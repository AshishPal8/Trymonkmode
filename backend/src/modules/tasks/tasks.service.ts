import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { tasks, users } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schema.js";
import {
  scheduleTaskReminder,
  cancelTaskReminder,
} from "../cron/reminders.cron.js";
import { resolveGoalLink } from "../goals/goals.service.js";

export async function getTasksService(
  userId: number,
  filters?: { dueDate?: string; completed?: boolean; priority?: string },
) {
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

export async function createTaskService(
  userId: number,
  input: CreateTaskInput,
  clientTz?: string,
) {
  const link = await resolveGoalLink(userId, input.goalId, input.milestoneId);
  const [created] = await db
    .insert(tasks)
    .values({
      userId,
      goalId: link.goalId,
      milestoneId: link.milestoneId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
      tags: input.tags,
      subtasks: input.subtasks,
      completed: input.completed,
      completedAt: input.completed ? new Date() : null,
      quadrant: input.quadrant,
    })
    .returning();

  await db
    .update(users)
    .set({ xp: sql`${users.xp} + 10` })
    .where(eq(users.id, userId));

  // Instantly schedule in-memory reminder if dueTime is provided
  if (created.dueTime) {
    scheduleTaskReminder(created, clientTz).catch(() => {});
  }

  return created;
}

export async function updateTaskService(
  userId: number,
  taskId: number,
  input: UpdateTaskInput,
  clientTz?: string,
) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.dueDate !== undefined || input.dueTime !== undefined) {
    updateData.reminderSent = false;
  }

  if (input.completed !== undefined) {
    updateData.completedAt = input.completed ? new Date() : null;
  }

  if (input.goalId !== undefined || input.milestoneId !== undefined) {
    if (input.goalId === null) {
      // Unlink from any goal
      updateData.goalId = null;
      updateData.milestoneId = null;
    } else if (input.goalId === undefined && input.milestoneId === null) {
      // Only take it out of its milestone, keep the goal
      updateData.milestoneId = null;
    } else {
      // A new goal without a milestone clears the old milestone.
      const link = await resolveGoalLink(userId, input.goalId, input.milestoneId ?? null);
      updateData.goalId = link.goalId;
      updateData.milestoneId = link.milestoneId;
    }
  }

  const [updated] = await db
    .update(tasks)
    .set(updateData)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!updated) {
    throw new NotFoundError("Task not found.");
  }

  // Update in-memory timer
  if (updated.dueTime && !updated.completed) {
    scheduleTaskReminder(updated, clientTz).catch(() => {});
  } else {
    cancelTaskReminder(taskId);
  }

  return updated;
}

export async function toggleTaskService(userId: number, taskId: number) {
  const [existing] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Task not found.");
  }

  const nextCompleted = !existing.completed;
  const [updated] = await db
    .update(tasks)
    .set({
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (nextCompleted) {
    cancelTaskReminder(taskId);
    await db
      .update(users)
      .set({ xp: sql`${users.xp} + 25` })
      .where(eq(users.id, userId));
  } else if (updated.dueTime) {
    scheduleTaskReminder(updated).catch(() => {});
  }

  return { task: updated, xpGained: nextCompleted ? 25 : 0 };
}

export async function deleteTaskService(userId: number, taskId: number) {
  cancelTaskReminder(taskId);

  const [deleted] = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning();

  if (!deleted) {
    throw new NotFoundError("Task not found or already deleted.");
  }

  return { message: "Task deleted successfully." };
}
