import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/db.js';
import { tasks, users } from '../../db/schema.js';
import { NotFoundError } from '../../utils/errors.js';
import type { CreateTaskInput, UpdateTaskInput } from './tasks.schema.js';

// 1. Get all tasks for user
export async function getTasksService(userId: number, filters?: { dueDate?: string; completed?: boolean; priority?: string }) {
  const conditions = [eq(tasks.userId, userId)];

  if (filters?.dueDate) {
    conditions.push(eq(tasks.dueDate, filters.dueDate));
  }
  if (filters?.completed !== undefined) {
    conditions.push(eq(tasks.completed, filters.completed));
  }
  if (filters?.priority) {
    conditions.push(eq(tasks.priority, filters.priority));
  }

  return db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(desc(tasks.createdAt));
}

// 2. Create new task
export async function createTaskService(userId: number, input: CreateTaskInput) {
  const [created] = await db
    .insert(tasks)
    .values({
      userId,
      goalId: input.goalId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      tags: input.tags,
      subtasks: input.subtasks,
      completed: input.completed,
      quadrant: input.quadrant,
    })
    .returning();

  // Award +10 XP for planning a task
  await db
    .update(users)
    .set({ xp: sql`${users.xp} + 10` })
    .where(eq(users.id, userId));

  return created;
}

// 3. Update task
export async function updateTaskService(userId: number, taskId: number, input: UpdateTaskInput) {
  const [updated] = await db
    .update(tasks)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError('Task not found.');
  }

  return updated;
}

// 4. Fast 1-click toggle completed + Award +25 XP
export async function toggleTaskService(userId: number, taskId: number) {
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError('Task not found.');
  }

  const nextCompleted = !existing.completed;
  const [updated] = await db
    .update(tasks)
    .set({
      completed: nextCompleted,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (nextCompleted) {
    // Award +25 XP on completing task
    await db
      .update(users)
      .set({ xp: sql`${users.xp} + 25` })
      .where(eq(users.id, userId));
  }

  return { task: updated, xpGained: nextCompleted ? 25 : 0 };
}

// 5. Delete task
export async function deleteTaskService(userId: number, taskId: number) {
  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError('Task not found or already deleted.');
  }

  return { message: 'Task deleted successfully.' };
}