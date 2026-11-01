import { and, eq, gte, inArray, or, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { friendships, focusSessions, users, userSettings } from "../../db/schema.js";
import { BadRequestError, NotFoundError } from "../../utils/errors.js";
import { daysAgo } from "../../utils/date.js";
import { sendPushNotificationToUser } from "../notifications/notifications.service.js";
import { MAX_FRIENDS, MAX_PENDING_SENT, normalizeUsername, orderedPair, otherUserId } from "./social.rules.js";
import { publicUserColumns, type PublicUser } from "./social.profile.service.js";

type FriendshipRow = typeof friendships.$inferSelect;

// ─── Small helpers ───────────────────────────────────────────────────────────

const pairCondition = (a: number, b: number) => {
  const { userLowId, userHighId } = orderedPair(a, b);
  return and(eq(friendships.userLowId, userLowId), eq(friendships.userHighId, userHighId));
};

const involves = (userId: number) => or(eq(friendships.userLowId, userId), eq(friendships.userHighId, userId));

async function findPair(a: number, b: number): Promise<FriendshipRow | null> {
  const [row] = await db.select().from(friendships).where(pairCondition(a, b)).limit(1);
  return row ?? null;
}

async function getPublicUser(where: ReturnType<typeof eq>): Promise<PublicUser | null> {
  const [user] = await db.select(publicUserColumns).from(users).where(where).limit(1);
  return user ?? null;
}

const displayName = (u: PublicUser) => u.name || (u.username ? `@${u.username}` : "Someone");

async function countFor(userId: number, status: "accepted" | "pending", sentOnly = false) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(friendships)
    .where(
      and(involves(userId), eq(friendships.status, status), sentOnly ? eq(friendships.requesterId, userId) : undefined),
    );
  return row?.n ?? 0;
}

async function assertRoomForFriend(userId: number) {
  if ((await countFor(userId, "accepted")) >= MAX_FRIENDS) {
    throw new BadRequestError(`You can have up to ${MAX_FRIENDS} friends.`);
  }
}

/** Push + inbox note to a friend (fire and forget). */
function notify(userId: number, title: string, body: string) {
  sendPushNotificationToUser(userId, { title, body, type: "social", data: { moduleId: "leaderboard" } }).catch(() => {});
}

/** Blocked pairs look like "not found" to the person who was blocked. */
function assertNotBlocked(row: FriendshipRow | null, me: number) {
  if (row?.status !== "blocked") return;
  if (row.blockedBy === me) throw new BadRequestError("You blocked this person. Unblock them first.");
  throw new NotFoundError("No user with that username.");
}

async function makeFriends(me: number, other: number, existing: FriendshipRow | null) {
  if (existing) {
    await db
      .update(friendships)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(friendships.id, existing.id));
  } else {
    await db.insert(friendships).values({ ...orderedPair(me, other), requesterId: other, status: "accepted" });
  }
}

// ─── Listing ─────────────────────────────────────────────────────────────────

/** Friends' streak, XP and last-7-days focus, only when they share their stats. */
async function loadFriendStats(friendIds: number[]) {
  const stats = new Map<number, { streak: number; xp: number; level: number; weekFocusMinutes: number }>();
  if (friendIds.length === 0) return stats;

  const [profiles, focus] = await Promise.all([
    db
      .select({ id: users.id, streak: users.streak, xp: users.xp, level: users.level, visibility: userSettings.statsVisibility })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .where(inArray(users.id, friendIds)),
    db
      .select({ userId: focusSessions.userId, minutes: sql<number>`coalesce(sum(${focusSessions.durationMinutes}), 0)::int` })
      .from(focusSessions)
      .where(and(inArray(focusSessions.userId, friendIds), gte(focusSessions.endedAt, daysAgo(7))))
      .groupBy(focusSessions.userId),
  ]);

  const focusByUser = new Map(focus.map((f) => [f.userId, f.minutes]));
  for (const p of profiles) {
    if (p.visibility === "private") continue;
    stats.set(p.id, { streak: p.streak, xp: p.xp, level: p.level, weekFocusMinutes: focusByUser.get(p.id) ?? 0 });
  }
  return stats;
}

