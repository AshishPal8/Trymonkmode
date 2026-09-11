import cron, { type ScheduledTask } from "node-cron";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  tasks,
  calendarEvents,
  habits,
  userSettings,
} from "../../db/schema.js";
import { sendPushNotificationToUser } from "../notifications/notifications.service.js";
import { isFlagEnabled } from "../settings/settings.service.js";

let hourlyLookaheadTask: ScheduledTask | null = null;
let isBatchLoading = false;

const activeTimers = new Map<string, NodeJS.Timeout>();

export function getTargetTimestamp(
  dateStr: string,
  timeStr: string,
  tz: string = "UTC",
): number {
  const validTz = tz && tz.trim() ? tz.trim() : "UTC";

  const dateParts = dateStr.split("-").map(Number);
  const timeParts = timeStr.split(":").map(Number);

  const year = dateParts[0] || new Date().getFullYear();
  const month = (dateParts[1] || 1) - 1;
  const day = dateParts[2] || 1;
  const hours = timeParts[0] || 0;
  const minutes = timeParts[1] || 0;

  const approximateUtc = new Date(
    Date.UTC(year, month, day, hours, minutes, 0),
  );

  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: validTz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(approximateUtc);
    const getPart = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value || 0);

    const tzYear = getPart("year");
    const tzMonth = getPart("month");
    const tzDay = getPart("day");
    let tzHour = getPart("hour");
    if (tzHour === 24) tzHour = 0;
    const tzMinute = getPart("minute");
    const tzSecond = getPart("second");

    const tzTimestamp = Date.UTC(
      tzYear,
      tzMonth - 1,
      tzDay,
      tzHour,
      tzMinute,
      tzSecond,
    );
    const offsetDiff = tzTimestamp - approximateUtc.getTime();

    return approximateUtc.getTime() - offsetDiff;
  } catch {
    return new Date(year, month, day, hours, minutes, 0).getTime();
  }
}

function clearTimer(key: string) {
  const existing = activeTimers.get(key);
  if (existing) {
    clearTimeout(existing);
    activeTimers.delete(key);
  }
}

export function cancelAllUserReminders(userId: number) {
  const userTag = `:u${userId}`;
  for (const [key, timeoutId] of activeTimers.entries()) {
    if (key.includes(userTag)) {
      clearTimeout(timeoutId);
      activeTimers.delete(key);
    }
  }
}

export async function isUserPushEnabled(userId: number): Promise<boolean> {
  const [settings] = await db
    .select({ notificationsEnabled: userSettings.notificationsEnabled })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  return settings ? settings.notificationsEnabled : true;
}

function registerTimer(
  key: string,
  delayMs: number,
  action: () => Promise<void>,
) {
  clearTimer(key);

  if (delayMs <= 0) {
    // Already due (within tolerance)
    action().catch((err) =>
      console.error(`❌ [Timer] Execution error for ${key}:`, err),
    );
    return;
  }

  // Node.js max setTimeout is 24.8 days (2,147,483,647 ms)
  const safeDelay = Math.min(delayMs, 2147483647);

  const timeoutId = setTimeout(async () => {
    activeTimers.delete(key);
    try {
      await action();
    } catch (err) {
      console.error(`❌ [Timer] Execution error for ${key}:`, err);
    }
  }, safeDelay);

  activeTimers.set(key, timeoutId);
}

export async function scheduleTaskReminderInMemory(
  task: {
    id: number;
    userId: number;
    title: string;
    description?: string | null;
    dueDate: string;
    dueTime?: string | null;
    completed?: boolean;
    reminderSent?: boolean;
  },
  userTz?: string | null,
) {
  const key = `task:${task.id}:u${task.userId}`;
  if (!task.dueTime || task.completed || task.reminderSent) {
    clearTimer(key);
    return;
  }

  // Check global system settings: is reminders cron active?
  const isGlobalEnabled = await isFlagEnabled('reminders_cron', true);
  if (!isGlobalEnabled) {
    clearTimer(key);
    return;
  }

  // If user has disabled notifications, do not allocate any timer
  const enabled = await isUserPushEnabled(task.userId);
  if (!enabled) {
    clearTimer(key);
    return;
  }

  const targetMs = getTargetTimestamp(
    task.dueDate,
    task.dueTime,
    userTz || "UTC",
  );
  const delayMs = targetMs - Date.now();

  // If due within the next 24 hours
  if (delayMs >= -30000 && delayMs <= 24 * 60 * 60 * 1000) {
    registerTimer(key, delayMs, async () => {
      await sendPushNotificationToUser(task.userId, {
        title: `🎯 Task Reminder: ${task.title}`,
        body:
          task.description ||
          "Your scheduled task is due now. Open Try Monk Mode to execute.",
        type: "task_reminder",
        data: { taskId: String(task.id), moduleId: "tasks" },
      });

      await db
        .update(tasks)
        .set({ reminderSent: true, updatedAt: new Date() })
        .where(eq(tasks.id, task.id));
    });
  }
}

