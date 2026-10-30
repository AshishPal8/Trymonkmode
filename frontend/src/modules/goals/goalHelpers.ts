import type { GoalItem, GoalKind, GoalMilestone } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";

export const GOAL_KINDS: { value: GoalKind; label: string; hint: string; emoji: string }[] = [
  { value: "project", label: "Project", hint: "Milestones + tasks, e.g. Learn DSA", emoji: "🧩" },
  { value: "target", label: "Number target", hint: "Count up to a number, e.g. 24 books", emoji: "🔢" },
  { value: "focus", label: "Focus hours", hint: "Hours of deep work, e.g. 100 h", emoji: "⏱️" },
];

export const GOAL_CATEGORIES = ["Learning", "Career", "Fitness", "Finance", "Personal", "Startup"].map(
  (c) => ({ value: c, label: c }),
);

export const GOAL_COLORS = ["#0052FF", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#EF4444"];

/** 95 -> "1h 35m", 30 -> "30m". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Days from today to `date` (negative = overdue). Null if no date. */
export function daysUntil(date?: string | null): number | null {
  if (!date) return null;
  const today = new Date(`${getTodayDateString()}T00:00:00`);
  const target = new Date(`${date}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function deadlineLabel(date?: string | null): { text: string; tone: "muted" | "warn" | "danger" } | null {
  const d = daysUntil(date);
  if (d === null) return null;
  if (d < 0) return { text: `${-d} day${d === -1 ? "" : "s"} overdue`, tone: "danger" };
  if (d === 0) return { text: "Due today", tone: "warn" };
  if (d <= 7) return { text: `${d} day${d === 1 ? "" : "s"} left`, tone: "warn" };
  return { text: `${d} days left`, tone: "muted" };
}

/** Ticked by hand, or all of its tasks are done. */
export function isMilestoneDone(m: GoalMilestone): boolean {
  return m.completed || (m.taskTotal > 0 && m.taskDone === m.taskTotal);
}

/** Short line under the progress bar, depending on how the goal is measured. */
export function progressDetail(goal: GoalItem): string {
  if (goal.kind === "target") {
    return `${goal.currentProgress} / ${goal.targetProgress}${goal.unit ? ` ${goal.unit}` : ""}`;
  }
  if (goal.kind === "focus") {
    return `${formatMinutes(goal.focusMinutes)} of ${formatMinutes(goal.targetFocusMinutes || 60)}`;
  }
  const done = goal.milestones.filter(isMilestoneDone).length;
  const parts = [];
  if (goal.milestones.length) parts.push(`${done}/${goal.milestones.length} milestones`);
  parts.push(`${goal.taskDone}/${goal.taskTotal} tasks`);
  return parts.join(" · ");
}
