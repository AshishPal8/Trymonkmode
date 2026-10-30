import { and, desc, eq, gte, inArray, isNull, lt, ne, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  notificationLogs,
  scheduledNotifications,
  tasks,
  habits,
  users,
  userSettings,
  userPlans,
  userDeviceTokens,
} from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import { deliverPush, type PushPayload } from "./notifications.service.js";
import { getLocalDate, getReminderContext } from "../cron/reminders.cron.js";
import { toggleTaskService } from "../tasks/tasks.service.js";
import { toggleCheckInService } from "../habits/habits.service.js";
import type {
  InboxQueryInput,
  MarkReadInput,
  NotificationActionInput,
  BroadcastInput,
} from "./notifications.schema.js";

const logs = notificationLogs;
const sn = scheduledNotifications;

// ─── Inbox ───────────────────────────────────────────────────────────────────

async function countUnread(userId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(logs)
    .where(and(eq(logs.userId, userId), isNull(logs.readAt)));
  return row?.count ?? 0;
}

/** Newest first, paged by id. 2 queries (items + unread count) in parallel. */
export async function getInboxService(userId: number, query: InboxQueryInput) {
  const limit = query.limit ?? 20;
  const [rows, unreadCount] = await Promise.all([
    db
      .select({
        id: logs.id,
        title: logs.title,
        body: logs.body,
        type: logs.type,
        data: logs.data,
        readAt: logs.readAt,
        createdAt: logs.createdAt,
      })
      .from(logs)
      .where(
        and(
          eq(logs.userId, userId),
          query.before ? lt(logs.id, query.before) : undefined,
        ),
      )
      .orderBy(desc(logs.id))
      .limit(limit + 1),
    countUnread(userId),
  ]);

  return {
    items: rows.slice(0, limit),
    hasMore: rows.length > limit,
    unreadCount,
  };
}

/** Marks the given ids (or everything) as read. */
export async function markReadService(userId: number, input: MarkReadInput) {
  await db
    .update(logs)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(logs.userId, userId),
        isNull(logs.readAt),
        input.ids?.length ? inArray(logs.id, input.ids) : undefined,
      ),
    );
  return { unreadCount: input.ids?.length ? await countUnread(userId) : 0 };
}

// ─── Actions from notification buttons (Snooze / Done) ───────────────────────

export async function notificationActionService(
  userId: number,
  input: NotificationActionInput,
) {
  const { action, kind, refId } = input;

  if (kind === "task") {
    const [task] = await db
      .select({ id: tasks.id, completed: tasks.completed, title: tasks.title })
      .from(tasks)
      .where(and(eq(tasks.id, refId), eq(tasks.userId, userId)))
      .limit(1);
    if (!task) throw new NotFoundError("Task not found.");

    if (action === "done") {
      if (task.completed) return { message: `"${task.title}" is already done.` };
      await toggleTaskService(userId, refId);
      return { message: `Nice! "${task.title}" is done.`, moduleId: "tasks" };
    }

    const minutes = input.minutes ?? 10;
    const sendAt = new Date(Date.now() + minutes * 60000);
    const updated = await db
      .update(sn)
      .set({ sendAt, status: "pending", lockedAt: null, updatedAt: new Date() })
      .where(and(eq(sn.kind, "task"), eq(sn.refId, refId), eq(sn.userId, userId)))
      .returning({ id: sn.id });
    if (updated.length === 0) {
      // Row was already cleaned up; create a one-off.
      await db.insert(sn).values({
        userId,
        kind: "task",
        refId,
        sendAt,
        targetAt: sendAt,
        status: "pending",
      });
    }
    return { message: `Okay, I'll remind you in ${minutes} min.` };
  }

  // Habits
  const [habit] = await db
    .select({ id: habits.id, title: habits.title, completedDates: habits.completedDates })
    .from(habits)
    .where(and(eq(habits.id, refId), eq(habits.userId, userId)))
    .limit(1);
  if (!habit) throw new NotFoundError("Habit not found.");

  const { tz } = await getReminderContext(userId);
  const today = getLocalDate(Date.now(), tz).dateStr;

  if (action === "done") {
    const done = ((habit.completedDates as string[]) || []).includes(today);
    if (done) return { message: `"${habit.title}" is already checked off today.` };
    await toggleCheckInService(userId, refId, today);
    return { message: `Checked off "${habit.title}". Streak kept!`, moduleId: "habits" };
  }

  // Snooze uses its own one-off row, so the habit's daily row isn't touched.
  const minutes = input.minutes ?? 10;
  const sendAt = new Date(Date.now() + minutes * 60000);
  await db
    .insert(sn)
    .values({
      userId,
      kind: "habit_snooze",
      refId,
      sendAt,
      targetAt: sendAt,
      occurrenceDate: today,
      status: "pending",
    })
    .onConflictDoUpdate({
      target: [sn.kind, sn.refId],
      set: {
        sendAt,
        targetAt: sendAt,
        occurrenceDate: today,
        status: "pending",
        lockedAt: null,
        updatedAt: new Date(),
      },
    });
  return { message: `Okay, I'll remind you in ${minutes} min.` };
}

