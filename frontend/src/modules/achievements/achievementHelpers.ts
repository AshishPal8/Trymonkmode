import type { AchievementRule } from "@/lib/types";

export const RULE_OPTIONS: { value: AchievementRule; label: string }[] = [
  { value: "streak_days", label: "Day streak" },
  { value: "focus_hours", label: "Total focus hours" },
  { value: "tasks_completed", label: "Tasks completed" },
  { value: "goals_finished", label: "Goals finished" },
  { value: "habit_checkins", label: "Habit check-ins" },
  { value: "challenges_completed", label: "Challenges completed (every day)" },
];

export const ruleLabel = (rule: AchievementRule) => RULE_OPTIONS.find((r) => r.value === rule)?.label ?? rule;
