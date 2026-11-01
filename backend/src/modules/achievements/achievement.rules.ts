// What a badge can be earned for, and the default catalog.

export const RULES = {
  streak_days: { label: "Day streak", unit: "days" },
  focus_hours: { label: "Total focus hours", unit: "h" },
  tasks_completed: { label: "Tasks completed", unit: "tasks" },
  goals_finished: { label: "Goals finished", unit: "goals" },
  habit_checkins: { label: "Habit check-ins", unit: "check-ins" },
  challenges_completed: { label: "Challenges completed (every day)", unit: "challenges" },
  friends_referred: { label: "Friends who joined from your invite", unit: "friends" },
} as const;

export type AchievementRule = keyof typeof RULES;
export const RULE_KEYS = Object.keys(RULES) as [AchievementRule, ...AchievementRule[]];

/** The user's current number for each rule. */
export type AchievementStats = Record<AchievementRule, number>;

/** Seeded once; admins can edit or switch them off afterwards. */
export const DEFAULT_ACHIEVEMENTS: {
  key: string;
  title: string;
  description: string;
  emoji: string;
  rule: AchievementRule;
  threshold: number;
  xpReward: number;
}[] = [
  { key: "streak_7", title: "Week warrior", description: "Keep a 7-day streak.", emoji: "🔥", rule: "streak_days", threshold: 7, xpReward: 50 },
  { key: "streak_30", title: "Monthly monk", description: "Keep a 30-day streak.", emoji: "🌕", rule: "streak_days", threshold: 30, xpReward: 200 },
  { key: "streak_100", title: "Centurion", description: "Keep a 100-day streak.", emoji: "🏛️", rule: "streak_days", threshold: 100, xpReward: 500 },
  { key: "focus_10h", title: "Getting deep", description: "Focus for 10 hours in total.", emoji: "⏱️", rule: "focus_hours", threshold: 10, xpReward: 50 },
  { key: "focus_100h", title: "Deep worker", description: "Focus for 100 hours in total.", emoji: "🧠", rule: "focus_hours", threshold: 100, xpReward: 300 },
  { key: "tasks_100", title: "Finisher", description: "Complete 100 tasks.", emoji: "✅", rule: "tasks_completed", threshold: 100, xpReward: 100 },
  { key: "goal_1", title: "First project done", description: "Finish your first goal.", emoji: "🎯", rule: "goals_finished", threshold: 1, xpReward: 100 },
  { key: "habits_100", title: "Habit builder", description: "Check in on habits 100 times.", emoji: "🔁", rule: "habit_checkins", threshold: 100, xpReward: 100 },
  { key: "referral_1", title: "Recruiter", description: "A friend joins through your invite link.", emoji: "🤝", rule: "friends_referred", threshold: 1, xpReward: 50 },
  { key: "referral_5", title: "Community builder", description: "5 friends join through your invite link.", emoji: "🌱", rule: "friends_referred", threshold: 5, xpReward: 250 },
  { key: "challenge_1", title: "Challenge champion", description: "Complete every day of a challenge.", emoji: "🏆", rule: "challenges_completed", threshold: 1, xpReward: 150 },
];

/** 0–100, how close `current` is to `threshold`. */
export const progressPct = (current: number, threshold: number) =>
  Math.min(100, Math.round((current / Math.max(1, threshold)) * 100));
