"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { useApp } from "@/lib/store";

export function WeeklyVelocityChart() {
  const { analyticsData } = useApp();

  const days = analyticsData?.dailyVelocity || [];

  return (
    <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl ios-card space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0052FF]" />
            <span>7-Day Productivity Velocity</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daily focus hours and completed task throughput
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0052FF]" /> Focus Hours
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Tasks
            Done
          </span>
        </div>
      </div>

      {/* Bar Columns */}
      <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 items-end h-44 border-b border-border pb-3">
        {days.map((d) => {
          const focusHrs = d.focusHours ?? 0;
          const tasksDone = d.completedTasks ?? 0;
          const heightPct = d.heightPct || 0;
          const hasActivity = focusHrs > 0 || tasksDone > 0;

          return (
            <div
              key={d.date || d.day}
              className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
            >
              <span className="text-[10px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition">
                {focusHrs}h ({tasksDone} tasks)
              </span>
              <div className="w-full max-w-[28px] bg-muted/60 rounded-xl h-full flex flex-col justify-end p-1 overflow-hidden">
                {hasActivity ? (
                  <div
                    className="w-full bg-gradient-to-t from-[#0052FF] to-[#3B82F6] rounded-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${Math.max(15, heightPct)}%` }}
                  />
                ) : (
                  <div className="w-full bg-border/40 rounded-full h-1.5 transition-all group-hover:bg-[#0052FF]/30" />
                )}
              </div>
              <span className="text-xs font-bold text-card-foreground mt-1">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