// ─── Admin: broadcast ────────────────────────────────────────────────────────

/**
 * Sends one message to every user in the audience. Users who turned push off
 * (or have no devices) still get it in their in-app inbox.
 * Runs in the background; returns how many users it targets.
 */
export async function broadcastService(input: BroadcastInput) {
  const recipients = await db
    .select({
      id: users.id,
      pushEnabled: userSettings.notificationsEnabled,
      planTier: userPlans.planTier,
    })
    .from(users)
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .leftJoin(userPlans, eq(userPlans.userId, users.id))
    .where(
      input.audience === "free"
        ? sql`coalesce(${userPlans.planTier}, 'free') = 'free'`
        : input.audience === "paid"
          ? sql`coalesce(${userPlans.planTier}, 'free') <> 'free'`
          : undefined,
    );

  const payload: PushPayload = {
    title: input.title,
    body: input.body,
    type: "system",
    data: {
      broadcast: "1",
      ...(input.moduleId ? { moduleId: input.moduleId } : {}),
    },
  };

  runBroadcast(recipients, payload).catch((err) =>
    console.error("❌ [Broadcast] Failed:", err),
  );

  return { targetedUsers: recipients.length };
}

async function runBroadcast(
  recipients: { id: number; pushEnabled: boolean | null }[],
  payload: PushPayload,
) {
  const CHUNK = 200;
  let sent = 0;

  for (let i = 0; i < recipients.length; i += CHUNK) {
    const chunk = recipients.slice(i, i + CHUNK);
    const pushIds = chunk.filter((r) => r.pushEnabled !== false).map((r) => r.id);

    // One token query per chunk.
    const tokenRows = pushIds.length
      ? await db
          .select({ userId: userDeviceTokens.userId, token: userDeviceTokens.fcmToken })
          .from(userDeviceTokens)
          .where(inArray(userDeviceTokens.userId, pushIds))
      : [];
    const tokensByUser = new Map<number, string[]>();
    for (const { userId, token } of tokenRows) {
      tokensByUser.set(userId, [...(tokensByUser.get(userId) || []), token]);
    }

    const results = await Promise.all(
      chunk.map(async (r) => {
        if (r.pushEnabled === false) return { userId: r.id, status: "in_app" };
        const { status } = await deliverPush(r.id, tokensByUser.get(r.id) || [], payload);
        if (status === "sent") sent++;
        return { userId: r.id, status };
      }),
    );

    // One log insert per chunk.
    await db.insert(logs).values(
      results.map((r) => ({
        userId: r.userId,
        title: payload.title,
        body: payload.body,
        type: payload.type || "system",
        data: payload.data || {},
        status: r.status,
      })),
    );
  }

  console.log(
    `📣 [Broadcast] "${payload.title}" -> ${recipients.length} users, ${sent} with push delivered.`,
  );
}

// ─── Admin: delivery stats ───────────────────────────────────────────────────

export async function notificationStatsService(days = 7) {
  const since = new Date(Date.now() - days * 86400000);

  const [byTypeStatus, totals, queue, devices] = await Promise.all([
    db
      .select({
        type: logs.type,
        status: logs.status,
        count: sql<number>`count(*)::int`,
      })
      .from(logs)
      .where(gte(logs.createdAt, since))
      .groupBy(logs.type, logs.status),
    db
      .select({
        total: sql<number>`count(*)::int`,
        read: sql<number>`count(${logs.readAt})::int`,
      })
      .from(logs)
      .where(gte(logs.createdAt, since)),
    db
      .select({ kind: sn.kind, status: sn.status, count: sql<number>`count(*)::int` })
      .from(sn)
      .where(ne(sn.status, "sent"))
      .groupBy(sn.kind, sn.status),
    db
      .select({
        tokens: sql<number>`count(*)::int`,
        usersWithDevices: sql<number>`count(distinct ${userDeviceTokens.userId})::int`,
      })
      .from(userDeviceTokens),
  ]);

  const total = totals[0]?.total ?? 0;
  const read = totals[0]?.read ?? 0;
  const delivered = byTypeStatus
    .filter((r) => r.status === "sent")
    .reduce((n, r) => n + r.count, 0);
  const failed = byTypeStatus
    .filter((r) => r.status === "failed")
    .reduce((n, r) => n + r.count, 0);

  return {
    days,
    total,
    delivered,
    failed,
    readRate: total > 0 ? Math.round((read / total) * 100) : 0,
    byTypeStatus,
    queue,
    devices: devices[0] ?? { tokens: 0, usersWithDevices: 0 },
  };
}
