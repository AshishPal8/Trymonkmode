import cron, { type ScheduledTask } from "node-cron";
import {
  eq,
  and,
  or,
  gte,
  lt,
  inArray,
  isNotNull,
  sql,
} from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  tasks,
  calendarEvents,
  habits,
  users,
  userSettings,
  userDeviceTokens,
  notificationLogs,
  scheduledNotifications,
} from "../../db/schema.js";
import {
  deliverPush,
  type PushPayload,
} from "../notifications/notifications.service.js";
import {
  taskReminderMessage,
  eventReminderMessage,
  habitReminderMessage,
  firstNameOf,
} from "../notifications/notifications.templates.js";
import { isFlagEnabled } from "../settings/settings.service.js";

// How it works:
// - Every task/event/habit with a reminder has one row in
//   `scheduled_notifications` with the time to send it (`send_at`).
// - Creating, editing, completing or deleting the item updates that row.
// - A worker runs every minute and claims due rows with
//   `FOR UPDATE SKIP LOCKED`, so two servers or a restart can never send
//   the same reminder twice. When nothing is due that's 1 small indexed query.
// - Habits reuse their row: after sending, `send_at` moves to the next day.

type Kind = "task" | "event" | "habit" | "habit_snooze";

const DEFAULT_TZ = "Asia/Kolkata";
const DEFAULT_LEAD_MINUTES = 10;
const BATCH_SIZE = 100;
// If the server was down and a reminder is this late, drop it instead of
// sending a stale "due now" message.
const STALE_AFTER_MS = 30 * 60 * 1000;
// A row stuck in 'processing' this long means the worker crashed mid-send.
const STUCK_AFTER_MS = 10 * 60 * 1000;

let workerTask: ScheduledTask | null = null;
let isWorkerRunning = false;
let runCount = 0;

// ─── Time helpers ────────────────────────────────────────────────────────────

/** Converts a local date + "HH:MM" in `tz` to a UTC timestamp (ms). */
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
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: validTz,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(approximateUtc);
    const getPart = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value || 0);

    let tzHour = getPart("hour");
    if (tzHour === 24) tzHour = 0;

    const tzTimestamp = Date.UTC(
      getPart("year"),
      getPart("month") - 1,
      getPart("day"),
      tzHour,
      getPart("minute"),
      getPart("second"),
    );
    return approximateUtc.getTime() - (tzTimestamp - approximateUtc.getTime());
  } catch {
    return new Date(year, month, day, hours, minutes, 0).getTime();
  }
}

/** YYYY-MM-DD and day of week (0 = Sunday) for `ms` as seen in `tz`. */
export function getLocalDate(
  ms: number,
  tz: string,
): { dateStr: string; dayOfWeek: number } {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
    }).formatToParts(new Date(ms));
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      dateStr: `${get("year")}-${get("month")}-${get("day")}`,
      dayOfWeek: days.indexOf(get("weekday")),
    };
  } catch {
    const d = new Date(ms);
    return { dateStr: d.toISOString().slice(0, 10), dayOfWeek: d.getUTCDay() };
  }
}

function resolveTz(tz?: string | null): string {
  return tz && tz.trim() && tz !== "UTC" ? tz.trim() : DEFAULT_TZ;
}

function utcDateStr(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
}

// ─── Computing when to send ──────────────────────────────────────────────────

type ReminderCtx = { tz: string; leadMinutes: number };

type ScheduleRow = {
  userId: number;
  kind: Kind;
  refId: number;
  sendAt: Date;
  targetAt: Date;
  occurrenceDate: string | null;
};

type TaskLike = {
  id: number;
  userId: number;
  dueDate: string;
  dueTime?: string | null;
  completed?: boolean;
};

type EventLike = {
  id: number;
  userId: number;
  date: string;
  startTime: string;
};

type HabitLike = {
  id: number;
  userId: number;
  reminderEnabled: boolean;
  reminderTime?: string | null;
  targetDays: unknown;
  completedDates: unknown;
};

