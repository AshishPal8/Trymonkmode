import React from "react";
import { Flame } from "lucide-react";
import type { GroupSummary } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

/** "6h 20m of 10h this week" + bar + group streak in weeks. */
export function WeeklyGoalBar({ group }: { group: GroupSummary }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-foreground">
          {formatMinutes(group.weekMinutes)} of {formatMinutes(group.weeklyGoalMinutes)} this week
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Flame className="w-3 h-3 text-amber-500" />
          {group.streakWeeks}-week streak
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${group.weekProgress}%` }} />
      </div>
    </div>
  );
}
