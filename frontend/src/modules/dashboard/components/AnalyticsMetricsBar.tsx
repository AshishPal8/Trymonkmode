'use client';

import React from 'react';
import { Clock, CheckCircle2, Flame, Award, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface AnalyticsMetricsBarProps {
  user: UserProfile;
  totalFocusHours: string;
  taskCompletionRate: number;
}

export function AnalyticsMetricsBar({
  user,
  totalFocusHours,
  taskCompletionRate
}: AnalyticsMetricsBarProps) {
  const xpPercent = Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 1000)) * 100));

  const velocityLabel = taskCompletionRate >= 80
    ? 'High velocity'
    : taskCompletionRate >= 50
      ? 'Steady pace'
      : taskCompletionRate > 0
        ? 'In progress'
        : 'Ready to start';

  const velocityColor = taskCompletionRate >= 50
    ? 'text-emerald-500'
    : taskCompletionRate > 0
      ? 'text-[#0052FF]'
      : 'text-muted-foreground';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* Focus Hours */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Focus Time</span>
          <Clock className="w-4 h-4 text-[#0052FF]" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {totalFocusHours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-0.5 mt-1">
          <ArrowUpRight className="w-3.5 h-3.5 text-[#0052FF]" /> Tracked deep work
        </span>
      </div>

      {/* Task Velocity */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Task Velocity</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {taskCompletionRate}%
        </div>
        <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-1 ${velocityColor}`}>
          <ArrowUpRight className="w-3.5 h-3.5" /> {velocityLabel}
        </span>
      </div>

      {/* Active Streak */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Streak</span>
          <Flame className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {user.streak || 0} <span className="text-xs font-normal text-muted-foreground">days</span>
        </div>
        <span className="text-[11px] font-semibold text-amber-500 mt-1 block">
          {user.streak > 0 ? '🔥 Unbroken consistency' : '⚡ Start your streak today'}
        </span>
      </div>

      {/* Level & XP Progress */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm">
        <div className="flex items-center justify-between text-muted-foreground mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider">Level {user.level || 1}</span>
          <Award className="w-4 h-4 text-[#0052FF]" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
          {user.xp || 0} <span className="text-xs font-normal text-muted-foreground">/ {user.xpToNextLevel || 1000} XP</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#0052FF] rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