export function cancelTaskReminder(taskId: number) {
  for (const [key] of activeTimers.entries()) {
    if (key.startsWith(`task:${taskId}:`)) {
      clearTimer(key);
    }
  }
}

export async function scheduleEventReminderInMemory(
  event: {
    id: number;
    userId: number;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    reminderSent?: boolean;
  },
  userTz?: string | null,
) {
  const key = `calendar:${event.id}:u${event.userId}`;
  if (event.reminderSent) {
    clearTimer(key);
    return;
  }

  // Check global system settings: is reminders cron active?
  const isGlobalEnabled = await isFlagEnabled('reminders_cron', true);
  if (!isGlobalEnabled) {
    clearTimer(key);
    return;
  }

  // If user has disabled notifications, do not allocate any timer
  const enabled = await isUserPushEnabled(event.userId);
  if (!enabled) {
    clearTimer(key);
    return;
  }

  const targetMs = getTargetTimestamp(
    event.date,
    event.startTime,
    userTz || "UTC",
  );
  const delayMs = targetMs - Date.now();

  if (delayMs >= -30000 && delayMs <= 24 * 60 * 60 * 1000) {
    registerTimer(key, delayMs, async () => {
      await sendPushNotificationToUser(event.userId, {
        title: `📅 Calendar Event: ${event.title}`,
        body: `Starting now (${event.startTime} - ${event.endTime}). Stay focused and prepared.`,
        type: "calendar_event",
        data: { eventId: String(event.id), moduleId: "calendar" },
      });

      await db
        .update(calendarEvents)
        .set({ reminderSent: true, updatedAt: new Date() })
        .where(eq(calendarEvents.id, event.id));
    });
  }
}

export function cancelEventReminder(eventId: number) {
  for (const [key] of activeTimers.entries()) {
    if (key.startsWith(`calendar:${eventId}:`)) {
      clearTimer(key);
    }
  }
}

export async function reloadUserReminders(userId: number) {
  cancelAllUserReminders(userId);

  const isGlobalEnabled = await isFlagEnabled('reminders_cron', true);
  if (!isGlobalEnabled) return;

  const [settings] = await db
    .select({
      timezone: userSettings.timezone,
      notificationsEnabled: userSettings.notificationsEnabled,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (!settings || !settings.notificationsEnabled) return;

  const userTz = settings.timezone || "UTC";
  const nowMs = Date.now();
  const LOOKAHEAD_WINDOW_MS = 90 * 60 * 1000;

  // 1. Pending tasks for this user
  const userTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.completed, false),
        eq(tasks.reminderSent, false),
        isNotNull(tasks.dueTime),
      ),
    );

  for (const task of userTasks) {
    if (!task.dueTime) continue;
    const targetMs = getTargetTimestamp(task.dueDate, task.dueTime, userTz);
    const delayMs = targetMs - nowMs;
    if (delayMs >= -30000 && delayMs <= LOOKAHEAD_WINDOW_MS) {
      scheduleTaskReminderInMemory(task, userTz);
    }
  }

  // 2. Pending events for this user
  const userEvents = await db
    .select()
    .from(calendarEvents)
    .where(
      and(
        eq(calendarEvents.userId, userId),
        eq(calendarEvents.reminderSent, false),
      ),
    );

  for (const event of userEvents) {
    const targetMs = getTargetTimestamp(event.date, event.startTime, userTz);
    const delayMs = targetMs - nowMs;
    if (delayMs >= -30000 && delayMs <= LOOKAHEAD_WINDOW_MS) {
      scheduleEventReminderInMemory(event, userTz);
    }
  }
}

