'use client';

import React, { useEffect } from 'react';
import { useApp } from '@/lib/store';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  Award,
  ArrowUpRight,
  Target,
  Zap,
  Loader2
} from 'lucide-react';
import { ModuleContainer } from '@/components/layout/ModuleContainer';

export function AnalyticsView() {
  const { analyticsData, loadModuleData } = useApp();

  useEffect(() => {
    if (!analyticsData) {
      loadModuleData('analytics', true);
    }
  }, [analyticsData, loadModuleData]);

  if (!analyticsData) {
    return (
      <ModuleContainer>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#0052FF]" />
          <p className="text-xs font-semibold">Loading telemetry from backend...</p>
        </div>
      </ModuleContainer>
    );
  }

  const telemetry = analyticsData;

  return (
    <ModuleContainer>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Productivity Analytics
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Empirical telemetry into your deep work sessions, habit velocity, and cognitive peak performance
        </p>
      </div>

      {/* 1. Dynamic Peak Performance Highlight Banner */}
      <div className="p-6 sm:p-8 rounded-3xl ios-card text-card-foreground shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052FF]/10 text-[#0052FF] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Biological Window</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {telemetry.completedTasks > 0 ? `You are most productive around ${telemetry.optimalTimeWindow}` : 'Biological Productivity Window'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {telemetry.optimalTimeDescription}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-muted border border-border text-center shrink-0 min-w-[160px]">
          <span className="text-xs font-semibold text-muted-foreground">Weekly Adherence</span>
          <div className="text-3xl font-bold font-mono text-card-foreground mt-1">
            {telemetry.weeklyAdherenceRate}%
          </div>
          <span className="text-[10px] text-emerald-500 font-bold">
            {telemetry.velocityTier}
          </span>
        </div>
      </div>

      {/* 2. 4 Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl ios-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase">Focus Hours</span>
            <Clock className="w-4 h-4 text-[#0052FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
            {telemetry.totalFocusHours} <span className="text-sm font-normal text-muted-foreground">hrs</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tracked deep work
          </span>
        </div>

        <div className="p-5 rounded-3xl ios-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase">Task Velocity</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
            {telemetry.taskCompletionRate}%
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-0.5 mt-1">
            {telemetry.completedTasks} of {telemetry.totalTasks} tasks done
          </span>
        </div>

        <div className="p-5 rounded-3xl ios-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase">Active Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
            {telemetry.streak} <span className="text-sm font-normal text-muted-foreground">days</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-500 mt-1 block">
            {telemetry.streak > 0 ? '🔥 Unbroken streak' : '⚡ Start your streak today'}
          </span>
        </div>

        <div className="p-5 rounded-3xl ios-card">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-bold uppercase">Total XP</span>
            <Award className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
            {telemetry.xp} <span className="text-sm font-normal text-muted-foreground">/ {telemetry.xpToNextLevel}</span>
          </div>
          <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
            Lvl {telemetry.level} Flow Architect
          </span>
        </div>
      </div>

      {/* 3. Focus Hours 7-Day Bar Chart */}
      <div className="p-6 sm:p-8 rounded-3xl ios-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-card-foreground">7-Day Focus & Activity Volume</h3>
            <p className="text-xs text-muted-foreground">Real-time daily output and task completion volume across the past week</p>
          </div>

          <div className="text-xs font-bold text-[#0052FF] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>Peak: {telemetry.peakDayName}</span>
          </div>
        </div>

        {/* 7-Day Focus Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-6 h-48 items-end pt-6 pb-2 border-b border-border">
          {(telemetry.dailyVelocity || []).map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                {bar.focusHours}h ({bar.completedTasks} tasks)
              </span>
              <div
                className={`w-full sm:w-12 rounded-t-2xl transition-all duration-500 shadow-sm ${
                  bar.isPeak
                    ? 'bg-[#0052FF]'
                    : 'bg-muted hover:bg-[#0052FF]/60'
                }`}
                style={{ height: `${bar.heightPct}%` }}
              />
              <span className="text-xs font-bold text-muted-foreground mt-2">{bar.day}</span>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>{telemetry.totalHabits} habits tracked</span>
          </span>
          <span>{telemetry.pendingTasks} pending tasks in queue</span>
        </div>
      </div>
    </ModuleContainer>
  );
}
