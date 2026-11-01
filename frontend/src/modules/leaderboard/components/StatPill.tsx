import React from "react";
import { Flame, Timer, Trophy } from "lucide-react";
import type { FriendStats } from "@/lib/types";
import { formatMinutesShort } from "@/lib/utils";

export function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex-1 rounded-xl bg-muted/40 px-2 py-1.5 text-center min-w-0">
      <div className="flex items-center justify-center gap-1 text-sm font-bold text-foreground font-mono whitespace-nowrap">
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground truncate">{label}</div>
    </div>
  );
}

/** Streak, 7-day focus and level: the same three numbers everywhere. */
export function StatPills({ stats }: { stats: FriendStats }) {
  return (
    <div className="flex gap-2">
      <StatPill icon={<Flame className="w-3.5 h-3.5 text-amber-500" />} value={String(stats.streak)} label="streak" />
      <StatPill icon={<Timer className="w-3.5 h-3.5 text-primary" />} value={formatMinutesShort(stats.weekFocusMinutes)} label="7-day focus" />
      <StatPill icon={<Trophy className="w-3.5 h-3.5 text-violet-500" />} value={`L${stats.level}`} label={`${stats.xp} XP`} />
    </div>
  );
}
