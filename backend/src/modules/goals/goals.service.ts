import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { goals } from '../../db/schema.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateGoalInput, UpdateGoalInput } from './goals.schema.js';

export async function getGoalsService(userId: number, timeframe?: string) {
  const conditions = [eq(goals.userId, userId)];
  if (timeframe && timeframe !== 'all') {
    conditions.push(eq(goals.timeframe, timeframe));
  }
  return db
    .select()
    .from(goals)
    .where(and(...conditions))
    .orderBy(desc(goals.createdAt));
}

export async function createGoalService(userId: number, input: CreateGoalInput) {
  const [created] = await db
    .insert(goals)
    .values({
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      timeframe: input.timeframe,
      targetMetric: input.targetMetric,
      currentProgress: input.currentProgress,
      targetProgress: input.targetProgress,
      color: input.color,
    })
    .returning();

  return created;
}

export async function updateGoalService(userId: number, goalId: number, input: UpdateGoalInput) {
  const [updated] = await db
    .update(goals)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError('Goal not found.');
  }

  return updated;
}

export async function deleteGoalService(userId: number, goalId: number) {
  const [deleted] = await db
    .delete(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError('Goal not found.');
  }

  return { message: 'Goal deleted successfully.' };
}