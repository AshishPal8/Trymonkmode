// "Focus together": who is focusing right now, and shared group timers.

import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { focusPresence, focusRooms, groupMembers } from "../../db/schema.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import { sendPushNotificationToUser } from "../notifications/notifications.service.js";
import { getGroupMembership } from "./group.service.js";

/** Longest a presence can claim, so a crashed tab can't show "focusing" forever. */
const MAX_PRESENCE_MS = 4 * 60 * 60 * 1000;

// ─── My presence ─────────────────────────────────────────────────────────────

/** Called when my timer starts. `endsAt` null = stopwatch (shown for up to 4 hours). */
export async function setPresenceService(me: number, endsAt: Date | null, roomId: number | null = null) {
  const cap = new Date(Date.now() + MAX_PRESENCE_MS);
  const until = endsAt && endsAt < cap ? endsAt : cap;
  await db
    .insert(focusPresence)
    .values({ userId: me, endsAt: until, roomId, updatedAt: new Date() })
    .onConflictDoUpdate({ target: focusPresence.userId, set: { endsAt: until, roomId, updatedAt: new Date() } });
  return { endsAt: until };
}

/** Called when my timer stops, pauses or finishes. */
export async function clearPresenceService(me: number) {
  await db.delete(focusPresence).where(eq(focusPresence.userId, me));
  return { message: "Stopped." };
}

// ─── Group live view (polled while the group page is open) ───────────────────

export async function getGroupLiveService(me: number, groupId: number) {
  // Membership check runs alongside the two small reads (it throws if I'm not in the group).
  const [, focusing, [room]] = await Promise.all([
    getGroupMembership(groupId, me),
    db
      .select({ userId: focusPresence.userId, endsAt: focusPresence.endsAt, roomId: focusPresence.roomId })
      .from(groupMembers)
      .innerJoin(focusPresence, eq(focusPresence.userId, groupMembers.userId))
      .where(and(eq(groupMembers.groupId, groupId), gt(focusPresence.endsAt, new Date()))),
    db
      .select({ id: focusRooms.id, hostId: focusRooms.hostId, durationMinutes: focusRooms.durationMinutes, endsAt: focusRooms.endsAt })
      .from(focusRooms)
      .where(and(eq(focusRooms.groupId, groupId), gt(focusRooms.endsAt, new Date())))
      .orderBy(desc(focusRooms.endsAt))
      .limit(1),
  ]);
  return { focusing, room: room ?? null };
}

// ─── Shared timers ───────────────────────────────────────────────────────────

/** Start a shared timer; everyone in the group gets a push to join. */
export async function startRoomService(me: number, myName: string, groupId: number, durationMinutes: number) {
  const { group } = await getGroupMembership(groupId, me);
  const [running] = await db
    .select({ id: focusRooms.id })
    .from(focusRooms)
    .where(and(eq(focusRooms.groupId, groupId), gt(focusRooms.endsAt, new Date())))
    .limit(1);
  if (running) throw new BadRequestError("A focus session is already running in this group. Join it instead.");

  const endsAt = new Date(Date.now() + durationMinutes * 60_000);
  const [room] = await db.insert(focusRooms).values({ groupId, hostId: me, durationMinutes, endsAt }).returning();
  await setPresenceService(me, endsAt, room.id);

  const others = await db
    .select({ userId: groupMembers.userId })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), sql`${groupMembers.userId} <> ${me}`));
  for (const { userId } of others) {
    sendPushNotificationToUser(userId, {
      title: `${group.emoji} ${myName} started a ${durationMinutes}-min focus`,
      body: `Join "${group.name}" and focus together.`,
      type: "social",
      data: { moduleId: "groups" },
    }).catch(() => {});
  }
  return { id: room.id, hostId: me, durationMinutes, endsAt };
}

/** Join a running shared timer: my timer will end when the room ends. */
export async function joinRoomService(me: number, groupId: number, roomId: number) {
  await getGroupMembership(groupId, me);
  const [room] = await db
    .select({ id: focusRooms.id, endsAt: focusRooms.endsAt, durationMinutes: focusRooms.durationMinutes })
    .from(focusRooms)
    .where(and(eq(focusRooms.id, roomId), eq(focusRooms.groupId, groupId), gt(focusRooms.endsAt, new Date())))
    .limit(1);
  if (!room) throw new NotFoundError("This focus session has already ended.");

  await setPresenceService(me, room.endsAt, room.id);
  return room;
}
