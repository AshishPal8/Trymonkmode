import { and, eq, gte } from "drizzle-orm";
import { db } from "../../config/db.js";
import {
  tasks,
  habits,
  focusSessions,
  users,
  userSettings,
  userPlans,
  streakRepairs,
  consistencyBonuses,
} from "../../db/schema.js";
import { BadRequestError } from "../../utils/errors.js";
import { daysAgo, dayInTimezone, userTimezone } from "../../utils/date.js";
import { addXp, XP } from "../../utils/xp.js";
import { addToInbox } from "../notifications/notifications.service.js";
import { computeStreak, type StreakResult } from "./streak.logic.js";

/** Free users get 1 repair a month, paid plans get 3. */
const REPAIRS_PER_MONTH = { free: 1, paid: 3 };
/** Active on this many days in a week -> bonus XP. */
const WEEKLY_GOAL_DAYS = 5;
const LOOKBACK_DAYS = 400;

type Repair = { repairedDate: string; createdAt: Date };

// ─── Loading ─────────────────────────────────────────────────────────────────

/** Everything the streak needs, in 5 parallel queries. */
async function loadStreakData(userId: number) {
  const since = daysAgo(LOOKBACK_DAYS);

  const [[profile], doneTasks, userHabits, sessions, repairs] = await Promise.all([
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
    db
      .select({ completedAt: tasks.completedAt, updatedAt: tasks.updatedAt })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true), gte(tasks.updatedAt, since))),
    db.select({ completedDates: habits.completedDates }).from(habits).where(eq(habits.userId, userId)),
    db
      .select({ endedAt: focusSessions.endedAt })
      .from(focusSessions)
      .where(and(eq(focusSessions.userId, userId), gte(focusSessions.endedAt, since))),
    db
      .select({ repairedDate: streakRepairs.repairedDate, createdAt: streakRepairs.createdAt })
      .from(streakRepairs)
      .where(eq(streakRepairs.userId, userId)),
  ]);

  const tz = userTimezone(profile?.timezone);
  const activeDays = new Set<string>();
  // completedAt when we have it; older tasks only have updatedAt.
  for (const t of doneTasks) activeDays.add(dayInTimezone(t.completedAt || t.updatedAt, tz));
  for (const h of userHabits) for (const d of (h.completedDates as string[]) || []) activeDays.add(d);
  for (const s of sessions) activeDays.add(dayInTimezone(s.endedAt, tz));

  return {
    tz,
    activeDays,
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
