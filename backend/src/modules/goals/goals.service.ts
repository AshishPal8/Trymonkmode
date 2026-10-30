import { and, asc, desc, eq, gte, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { goals, goalMilestones, tasks, focusSessions, users } from "../../db/schema.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import type {
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "./goals.schema.js";

type GoalRow = typeof goals.$inferSelect;
type MilestoneRow = typeof goalMilestones.$inferSelect;
type TaskCount = { goalId: number | null; milestoneId: number | null; total: number; done: number };

// ─── Progress ────────────────────────────────────────────────────────────────

/**
 * Progress rules:
 *  - project: each milestone counts equally. A milestone with linked tasks is
 *    "tasks done / tasks"; without tasks it's 0% or 100% from its checkbox.
 *    No milestones -> linked tasks done / linked tasks.
 *  - target: current / target.
 *  - focus: all focused minutes since the goal started / target minutes.
 */
function computeProgress(
  goal: GoalRow,
  milestones: MilestoneRow[],
  counts: TaskCount[],
  focusMinutes: number,
): number {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  if (goal.kind === "target") {
    return clamp((goal.currentProgress / Math.max(1, goal.targetProgress)) * 100);
  }
  if (goal.kind === "focus") {
    return clamp((focusMinutes / Math.max(1, goal.targetFocusMinutes || 60)) * 100);
  }

  if (milestones.length > 0) {
    const parts = milestones.map((m) => {
      const c = counts.find((x) => x.milestoneId === m.id);
      if (m.completed) return 1;
      return c && c.total > 0 ? c.done / c.total : 0;
    });
    return clamp((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
  }

  const total = counts.reduce((n, c) => n + c.total, 0);
  const done = counts.reduce((n, c) => n + c.done, 0);
  return total > 0 ? clamp((done / total) * 100) : 0;
}

/** When a "focus hours" goal starts counting: its start date, else when it was created. */
function focusStart(goal: GoalRow): Date {
  return goal.startDate ? new Date(`${goal.startDate}T00:00:00Z`) : goal.createdAt;
}

/**
 * "Focus hours" goals count every focus session since the goal started
 * (not only sessions on its tasks). One query for all of them.
 */
async function loadFocusGoalMinutes(userId: number, focusGoals: GoalRow[]) {
  const result = new Map<number, number>();
  if (focusGoals.length === 0) return result;
  const earliest = new Date(Math.min(...focusGoals.map((g) => focusStart(g).getTime())));
  const sessions = await db
    .select({ minutes: focusSessions.durationMinutes, endedAt: focusSessions.endedAt })
    .from(focusSessions)
    .where(and(eq(focusSessions.userId, userId), gte(focusSessions.endedAt, earliest)));
  for (const g of focusGoals) {
    const from = focusStart(g).getTime();
    result.set(g.id, sessions.filter((s) => s.endedAt.getTime() >= from).reduce((n, s) => n + s.minutes, 0));
  }
  return result;
}

/** Loads everything the goal cards need in 4–5 queries, however many goals. */
async function loadGoalExtras(userId: number, goalIds: number[], focusGoals: GoalRow[] = []) {
  if (goalIds.length === 0) {
    return { milestones: [] as MilestoneRow[], counts: [] as TaskCount[], focus: new Map<number, number>(), nextTasks: [] as { goalId: number | null; title: string; dueDate: string }[] };
  }
  const [milestones, counts, focusRows, nextTasks, focusGoalMinutes] = await Promise.all([
    db
      .select()
      .from(goalMilestones)
      .where(and(eq(goalMilestones.userId, userId), inArray(goalMilestones.goalId, goalIds)))
      .orderBy(asc(goalMilestones.orderIndex), asc(goalMilestones.id)),
    db
      .select({
        goalId: tasks.goalId,
        milestoneId: tasks.milestoneId,
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${tasks.completed})::int`,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), inArray(tasks.goalId, goalIds)))
      .groupBy(tasks.goalId, tasks.milestoneId),
    db
      .select({ goalId: focusSessions.goalId, minutes: sql<number>`coalesce(sum(${focusSessions.durationMinutes}), 0)::int` })
      .from(focusSessions)
      .where(and(eq(focusSessions.userId, userId), inArray(focusSessions.goalId, goalIds)))
      .groupBy(focusSessions.goalId),
    // Earliest open task per goal ("next up")
    db
      .selectDistinctOn([tasks.goalId], { goalId: tasks.goalId, title: tasks.title, dueDate: tasks.dueDate })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), inArray(tasks.goalId, goalIds), eq(tasks.completed, false)))
      .orderBy(tasks.goalId, asc(tasks.dueDate)),
    loadFocusGoalMinutes(userId, focusGoals),
  ]);
  const focus = new Map<number, number>();
  for (const f of focusRows) if (f.goalId !== null) focus.set(f.goalId, f.minutes);
  // Focus-hours goals use all sessions since they started.
  for (const [id, minutes] of focusGoalMinutes) focus.set(id, minutes);
  return { milestones, counts, focus, nextTasks };
}

function shapeGoal(
  goal: GoalRow,
  extras: Awaited<ReturnType<typeof loadGoalExtras>>,
) {
  const milestones = extras.milestones.filter((m) => m.goalId === goal.id);
  const counts = extras.counts.filter((c) => c.goalId === goal.id);
  const focusMinutes = extras.focus.get(goal.id) || 0;
  const taskTotal = counts.reduce((n, c) => n + c.total, 0);
  const taskDone = counts.reduce((n, c) => n + c.done, 0);

  return {
    ...goal,
    progress: computeProgress(goal, milestones, counts, focusMinutes),
    focusMinutes,
    taskTotal,
    taskDone,
    nextTask: extras.nextTasks.find((t) => t.goalId === goal.id) || null,
    milestones: milestones.map((m) => {
      const c = counts.find((x) => x.milestoneId === m.id);
      return { ...m, taskTotal: c?.total || 0, taskDone: c?.done || 0 };
    }),
  };
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export async function getGoalsService(userId: number, timeframe?: string) {
  const rows = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), timeframe ? eq(goals.timeframe, timeframe) : undefined))
    .orderBy(desc(goals.createdAt));
  const extras = await loadGoalExtras(
    userId,
    rows.map((g) => g.id),
    rows.filter((g) => g.kind === "focus"),
  );
  return rows.map((g) => shapeGoal(g, extras));
}

async function getOwnedGoal(userId: number, goalId: number) {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  if (!goal) throw new NotFoundError("Goal not found.");
  return goal;
}

/** One goal with its milestones and linked tasks. */
export async function getGoalDetailService(userId: number, goalId: number) {
  const goal = await getOwnedGoal(userId, goalId);
  const [extras, linkedTasks] = await Promise.all([
    loadGoalExtras(userId, [goalId], goal.kind === "focus" ? [goal] : []),
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.goalId, goalId)))
      .orderBy(asc(tasks.completed), asc(tasks.dueDate)),
  ]);
  return { ...shapeGoal(goal, extras), tasks: linkedTasks };
}

export async function createGoalService(userId: number, input: CreateGoalInput) {
  const { milestones, ...values } = input;
  const [goal] = await db.insert(goals).values({ userId, ...values }).returning();

  if (milestones?.length) {
    await db.insert(goalMilestones).values(
      milestones.map((m, i) => ({
        goalId: goal.id,
        userId,
        title: m.title,
        dueDate: m.dueDate || null,
        orderIndex: i,
      })),
    );
  }

  await db.update(users).set({ xp: sql`${users.xp} + 30` }).where(eq(users.id, userId));
  return getGoalDetailService(userId, goal.id);
}

export async function updateGoalService(userId: number, goalId: number, input: UpdateGoalInput) {
  const before = await getOwnedGoal(userId, goalId);
  await db
    .update(goals)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  // Finishing a goal is worth celebrating (once).
  if (input.status === "done" && before.status !== "done") {
    await db.update(users).set({ xp: sql`${users.xp} + 100` }).where(eq(users.id, userId));
  }
  return getGoalDetailService(userId, goalId);
}

export async function deleteGoalService(userId: number, goalId: number) {
  await getOwnedGoal(userId, goalId);
  // Keep the tasks, just unlink them.
  await db
    .update(tasks)
    .set({ goalId: null, milestoneId: null })
    .where(and(eq(tasks.userId, userId), eq(tasks.goalId, goalId)));
  await db.delete(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  return { message: "Goal deleted. Its tasks were kept." };
}

// ─── Milestones ──────────────────────────────────────────────────────────────

export async function createMilestoneService(userId: number, goalId: number, input: CreateMilestoneInput) {
  await getOwnedGoal(userId, goalId);
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${goalMilestones.orderIndex}) + 1, 0)::int` })
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId));
  const [m] = await db
    .insert(goalMilestones)
    .values({ goalId, userId, title: input.title, dueDate: input.dueDate || null, orderIndex: next })
    .returning();
  return m;
}

export async function updateMilestoneService(userId: number, milestoneId: number, input: UpdateMilestoneInput) {
  const [before] = await db
    .select()
    .from(goalMilestones)
    .where(and(eq(goalMilestones.id, milestoneId), eq(goalMilestones.userId, userId)))
    .limit(1);
  if (!before) throw new NotFoundError("Milestone not found.");

  const [m] = await db
    .update(goalMilestones)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(goalMilestones.id, milestoneId))
    .returning();

  let xpGained = 0;
  if (input.completed === true && !before.completed) {
    xpGained = 25;
    await db.update(users).set({ xp: sql`${users.xp} + ${xpGained}` }).where(eq(users.id, userId));
  }
  return { milestone: m, xpGained };
}

export async function deleteMilestoneService(userId: number, milestoneId: number) {
  const [m] = await db
    .delete(goalMilestones)
    .where(and(eq(goalMilestones.id, milestoneId), eq(goalMilestones.userId, userId)))
    .returning();
  if (!m) throw new NotFoundError("Milestone not found.");
  await db
    .update(tasks)
    .set({ milestoneId: null })
    .where(and(eq(tasks.userId, userId), eq(tasks.milestoneId, milestoneId)));
  return { message: "Milestone deleted." };
}

// ─── Link checks (used by tasks and focus) ───────────────────────────────────

/**
 * Makes sure a task's goal / milestone belong to this user, and that the
 * milestone is inside that goal. Returns the ids to store (goal filled in
 * from the milestone if only a milestone was given).
 */
export async function resolveGoalLink(
  userId: number,
  goalId?: number | null,
  milestoneId?: number | null,
): Promise<{ goalId: number | null; milestoneId: number | null }> {
  if (milestoneId) {
    const [m] = await db
      .select({ goalId: goalMilestones.goalId })
      .from(goalMilestones)
      .where(and(eq(goalMilestones.id, milestoneId), eq(goalMilestones.userId, userId)))
      .limit(1);
    if (!m) throw new BadRequestError("That milestone doesn't exist.");
    if (goalId && goalId !== m.goalId) throw new BadRequestError("Milestone belongs to a different goal.");
    return { goalId: m.goalId, milestoneId };
  }
  if (goalId) {
    await getOwnedGoal(userId, goalId);
    return { goalId, milestoneId: null };
  }
  return { goalId: null, milestoneId: null };
}

/** Goal linked to a task, if any (for focus sessions). */
export async function goalIdOfTask(userId: number, taskId: number): Promise<number | null> {
  const [t] = await db
    .select({ goalId: tasks.goalId })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId), isNotNull(tasks.goalId)))
    .limit(1);
  return t?.goalId ?? null;
}
