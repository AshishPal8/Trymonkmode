"use client";

import React, { useState } from "react";
import { Check, Flame } from "lucide-react";
import type { ChallengeDetail, ChallengeRankRow } from "@/lib/types";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { displayName } from "@/modules/leaderboard/friendHelpers";
import { formatMetricValue } from "../challengeHelpers";

type View = "overall" | "today";
const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const VIEWS = [
  { value: "overall" as const, label: "Overall" },
  { value: "today" as const, label: "Today" },
];

/** Today's order: most done today first. */
const byToday = (rows: ChallengeRankRow[]) =>
  [...rows].sort((a, b) => b.standing.todayValue - a.standing.todayValue).map((row, i) => ({ ...row, rank: i + 1 }));

/** Everyone in the challenge with their streak, so members can push each other. */
export function ChallengeLeaderboard({ challenge }: { challenge: ChallengeDetail }) {
  const [view, setView] = useState<View>("overall");
  const { metric, dailyTarget, durationDays, phase } = challenge;
  const showToday = phase === "active";
  const isTodayView = view === "today" && showToday;
  const rows = isTodayView ? byToday(challenge.leaderboard) : challenge.leaderboard;
  const myId = challenge.me?.user.id;

  return (
    <div className="ios-card rounded-3xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Leaderboard · {rows.length}
        </h3>
        {showToday && <SegmentedTabs size="sm" value={view} onChange={setView} options={VIEWS} />}
      </div>

      {rows.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No one has joined yet. Be the first!</p>}

      <div className="space-y-1">
        {rows.map((row) => {
          const isMe = row.user.id === myId;
          const doneToday = row.standing.todayValue >= dailyTarget;
          return (
            <div
              key={row.user.id}
              className={`flex items-center gap-3 px-2 py-2 rounded-2xl ${isMe ? "bg-primary/10 ring-1 ring-primary/30" : ""}`}
            >
              <span className="w-7 text-center text-sm font-bold font-mono text-muted-foreground">
                {MEDALS[row.rank] ?? `#${row.rank}`}
              </span>
              <UserAvatar name={displayName(row.user)} avatarUrl={row.user.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {displayName(row.user)}
                  {isMe && <span className="ml-1.5 text-[10px] font-bold text-primary">YOU</span>}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-500" />
                    {row.standing.streak}-day streak
                  </span>
                  {showToday && doneToday && (
                    <span className="flex items-center gap-0.5 text-primary">
                      <Check className="w-3 h-3" /> done today
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-foreground">
                  {isTodayView
                    ? formatMetricValue(metric, row.standing.todayValue)
                    : `${row.standing.daysDone}/${durationDays}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isTodayView ? "today" : "days done"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
