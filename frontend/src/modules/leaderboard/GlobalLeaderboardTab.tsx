"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import type { LeaderboardSort } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useLeaderboard } from "./useLeaderboard";
import { LeaderboardRow } from "./components/LeaderboardRow";

const SORTS: { value: LeaderboardSort; label: string }[] = [
  { value: "xp", label: "XP" },
  { value: "streak", label: "Streak" },
  { value: "focus", label: "Focus (7 days)" },
];

/** Every user who shares their stats, ranked, 20 per page. */
export function GlobalLeaderboardTab() {
  const [sort, setSort] = useState<LeaderboardSort>("xp");
  const [page, setPage] = useState(1);
  const { data, isLoading, failed } = useLeaderboard(sort, page);
  const myId = data?.me?.user.id;
  const meOnThisPage = !!data?.items.some((entry) => entry.user.id === myId);

  const changeSort = (next: LeaderboardSort) => {
    setSort(next);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs value={sort} onChange={changeSort} options={SORTS} />
        {data && <span className="text-[11px] text-muted-foreground">{data.total} {data.total === 1 ? "monk" : "monks"} ranked</span>}
      </div>

      {/* Your row, pinned, unless it's already in the list below */}
      {data?.me && !meOnThisPage ? (
        <div className="ios-card rounded-2xl border border-border p-1">
          <LeaderboardRow entry={data.me} sort={sort} isMe />
        </div>
      ) : (
        data && !data.me && (
          <p className="text-[11px] text-muted-foreground">
            Your stats are private, so you&apos;re not on the leaderboard. Change it in the Friends tab.
          </p>
        )
      )}

      <div className="ios-card rounded-3xl border border-border p-2 min-h-40">
        {failed && <p className="p-6 text-center text-xs text-muted-foreground">Couldn&apos;t load the leaderboard.</p>}
        {!failed && data?.items.length === 0 && (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Trophy className="w-6 h-6 mx-auto mb-2 opacity-50" /> No one here yet.
          </div>
        )}
        <div className={isLoading ? "opacity-50 transition" : "transition"}>
          {data?.items.map((entry) => (
            <LeaderboardRow key={entry.user.id} entry={entry} sort={sort} isMe={entry.user.id === myId} />
          ))}
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 rounded-xl text-xs px-3 gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= data.totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 rounded-xl text-xs px-3 gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
