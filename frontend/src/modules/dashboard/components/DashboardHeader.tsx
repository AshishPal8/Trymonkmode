'use client';

import React from 'react';
import { Play, LayoutDashboard, BarChart3 } from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  pendingTasksCount: number;
  activeTab: 'overview' | 'analytics';
  setActiveTab: (tab: 'overview' | 'analytics') => void;
  onStartFocus: () => void;
}

export function DashboardHeader({
  pendingTasksCount,
  activeTab,
  setActiveTab,
  onStartFocus
}: DashboardHeaderProps) {
  const todayStr = getTodayDateString();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2 flex-wrap">
          <span>Let&apos;s organize your</span>
          <span className="bg-[#0052FF] text-white px-3 py-0.5 rounded-xl font-mono text-xl sm:text-2xl shadow-sm">
            {pendingTasksCount} {pendingTasksCount === 1 ? 'task' : 'tasks'}
          </span>
          <span>today! 👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {formatDatePretty(todayStr)} · Flow State Velocity
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Modular View Switcher: Overview vs Deep Analytics */}
        <div className="flex p-1 ios-card rounded-2xl bg-card border border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#0052FF] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>

        <Button
          onClick={onStartFocus}
          className="rounded-xl bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold px-4 py-2 cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">Focus Mode</span>
          <span className="sm:hidden">Focus</span>
        </Button>
      </div>
    </div>
  );
}
