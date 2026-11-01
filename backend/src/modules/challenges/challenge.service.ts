import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { challenges, challengeCheckins, challengeMembers, users } from "../../db/schema.js";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../utils/errors.js";
import { addDays, dayInTimezone, DEFAULT_TIMEZONE } from "../../utils/date.js";
import { publicUserColumns } from "../social/social.profile.service.js";
import { loadDailyValues } from "./challenge.progress.js";
import {
  computeStanding,
  dayNumber,
  endDateFor,
  MAX_ACTIVE_CHALLENGES,
  MAX_START_AHEAD_DAYS,
  METRICS,
  phaseOf,
  rankStandings,
  type ChallengeMetric,
} from "./challenge.rules.js";
import type { CreateChallengeInput } from "./challenge.schema.js";

// Admins create challenges; users join them and compete on one leaderboard.

type ChallengeRow = typeof challenges.$inferSelect;

const todayIn = (tz: string) => dayInTimezone(new Date(), tz);

/** Fields every screen needs on top of the row. */
function describe(c: ChallengeRow) {
  const today = todayIn(c.timezone);
  const metric = c.metric as ChallengeMetric;
  return {
    ...c,
    metric,
    metricLabel: METRICS[metric].label,
    phase: phaseOf(today, c.startDate, c.endDate),
    dayNumber: dayNumber(today, c.startDate, c.durationDays),
    today,
    /** Last day counted so far (today, or the end date once it's over). */
    lastDay: today < c.endDate ? today : c.endDate,
  };
}

/** One member's standing in a challenge. */
async function standingOf(c: ChallengeRow, userId: number) {
  const info = describe(c);
  const values = await loadDailyValues(info, [userId]);
  return computeStanding(values.get(userId)!, c.dailyTarget, info.metric, c.startDate, info.lastDay, info.today);
}

// ─── Loading ─────────────────────────────────────────────────────────────────

async function getChallenge(id: number): Promise<ChallengeRow> {
  const [c] = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  if (!c) throw new NotFoundError("Challenge not found.");
  return c;
}

async function isMember(challengeId: number, userId: number) {
  const [m] = await db
    .select({ id: challengeMembers.id })
    .from(challengeMembers)
    .where(and(eq(challengeMembers.challengeId, challengeId), eq(challengeMembers.userId, userId)))
    .limit(1);
  return !!m;
}

async function assertCanJoinMore(me: number) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(challengeMembers)
    .innerJoin(challenges, eq(challenges.id, challengeMembers.challengeId))
    .where(and(eq(challengeMembers.userId, me), gte(challenges.endDate, todayIn(DEFAULT_TIMEZONE))));
  if ((row?.n ?? 0) >= MAX_ACTIVE_CHALLENGES) {
    throw new BadRequestError(`You can be in up to ${MAX_ACTIVE_CHALLENGES} running challenges at once.`);
  }
}

