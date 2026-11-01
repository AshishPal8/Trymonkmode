import { eq, sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  users,
  userSettings,
  userPlans,
  streakRepairs,
  consistencyBonuses,
} from "../../db/schema.js";
import { BadRequestError } from "../../utils/errors.js";
import { daysAgo, dayInTimezone, DEFAULT_TIMEZONE, userTimezone } from "../../utils/date.js";
import { addXp, XP } from "../../utils/xp.js";
import { addToInbox } from "../notifications/notifications.service.js";
import { computeStreak, type StreakResult } from "./streak.logic.js";
import { scheduleAchievementCheck } from "../achievements/achievement.service.js";

/** Free users get 1 repair a month, paid plans get 3. */
const REPAIRS_PER_MONTH = { free: 1, paid: 3 };
/** Active on this many days in a week -> bonus XP. */
const WEEKLY_GOAL_DAYS = 5;
const LOOKBACK_DAYS = 400;

type Repair = { repairedDate: string; createdAt: Date };

// ─── Loading ─────────────────────────────────────────────────────────────────

/**
 * Everything the streak needs, in 3 parallel queries. The database returns
 * only the distinct days with activity (in the user's timezone), not every
 * task / habit / focus row.
 */
async function loadStreakData(userId: number) {
  const since = daysAgo(LOOKBACK_DAYS);
  // The user's timezone, worked out inside SQL so all three queries can run at once.
  const tz = sql`coalesce(nullif((select timezone from user_settings where user_id = ${userId}), 'UTC'), ${DEFAULT_TIMEZONE})`;

  const [[profile], activeDayRows, repairs] = await Promise.all([
    db
      .select({
        timezone: userSettings.timezone,
        restDays: userSettings.restDays,
        planTier: userPlans.planTier,
        storedStreak: users.streak,
      })
      .from(users)
      .leftJoin(userSettings, eq(userSettings.userId, users.id))
      .leftJoin(userPlans, eq(userPlans.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1),
    db.execute<{ day: string }>(sql`
      select (coalesce(completed_at, updated_at) at time zone ${tz})::date::text as day
      from tasks where user_id = ${userId} and completed and coalesce(completed_at, updated_at) >= ${since}
      union
      select (ended_at at time zone ${tz})::date::text
      from focus_sessions where user_id = ${userId} and ended_at >= ${since}
      union
      select d.day
      from habits h, jsonb_array_elements_text(h.completed_dates) as d(day)
      where h.user_id = ${userId}`),
    db
      .select({ repairedDate: streakRepairs.repairedDate, createdAt: streakRepairs.createdAt })
      .from(streakRepairs)
      .where(eq(streakRepairs.userId, userId)),
  ]);

  return {
    tz: userTimezone(profile?.timezone),
    activeDays: new Set(activeDayRows.rows.map((r) => r.day)),
    repairs,
    restDays: Array.isArray(profile?.restDays) ? (profile.restDays as number[]) : [],
    isPaid: !!profile?.planTier && profile.planTier !== "free",
    storedStreak: profile?.storedStreak ?? null,
  };
}

// ─── Rules that touch the database ───────────────────────────────────────────

function repairsLeftThisMonth(repairs: Repair[], allowance: number, today: string, tz: string) {
  const month = today.slice(0, 7);
  const used = repairs.filter((r) => dayInTimezone(r.createdAt, tz).startsWith(month)).length;
  return Math.max(0, allowance - used);
}

/** Keeps `users.streak` (shown in the sidebar) in step. Fire and forget. */
function syncStoredStreak(userId: number, stored: number | null, current: number) {
  if (stored === null || stored === current) return;
  db.update(users).set({ streak: current }).where(eq(users.id, userId)).catch(() => {});
}

/** Grants the weekly bonus the first time we see 5 active days. True if granted now. */
async function grantWeeklyBonusOnce(userId: number, streak: StreakResult): Promise<boolean> {
  if (streak.activeDaysThisWeek < WEEKLY_GOAL_DAYS) return false;

  const inserted = await db
    .insert(consistencyBonuses)
    .values({ userId, weekStart: streak.weekStart, xp: XP.weeklyConsistency })
    .onConflictDoNothing()
    .returning({ id: consistencyBonuses.id });
  if (inserted.length === 0) return false;

  await addXp(userId, XP.weeklyConsistency);
  addToInbox(userId, {
    title: `🏅 ${WEEKLY_GOAL_DAYS} active days this week! +${XP.weeklyConsistency} XP`,
    body: "Consistency beats intensity. Keep showing up.",
    data: { moduleId: "dashboard" },
  });
  return true;
}

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getStreakStatusService(userId: number) {
  const data = await loadStreakData(userId);
  const today = dayInTimezone(new Date(), data.tz);

  const streak = computeStreak({
    today,
    activeDays: data.activeDays,
    restDows: new Set(data.restDays),
    repairedDays: new Set(data.repairs.map((r) => r.repairedDate)),
  });

  const repairsPerMonth = data.isPaid ? REPAIRS_PER_MONTH.paid : REPAIRS_PER_MONTH.free;
  const repairsLeft = repairsLeftThisMonth(data.repairs, repairsPerMonth, today, data.tz);

  syncStoredStreak(userId, data.storedStreak, streak.current);
  scheduleAchievementCheck(userId);
  const bonusJustEarned = await grantWeeklyBonusOnce(userId, streak);

  return {
    ...streak,
    restDays: data.restDays,
    repairsLeft,
    repairsPerMonth,
    canRepair: !!streak.brokenOn && repairsLeft > 0,
    weeklyGoalDays: WEEKLY_GOAL_DAYS,
    weeklyBonusXp: XP.weeklyConsistency,
    weeklyBonusEarned: streak.activeDaysThisWeek >= WEEKLY_GOAL_DAYS,
    bonusJustEarned,
  };
}

export async function repairStreakService(userId: number) {
  const status = await getStreakStatusService(userId);
  if (!status.brokenOn) throw new BadRequestError("There's no missed day to repair right now.");
  if (status.repairsLeft <= 0) {
    throw new BadRequestError("No repairs left this month. Rest days keep your streak safe too.");
  }

  await db.insert(streakRepairs).values({ userId, repairedDate: status.brokenOn }).onConflictDoNothing();
  return getStreakStatusService(userId);
}
