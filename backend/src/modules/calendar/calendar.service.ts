import { eq, and } from "drizzle-orm";
import { db } from "../../config/db.js";
import { calendarEvents, userSettings } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "./calendar.schema.js";
import {
  scheduleEventReminderInMemory,
  cancelEventReminder,
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

  if (validReqTz && (!settings?.timezone || settings.timezone === "UTC")) {
    db.update(userSettings)
      .set({ timezone: validReqTz, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .catch(() => {});
  }

  return resolvedTz;
}

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

  getUserTimezone(userId, clientTz).then((tz) => {
    scheduleEventReminderInMemory(created, tz);
  });

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

  getUserTimezone(userId, clientTz).then((tz) => {
    scheduleEventReminderInMemory(updated, tz);
  });

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
