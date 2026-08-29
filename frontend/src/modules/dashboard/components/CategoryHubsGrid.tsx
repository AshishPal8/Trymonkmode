'use client';

import React from 'react';
import { Inbox, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { ActiveModuleId } from '@/lib/types';

interface CategoryHubsGridProps {
  pendingTasksCount: number;
  completedTasksCount: number;
  todayFocusMinutes: number;
  onNavigate: (module: ActiveModuleId) => void;
}

export function CategoryHubsGrid({
  pendingTasksCount,
  completedTasksCount,
  todayFocusMinutes,
  onNavigate
}: CategoryHubsGridProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
        Categories & Hubs
      </h3>

      <div className="space-y-2.5">
        {/* Inbox Card */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-2xl cat-inbox flex items-center justify-between cursor-pointer hover:scale-[1.01] transition shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FF5C39] text-white shadow-sm">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Inbox</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF5C39] text-white">
                  +{pendingTasksCount}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5 font-medium">
                Manage all active daily deliverables and tasks
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </div>

        {/* Focus & Ambient */}
        <div
          onClick={() => onNavigate('pomodoro')}
          className="p-4 rounded-2xl cat-focus flex items-center justify-between cursor-pointer hover:scale-[1.01] transition shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Focus & Ambient</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#8B5CF6] text-white">
                  {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5 font-medium">
                Neuroscience Pomodoro timer and lo-fi soundscapes
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </div>

        {/* Completed Card */}
        <div
          onClick={() => onNavigate('tasks')}
          className="p-4 rounded-2xl cat-done flex items-center justify-between cursor-pointer hover:scale-[1.01] transition shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#22C55E] text-white shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Completed</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#22C55E] text-white">
                  {completedTasksCount}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5 font-medium">
                A quick look at everything you&apos;ve checked off
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </div>
      </div>
    </div>
  );
}
