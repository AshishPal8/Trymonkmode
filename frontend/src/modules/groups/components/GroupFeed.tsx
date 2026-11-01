import React from "react";
import type { GroupDetail } from "@/lib/types";
import { feedText, timeAgo } from "../groupHelpers";

const ICON = { focus: "⏱️", badge: "🏅", joined: "👋" } as const;

/** The last 7 days of focus sessions, badges and new members. */
export function GroupFeed({ group }: { group: GroupDetail }) {
  return (
    <div className="ios-card rounded-3xl border border-border p-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">This week</h3>
      {group.feed.length === 0 && <p className="text-xs text-muted-foreground py-3">Nothing yet. Start a focus session!</p>}
      {group.feed.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5 py-1">
          <span className="text-base">{ICON[item.kind]}</span>
          <p className="flex-1 text-xs text-foreground">{feedText(item, group.members)}</p>
          <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(item.at)}</span>
        </div>
      ))}
    </div>
  );
}