/** Friends, requests in both directions and blocked people: 3 queries in all. */
export async function listFriendsService(me: number) {
  const otherIdSql = sql`case when ${friendships.userLowId} = ${me} then ${friendships.userHighId} else ${friendships.userLowId} end`;
  const rows = await db
    .select({ friendship: friendships, other: publicUserColumns })
    .from(friendships)
    .innerJoin(users, eq(users.id, otherIdSql))
    .where(involves(me))
    .orderBy(sql`${friendships.updatedAt} desc`);

  const friendIds = rows.filter((r) => r.friendship.status === "accepted").map((r) => r.other.id);
  const stats = await loadFriendStats(friendIds);

  const result = {
    friends: [] as (PublicUser & { since: Date; stats: ReturnType<typeof stats.get> | null })[],
    incoming: [] as (PublicUser & { sentAt: Date })[],
    outgoing: [] as (PublicUser & { sentAt: Date })[],
    blocked: [] as PublicUser[],
  };

  for (const { friendship: f, other } of rows) {
    if (f.status === "accepted") result.friends.push({ ...other, since: f.updatedAt, stats: stats.get(other.id) ?? null });
    else if (f.status === "pending" && f.requesterId === me) result.outgoing.push({ ...other, sentAt: f.createdAt });
    else if (f.status === "pending") result.incoming.push({ ...other, sentAt: f.createdAt });
    else if (f.status === "blocked" && f.blockedBy === me) result.blocked.push(other);
  }
  // Most active friends first.
  result.friends.sort((a, b) => (b.stats?.weekFocusMinutes ?? -1) - (a.stats?.weekFocusMinutes ?? -1));
  return result;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export async function sendFriendRequestService(me: number, rawUsername: string) {
  const target = await getPublicUser(eq(users.username, normalizeUsername(rawUsername)));
  if (!target) throw new NotFoundError("No user with that username.");
  if (target.id === me) throw new BadRequestError("That's you! Share your invite link with a friend instead.");

  const existing = await findPair(me, target.id);
  assertNotBlocked(existing, me);
  if (existing?.status === "accepted") throw new BadRequestError("You're already friends.");
  if (existing?.status === "pending" && existing.requesterId === me) throw new BadRequestError("Request already sent.");

  // They already asked me: sending one back means yes.
  if (existing?.status === "pending") return acceptFriendRequestService(me, target.id);

  if ((await countFor(me, "pending", true)) >= MAX_PENDING_SENT) {
    throw new BadRequestError("You have too many requests waiting. Cancel a few first.");
  }
  await assertRoomForFriend(me);

  await db.insert(friendships).values({ ...orderedPair(me, target.id), requesterId: me, status: "pending" });
  const sender = await getPublicUser(eq(users.id, me));
  notify(target.id, "👋 New friend request", `${sender ? displayName(sender) : "Someone"} wants to be your friend.`);
  return { status: "pending" as const, user: target };
}

/** Opening a friend's invite link: friends right away (the link was their yes). */
export async function joinByInviteService(me: number, code: string) {
  const inviter = await getPublicUser(eq(users.inviteCode, code.toUpperCase()));
  if (!inviter) throw new NotFoundError("This invite link doesn't work anymore.");
  if (inviter.id === me) throw new BadRequestError("That's your own invite link.");

  const existing = await findPair(me, inviter.id);
  if (existing?.status === "blocked") throw new BadRequestError("This invite can't be used.");
  if (existing?.status === "accepted") return { status: "accepted" as const, user: inviter, alreadyFriends: true };

  await assertRoomForFriend(me);
  await makeFriends(me, inviter.id, existing);

  const joiner = await getPublicUser(eq(users.id, me));
  notify(inviter.id, "🎉 Your invite worked", `${joiner ? displayName(joiner) : "A friend"} joined you on TryMonkMode.`);
  return { status: "accepted" as const, user: inviter, alreadyFriends: false };
}

export async function acceptFriendRequestService(me: number, otherId: number) {
  const row = await findPair(me, otherId);
  if (!row || row.status !== "pending" || row.requesterId === me) throw new NotFoundError("No request from this person.");

  await assertRoomForFriend(me);
  await makeFriends(me, otherId, row);

  const accepter = await getPublicUser(eq(users.id, me));
  notify(otherId, "🤝 Friend request accepted", `You and ${accepter ? displayName(accepter) : "your friend"} are now friends.`);
  return { status: "accepted" as const, user: await getPublicUser(eq(users.id, otherId)) };
}

export async function declineFriendRequestService(me: number, otherId: number) {
  const row = await findPair(me, otherId);
  if (!row || row.status !== "pending" || row.requesterId === me) throw new NotFoundError("No request from this person.");
  await db.delete(friendships).where(eq(friendships.id, row.id));
  return { message: "Request declined." };
}

/** Unfriend, or cancel a request I sent. */
export async function removeFriendService(me: number, otherId: number) {
  const row = await findPair(me, otherId);
  const canRemove = row && (row.status === "accepted" || (row.status === "pending" && row.requesterId === me));
  if (!canRemove) throw new NotFoundError("Nothing to remove.");
  await db.delete(friendships).where(eq(friendships.id, row.id));
  return { message: row.status === "accepted" ? "Friend removed." : "Request cancelled." };
}

// ─── Blocking ────────────────────────────────────────────────────────────────

export async function blockUserService(me: number, otherId: number) {
  if (otherId === me) throw new BadRequestError("You can't block yourself.");
  const other = await getPublicUser(eq(users.id, otherId));
  if (!other) throw new NotFoundError("User not found.");

  const existing = await findPair(me, otherId);
  if (existing?.status === "blocked" && existing.blockedBy !== me) {
    return { message: "Blocked." }; // already blocked from their side; nothing to change
  }
  await db
    .insert(friendships)
    .values({ ...orderedPair(me, otherId), requesterId: me, status: "blocked", blockedBy: me })
    .onConflictDoUpdate({
      target: [friendships.userLowId, friendships.userHighId],
      set: { status: "blocked", blockedBy: me, updatedAt: new Date() },
    });
  return { message: "Blocked. They can't send you requests or see your stats." };
}

export async function unblockUserService(me: number, otherId: number) {
  const row = await findPair(me, otherId);
  if (!row || row.status !== "blocked" || row.blockedBy !== me) throw new NotFoundError("This person isn't blocked.");
  await db.delete(friendships).where(eq(friendships.id, row.id));
  return { message: "Unblocked." };
}

/** Ids of my accepted friends (for challenges and leaderboards later). */
export async function friendIdsOf(me: number): Promise<number[]> {
  const rows = await db
    .select({ userLowId: friendships.userLowId, userHighId: friendships.userHighId })
    .from(friendships)
    .where(and(involves(me), eq(friendships.status, "accepted")));
  return rows.map((r) => otherUserId(r, me));
}
