import { eq, desc, and, gte } from "drizzle-orm";
import { db } from "../../config/db.js";
import { getStreakStatusService } from "../streak/streak.service.js";
import {
  tasks,
  habits,
  users,
  userSettings,
  focusSessions,
} from "../../db/schema.js";

export interface DailyVelocity {
  day: string; // 'Mon', 'Tue', ...
  date: string; // 'YYYY-MM-DD'
  focusHours: number;
  completedTasks: number;
  completedHabits: number;
  isPeak: boolean;
  heightPct: number;
}

export interface CategoryDistributionItem {
  tag: string;
  count: number;
  pct: number;
  color: string;
}

export interface ConsistencyScorecard {
  adherence: number;
  habitRate: number;
  flowStateTier: string;
}

export interface AnalyticsSummary {
  totalFocusHours: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalHabits: number;
  weeklyAdherenceRate: number;
  habitCompletionRate: number;
  streak: number;
  streakStatus: Awaited<ReturnType<typeof getStreakStatusService>>;
  xp: number;
  level: number;
  xpToNextLevel: number;
  peakDayName: string;
  optimalTimeWindow: string;
  optimalTimeDescription: string;
  velocityTier: string;
  dailyVelocity: DailyVelocity[];
  categoryDistribution: CategoryDistributionItem[];
  consistencyScorecard: ConsistencyScorecard;
}

const CATEGORY_COLORS = [
  "#0052FF",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#06B6D4",
  "#6366F1",
];

