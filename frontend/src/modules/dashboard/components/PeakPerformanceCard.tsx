'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';

export function PeakPerformanceCard() {
  const { analyticsData } = useApp();

  const adherence = analyticsData?.weeklyAdherenceRate ?? 0;
  const optimalWindow = analyticsData?.optimalTimeWindow ?? '9:00 AM – 12:30 PM';
  const optimalDesc = analyticsData?.optimalTimeDescription ?? 'Complete tasks and start focus sessions to calibrate your personalized biological peak window.';
  const velocityTier = analyticsData?.velocityTier ?? 'Getting Started Tier';
  const hasCompletedTasks = (analyticsData?.completedTasks ?? 0) > 0;

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl ios-card text-card-foreground shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052FF]/10 text-[#0052FF] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optimal Biological Window</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          {hasCompletedTasks ? `You are most productive around ${optimalWindow}` : 'Biological Productivity Window'}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {optimalDesc}
        </p>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-muted/70 border border-border text-center shrink-0 min-w-[150px]">
        <span className="text-xs font-semibold text-muted-foreground">Weekly Adherence</span>
        <div className="text-3xl font-bold font-mono text-card-foreground mt-1">{adherence}%</div>
        <span className="text-[10px] text-emerald-500 font-bold">{velocityTier}</span>
      </div>
    </div>
  );
}