function withLead(
  base: Omit<ScheduleRow, "sendAt" | "targetAt">,
  targetMs: number,
  leadMinutes: number,
  nowMs: number,
): ScheduleRow | null {
  if (targetMs <= nowMs) return null; // already happened
  // If the lead time is already past (e.g. task due in 3 min, lead 10),
  // send right away; the message will say "due in 3 min".
  const sendMs = Math.max(targetMs - leadMinutes * 60000, nowMs);
  return { ...base, sendAt: new Date(sendMs), targetAt: new Date(targetMs) };
}

function computeTaskRow(task: TaskLike, ctx: ReminderCtx, nowMs = Date.now()) {
  if (!task.dueTime || task.completed) return null;
  const targetMs = getTargetTimestamp(task.dueDate, task.dueTime, ctx.tz);
  return withLead(
    { userId: task.userId, kind: "task", refId: task.id, occurrenceDate: null },
    targetMs,
    ctx.leadMinutes,
    nowMs,
  );
}

function computeEventRow(event: EventLike, ctx: ReminderCtx, nowMs = Date.now()) {
  const targetMs = getTargetTimestamp(event.date, event.startTime, ctx.tz);
  return withLead(
    { userId: event.userId, kind: "event", refId: event.id, occurrenceDate: null },
    targetMs,
    ctx.leadMinutes,
    nowMs,
  );
}

/** Next day (in the user's timezone) the habit is planned and not yet done. */
export function computeHabitRow(
  habit: HabitLike,
  ctx: ReminderCtx,
  nowMs = Date.now(),
): ScheduleRow | null {
  if (!habit.reminderEnabled || !habit.reminderTime) return null;

  const targetDays = Array.isArray(habit.targetDays)
    ? (habit.targetDays as number[])
    : [0, 1, 2, 3, 4, 5, 6];
  const completedDates = Array.isArray(habit.completedDates)
    ? (habit.completedDates as string[])
    : [];
  if (targetDays.length === 0) return null;

  for (let offset = 0; offset <= 7; offset++) {
    const { dateStr, dayOfWeek } = getLocalDate(nowMs + offset * 86400000, ctx.tz);
    if (!targetDays.includes(dayOfWeek)) continue;
    if (completedDates.includes(dateStr)) continue;

    const targetMs = getTargetTimestamp(dateStr, habit.reminderTime, ctx.tz);
    if (targetMs <= nowMs) continue;

    // Habit reminders go out at the chosen time, no lead.
    return {
      userId: habit.userId,
      kind: "habit",
      refId: habit.id,
      occurrenceDate: dateStr,
      sendAt: new Date(targetMs),
      targetAt: new Date(targetMs),
    };
  }
  return null;
}

// ─── Writing the queue ───────────────────────────────────────────────────────

const sn = scheduledNotifications;

/**
 * Inserts or updates rows. If an item's time didn't change and its reminder
 * was already sent (or is being sent), it stays that way, so editing the
 * title of a task never sends its reminder twice.
 */
async function upsertRows(rows: ScheduleRow[]) {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += 500) {
    await db
      .insert(sn)
      .values(rows.slice(i, i + 500).map((r) => ({ ...r, status: "pending" })))
      .onConflictDoUpdate({
        target: [sn.kind, sn.refId],
        set: {
          userId: sql`excluded.user_id`,
          sendAt: sql`excluded.send_at`,
          occurrenceDate: sql`excluded.occurrence_date`,
          status: sql`CASE WHEN ${sn.status} IN ('sent', 'processing') AND ${sn.targetAt} = excluded.target_at THEN ${sn.status} ELSE 'pending' END`,
          lockedAt: sql`CASE WHEN ${sn.status} = 'processing' AND ${sn.targetAt} = excluded.target_at THEN ${sn.lockedAt} ELSE NULL END`,
          targetAt: sql`excluded.target_at`,
          updatedAt: new Date(),
        },
      });
  }
}

