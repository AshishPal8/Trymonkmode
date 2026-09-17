"use client";

import React from "react";
import {
  BarChart3,
  RotateCcw,
  Flame,
  Clock,
  Trophy,
  Zap,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useFocusStore, DayFocusStat } from "@/stores/focusStore";
import { Button } from "@/components/ui/button";

interface FocusAnalyticsCardProps {
  onFlipBack: () => void;
  onStartSprint: () => void;
}

export function FocusAnalyticsCard({
  onFlipBack,
  onStartSprint,
}: FocusAnalyticsCardProps) {
  const {
    getTodayFocusMinutes,
    getPast7DaysFocus,
    get7DayTotalMinutes,
    getDailyAverageMinutes,
    getFocusStreak,
    focusSessions,
  } = useFocusStore();

  const todayMinutes = getTodayFocusMinutes();
  const past7Days: DayFocusStat[] = getPast7DaysFocus();
  const total7DayMinutes = get7DayTotalMinutes();
  const dailyAverage = getDailyAverageMinutes();
  const streak = getFocusStreak();

  // Find max minutes in past 7 days to scale graph heights proportionally
  const maxMinutes = Math.max(120, ...past7Days.map((d) => d.minutes));

  // Today target is 90 mins
  const dailyTarget = 90;
  const todayProgressPercent = Math.min(
    100,
    Math.round((todayMinutes / dailyTarget) * 100),
  );

  const formatHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Recent 5 sessions
  const recentSessions = focusSessions.slice(0, 5);

  return (
    <div className="w-full h-full flex flex-col justify-between space-y-6 text-left">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#0052FF]/10 text-[#0052FF] dark:bg-[#0052FF]/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                7-Day Deep Work Analytics
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {streak} Day Streak
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time synchronization across your Monk Mode workspace
            </p>
          </div>
        </div>

        {/* Flip Back to Timer Button */}
        <Button
          onClick={onFlipBack}
          variant="outline"
          size="sm"
          className="rounded-xl border-border hover:bg-muted font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#0052FF]" />
          <span>Timer View</span>
        </Button>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today Focus */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0052FF]/10 via-background to-background border border-[#0052FF]/30 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>Today</span>
            </span>
            <span className="text-[11px] font-bold text-[#0052FF]">
              {todayProgressPercent}%
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {formatHoursMins(todayMinutes)}
          </div>
          <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#0052FF] h-full rounded-full transition-all duration-500"
              style={{ width: `${todayProgressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Target: {dailyTarget}m daily
          </span>
        </div>

        {/* 7-Day Total */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>7-Day Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {formatHoursMins(total7DayMinutes)}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {
              focusSessions.filter((s) => {
                const d = new Date();
                d.setDate(d.getDate() - 7);
                const timeStr = s.timestamp || s.date || s.completedAt;
                return timeStr ? new Date(timeStr) >= d : false;
              }).length
            }{" "}
            total sprints
          </p>
        </div>

        {/* Daily Average */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Daily Average</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {formatHoursMins(dailyAverage)}
          </div>
          <p className="text-[10px] text-muted-foreground">Per day velocity</p>
        </div>

        {/* Total XP Earned */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/80 space-y-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Focus XP</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            +{todayMinutes * 2} XP
          </div>
          <p className="text-[10px] text-muted-foreground">Earned today</p>
        </div>
      </div>

      {/* 7-Day Interactive Bar Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-muted/20 border border-border/60 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#0052FF]" />
            Daily Focus Breakdown (Past 7 Days)
          </span>
          <span className="text-muted-foreground text-[11px]">
            Goal line:{" "}
            <span className="font-semibold text-foreground">90m</span>
          </span>
        </div>

        {/* Graph Columns */}
        <div className="pt-4 pb-1 grid grid-cols-7 gap-2 sm:gap-3 items-end h-44">
          {past7Days.map((day, idx) => {
            const heightPercent =
              maxMinutes > 0 ? Math.round((day.minutes / maxMinutes) * 100) : 0;
            const meetsGoal = day.minutes >= dailyTarget;

            return (
              <div
                key={day.date}
                className="flex flex-col items-center h-full justify-end group"
              >
                {/* Time Badge on Hover or Today */}
                <div
                  className={`text-[10px] font-bold mb-1.5 transition ${
                    day.isToday
                      ? "text-[#0052FF] scale-105"
                      : day.minutes > 0
                        ? "text-muted-foreground group-hover:text-foreground"
                        : "text-muted-foreground/40"
                  }`}
                >
                  {day.minutes > 0 ? formatHoursMins(day.minutes) : "0m"}
                </div>

                {/* Bar Pillar */}
                <div className="w-full max-w-[36px] bg-muted/50 rounded-xl p-0.5 flex flex-col justify-end h-28 relative overflow-hidden group-hover:ring-2 group-hover:ring-[#0052FF]/30 transition">
                  {/* Goal threshold line */}
                  <div
                    className="absolute w-full border-t border-dashed border-amber-500/40 z-10 pointer-events-none"
                    style={{
                      bottom: `${Math.min(95, Math.round((dailyTarget / maxMinutes) * 100))}%`,
                    }}
                    title="Daily Goal: 90m"
                  />

                  {/* Filled Bar */}
                  <div
                    className={`w-full rounded-lg transition-all duration-700 ${
                      day.isToday
                        ? "bg-gradient-to-t from-[#0052FF] to-[#38BDF8] shadow-md shadow-[#0052FF]/30"
                        : meetsGoal
                          ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          : day.minutes > 0
                            ? "bg-gradient-to-t from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400"
                            : "bg-transparent"
                    }`}
                    style={{
                      height: `${Math.max(day.minutes > 0 ? 8 : 0, heightPercent)}%`,
                    }}
                  />
                </div>

                {/* Day Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs block font-bold ${
                      day.isToday ? "text-[#0052FF]" : "text-muted-foreground"
                    }`}
                  >
                    {day.isToday ? "Today" : day.shortDay}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 block">
                    {day.fullDate.split(" ")[1]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions & Bottom CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            {recentSessions.length > 0 &&
            (recentSessions[0].timestamp ||
              recentSessions[0].date ||
              recentSessions[0].completedAt)
              ? `Last active: ${new Date(recentSessions[0].timestamp || recentSessions[0].date || recentSessions[0].completedAt || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${recentSessions[0].durationMinutes}m sprint)`
              : "No sessions logged today yet. Ready to start?"}
          </span>
        </div>

        <Button
          onClick={onStartSprint}
          className="w-full sm:w-auto bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start 25m Focus Sprint</span>
        </Button>
      </div>
    </div>
  );
}
