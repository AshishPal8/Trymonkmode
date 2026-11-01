import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { achievements, userAchievements } from "../../db/schema.js";
import { NotFoundError } from "../../utils/errors.js";
import { addXp } from "../../utils/xp.js";
import { addToInbox } from "../notifications/notifications.service.js";
import { countCompletedChallenges } from "../challenges/challenge.service.js";
import {
  DEFAULT_ACHIEVEMENTS,
  progressPct,
  RULES,
  type AchievementRule,
  type AchievementStats,
} from "./achievement.rules.js";
import type { AchievementInput } from "./achievement.schema.js";

type AchievementRow = typeof achievements.$inferSelect;

// ─── Catalog seeding (once per server start) ─────────────────────────────────

let seeding: Promise<void> | null = null;

/** Adds the default badges if missing. Never overwrites an admin's edits. */
export function ensureAchievementsSeeded(): Promise<void> {
  seeding ??= db
    .insert(achievements)
    .values(DEFAULT_ACHIEVEMENTS.map((a, orderIndex) => ({ ...a, orderIndex })))
    .onConflictDoNothing({ target: achievements.key })
    .then(() => undefined)
    .catch((err) => {
      seeding = null; // try again next time
      console.error("Achievement seeding failed:", err);
    });
  return seeding;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

/** The user's number for each rule. Five counts in one query; challenges only when asked. */
async function loadStats(userId: number, includeChallenges: boolean): Promise<AchievementStats> {
  const { rows } = await db.execute<Omit<AchievementStats, "challenges_completed">>(sql`
    select
      (select streak from users where id = ${userId})::int as streak_days,
      (select coalesce(sum(duration_minutes), 0) / 60 from focus_sessions where user_id = ${userId})::int as focus_hours,
      (select count(*) from tasks where user_id = ${userId} and completed)::int as tasks_completed,
      (select count(*) from goals where user_id = ${userId} and status = 'done')::int as goals_finished,
      (select coalesce(sum(jsonb_array_length(completed_dates)), 0) from habits where user_id = ${userId})::int as habit_checkins,
      (select count(*) from users where referred_by = ${userId})::int as friends_referred
  `);
  return {
    ...rows[0],
    challenges_completed: includeChallenges ? await countCompletedChallenges(userId) : 0,
  };
}

/** Active badges with whether this user has them. */
async function catalogFor(userId: number) {
  await ensureAchievementsSeeded();
  return db
    .select({ achievement: achievements, unlockedAt: userAchievements.unlockedAt })
    .from(achievements)
    .leftJoin(
      userAchievements,
      and(eq(userAchievements.achievementId, achievements.id), eq(userAchievements.userId, userId)),
    )
    .where(eq(achievements.isActive, true))
    .orderBy(asc(achievements.orderIndex), asc(achievements.id));
}

// ─── Unlocking ───────────────────────────────────────────────────────────────

/** Unlocks every badge the user now qualifies for. Returns the new ones. */
export async function checkAchievementsService(userId: number): Promise<AchievementRow[]> {
  const catalog = await catalogFor(userId);
  const locked = catalog.filter((c) => !c.unlockedAt).map((c) => c.achievement);
  if (locked.length === 0) return [];

  const stats = await loadStats(userId, locked.some((a) => a.rule === "challenges_completed"));
  const earned = locked.filter((a) => stats[a.rule as AchievementRule] >= a.threshold);
  if (earned.length === 0) return [];

  const inserted = await db
    .insert(userAchievements)
    .values(earned.map((a) => ({ userId, achievementId: a.id })))
    .onConflictDoNothing()
    .returning({ achievementId: userAchievements.achievementId });
  const newIds = new Set(inserted.map((r) => r.achievementId));
  const unlocked = earned.filter((a) => newIds.has(a.id));

  for (const badge of unlocked) {
    await addXp(userId, badge.xpReward);
    addToInbox(userId, {
      title: `${badge.emoji} Badge unlocked: ${badge.title}`,
      body: `${badge.description}${badge.xpReward ? ` +${badge.xpReward} XP` : ""}`,
      data: { moduleId: "leaderboard" },
    });
  }
  return unlocked;
}

const pendingChecks = new Map<number, NodeJS.Timeout>();

/**
 * Call after any activity is saved. Several saves within 2 seconds collapse
 * into one check, and it never slows down or breaks the request.
 */
export function scheduleAchievementCheck(userId: number): void {
  clearTimeout(pendingChecks.get(userId));
  pendingChecks.set(
    userId,
    setTimeout(() => {
      pendingChecks.delete(userId);
      checkAchievementsService(userId).catch((err) => console.error("Achievement check failed:", err));
    }, 2000),
  );
}

// ─── User ────────────────────────────────────────────────────────────────────

/** Every active badge, unlocked or not, with progress toward it. */
export async function listMyAchievementsService(userId: number) {
  const catalog = await catalogFor(userId);
  const stats = await loadStats(userId, catalog.some((c) => !c.unlockedAt && c.achievement.rule === "challenges_completed"));

  const items = catalog.map(({ achievement: a, unlockedAt }) => {
    const current = stats[a.rule as AchievementRule] ?? 0;
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      emoji: a.emoji,
      threshold: a.threshold,
      unit: RULES[a.rule as AchievementRule]?.unit ?? "",
      unlockedAt,
      current: unlockedAt ? Math.max(current, a.threshold) : current,
      progress: unlockedAt ? 100 : progressPct(current, a.threshold),
    };
  });
  return { items, unlockedCount: items.filter((i) => i.unlockedAt).length, total: items.length };
}

/**
 * Badges the app hasn't celebrated yet. Unlocks already happen right after
 * activity is saved, so the full check only runs when asked (on app open).
 */
export async function getUnseenAchievementsService(userId: number, runCheck: boolean) {
  if (runCheck) await checkAchievementsService(userId);
  return db
    .select({ id: achievements.id, title: achievements.title, description: achievements.description, emoji: achievements.emoji, xpReward: achievements.xpReward })
    .from(userAchievements)
    .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
    .where(and(eq(userAchievements.userId, userId), isNull(userAchievements.seenAt)))
    .orderBy(asc(userAchievements.unlockedAt));
}

export async function markAchievementsSeenService(userId: number, achievementIds: number[]) {
  await db
    .update(userAchievements)
    .set({ seenAt: new Date() })
    .where(and(eq(userAchievements.userId, userId), inArray(userAchievements.achievementId, achievementIds)));
  return { message: "Marked as seen." };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

/** All badges (active or not) with how many users have each. */
export async function adminListAchievementsService() {
  await ensureAchievementsSeeded();
  const rows = await db
    .select({ achievement: achievements, unlockCount: sql<number>`count(${userAchievements.id})::int` })
    .from(achievements)
    .leftJoin(userAchievements, eq(userAchievements.achievementId, achievements.id))
    .groupBy(achievements.id)
    .orderBy(asc(achievements.orderIndex), asc(achievements.id));
  return rows.map((r) => ({ ...r.achievement, unlockCount: r.unlockCount }));
}

export async function createAchievementService(input: AchievementInput) {
  const [row] = await db.insert(achievements).values(input).returning();
  return row;
}

export async function updateAchievementService(id: number, input: Partial<AchievementInput>) {
  const [row] = await db
    .update(achievements)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(achievements.id, id))
    .returning();
  if (!row) throw new NotFoundError("Badge not found.");
  return row;
}

export async function deleteAchievementService(id: number) {
  const [row] = await db.delete(achievements).where(eq(achievements.id, id)).returning({ id: achievements.id });
  if (!row) throw new NotFoundError("Badge not found.");
  return { message: "Badge deleted." };
}
