import { eq, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../db/schema.js";

/** XP rewards, in one place so they're easy to tune. */
export const XP = {
  taskCreated: 10,
  taskCompleted: 25,
  habitCheckIn: 15,
  journalEntry: 40,
  goalCreated: 30,
  goalFinished: 100,
  milestoneDone: 25,
  focusPerMinute: 2,
  weeklyConsistency: 100,
  friendJoined: 50,
} as const;

/** Adds XP to a user in one atomic update. */
export async function addXp(userId: number, amount: number): Promise<void> {
  if (amount <= 0) return;
  await db.update(users).set({ xp: sql`${users.xp} + ${amount}` }).where(eq(users.id, userId));
}
