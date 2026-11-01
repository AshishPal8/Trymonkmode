// Pure streak rules (no database), so they're easy to test.
//
// A day keeps the streak alive if the user did something (task, habit or
// focus session). Planned rest days and repaired days are "skipped": they
// don't break the streak and don't add to it. Today is allowed to be empty
// until the day is over.

import { addDays, dayOfWeek, daysBetween, weekStartOf } from "../../utils/date.js";

export type DayState = "active" | "rest" | "repaired" | "missed" | "today" | "future";

export interface StreakInput {
  today: string;
  activeDays: Set<string>;
  /** Weekdays the user rests on (0 = Sunday). */
  restDows: Set<number>;
  repairedDays: Set<string>;
}

export interface WeekDay {
  date: string;
  dow: number;
  state: DayState;
}

export interface StreakResult {
  current: number;
  /** The missed day that can still be repaired, if any. */
  brokenOn: string | null;
  streakIfRepaired: number | null;
  week: WeekDay[];
  activeDaysThisWeek: number;
  weekStart: string;
  todayIsRest: boolean;
  activeToday: boolean;
}

export const REPAIR_WINDOW_DAYS = 7;
const MAX_LOOKBACK_DAYS = 400;

const isSkipped = (input: StreakInput, day: string) =>
  input.restDows.has(dayOfWeek(day)) || input.repairedDays.has(day);

/** Counts active days going back from `fromDay` until a missed day. */
function countBack(input: StreakInput, fromDay: string, allowEmptyFirstDay: boolean) {
  let count = 0;
  for (let i = 0; i < MAX_LOOKBACK_DAYS; i++) {
    const day = addDays(fromDay, -i);
    if (input.activeDays.has(day)) count++;
    else if (i === 0 && allowEmptyFirstDay) continue;
    else if (!isSkipped(input, day)) return { count, brokenOn: day };
  }
  return { count, brokenOn: null };
}

/** The missed day is repairable if it's recent and there was a streak before it. */
function findRepair(input: StreakInput, current: number, missedDay: string | null) {
  if (!missedDay) return null;
  const age = daysBetween(missedDay, input.today);
  if (age < 1 || age > REPAIR_WINDOW_DAYS) return null;

  const before = countBack(input, addDays(missedDay, -1), false);
  if (before.count === 0) return null;
  return { brokenOn: missedDay, streakIfRepaired: current + before.count };
}

function stateOf(input: StreakInput, date: string): DayState {
  const isRest = input.restDows.has(dayOfWeek(date));
  if (input.activeDays.has(date)) return "active";
  if (date > input.today) return "future";
  if (date === input.today) return isRest ? "rest" : "today";
  if (input.repairedDays.has(date)) return "repaired";
  return isRest ? "rest" : "missed";
}

/** Monday to Sunday of the current week. */
function buildWeek(input: StreakInput): WeekDay[] {
  const weekStart = weekStartOf(input.today);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return { date, dow: dayOfWeek(date), state: stateOf(input, date) };
  });
}

export function computeStreak(input: StreakInput): StreakResult {
  const { count: current, brokenOn: missedDay } = countBack(input, input.today, true);
  const repair = findRepair(input, current, missedDay);
  const week = buildWeek(input);

  return {
    current,
    brokenOn: repair?.brokenOn ?? null,
    streakIfRepaired: repair?.streakIfRepaired ?? null,
    week,
    activeDaysThisWeek: week.filter((d) => d.state === "active").length,
    weekStart: week[0].date,
    todayIsRest: input.restDows.has(dayOfWeek(input.today)),
    activeToday: input.activeDays.has(input.today),
  };
}
