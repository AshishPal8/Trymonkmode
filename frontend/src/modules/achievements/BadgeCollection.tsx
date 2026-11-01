"use client";

import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import type { MyAchievement, MyAchievements } from "@/lib/types";
import { achievementsApi } from "@/lib/api";
import { formatDatePretty } from "@/lib/utils";

function Badge({ badge }: { badge: MyAchievement }) {
  const isUnlocked = !!badge.unlockedAt;
  return (
    <div
      className={`ios-card rounded-2xl border border-border p-3 text-center space-y-1.5 ${isUnlocked ? "" : "opacity-60"}`}
      title={badge.description}
    >
      <div className={`text-3xl ${isUnlocked ? "" : "grayscale"}`}>{badge.emoji}</div>
      <p className="text-xs font-bold text-foreground leading-tight">{badge.title}</p>
      <p className="text-[10px] text-muted-foreground leading-snug">{badge.description}</p>
      {isUnlocked ? (
        <p className="text-[10px] font-semibold text-primary">{formatDatePretty(badge.unlockedAt!.slice(0, 10))}</p>
      ) : (
        <div className="space-y-1 pt-0.5">
          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${badge.progress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            {badge.current} / {badge.threshold} {badge.unit}
          </p>
        </div>
      )}
    </div>
  );
}

/** Every badge: unlocked ones in colour with the date, locked ones with progress. */
export function BadgeCollection() {
  const [data, setData] = useState<MyAchievements | null>(null);

  useEffect(() => {
    achievementsApi
      .mine()
      .then((res) => setData(res.data.data))
      .catch(() => setData({ items: [], unlockedCount: 0, total: 0 }));
  }, []);

  if (!data) return <p className="text-xs text-muted-foreground py-6 text-center">Loading badges…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        <span className="font-bold text-foreground">{data.unlockedCount}</span> of {data.total} badges unlocked
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {data.items.map((badge) => (
          <Badge key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
