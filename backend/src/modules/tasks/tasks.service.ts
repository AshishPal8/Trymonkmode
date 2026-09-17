import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { tasks, users, userSettings } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.schema.js";
import {
  scheduleTaskReminderInMemory,
  cancelTaskReminder,
} from "../cron/reminders.cron.js";

async function getUserTimezone(
  userId: number,
  requestTz?: string,
): Promise<string> {
  const validReqTz =
    requestTz && requestTz.trim() && requestTz !== "UTC"
      ? requestTz.trim()
      : null;
  const [settings] = await db
    .select({ timezone: userSettings.timezone })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const dbTz =
    settings?.timezone && settings.timezone !== "UTC"
      ? settings.timezone
      : null;
  const resolvedTz = validReqTz || dbTz || "Asia/Kolkata";

  // Automatically sync to userSettings in DB if it was still default 'UTC'
  if (validReqTz && (!settings?.timezone || settings.timezone === "UTC")) {
    db.update(userSettings)
      .set({ timezone: validReqTz, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .catch(() => {});
  }

  return resolvedTz;
}

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

  await db
    .update(users)
    .set({ xp: sql`${users.xp} + 10` })
    .where(eq(users.id, userId));

  // Instantly schedule in-memory reminder if dueTime is provided
  if (created.dueTime) {
    getUserTimezone(userId, clientTz).then((tz) => {
      scheduleTaskReminderInMemory(created, tz);
    });
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
    getUserTimezone(userId, clientTz).then((tz) => {
      scheduleTaskReminderInMemory(updated, tz);
    });
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
    getUserTimezone(userId).then((tz) => {
      scheduleTaskReminderInMemory(updated, tz);
    });
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
