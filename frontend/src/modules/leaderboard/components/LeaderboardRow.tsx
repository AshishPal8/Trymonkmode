import React from "react";
import type { LeaderboardEntry, LeaderboardSort } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { displayName } from "../friendHelpers";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/** The number the list is sorted by, shown big on the right. */
function mainValue(entry: LeaderboardEntry, sort: LeaderboardSort) {
  if (sort === "streak") return { value: `${entry.stats.streak}`, label: "day streak" };
  if (sort === "focus") return { value: formatMinutes(entry.stats.weekFocusMinutes), label: "focus, 7 days" };
  return { value: entry.stats.xp.toLocaleString("en-IN"), label: `XP · L${entry.stats.level}` };
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  sort: LeaderboardSort;
  isMe?: boolean;
}

export function LeaderboardRow({ entry, sort, isMe }: LeaderboardRowProps) {
  const main = mainValue(entry, sort);
  const name = displayName(entry.user);

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl ${isMe ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}>
      <span className="w-8 text-center text-sm font-bold font-mono text-muted-foreground shrink-0">
        {MEDALS[entry.rank] ?? `#${entry.rank}`}
      </span>
      <UserAvatar name={name} avatarUrl={entry.user.avatar} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {name}
          {isMe && <span className="ml-1.5 text-[10px] font-bold text-primary">YOU</span>}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {entry.user.username ? `@${entry.user.username} · ` : ""}🔥 {entry.stats.streak} · L{entry.stats.level}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold font-mono text-foreground">{main.value}</p>
        <p className="text-[10px] text-muted-foreground">{main.label}</p>
      </div>
    </div>
  );
}
