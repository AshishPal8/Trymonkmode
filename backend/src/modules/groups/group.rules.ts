// Pure group rules (no database).

import { addDays, dayInTimezone, DEFAULT_TIMEZONE, weekStartOf } from "../../utils/date.js";

export const MAX_GROUP_MEMBERS = 10;
export const MAX_GROUPS_PER_USER = 10;
export const STREAK_WEEKS_LOOKBACK = 26;
export const ROOM_LENGTHS = [25, 50, 90] as const;

export type WeekTotal = { week: string; minutes: number };

/** Monday of this week, India time (weeks run Monday–Sunday). */
export const currentWeekStart = () => weekStartOf(dayInTimezone(new Date(), DEFAULT_TIMEZONE));

/**
 * Weeks in a row the group reached its goal. The current week counts once
 * reached; until then it doesn't break the streak.
 */
export function groupStreakWeeks(weeks: WeekTotal[], goalMinutes: number, thisWeek: string): number {
  const minutesByWeek = new Map(weeks.map((w) => [w.week, w.minutes]));
  const reached = (week: string) => (minutesByWeek.get(week) ?? 0) >= goalMinutes;

  let streak = reached(thisWeek) ? 1 : 0;
  for (let week = addDays(thisWeek, -7), i = 0; i < STREAK_WEEKS_LOOKBACK && reached(week); week = addDays(week, -7), i++) {
    streak++;
  }
  return streak;
}

export function weekSummary(weeks: WeekTotal[], goalMinutes: number) {
  const thisWeek = currentWeekStart();
  const weekMinutes = weeks.find((w) => w.week === thisWeek)?.minutes ?? 0;
  return {
    weekMinutes,
    weekProgress: Math.min(100, Math.round((weekMinutes / Math.max(1, goalMinutes)) * 100)),
    streakWeeks: groupStreakWeeks(weeks, goalMinutes, thisWeek),
  };
}
