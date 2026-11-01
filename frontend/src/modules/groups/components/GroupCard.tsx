import React from "react";
import { Users } from "lucide-react";
import type { GroupSummary } from "@/lib/types";
import { WeeklyGoalBar } from "./WeeklyGoalBar";

export function GroupCard({ group, onOpen }: { group: GroupSummary; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="ios-card rounded-2xl border border-border p-4 space-y-3 text-left cursor-pointer hover:border-primary/40 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-foreground truncate">
          {group.emoji} {group.name}
        </h3>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <Users className="w-3 h-3" /> {group.memberCount}
        </span>
      </div>
      <WeeklyGoalBar group={group} />
    </button>
  );
}
