import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { groupMembers, groups } from "../../db/schema.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { daysAgo, DEFAULT_TIMEZONE } from "../../utils/date.js";
import { sendPushNotificationToUser } from "../notifications/notifications.service.js";
import { friendIdsOf } from "../social/social.friends.service.js";
import { MAX_GROUP_MEMBERS, MAX_GROUPS_PER_USER, STREAK_WEEKS_LOOKBACK, weekSummary, type WeekTotal } from "./group.rules.js";
import type { CreateGroupInput, UpdateGroupInput } from "./group.schema.js";

const TZ = DEFAULT_TIMEZONE;

/** Focus minutes per (group, week) for the given groups' current members. */
const weeklyTotalsSql = (groupFilter: ReturnType<typeof sql>) => sql`
  select gm.group_id,
         date_trunc('week', fs.ended_at at time zone ${TZ})::date::text as week,
         sum(fs.duration_minutes)::int as minutes
  from group_members gm
  join focus_sessions fs on fs.user_id = gm.user_id
  where ${groupFilter} and fs.ended_at >= ${daysAgo(STREAK_WEEKS_LOOKBACK * 7 + 7)}
  group by 1, 2`;

// ─── Access ──────────────────────────────────────────────────────────────────

async function getMembership(groupId: number, userId: number) {
  const [row] = await db
    .select({ group: groups, role: groupMembers.role })
    .from(groupMembers)
    .innerJoin(groups, eq(groups.id, groupMembers.groupId))
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);
  if (!row) throw new NotFoundError("Group not found.");
  return row;
}

async function assertOwner(groupId: number, userId: number) {
  const m = await getMembership(groupId, userId);
  if (m.role !== "owner") throw new ForbiddenError("Only the group owner can do that.");
  return m;
}

async function assertAllFriends(me: number, userIds: number[]) {
  const friends = new Set(await friendIdsOf(me));
  if (userIds.some((id) => !friends.has(id))) throw new BadRequestError("You can only add your friends.");
}

function notifyAdded(userIds: number[], groupName: string, emoji: string, adderName: string) {
  for (const userId of userIds) {
    sendPushNotificationToUser(userId, {
      title: `${emoji} You joined "${groupName}"`,
      body: `${adderName} added you to their accountability group.`,
      type: "social",
      data: { moduleId: "groups" },
    }).catch(() => {});
  }
}

// ─── List ────────────────────────────────────────────────────────────────────

type ListRow = {
  id: number;
  name: string;
  emoji: string;
  weekly_goal_minutes: number;
  role: string;
  member_count: number;
  weeks: WeekTotal[];
};

/** All my groups with members count, this week's progress and group streak: one query. */
export async function listGroupsService(me: number) {
  const { rows } = await db.execute<ListRow>(sql`
    with mine as (select group_id, role from group_members where user_id = ${me}),
    weekly as (${weeklyTotalsSql(sql`gm.group_id in (select group_id from mine)`)})
    select g.id, g.name, g.emoji, g.weekly_goal_minutes, mine.role,
           (select count(*) from group_members m where m.group_id = g.id)::int as member_count,
           coalesce((select json_agg(json_build_object('week', w.week, 'minutes', w.minutes))
                     from weekly w where w.group_id = g.id), '[]'::json) as weeks
    from groups g join mine on mine.group_id = g.id
    order by g.created_at`);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    emoji: r.emoji,
    weeklyGoalMinutes: r.weekly_goal_minutes,
    isOwner: r.role === "owner",
    memberCount: r.member_count,
    ...weekSummary(r.weeks, r.weekly_goal_minutes),
  }));
}

// ─── Detail ──────────────────────────────────────────────────────────────────

type MemberRow = {
  id: number;
  name: string;
  username: string | null;
  avatar: string | null;
  role: string;
  streak: number;
  week_minutes: number;
};

type FeedRow = { kind: "focus" | "badge" | "joined"; user_id: number; minutes: number | null; title: string | null; emoji: string | null; at: string };