export async function loadUpcomingRemindersBatch() {
  if (isBatchLoading) return;
  isBatchLoading = true;

  try {
    const isGlobalEnabled = await isFlagEnabled('reminders_cron', true);
    if (!isGlobalEnabled) {
      console.log(
        "⏸️ [Lookahead Batcher] Reminders Cron is DISABLED in system_settings. Skipping batch & purging timers.",
      );
      for (const [key, timeoutId] of activeTimers.entries()) {
        clearTimeout(timeoutId);
      }
      activeTimers.clear();
      return;
    }

    const LOOKAHEAD_WINDOW_MS = 90 * 60 * 1000;
    const nowMs = Date.now();

    // 1. Tasks Batch (Only for users with notificationsEnabled = true)
    const pendingTasks = await db
      .select({
        task: tasks,
        userTz: userSettings.timezone,
      })
      .from(tasks)
      .innerJoin(userSettings, eq(tasks.userId, userSettings.userId))
      .where(
        and(
          eq(tasks.completed, false),
          eq(tasks.reminderSent, false),
          isNotNull(tasks.dueTime),
          eq(userSettings.notificationsEnabled, true),
        ),
      );

    for (const { task, userTz } of pendingTasks) {
      if (!task.dueTime) continue;
      const targetMs = getTargetTimestamp(
        task.dueDate,
        task.dueTime,
        userTz || "UTC",
      );
      const delayMs = targetMs - nowMs;

      if (delayMs >= -30000 && delayMs <= LOOKAHEAD_WINDOW_MS) {
        scheduleTaskReminderInMemory(task, userTz);
      }
    }

    // 2. Calendar Events Batch (Only for users with notificationsEnabled = true)
    const pendingEvents = await db
      .select({
        event: calendarEvents,
        userTz: userSettings.timezone,
      })
      .from(calendarEvents)
      .innerJoin(userSettings, eq(calendarEvents.userId, userSettings.userId))
      .where(
        and(
          eq(calendarEvents.reminderSent, false),
          eq(userSettings.notificationsEnabled, true),
        ),
      );

    for (const { event, userTz } of pendingEvents) {
      const targetMs = getTargetTimestamp(
        event.date,
        event.startTime,
        userTz || "UTC",
      );
      const delayMs = targetMs - nowMs;

      if (delayMs >= -30000 && delayMs <= LOOKAHEAD_WINDOW_MS) {
        scheduleEventReminderInMemory(event, userTz);
      }
    }

    // 3. Habits Batch (Only for users with notificationsEnabled = true)
    const activeHabits = await db
      .select({
        habit: habits,
        userTz: userSettings.timezone,
      })
      .from(habits)
      .innerJoin(userSettings, eq(habits.userId, userSettings.userId))
      .where(
        and(
          eq(habits.reminderEnabled, true),
          isNotNull(habits.reminderTime),
          eq(userSettings.notificationsEnabled, true),
        ),
      );

    const now = new Date();
    const todayDateStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay();

    for (const { habit, userTz } of activeHabits) {
      if (!habit.reminderTime) continue;
      const targetDays = (habit.targetDays as number[]) || [
        0, 1, 2, 3, 4, 5, 6,
      ];
      if (!targetDays.includes(dayOfWeek)) continue;

      const targetMs = getTargetTimestamp(
        todayDateStr,
        habit.reminderTime,
        userTz || "UTC",
      );
      const delayMs = targetMs - nowMs;

      if (delayMs >= -30000 && delayMs <= LOOKAHEAD_WINDOW_MS) {
        const key = `habit:${habit.id}:u${habit.userId}`;
        registerTimer(key, delayMs, async () => {
          const completedDates = (habit.completedDates as string[]) || [];
          if (!completedDates.includes(todayDateStr)) {
            await sendPushNotificationToUser(habit.userId, {
              title: `⚡ Habit Ritual: ${habit.title}`,
              body:
                habit.description ||
                "Time to complete your non-negotiable ritual and keep your streak alive!",
              type: "habit_reminder",
              data: { habitId: String(habit.id), moduleId: "habits" },
            });

            await db
              .update(habits)
              .set({ lastReminderDate: todayDateStr, updatedAt: new Date() })
              .where(eq(habits.id, habit.id));
          }
        });
      }
    }

    console.log(
      `  🕒 [Lookahead Batcher] Batch loaded. ${activeTimers.size} active timers in memory (Skipping disabled users).`,
    );
  } catch (err) {
    console.error(
      "❌ [Lookahead Batcher] Error loading upcoming reminders:",
      err,
    );
  } finally {
    isBatchLoading = false;
  }
}

export function startReminderCron(): ScheduledTask {
  if (hourlyLookaheadTask) {
    return hourlyLookaheadTask;
  }

  // 1. Initial batch load on startup
  loadUpcomingRemindersBatch();

  hourlyLookaheadTask = cron.schedule("0 * * * *", loadUpcomingRemindersBatch);
  console.log(
    "  🕒 [Cron] Lookahead Reminders Scheduled -> (0 * * * *) Hourly batching (Zero Redis)",
  );
  return hourlyLookaheadTask;
}

export function stopReminderCron(): void {
  if (hourlyLookaheadTask) {
    hourlyLookaheadTask.stop();
    hourlyLookaheadTask = null;
  }

  // Clear all in-memory timers
  for (const [key, timeoutId] of activeTimers.entries()) {
    clearTimeout(timeoutId);
  }
  activeTimers.clear();

  console.log(
    "  🛑 [Cron] Lookahead Reminders Stopped & in-memory timers cleared.",
  );
}