/** All members, ranked, with their standing. One progress query for everyone. */
async function loadLeaderboard(c: ChallengeRow) {
  const members = await db
    .select({ user: publicUserColumns, joinedAt: challengeMembers.joinedAt })
    .from(challengeMembers)
    .innerJoin(users, eq(users.id, challengeMembers.userId))
    .where(eq(challengeMembers.challengeId, c.id));

  const info = describe(c);
  const values = await loadDailyValues(info, members.map((m) => m.user.id));
  return rankStandings(
    members.map((m) => ({
      user: m.user,
      joinedAt: m.joinedAt,
      standing: computeStanding(values.get(m.user.id)!, c.dailyTarget, info.metric, c.startDate, info.lastDay, info.today),
    })),
  );
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function createChallengeService(adminId: number, input: CreateChallengeInput) {
  const today = todayIn(DEFAULT_TIMEZONE);
  const metric = METRICS[input.metric];
  if (input.dailyTarget > metric.maxTarget) {
    throw new BadRequestError(`Daily target can be at most ${metric.maxTarget} ${metric.label}.`);
  }
  if (input.startDate < today || input.startDate > addDays(today, MAX_START_AHEAD_DAYS)) {
    throw new BadRequestError(`Start today or within the next ${MAX_START_AHEAD_DAYS} days.`);
  }

  const [challenge] = await db
    .insert(challenges)
    .values({
      ...input,
      dailyTarget: input.metric === "manual" ? 1 : input.dailyTarget,
      endDate: endDateFor(input.startDate, input.durationDays),
      timezone: DEFAULT_TIMEZONE,
      createdBy: adminId,
    })
    .returning();
  return getChallengeDetailService(adminId, challenge.id);
}

export async function deleteChallengeService(id: number) {
  await getChallenge(id);
  await db.delete(challenges).where(eq(challenges.id, id));
  return { message: "Challenge deleted." };
}

// ─── Read ────────────────────────────────────────────────────────────────────

/** Challenges I'm in (running, upcoming, ended in the last 14 days) and ones I can join. */
export async function listChallengesService(me: number) {
  const today = todayIn(DEFAULT_TIMEZONE);
  const rows = await db
    .select({ challenge: challenges, memberId: challengeMembers.id })
    .from(challenges)
    .leftJoin(challengeMembers, and(eq(challengeMembers.challengeId, challenges.id), eq(challengeMembers.userId, me)))
    .where(gte(challenges.endDate, addDays(today, -14)))
    .orderBy(asc(challenges.startDate));

  const joined = rows.filter((r) => r.memberId !== null).map((r) => r.challenge);
  const available = rows.filter((r) => r.memberId === null && r.challenge.endDate >= today).map((r) => r.challenge);

  // Member counts in one query; my progress on joined ones (at most 10 small queries).
  const ids = rows.map((r) => r.challenge.id);
  const [counts, myStandings] = await Promise.all([
    ids.length
      ? db
          .select({ challengeId: challengeMembers.challengeId, n: sql<number>`count(*)::int` })
          .from(challengeMembers)
          .where(inArray(challengeMembers.challengeId, ids))
          .groupBy(challengeMembers.challengeId)
      : [],
    Promise.all(joined.map(async (c) => [c.id, describe(c).phase === "upcoming" ? null : await standingOf(c, me)] as const)),
  ]);

  const memberCount = new Map(counts.map((c) => [c.challengeId, c.n]));
  const standingById = new Map(myStandings);
  const summary = (c: ChallengeRow) => {
    const { lastDay: _lastDay, ...info } = describe(c);
    return { ...info, memberCount: memberCount.get(c.id) ?? 0 };
  };

  return {
    joined: joined.map((c) => ({ ...summary(c), myStanding: standingById.get(c.id) ?? null })),
    available: available.map(summary),
  };
}

export async function getChallengeDetailService(me: number, id: number) {
  const challenge = await getChallenge(id);
  const leaderboard = await loadLeaderboard(challenge);
  const { lastDay: _lastDay, ...info } = describe(challenge);
  const mine = leaderboard.find((row) => row.user.id === me) ?? null;

  return {
    ...info,
    memberCount: leaderboard.length,
    isMember: !!mine,
    canCheckIn: !!mine && info.metric === "manual" && info.phase === "active",
    leaderboard,
    me: mine,
  };
}

// ─── Members ─────────────────────────────────────────────────────────────────

export async function joinChallengeService(me: number, id: number) {
  const challenge = await getChallenge(id);
  if (await isMember(id, me)) throw new BadRequestError("You're already in this challenge.");
  if (describe(challenge).phase === "ended") throw new BadRequestError("This challenge has ended.");
  await assertCanJoinMore(me);

  await db.insert(challengeMembers).values({ challengeId: id, userId: me }).onConflictDoNothing();
  return getChallengeDetailService(me, id);
}

export async function leaveChallengeService(me: number, id: number) {
  const removed = await db
    .delete(challengeMembers)
    .where(and(eq(challengeMembers.challengeId, id), eq(challengeMembers.userId, me)))
    .returning({ id: challengeMembers.id });
  if (removed.length === 0) throw new NotFoundError("You're not in this challenge.");
  return { message: "You left the challenge." };
}

/** Honor-based "I did it today" for manual challenges. */
export async function checkInService(me: number, id: number) {
  const challenge = await getChallenge(id);
  if (!(await isMember(id, me))) throw new ForbiddenError("Join the challenge first.");
  if (challenge.metric !== "manual") throw new BadRequestError("This challenge is tracked automatically.");

  const { phase, today } = describe(challenge);
  if (phase !== "active") throw new BadRequestError("This challenge isn't running today.");
  await db.insert(challengeCheckins).values({ challengeId: id, userId: me, day: today }).onConflictDoNothing();
  return getChallengeDetailService(me, id);
}
