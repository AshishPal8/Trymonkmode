"use client";

import React from "react";
import { Clock, CheckCircle2, Award, ArrowUpRight } from "lucide-react";
import { UserProfile, StreakStatus } from "@/lib/types";
import { StreakTile } from "./StreakTile";

interface AnalyticsMetricsBarProps {
  user: UserProfile;
  streak: number;
  /** Focus hours over the last 7 days. */
  weekFocusHours: string;
  todayFocusMinutes?: number;
  /** null = nothing to measure (shows a dash). */
  taskRate: number | null;
  taskLabel: string;
  taskDetail: string;
  streakStatus?: StreakStatus;
  onStreakChanged?: () => void;
}

export function AnalyticsMetricsBar({
  user,
  streak,
  weekFocusHours,
  todayFocusMinutes = 0,
  taskRate,
  taskLabel,
  taskDetail,
  streakStatus,
  onStreakChanged = () => {},
}: AnalyticsMetricsBarProps) {
  const taskCompletionRate = taskRate ?? 0;
  const xpPercent = Math.min(
    100,
    Math.round((user.xp / (user.xpToNextLevel || 1000)) * 100),
  );

  const velocityLabel = taskDetail;

  const velocityColor =
    taskCompletionRate >= 50
      ? "text-emerald-500"
      : taskCompletionRate > 0
        ? "text-[#0052FF]"
        : "text-muted-foreground";

  const hours = Math.floor(todayFocusMinutes / 60);
  const mins = todayFocusMinutes % 60;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Focus Hours */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Today&apos;s Focus
          </span>
          <Clock className="w-4 h-4 text-[#0052FF]" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {hours}h {mins}m
        </div>
        <span className="text-[11px] font-semibold text-[#0052FF] flex items-center gap-0.5 mt-1">
          <ArrowUpRight className="w-3.5 h-3.5" /> {weekFocusHours}h this week
        </span>
      </div>

      {/* Task Velocity */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {taskLabel}
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {taskRate === null ? "—" : `${taskCompletionRate}%`}
        </div>
        <span
          className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${velocityColor}`}
        >
          <ArrowUpRight className="w-3.5 h-3.5" /> {velocityLabel}
        </span>
      </div>

      {/* Active Streak */}
      <StreakTile
        streak={streak}
        status={streakStatus}
        onChanged={onStreakChanged}
      />

      {/* Level & XP Progress */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Level {user.level || 1}
          </span>
          <Award className="w-4 h-4 text-[#0052FF]" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {user.xp || 0}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            / {user.xpToNextLevel || 1000} XP
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-[#0052FF] rounded-full transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
