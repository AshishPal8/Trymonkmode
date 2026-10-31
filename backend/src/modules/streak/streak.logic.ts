export type DayState =
  | "active"
  | "rest"
  | "repaired"
  | "missed"
  | "today"
  | "future";

export interface StreakInput {
  today: string;
  activeDays: Set<string>;
  restDows: Set<number>;
  repairedDays: Set<string>;
}

export interface StreakResult {
  current: number;
  brokenOn: string | null;
  streakIfRepaired: number | null;
  week: { date: string; dow: number; state: DayState }[];
  activeDaysThisWeek: number;
  weekStart: string;
  todayIsRest: boolean;
  activeToday: boolean;
}

export const REPAIR_WINDOW_DAYS = 7;
const MAX_LOOKBACK = 400;

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

/** Monday of the week containing `date`. */
export function weekStartOf(date: string): string {
  const dow = dayOfWeek(date);
  return addDays(date, dow === 0 ? -6 : 1 - dow);
}

function walk(
  input: StreakInput,
  fromDay: string,
  allowEmptyFirstDay: boolean,
): { count: number; brokenOn: string | null } {
  let count = 0;
  for (let i = 0; i < MAX_LOOKBACK; i++) {
    const day = addDays(fromDay, -i);
    if (input.activeDays.has(day)) {
      count++;
      continue;
    }
    if (i === 0 && allowEmptyFirstDay) continue;
    if (input.restDows.has(dayOfWeek(day)) || input.repairedDays.has(day))
      continue;
    return { count, brokenOn: day };
  }
  return { count, brokenOn: null };
}

export function computeStreak(input: StreakInput): StreakResult {
  const { today } = input;
  const main = walk(input, today, true);

  let brokenOn: string | null = null;
  let streakIfRepaired: number | null = null;
  if (main.brokenOn) {
    const daysAgo = Math.round(
      (new Date(`${today}T00:00:00Z`).getTime() -
        new Date(`${main.brokenOn}T00:00:00Z`).getTime()) /
        86400000,
    );
    if (daysAgo >= 1 && daysAgo <= REPAIR_WINDOW_DAYS) {
      const before = walk(input, addDays(main.brokenOn, -1), false);
      if (before.count > 0) {
        brokenOn = main.brokenOn;
        streakIfRepaired = main.count + before.count;
      }
    }
  }

  const weekStart = weekStartOf(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dow = dayOfWeek(date);
    let state: DayState;
    if (input.activeDays.has(date)) state = "active";
    else if (date > today) state = "future";
    else if (date === today) state = input.restDows.has(dow) ? "rest" : "today";
    else if (input.repairedDays.has(date)) state = "repaired";
    else if (input.restDows.has(dow)) state = "rest";
    else state = "missed";
    return { date, dow, state };
  });

  return {
    current: main.count,
    brokenOn,
    streakIfRepaired,
    week,
    activeDaysThisWeek: week.filter((d) => d.state === "active").length,
    weekStart,
    todayIsRest: input.restDows.has(dayOfWeek(today)),
    activeToday: input.activeDays.has(today),
  };
}
