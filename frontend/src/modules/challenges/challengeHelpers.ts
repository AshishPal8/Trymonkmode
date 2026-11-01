import type { Challenge, ChallengeMetric, NewChallengeInput } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { daysUntil } from "@/modules/goals/goalHelpers";

export const METRIC_OPTIONS: { value: ChallengeMetric; label: string; unit: string; maxTarget: number }[] = [
  { value: "focus_minutes", label: "Focus minutes", unit: "min of focus", maxTarget: 600 },
  { value: "focus_sessions", label: "Focus sessions", unit: "focus sessions", maxTarget: 20 },
  { value: "tasks_done", label: "Tasks done", unit: "tasks done", maxTarget: 30 },
  { value: "habit_checkins", label: "Habit check-ins", unit: "habit check-ins", maxTarget: 20 },
  { value: "manual", label: "Daily check-in (honor based)", unit: "check-in", maxTarget: 1 },
];

/** 90 focus minutes -> "1h 30m"; 3 tasks -> "3". */
export function formatMetricValue(metric: ChallengeMetric, value: number): string {
  return metric === "focus_minutes" ? formatMinutes(value) : String(value);
}

/** "60 min of focus a day · 7 days" */
export function ruleText(c: Pick<Challenge, "metric" | "dailyTarget" | "durationDays">): string {
  const days = `${c.durationDays} day${c.durationDays === 1 ? "" : "s"}`;
  if (c.metric === "manual") return `Check in every day · ${days}`;
  const unit = METRIC_OPTIONS.find((m) => m.value === c.metric)?.unit ?? "";
  const target = c.metric === "focus_minutes" ? formatMinutes(c.dailyTarget) : c.dailyTarget;
  return `${target} ${c.metric === "focus_minutes" ? "of focus" : unit} a day · ${days}`;
}

/** "Day 3 of 7", "Starts in 2 days", "Ended". */
export function phaseText(c: Pick<Challenge, "phase" | "dayNumber" | "durationDays" | "startDate">): string {
  if (c.phase === "active") return `Day ${c.dayNumber} of ${c.durationDays}`;
  if (c.phase === "ended") return "Ended";
  const d = daysUntil(c.startDate) ?? 0;
  return d <= 1 ? "Starts tomorrow" : `Starts in ${d} days`;
}

export const isAdminRole = (role?: string) => role === "admin" || role === "superadmin";

export type ChallengeTemplate = Omit<NewChallengeInput, "startDate">;

/** Starting points for the "New challenge" form. */
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  { emoji: "⏱️", title: "7-day focus sprint", description: "One focused hour every day for a week.", metric: "focus_minutes", dailyTarget: 60, durationDays: 7 },
  { emoji: "🧘", title: "30 days of deep work", description: "Two hours of deep work a day for a month.", metric: "focus_minutes", dailyTarget: 120, durationDays: 30 },
  { emoji: "✅", title: "3 tasks a day", description: "Finish at least three tasks every day.", metric: "tasks_done", dailyTarget: 3, durationDays: 14 },
  { emoji: "🔁", title: "Habit streak", description: "Tick off at least one habit every day.", metric: "habit_checkins", dailyTarget: 1, durationDays: 21 },
  { emoji: "📚", title: "Read 20 minutes", description: "Read for 20 minutes, then check in.", metric: "manual", dailyTarget: 1, durationDays: 30 },
];
