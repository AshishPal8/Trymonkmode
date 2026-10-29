import { eq, and } from "drizzle-orm";
import { db } from "../../config/db.js";
import { calendarEvents } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "./calendar.schema.js";
import {
  scheduleEventReminder,
  cancelEventReminder,
} from "../cron/reminders.cron.js";

export async function getEventsService(userId: number, dateStr?: string) {
  const conditions = [eq(calendarEvents.userId, userId)];
  if (dateStr) {
    conditions.push(eq(calendarEvents.date, dateStr));
  }
  return db
    .select()
    .from(calendarEvents)
    .where(and(...conditions))
    .orderBy(calendarEvents.date, calendarEvents.startTime);
}

export async function createEventService(
  userId: number,
  input: CreateCalendarEventInput,
  clientTz?: string,
) {
  const [created] = await db
    .insert(calendarEvents)
    .values({
      userId,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      category: input.category,
      description: input.description,
    })
    .returning();

  scheduleEventReminder(created, clientTz).catch(() => {});

  return created;
}

export async function updateEventService(
  userId: number,
  eventId: number,
  input: UpdateCalendarEventInput,
  clientTz?: string,
) {
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.date !== undefined || input.startTime !== undefined) {
    updateData.reminderSent = false;
  }

  const [updated] = await db
    .update(calendarEvents)
    .set(updateData)
    .where(
      and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)),
    )
    .returning();

  if (!updated) {
    throw new NotFoundError("Calendar event not found.");
  }

  scheduleEventReminder(updated, clientTz).catch(() => {});

  return updated;
}

export async function deleteEventService(userId: number, eventId: number) {
  cancelEventReminder(eventId);

  const [deleted] = await db
    .delete(calendarEvents)
    .where(
      and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)),
    )
    .returning();

  if (!deleted) {
    throw new NotFoundError("Calendar event not found.");
  }

  return { message: "Calendar event deleted successfully." };
}
