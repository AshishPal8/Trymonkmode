import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { habits, users } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CreateHabitInput, UpdateHabitInput } from "./habits.schema.js";

export async function getHabitsService(userId: number) {
  return db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId))
    .orderBy(desc(habits.createdAt));
}

export async function createHabitService(
  userId: number,
  input: CreateHabitInput,
) {
  const [created] = await db
    .insert(habits)
    .values({
      userId,
      title: input.title,
      category: input.category,
      frequency: input.frequency,
      targetDays: input.targetDays,
      completedDates: [],
      streak: 0,
      bestStreak: 0,
    })
    .returning();

  return created;
}

export async function updateHabitService(
  userId: number,
  habitId: number,
  input: UpdateHabitInput,
) {
  const [updated] = await db
    .update(habits)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Habit not found.");
  }

  return updated;
}

export async function toggleCheckInService(
  userId: number,
  habitId: number,
  dateStr: string,
) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .limit(1);

  if (!habit) {
    throw new NotFoundError("Habit not found.");
  }

  const completed = (habit.completedDates as string[]) || [];
  const isCompleted = completed.includes(dateStr);

  let updatedDates: string[];
  let newStreak = habit.streak;

  if (isCompleted) {
    updatedDates = completed.filter((d) => d !== dateStr);
    newStreak = Math.max(0, newStreak - 1);
  } else {
    updatedDates = [...completed, dateStr];
    newStreak += 1;
  }

  const newBestStreak = Math.max(habit.bestStreak, newStreak);

  const [updated] = await db
    .update(habits)
    .set({
      completedDates: updatedDates,
      streak: newStreak,
      bestStreak: newBestStreak,
      updatedAt: new Date(),
    })
    .where(eq(habits.id, habitId))
    .returning();

  if (!isCompleted) {
    await db
      .update(users)
      .set({ xp: sql`${users.xp} + 15` })
      .where(eq(users.id, userId));
  }

  return {
    habit: updated,
    checkedIn: !isCompleted,
    xpGained: !isCompleted ? 15 : 0,
  };
}

export async function deleteHabitService(userId: number, habitId: number) {
  const [deleted] = await db
    .delete(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError("Habit not found.");
  }

  return { message: "Habit deleted successfully." };
}
