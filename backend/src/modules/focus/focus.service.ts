import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { focusSessions, tasks, users } from "../../db/schema.js";
import { BadRequestError } from "../../utils/errors.js";
import type { CreateFocusSessionInput } from "./focus.schema.js";
import { goalIdOfTask } from "../goals/goals.service.js";

// 2 XP per focused minute (a full 25-min session = 50 XP, same as before).
const XP_PER_MINUTE = 2;

export async function createFocusSessionService(
  userId: number,
  input: CreateFocusSessionInput,
) {
  const now = Date.now();
  const startedMs = input.startedAt.getTime();
  const endedMs = input.endedAt.getTime();
  const wallClockMinutes = (endedMs - startedMs) / 60000;

  // Basic sanity checks so XP can't be farmed with fake sessions.
  if (endedMs > now + 2 * 60000 || startedMs > endedMs) {
    throw new BadRequestError("Session times look wrong.");
  }
  if (input.durationMinutes > Math.ceil(wallClockMinutes) + 1) {
    throw new BadRequestError("Focused time can't be longer than the session itself.");
  }

  const xpGained = input.durationMinutes * XP_PER_MINUTE;

  // Time spent on a task also counts toward that task's goal.
  const goalId = input.taskId ? await goalIdOfTask(userId, input.taskId) : null;

  const [session] = await db
    .insert(focusSessions)
    .values({ userId, ...input, goalId })
    .returning();

  await db
    .update(users)
    .set({ xp: sql`${users.xp} + ${xpGained}` })
    .where(eq(users.id, userId));

  return { session, xpGained };
}

export async function listFocusSessionsService(userId: number, days = 90) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await db
    .select({ session: focusSessions, taskTitle: tasks.title })
    .from(focusSessions)
    .leftJoin(tasks, and(eq(tasks.id, focusSessions.taskId), eq(tasks.userId, userId)))
    .where(and(eq(focusSessions.userId, userId), gte(focusSessions.endedAt, since)))
    .orderBy(desc(focusSessions.endedAt))
    .limit(1000);
  return rows.map((r) => ({ ...r.session, taskTitle: r.taskTitle }));
}
