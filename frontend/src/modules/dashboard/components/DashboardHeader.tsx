'use client';

import React from 'react';
import { Play, LayoutDashboard, BarChart3 } from 'lucide-react';
import { formatDatePretty, getTodayDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';

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
        <SegmentedTabs
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { value: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          ]}
        />

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
