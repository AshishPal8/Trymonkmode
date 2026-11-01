// Date helpers. Days are "YYYY-MM-DD" strings so they compare and sort as text.

export const DAY_MS = 86_400_000;
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

const asUtc = (day: string) => new Date(`${day}T00:00:00Z`);

/** "2026-10-31" + 1 -> "2026-11-01". */
export function addDays(day: string, n: number): string {
  const d = asUtc(day);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function dayOfWeek(day: string): number {
  return asUtc(day).getUTCDay();
}

/** Monday of the week that contains `day`. */
export function weekStartOf(day: string): string {
  const dow = dayOfWeek(day);
  return addDays(day, dow === 0 ? -6 : 1 - dow);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((asUtc(to).getTime() - asUtc(from).getTime()) / DAY_MS);
}

/** The user's timezone, falling back to India when unset or "UTC". */
export function userTimezone(tz?: string | null): string {
  return tz && tz !== "UTC" ? tz : DEFAULT_TIMEZONE;
}

/** The calendar day of `date` in timezone `tz`. */
export function dayInTimezone(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

/** The hour (0–23) of `date` in timezone `tz`. */
export function hourInTimezone(date: Date, tz: string): number {
  try {
    const hour = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date);
    return Number(hour) % 24;
  } catch {
    return date.getHours();
  }
}

export function daysAgo(n: number): Date {
  return new Date(Date.now() - n * DAY_MS);
}