/** Group, members (with this week's minutes and streak), weekly totals and a 7-day feed. */
export async function getGroupDetailService(me: number, groupId: number) {
  const { group, role } = await getMembership(groupId, me);
  const weekStart = sql`date_trunc('week', now() at time zone ${TZ})`;

  const [members, weeks, feed] = await Promise.all([
    db.execute<MemberRow>(sql`
      select u.id, u.name, u.username, u.avatar, gm.role, u.streak,
             coalesce((select sum(fs.duration_minutes) from focus_sessions fs
                       where fs.user_id = u.id and (fs.ended_at at time zone ${TZ}) >= ${weekStart}), 0)::int as week_minutes
      from group_members gm join users u on u.id = gm.user_id
      where gm.group_id = ${groupId}
      order by week_minutes desc, gm.joined_at`),
    db.execute<{ week: string; minutes: number }>(sql`
      select week, minutes from (${weeklyTotalsSql(sql`gm.group_id = ${groupId}`)}) t`),
    db.execute<FeedRow>(sql`
      select * from (
        select 'focus' as kind, fs.user_id, fs.duration_minutes as minutes, null as title, null as emoji, fs.ended_at as at
        from focus_sessions fs join group_members gm on gm.user_id = fs.user_id and gm.group_id = ${groupId}
        where fs.ended_at >= ${daysAgo(7)} and fs.duration_minutes >= 10
        union all
        select 'badge', ua.user_id, null, a.title, a.emoji, ua.unlocked_at
        from user_achievements ua
        join achievements a on a.id = ua.achievement_id
        join group_members gm on gm.user_id = ua.user_id and gm.group_id = ${groupId}
        where ua.unlocked_at >= ${daysAgo(7)}
        union all
        select 'joined', gm.user_id, null, null, null, gm.joined_at
        from group_members gm where gm.group_id = ${groupId} and gm.joined_at >= ${daysAgo(7)}
      ) f order by at desc limit 20`),
  ]);

  return {
    id: group.id,
    name: group.name,
    emoji: group.emoji,
    weeklyGoalMinutes: group.weeklyGoalMinutes,
    isOwner: role === "owner",
    myId: me,
    ...weekSummary(weeks.rows, group.weeklyGoalMinutes),
    members: members.rows.map((m) => ({
      id: m.id,
      name: m.name,
      username: m.username,
      avatar: m.avatar,
      isOwner: m.role === "owner",
      streak: m.streak,
      weekMinutes: m.week_minutes,
    })),
    // Names come from `members` on the client, so the feed only carries ids.
    feed: feed.rows.map((f) => ({ kind: f.kind, userId: f.user_id, minutes: f.minutes, title: f.title, emoji: f.emoji, at: f.at })),
  };
}

// ─── Create / edit ───────────────────────────────────────────────────────────

async function countMyGroups(me: number) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(groupMembers).where(eq(groupMembers.userId, me));
  return row?.n ?? 0;
}

export async function createGroupService(me: number, myName: string, input: CreateGroupInput) {
  if ((await countMyGroups(me)) >= MAX_GROUPS_PER_USER) {
    throw new BadRequestError(`You can be in up to ${MAX_GROUPS_PER_USER} groups.`);
  }
  const memberIds = [...new Set(input.memberIds)].filter((id) => id !== me);
  await assertAllFriends(me, memberIds);

  const [group] = await db
    .insert(groups)
    .values({ name: input.name, emoji: input.emoji, weeklyGoalMinutes: input.weeklyGoalMinutes, ownerId: me })
    .returning();
  await db.insert(groupMembers).values([
    { groupId: group.id, userId: me, role: "owner" },
    ...memberIds.map((userId) => ({ groupId: group.id, userId })),
  ]);

  notifyAdded(memberIds, group.name, group.emoji, myName);
  return getGroupDetailService(me, group.id);
}

export async function updateGroupService(me: number, groupId: number, input: UpdateGroupInput) {
  await assertOwner(groupId, me);
  await db.update(groups).set(input).where(eq(groups.id, groupId));
  return getGroupDetailService(me, groupId);
}

export async function deleteGroupService(me: number, groupId: number) {
  await assertOwner(groupId, me);
  await db.delete(groups).where(eq(groups.id, groupId));
  return { message: "Group deleted." };
}

// ─── Members ─────────────────────────────────────────────────────────────────

/** Any member can add their own friends, up to 10 people in the group. */
export async function addMembersService(me: number, myName: string, groupId: number, userIds: number[]) {
  const { group } = await getMembership(groupId, me);
  await assertAllFriends(me, userIds);

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(groupMembers)
    .where(eq(groupMembers.groupId, groupId));
  const newIds = [...new Set(userIds)];
  if (n + newIds.length > MAX_GROUP_MEMBERS) {
    throw new BadRequestError(`A group can have up to ${MAX_GROUP_MEMBERS} people.`);
  }

  const added = await db
    .insert(groupMembers)
    .values(newIds.map((userId) => ({ groupId, userId })))
    .onConflictDoNothing()
    .returning({ userId: groupMembers.userId });

  notifyAdded(added.map((a) => a.userId), group.name, group.emoji, myName);
  return getGroupDetailService(me, groupId);
}

/**
 * Leave (yourself) or remove someone (owner only). If the owner leaves, the
 * longest-standing member becomes owner; an empty group is deleted.
 */
export async function removeMemberService(me: number, groupId: number, userId: number) {
  const { role } = await getMembership(groupId, me);
  if (userId !== me && role !== "owner") throw new ForbiddenError("Only the owner can remove people.");

  const [removed] = await db
    .delete(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .returning({ role: groupMembers.role });
  if (!removed) throw new NotFoundError("That person isn't in this group.");

  if (removed.role === "owner") {
    const [next] = await db
      .select({ id: groupMembers.id, userId: groupMembers.userId })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
      .orderBy(asc(groupMembers.joinedAt))
      .limit(1);
    if (next) {
      await Promise.all([
        db.update(groupMembers).set({ role: "owner" }).where(eq(groupMembers.id, next.id)),
        db.update(groups).set({ ownerId: next.userId }).where(eq(groups.id, groupId)),
      ]);
    } else {
      await db.delete(groups).where(eq(groups.id, groupId));
    }
  }
  return { message: userId === me ? "You left the group." : "Removed from the group." };
}

export { getMembership as getGroupMembership };