async function removeRow(kind: Kind, refId: number) {
  await db.delete(sn).where(and(eq(sn.kind, kind), eq(sn.refId, refId)));
}

/**
 * The user's timezone and lead time in one query. If the client sent a
 * timezone and the DB still has the 'UTC' default, the DB is updated in the
 * background.
 */
export async function getReminderContext(
  userId: number,
  clientTz?: string,
): Promise<ReminderCtx> {
  const validClientTz =
    clientTz && clientTz.trim() && clientTz !== "UTC" ? clientTz.trim() : null;

  const [settings] = await db
    .select({
      timezone: userSettings.timezone,
      leadMinutes: userSettings.reminderLeadMinutes,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const dbTz =
    settings?.timezone && settings.timezone !== "UTC" ? settings.timezone : null;

  if (validClientTz && settings && !dbTz) {
    db.update(userSettings)
      .set({ timezone: validClientTz, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .catch(() => {});
  }

  return {
    tz: validClientTz || dbTz || DEFAULT_TZ,
    leadMinutes: settings?.leadMinutes ?? DEFAULT_LEAD_MINUTES,
  };
}

function logError(what: string) {
  return (err: unknown) => console.error(`❌ [Reminders] ${what}:`, err);
}

// ─── Public API used by services (2 queries each: context + upsert) ─────────

export async function scheduleTaskReminder(task: TaskLike, clientTz?: string) {
  try {
    if (!task.dueTime || task.completed) return await removeRow("task", task.id);
    const row = computeTaskRow(task, await getReminderContext(task.userId, clientTz));
    if (row) await upsertRows([row]);
    else await removeRow("task", task.id);
  } catch (err) {
    logError(`schedule task ${task.id}`)(err);
  }
}

export async function scheduleEventReminder(event: EventLike, clientTz?: string) {
  try {
    const row = computeEventRow(event, await getReminderContext(event.userId, clientTz));
    if (row) await upsertRows([row]);
    else await removeRow("event", event.id);
  } catch (err) {
    logError(`schedule event ${event.id}`)(err);
  }
}

export async function scheduleHabitReminder(habit: HabitLike, clientTz?: string) {
  try {
    if (!habit.reminderEnabled || !habit.reminderTime) {
      return await removeRow("habit", habit.id);
    }
    const row = computeHabitRow(habit, await getReminderContext(habit.userId, clientTz));
    if (row) await upsertRows([row]);
    else await removeRow("habit", habit.id);
  } catch (err) {
    logError(`schedule habit ${habit.id}`)(err);
  }
}

export function cancelTaskReminder(taskId: number) {
  removeRow("task", taskId).catch(logError(`cancel task ${taskId}`));
}

export function cancelEventReminder(eventId: number) {
  removeRow("event", eventId).catch(logError(`cancel event ${eventId}`));
}

export function cancelHabitReminder(habitId: number) {
  removeRow("habit", habitId).catch(logError(`cancel habit ${habitId}`));
  removeRow("habit_snooze", habitId).catch(logError(`cancel habit snooze ${habitId}`));
}

/**
 * Recomputes every reminder for one user (after a timezone or lead-time
 * change), or for everyone when no userId is given (on startup, so the queue
 * is always complete, e.g. right after this table was first added).
 */
export async function rebuildReminders(userId?: number) {
  const fromDate = utcDateStr(-1);
  const byUser = (col: typeof tasks.userId | typeof calendarEvents.userId | typeof habits.userId) =>
    userId !== undefined ? [eq(col, userId)] : [];

  const [taskRows, eventRows, habitRows] = await Promise.all([
    db
      .select({ item: tasks, tz: userSettings.timezone, lead: userSettings.reminderLeadMinutes })
      .from(tasks)
      .leftJoin(userSettings, eq(userSettings.userId, tasks.userId))
      .where(
        and(
          ...byUser(tasks.userId),
          eq(tasks.completed, false),
          isNotNull(tasks.dueTime),
          gte(tasks.dueDate, fromDate),
        ),
      ),
    db
      .select({ item: calendarEvents, tz: userSettings.timezone, lead: userSettings.reminderLeadMinutes })
      .from(calendarEvents)
      .leftJoin(userSettings, eq(userSettings.userId, calendarEvents.userId))
      .where(and(...byUser(calendarEvents.userId), gte(calendarEvents.date, fromDate))),
    db
      .select({ item: habits, tz: userSettings.timezone, lead: userSettings.reminderLeadMinutes })
      .from(habits)
      .leftJoin(userSettings, eq(userSettings.userId, habits.userId))
      .where(
        and(
          ...byUser(habits.userId),
          eq(habits.reminderEnabled, true),
          isNotNull(habits.reminderTime),
        ),
      ),
  ]);

  const nowMs = Date.now();
  const ctxOf = (tz: string | null, lead: number | null): ReminderCtx => ({
    tz: resolveTz(tz),
    leadMinutes: lead ?? DEFAULT_LEAD_MINUTES,
  });

  const rows: ScheduleRow[] = [];
  for (const r of taskRows) {
    const row = computeTaskRow(r.item, ctxOf(r.tz, r.lead), nowMs);
    if (row) rows.push(row);
  }
  for (const r of eventRows) {
    const row = computeEventRow(r.item, ctxOf(r.tz, r.lead), nowMs);
    if (row) rows.push(row);
  }
  for (const r of habitRows) {
    const row = computeHabitRow(r.item, ctxOf(r.tz, r.lead), nowMs);
    if (row) rows.push(row);
  }

  await upsertRows(rows);
  return rows.length;
}

/** Kept for callers that reload one user's reminders. */
export async function reloadUserReminders(userId: number) {
  await rebuildReminders(userId);
}

// ─── The worker ──────────────────────────────────────────────────────────────

type ClaimedRow = typeof sn.$inferSelect;

async function claimDueRows(): Promise<ClaimedRow[]> {
  const due = db
    .select({ id: sn.id })
    .from(sn)
    .where(and(eq(sn.status, "pending"), sql`${sn.sendAt} <= now()`))
    .orderBy(sn.sendAt)
    .limit(BATCH_SIZE)
    .for("update", { skipLocked: true });

  return db
    .update(sn)
    .set({ status: "processing", lockedAt: new Date() })
    .where(inArray(sn.id, due))
    .returning();
}

async function releaseStuckRows() {
  await db
    .update(sn)
    .set({ status: "pending", lockedAt: null })
    .where(
      and(
        eq(sn.status, "processing"),
        lt(sn.lockedAt, new Date(Date.now() - STUCK_AFTER_MS)),
      ),
    );
}

async function processBatch(claimed: ClaimedRow[]) {
  const nowMs = Date.now();
  const idsOf = (kind: Kind) => claimed.filter((r) => r.kind === kind).map((r) => r.refId);
  const taskIds = idsOf("task");
  const eventIds = idsOf("event");
  const habitIds = [...new Set([...idsOf("habit"), ...idsOf("habit_snooze")])];
  const userIds = [...new Set(claimed.map((r) => r.userId))];

  // Load everything for the whole batch at once: at most 5 queries,
  // however many reminders are in it.
  const [taskList, eventList, habitList, userList, tokenList] = await Promise.all([
    taskIds.length ? db.select().from(tasks).where(inArray(tasks.id, taskIds)) : [],
    eventIds.length
      ? db.select().from(calendarEvents).where(inArray(calendarEvents.id, eventIds))
      : [],
    habitIds.length ? db.select().from(habits).where(inArray(habits.id, habitIds)) : [],
    db
      .select({
        id: users.id,
        name: users.name,
        enabled: userSettings.notificationsEnabled,
        tz: userSettings.timezone,
        lead: userSettings.reminderLeadMinutes,
        notifyTasks: userSettings.notifyTaskReminders,
        notifyEvents: userSettings.notifyEventReminders,
        notifyHabits: userSettings.notifyHabitReminders,
      })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(inArray(users.id, userIds)),
    db
      .select({ userId: userDeviceTokens.userId, token: userDeviceTokens.fcmToken })
      .from(userDeviceTokens)
      .where(inArray(userDeviceTokens.userId, userIds)),
  ]);

  const taskById = new Map(taskList.map((t) => [t.id, t]));
  const eventById = new Map(eventList.map((e) => [e.id, e]));
  const habitById = new Map(habitList.map((h) => [h.id, h]));
  const userById = new Map(userList.map((u) => [u.id, u]));
  const tokensByUser = new Map<number, string[]>();
  for (const { userId, token } of tokenList) {
    tokensByUser.set(userId, [...(tokensByUser.get(userId) || []), token]);
  }

  const finalStatus = new Map<number, string>(); // row id -> status
  const habitNext: { rowId: number; next: ScheduleRow | null }[] = [];
  const logs: (typeof notificationLogs.$inferInsert)[] = [];

  await Promise.all(
    claimed.map(async (row) => {
      const user = userById.get(row.userId);
      const ctx: ReminderCtx = {
        tz: resolveTz(user?.tz),
        leadMinutes: user?.lead ?? DEFAULT_LEAD_MINUTES,
      };
      // Signed: negative means overdue (e.g. a snoozed task).
      const minutesLeft = Math.round((row.targetAt.getTime() - nowMs) / 60000);
      // Based on send time, so a snoozed reminder isn't treated as stale.
      const tooLate = nowMs - row.sendAt.getTime() > STALE_AFTER_MS;
      const pushEnabled = user ? user.enabled !== false : false;
      const typeEnabled =
        !!user &&
        (row.kind === "task"
          ? user.notifyTasks !== false
          : row.kind === "event"
            ? user.notifyEvents !== false
            : user.notifyHabits !== false);

      let payload: PushPayload | null = null;

      if (row.kind === "task") {
        const task = taskById.get(row.refId);
        if (task && !task.completed && task.dueTime) {
          payload = {
            ...taskReminderMessage({ ...task, minutesLeft }),
            type: "task_reminder",
            data: {
              taskId: String(task.id),
              moduleId: "tasks",
              kind: "task",
              refId: String(task.id),
              actions: "done,snooze",
            },
          };
        }
      } else if (row.kind === "event") {
        const event = eventById.get(row.refId);
        if (event) {
          payload = {
            ...eventReminderMessage({ ...event, minutesLeft }),
            type: "calendar_event",
            data: { eventId: String(event.id), moduleId: "calendar" },
          };
        }
      } else {
        const habit = habitById.get(row.refId);
        const isSnooze = row.kind === "habit_snooze";
        if (habit) {
          const done = ((habit.completedDates as string[]) || []).includes(
            row.occurrenceDate || "",
          );
          if (habit.reminderEnabled && !done) {
            payload = {
              ...habitReminderMessage({
                title: habit.title,
                description: habit.description,
                streak: habit.streak,
                firstName: firstNameOf(user?.name),
              }),
              type: "habit_reminder",
              data: {
                habitId: String(habit.id),
                moduleId: "habits",
                kind: "habit",
                refId: String(habit.id),
                actions: "done,snooze",
              },
            };
          }
        }
        // A snooze is one-off; only the daily row moves to the next day.
        if (isSnooze) {
          // nothing to reschedule
        } else if (habit) {
          // Whatever happens today, line up the next occurrence. Compute from
          // just after this one so today's slot isn't picked again.
          habitNext.push({
            rowId: row.id,
            next: computeHabitRow(habit, ctx, Math.max(nowMs, row.targetAt.getTime()) + 1000),
          });
        } else {
          habitNext.push({ rowId: row.id, next: null });
        }
      }

      if (!payload || !typeEnabled || tooLate) {
        finalStatus.set(row.id, "skipped");
        return;
      }

      // Push turned off: still show it in the in-app inbox.
      const { status } = pushEnabled
        ? await deliverPush(row.userId, tokensByUser.get(row.userId) || [], payload)
        : { status: "in_app" as const };
      finalStatus.set(row.id, status === "failed" ? "failed" : "sent");
      logs.push({
        userId: row.userId,
        title: payload.title,
        body: payload.body,
        type: payload.type || "system",
        data: payload.data || {},
        status,
      });
    }),
  );

  // Write results back. Tasks/events: one UPDATE per status.
  const habitRowIds = new Set(habitNext.map((h) => h.rowId));
  const byStatus = new Map<string, number[]>();
  for (const [rowId, status] of finalStatus) {
    if (habitRowIds.has(rowId)) continue;
    byStatus.set(status, [...(byStatus.get(status) || []), rowId]);
  }
  const writes: Promise<unknown>[] = [];
  for (const [status, ids] of byStatus) {
    writes.push(
      db
        .update(sn)
        .set({
          status,
          lockedAt: null,
          sentAt: status === "sent" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(inArray(sn.id, ids)),
    );
  }

  // Habits: move the row to the next day, or remove it if there is none.
  for (const { rowId, next } of habitNext) {
    writes.push(
      next
        ? db
            .update(sn)
            .set({
              status: "pending",
              lockedAt: null,
              sendAt: next.sendAt,
              targetAt: next.targetAt,
              occurrenceDate: next.occurrenceDate,
              sentAt: finalStatus.get(rowId) === "sent" ? new Date() : undefined,
              updatedAt: new Date(),
            })
            .where(eq(sn.id, rowId))
        : db.delete(sn).where(eq(sn.id, rowId)),
    );
  }

  if (logs.length > 0) writes.push(db.insert(notificationLogs).values(logs));
  await Promise.all(writes);

  const sent = [...finalStatus.values()].filter((s) => s === "sent").length;
  console.log(
    `🔔 [Reminders] Processed ${claimed.length} due reminder(s): ${sent} sent, ${claimed.length - sent} skipped/failed.`,
  );
}

export async function runReminderWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    if (!(await isFlagEnabled("reminders_cron", true))) return;

    if (runCount++ % 10 === 0) await releaseStuckRows();

    // Keep going while full batches come back (a busy minute).
    for (let round = 0; round < 20; round++) {
      const claimed = await claimDueRows();
      if (claimed.length === 0) break;
      await processBatch(claimed);
      if (claimed.length < BATCH_SIZE) break;
    }
  } catch (err) {
    console.error("❌ [Reminders] Worker run failed:", err);
  } finally {
    isWorkerRunning = false;
  }
}

export function startReminderCron(): ScheduledTask {
  if (workerTask) return workerTask;

  rebuildReminders()
    .then((n) => console.log(`  🔔 [Reminders] Queue rebuilt on startup (${n} upcoming).`))
    .catch(logError("startup rebuild"));

  workerTask = cron.schedule("* * * * *", runReminderWorker);
  console.log("  🕒 [Cron] Reminder worker scheduled -> (* * * * *) every minute");
  return workerTask;
}

export function stopReminderCron(): void {
  if (workerTask) {
    workerTask.stop();
    workerTask = null;
  }
  console.log("  🛑 [Cron] Reminder worker stopped.");
}

/** Deletes finished rows older than `days`. Called by the nightly cleanup. */
export async function purgeOldScheduledNotifications(days = 14) {
  await db
    .delete(sn)
    .where(
      and(
        or(eq(sn.status, "sent"), eq(sn.status, "skipped"), eq(sn.status, "failed")),
        lt(sn.updatedAt, new Date(Date.now() - days * 86400000)),
      ),
    );
}
