import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { tasks, habits, users, userSettings } from "../../db/schema.js";

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
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const [settings] = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const userTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));
  const userHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.userId, userId));

  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const past7Days: { dateStr: string; dayName: string }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = dayNames[d.getDay()];
    past7Days.push({ dateStr, dayName });
  }

  const focusPerTaskMinutes = settings?.focusDuration || 25;
  let maxDayScore = 0;

  const dailyVelocity: DailyVelocity[] = past7Days.map(
    ({ dateStr, dayName }) => {
      const tasksDoneOnDay = userTasks.filter(
        (t) =>
          t.completed &&
          String(t.updatedAt || t.createdAt).slice(0, 10) === dateStr,
      ).length;

      let habitsDoneOnDay = 0;
      userHabits.forEach((h) => {
        const dates = (h.completedDates as string[]) || [];
        if (dates.includes(dateStr)) {
          habitsDoneOnDay++;
        }
      });

      const estimatedFocusHours = Number(
        (
          (tasksDoneOnDay * focusPerTaskMinutes + habitsDoneOnDay * 15) /
          60
        ).toFixed(1),
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

    past7Days.forEach(({ dateStr, dayName }) => {
      const dayIndex = dayNames.indexOf(dayName);
      if (targetDays.includes(dayIndex)) {
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

  let morningTasks = 0;
  let afternoonTasks = 0;
  let eveningTasks = 0;

  userTasks.forEach((t) => {
    const time = t.dueTime || "09:00";
    const hour = parseInt(time.split(":")[0], 10) || 9;
    if (hour >= 6 && hour < 13) morningTasks++;
    else if (hour >= 13 && hour < 18) afternoonTasks++;
    else eveningTasks++;
  });

  let optimalTimeWindow = "9:00 AM – 12:30 PM";
  let optimalTimeDescription =
    "Plan deep work during morning hours to maximize uninterrupted flow state.";

  if (hasActivity) {
    if (afternoonTasks > morningTasks && afternoonTasks >= eveningTasks) {
      optimalTimeWindow = "1:30 PM – 5:30 PM";
      optimalTimeDescription = `Your task velocity and focus peak during mid-afternoon sprints. ${peakDayName} is historically your highest-output day.`;
    } else if (eveningTasks > morningTasks && eveningTasks > afternoonTasks) {
      optimalTimeWindow = "6:00 PM – 10:00 PM";
      optimalTimeDescription = `Your deep-work throughput peaks during quiet evening hours. ${peakDayName} is historically your highest-output day.`;
    } else {
      optimalTimeWindow = "9:00 AM – 12:30 PM";
      optimalTimeDescription = `Your task completion speed and focus sessions peak during morning hours. ${peakDayName} is historically your highest-output day.`;
    }
  } else {
    optimalTimeDescription =
      "Complete tasks and start focus sessions to calibrate your personalized biological peak window.";
  }

  const streak = user?.streak || 0;
  const velocityTier =
    weeklyAdherenceRate >= 90 && streak >= 7
      ? "Top 2% Flow Master Tier"
      : weeklyAdherenceRate >= 70
        ? "Top 10% High Velocity Tier"
        : streak >= 3
          ? "Active Momentum Tier"
          : "Getting Started Tier";

  const flowStateTier =
    streak >= 14
      ? "Top 1%"
      : streak >= 7
        ? "Top 5%"
        : streak >= 3
          ? "Top 15%"
          : streak >= 1
            ? "Top 30%"
            : "Building Flow";

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
