import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  tasks,
  habits,
  focusSessions,
  users,
  userSettings,
  userPlans,
  streakRepairs,
  consistencyBonuses,
  notificationLogs,
} from "../../db/schema.js";
import { BadRequestError } from "../../utils/errors.js";
import { computeStreak } from "./streak.logic.js";

/** Free users get 1 repair a month, paid plans get 3. */
const REPAIRS_PER_MONTH = { free: 1, paid: 3 };
/** Active on this many days in a week -> bonus XP. */
export const WEEKLY_GOAL_DAYS = 5;
export const WEEKLY_BONUS_XP = 100;

function dateInTz(d: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export async function getStreakStatusService(userId: number) {
  const since = new Date(Date.now() - 400 * 86400000);

  const [[ctx], doneTasks, userHabits, sessions, repairs] = await Promise.all([
    db
      .select({
        timezone: userSettings.timezone,
        restDays: userSettings.restDays,
        planTier: userPlans.planTier,
        storedStreak: users.streak,
      })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .leftJoin(userPlans, eq(userPlans.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1),
    db
      .select({ completedAt: tasks.completedAt, updatedAt: tasks.updatedAt })
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.completed, true),
          gte(tasks.updatedAt, since),
        ),
      ),
    db
      .select({ completedDates: habits.completedDates })
      .from(habits)
      .where(eq(habits.userId, userId)),
    db
      .select({ endedAt: focusSessions.endedAt })
      .from(focusSessions)
      .where(
        and(
          eq(focusSessions.userId, userId),
          gte(focusSessions.endedAt, since),
        ),
      ),
    db
      .select({
        repairedDate: streakRepairs.repairedDate,
        createdAt: streakRepairs.createdAt,
      })
      .from(streakRepairs)
      .where(eq(streakRepairs.userId, userId)),
  ]);

  const tz =
    ctx?.timezone && ctx.timezone !== "UTC" ? ctx.timezone : "Asia/Kolkata";
  const today = dateInTz(new Date(), tz);

  const activeDays = new Set<string>();
  // completedAt when we have it; older tasks only have updatedAt.
  for (const t of doneTasks)
    activeDays.add(dateInTz(t.completedAt || t.updatedAt, tz));
  for (const h of userHabits)
    for (const d of (h.completedDates as string[]) || []) activeDays.add(d);
  for (const s of sessions) activeDays.add(dateInTz(s.endedAt, tz));

  const restDays = Array.isArray(ctx?.restDays)
    ? (ctx!.restDays as number[])
    : [];
  const result = computeStreak({
    today,
    activeDays,
    restDows: new Set(restDays),
    repairedDays: new Set(repairs.map((r) => r.repairedDate)),
  });

  const isPaid = !!ctx?.planTier && ctx.planTier !== "free";
  const allowance = isPaid ? REPAIRS_PER_MONTH.paid : REPAIRS_PER_MONTH.free;
  const month = today.slice(0, 7);
  const usedThisMonth = repairs.filter((r) =>
    dateInTz(r.createdAt, tz).startsWith(month),
  ).length;
  const repairsLeft = Math.max(0, allowance - usedThisMonth);

  if (ctx && ctx.storedStreak !== result.current) {
    db.update(users)
      .set({ streak: result.current })
      .where(eq(users.id, userId))
      .catch(() => {});
  }

  // Weekly consistency bonus: granted once per week, the first time we see 5 active days.
  let bonusJustEarned = false;
  if (result.activeDaysThisWeek >= WEEKLY_GOAL_DAYS) {
    const inserted = await db
      .insert(consistencyBonuses)
      .values({ userId, weekStart: result.weekStart, xp: WEEKLY_BONUS_XP })
      .onConflictDoNothing()
      .returning({ id: consistencyBonuses.id });
    if (inserted.length > 0) {
      bonusJustEarned = true;
      await db
        .update(users)
        .set({ xp: sql`${users.xp} + ${WEEKLY_BONUS_XP}` })
        .where(eq(users.id, userId));
      db.insert(notificationLogs)
        .values({
          userId,
          title: `🏅 ${WEEKLY_GOAL_DAYS} active days this week! +${WEEKLY_BONUS_XP} XP`,
          body: "Consistency beats intensity. Keep showing up.",
          type: "system",
          data: { moduleId: "dashboard" },
          status: "in_app",
        })
        .catch(() => {});
    }
  }

  return {
    ...result,
    restDays,
    repairsLeft,
    repairsPerMonth: allowance,
    canRepair: !!result.brokenOn && repairsLeft > 0,
    weeklyGoalDays: WEEKLY_GOAL_DAYS,
    weeklyBonusXp: WEEKLY_BONUS_XP,
    weeklyBonusEarned: result.activeDaysThisWeek >= WEEKLY_GOAL_DAYS,
    bonusJustEarned,
  };
}

export async function repairStreakService(userId: number) {
  const status = await getStreakStatusService(userId);
  if (!status.brokenOn)
    throw new BadRequestError("There's no missed day to repair right now.");
  if (status.repairsLeft <= 0) {
    throw new BadRequestError(
      "No repairs left this month. Rest days keep your streak safe too.",
    );
  }

  await db
    .insert(streakRepairs)
    .values({ userId, repairedDate: status.brokenOn })
    .onConflictDoNothing();

  return getStreakStatusService(userId);
}