export async function getAnalyticsService(
  userId: number,
): Promise<AnalyticsSummary> {
  // All independent, so run them together.
  const [[user], [settings], userTasks, userHabits, recentFocus, streakStatus] =
    await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1),
      db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId))
        .orderBy(desc(tasks.createdAt)),
      db.select().from(habits).where(eq(habits.userId, userId)),
      db
        .select({
          minutes: focusSessions.durationMinutes,
          startedAt: focusSessions.startedAt,
          endedAt: focusSessions.endedAt,
        })
        .from(focusSessions)
        .where(
          and(
            eq(focusSessions.userId, userId),
            // A year back, for the streak; the weekly chart only uses the last 7 days.
            gte(focusSessions.endedAt, new Date(Date.now() - 366 * 86400000)),
          ),
        ),
      getStreakStatusService(userId),
    ]);

  // Days are counted in the user's timezone, not the server's.
  const tz =
    settings?.timezone && settings.timezone !== "UTC"
      ? settings.timezone
      : "Asia/Kolkata";
  const localDateStr = (d: Date) => {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    } catch {
      return d.toISOString().slice(0, 10);
    }
  };
  const localHour = (d: Date) => {
    try {
      return (
        Number(
          new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "numeric",
            hour12: false,
          }).format(d),
        ) % 24
      );
    } catch {
      return d.getHours();
    }
  };
  const focusMinutesByDay = new Map<string, number>();
  for (const f of recentFocus) {
    const key = localDateStr(f.endedAt);
    focusMinutesByDay.set(key, (focusMinutesByDay.get(key) || 0) + f.minutes);
  }

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const past7Days: { dateStr: string; dayName: string }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dateStr = localDateStr(d);
    const dayName = dayNames[new Date(`${dateStr}T12:00:00Z`).getUTCDay()];
    past7Days.push({ dateStr, dayName });
  }

  let maxDayScore = 0;

  const dailyVelocity: DailyVelocity[] = past7Days.map(
    ({ dateStr, dayName }) => {
      const tasksDoneOnDay = userTasks.filter(
        (t) =>
          t.completed &&
          localDateStr(new Date(t.updatedAt || t.createdAt)) === dateStr,
      ).length;

      let habitsDoneOnDay = 0;
      userHabits.forEach((h) => {
        const dates = (h.completedDates as string[]) || [];
        if (dates.includes(dateStr)) {
          habitsDoneOnDay++;
        }
      });

      // Real focus time from saved sessions (it used to be estimated as
      // tasks × 25 min, which had nothing to do with the timer).
      const estimatedFocusHours = Number(
        ((focusMinutesByDay.get(dateStr) || 0) / 60).toFixed(1),
      );
      const dayScore =
        tasksDoneOnDay * 2 + habitsDoneOnDay + estimatedFocusHours;
      if (dayScore > maxDayScore) {
        maxDayScore = dayScore;
      }

      return {
        day: dayName,
        date: dateStr,
        focusHours: estimatedFocusHours,
        completedTasks: tasksDoneOnDay,
        completedHabits: habitsDoneOnDay,
        isPeak: false,
        heightPct: 0,
      };
    },
  );

  let peakDayName = "No activity yet";
  let hasActivity = false;

  dailyVelocity.forEach((d) => {
    const score = d.completedTasks * 2 + d.completedHabits + d.focusHours;
    if (score > 0) hasActivity = true;
    if (score === maxDayScore && maxDayScore > 0) {
      d.isPeak = true;
      peakDayName = d.day;
    }
    d.heightPct =
      maxDayScore > 0
        ? Math.max(10, Math.round((score / maxDayScore) * 100))
        : 0;
  });

  const totalFocusHours = Number(
    dailyVelocity.reduce((acc, curr) => acc + curr.focusHours, 0).toFixed(1),
  );

  let totalHabitOpportunities = 0;
  let totalHabitsCompletedThisWeek = 0;

  userHabits.forEach((h) => {
    const targetDays = (h.targetDays as number[]) || [0, 1, 2, 3, 4, 5, 6];
    const completedDates = (h.completedDates as string[]) || [];
    // Days before the habit existed don't count against it.
    const createdDay = localDateStr(new Date(h.createdAt));

    past7Days.forEach(({ dateStr, dayName }) => {
      const dayIndex = dayNames.indexOf(dayName);
      if (dateStr >= createdDay && targetDays.includes(dayIndex)) {
        totalHabitOpportunities++;
        if (completedDates.includes(dateStr)) {
          totalHabitsCompletedThisWeek++;
        }
      }
    });
  });

  const weeklyAdherenceRate =
    totalHabitOpportunities > 0
      ? Math.round(
          (totalHabitsCompletedThisWeek / totalHabitOpportunities) * 100,
        )
      : totalTasks > 0
        ? taskCompletionRate
        : 0;

  const habitCompletionRate =
    totalHabitOpportunities > 0
      ? Math.round(
          (totalHabitsCompletedThisWeek / totalHabitOpportunities) * 100,
        )
      : 0;

  // Best time of day, from when the user actually focuses and finishes tasks
  // in the last 30 days (it used to guess from task due times).
  const BUCKETS = [
    {
      key: "early",
      label: "5:00 AM – 9:00 AM",
      name: "early morning",
      from: 5,
      to: 9,
    },
    {
      key: "morning",
      label: "9:00 AM – 1:00 PM",
      name: "morning",
      from: 9,
      to: 13,
    },
    {
      key: "afternoon",
      label: "1:00 PM – 5:00 PM",
      name: "afternoon",
      from: 13,
      to: 17,
    },
    {
      key: "evening",
      label: "5:00 PM – 10:00 PM",
      name: "evening",
      from: 17,
      to: 22,
    },
    {
      key: "night",
      label: "10:00 PM – 5:00 AM",
      name: "late night",
      from: 22,
      to: 29,
    },
  ];
  const bucketOf = (hour: number) =>
    BUCKETS.find(
      (b) =>
        (hour >= b.from && hour < b.to) ||
        (hour + 24 >= b.from && hour + 24 < b.to),
    ) || BUCKETS[1];
  const monthAgo = now.getTime() - 30 * 86400000;
  const bucketScore = new Map<string, number>();
  for (const f of recentFocus) {
    if (f.endedAt.getTime() < monthAgo) continue;
    const b = bucketOf(localHour(f.startedAt));
    bucketScore.set(b.key, (bucketScore.get(b.key) || 0) + f.minutes);
  }
  for (const t of userTasks) {
    const doneAt = new Date(t.updatedAt || t.createdAt);
    if (!t.completed || doneAt.getTime() < monthAgo) continue;
    const b = bucketOf(localHour(doneAt));
    bucketScore.set(b.key, (bucketScore.get(b.key) || 0) + 15); // a finished task ≈ 15 focused minutes
  }
  const best = [...bucketScore.entries()].sort((a, b) => b[1] - a[1])[0];

  let optimalTimeWindow = "Not enough data yet";
  let optimalTimeDescription =
    "Finish a few tasks and focus sessions this week, and your best time of day will show up here.";
  if (best) {
    const bucket = BUCKETS.find((b) => b.key === best[0])!;
    optimalTimeWindow = bucket.label;
    optimalTimeDescription = `Most of your focus and finished tasks in the last 30 days happened in the ${bucket.name}.${
      hasActivity ? ` ${peakDayName} was your strongest day this week.` : ""
    } Plan your hardest work then.`;
  }

  const streak = streakStatus.current;
  // Labels only describe the user's own numbers (no made-up "Top X%").
  const velocityTier =
    weeklyAdherenceRate >= 90 && streak >= 7
      ? "Flow master"
      : weeklyAdherenceRate >= 70
        ? "High velocity"
        : streak >= 3
          ? "Building momentum"
          : "Getting started";

  const flowStateTier =
    streak >= 14
      ? `${streak}-day streak · Unstoppable`
      : streak >= 7
        ? `${streak}-day streak · On fire`
        : streak >= 3
          ? `${streak}-day streak · Building`
          : streak >= 1
            ? `${streak}-day streak`
            : "Start a streak today";

  const categoryCounts: Record<string, number> = {};
  userTasks.forEach((t) => {
    const rawTags = (t.tags as string[]) || [];
    if (rawTags.length > 0) {
      rawTags.forEach((tag) => {
        const cleanTag = tag.replace(/^#/, "").trim();
        if (cleanTag) {
          categoryCounts[cleanTag] = (categoryCounts[cleanTag] || 0) + 1;
        }
      });
    } else {
      const q =
        t.quadrant === "urgent-important"
          ? "Critical Priorities"
          : "Core Projects";
      categoryCounts[q] = (categoryCounts[q] || 0) + 1;
    }
  });

  userHabits.forEach((h) => {
    const cat = h.category || "Habits";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const totalCategoryPoints = Object.values(categoryCounts).reduce(
    (a, b) => a + b,
    0,
  );
  const categoryDistribution: CategoryDistributionItem[] = Object.entries(
    categoryCounts,
  )
    .map(([tag, count], index) => ({
      tag,
      count,
      pct:
        totalCategoryPoints > 0
          ? Math.round((count / totalCategoryPoints) * 100)
          : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  const consistencyScorecard: ConsistencyScorecard = {
    adherence: weeklyAdherenceRate,
    habitRate: habitCompletionRate,
    flowStateTier,
  };

  return {
    totalFocusHours,
    taskCompletionRate,
    totalTasks,
    completedTasks,
    pendingTasks,
    totalHabits: userHabits.length,
    weeklyAdherenceRate,
    habitCompletionRate,
    streak,
    streakStatus,
    xp: user?.xp || 0,
    level: user?.level || 1,
    xpToNextLevel: Math.floor(1000 * Math.pow(1.3, (user?.level || 1) - 1)),
    peakDayName,
    optimalTimeWindow,
    optimalTimeDescription,
    velocityTier,
    dailyVelocity,
    categoryDistribution,
    consistencyScorecard,
  };
}
