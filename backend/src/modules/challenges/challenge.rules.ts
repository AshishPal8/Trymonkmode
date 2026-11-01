// Pure challenge rules (no database): metrics, dates and standings.

import { addDays, daysBetween } from "../../utils/date.js";

export const METRICS = {
  focus_minutes: { label: "focus minutes", maxTarget: 600, maxPerDay: 720 },
  focus_sessions: { label: "focus sessions", maxTarget: 20, maxPerDay: 30 },
  tasks_done: { label: "tasks done", maxTarget: 30, maxPerDay: 50 },
  habit_checkins: { label: "habit check-ins", maxTarget: 20, maxPerDay: 30 },
  manual: { label: "check-in", maxTarget: 1, maxPerDay: 1 },
} as const;

export type ChallengeMetric = keyof typeof METRICS;
export const METRIC_KEYS = Object.keys(METRICS) as [ChallengeMetric, ...ChallengeMetric[]];

export const MAX_DURATION_DAYS = 90;
export const MAX_START_AHEAD_DAYS = 30;
export const MAX_ACTIVE_CHALLENGES = 10;

export type ChallengePhase = "upcoming" | "active" | "ended";

export function phaseOf(today: string, startDate: string, endDate: string): ChallengePhase {
  if (today < startDate) return "upcoming";
  if (today > endDate) return "ended";
  return "active";
}

export const endDateFor = (startDate: string, durationDays: number) => addDays(startDate, durationDays - 1);

/** 1-based day number of the challenge today (clamped to its length). */
export function dayNumber(today: string, startDate: string, durationDays: number): number {
  return Math.min(durationDays, Math.max(0, daysBetween(startDate, today) + 1));
}

export interface Standing {
  daysDone: number;
  totalValue: number;
  todayValue: number;
  /** Days in a row reaching the target, up to today (today may still be open). */
  streak: number;
}

/**
 * How one member is doing. `values` maps day -> amount that day.
 * Each day counts at most `maxPerDay` (so one huge fake session can't win).
 */
export function computeStanding(
  values: Map<string, number>,
  target: number,
  metric: ChallengeMetric,
  startDate: string,
  lastDay: string,
  today: string,
): Standing {
  const cap = METRICS[metric].maxPerDay;
  let daysDone = 0;
  let totalValue = 0;

  for (let day = startDate; day <= lastDay; day = addDays(day, 1)) {
    const value = Math.min(values.get(day) ?? 0, cap);
    totalValue += value;
    if (value >= target) daysDone++;
  }

  let streak = 0;
  for (let day = lastDay; day >= startDate; day = addDays(day, -1)) {
    const done = (values.get(day) ?? 0) >= target;
    if (done) streak++;
    else if (day === today) continue; // today isn't over yet
    else break;
  }

  return { daysDone, totalValue, todayValue: Math.min(values.get(today) ?? 0, cap), streak };
}

/** More days done first, then more total, then whoever joined first. */
export function rankStandings<T extends { standing: Standing; joinedAt: Date | null }>(rows: T[]): (T & { rank: number })[] {
  return [...rows]
    .sort(
      (a, b) =>
        b.standing.daysDone - a.standing.daysDone ||
        b.standing.totalValue - a.standing.totalValue ||
        (a.joinedAt?.getTime() ?? 0) - (b.joinedAt?.getTime() ?? 0),
    )
    .map((row, i) => ({ ...row, rank: i + 1 }));
}
