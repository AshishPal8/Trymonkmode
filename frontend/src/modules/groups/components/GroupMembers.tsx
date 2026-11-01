"use client";

import React from "react";
import { Crown, Flame, Hand, UserMinus } from "lucide-react";
import type { GroupDetail, GroupLive } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Button } from "@/components/ui/button";
import { displayName } from "@/modules/leaderboard/friendHelpers";
import { minutesLeft } from "@/lib/utils";

interface GroupMembersProps {
  group: GroupDetail;
  live: GroupLive;
  myId: number | null;
  friendIds: Set<number>;
  onNudge: (userId: number) => void;
  onRemove: (userId: number) => void;
}

/** Members, most focus this week first, with who's focusing right now. */
export function GroupMembers({ group, live, myId, friendIds, onNudge, onRemove }: GroupMembersProps) {
  const focusingUntil = new Map(live.focusing.map((f) => [f.userId, f.endsAt]));

  return (
    <div className="ios-card rounded-3xl border border-border p-4 space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Members · {group.members.length}</h3>
      {group.members.map((m) => {
        const until = focusingUntil.get(m.id);
        const isMe = m.id === myId;
        return (
          <div key={m.id} className="flex items-center gap-3 py-1.5">
            <UserAvatar name={displayName(m)} avatarUrl={m.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                {displayName(m)}
                {m.isOwner && <Crown className="w-3 h-3 text-amber-500" />}
                {isMe && <span className="text-[10px] font-bold text-primary">YOU</span>}
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-500" /> {m.streak}
                </span>
                <span>{formatMinutes(m.weekMinutes)} this week</span>
                {until && <span className="text-primary font-semibold">● focusing · {minutesLeft(until)}</span>}
              </p>
            </div>
            {!isMe && friendIds.has(m.id) && !until && (
              <Button variant="ghost" size="icon-sm" onClick={() => onNudge(m.id)} aria-label={`Nudge ${displayName(m)}`} title="Nudge">
                <Hand />
              </Button>
            )}
            {!isMe && group.isOwner && (
              <Button variant="ghost" size="icon-sm" onClick={() => onRemove(m.id)} aria-label={`Remove ${displayName(m)}`}>
                <UserMinus />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
