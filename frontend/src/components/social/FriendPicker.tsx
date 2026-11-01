"use client";

import React, { useEffect } from "react";
import { Check } from "lucide-react";
import { useSocialStore } from "@/stores/socialStore";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { displayName } from "@/modules/leaderboard/friendHelpers";

interface FriendPickerProps {
  selected: number[];
  onChange: (ids: number[]) => void;
  /** People already in (not shown). */
  excludeIds?: number[];
  /** Most that can be picked. */
  max?: number;
}

/** Tick friends from your friends list (uses the cached list; loads it once if needed). */
export function FriendPicker({ selected, onChange, excludeIds = [], max = Infinity }: FriendPickerProps) {
  const { friendsData, load } = useSocialStore();
  useEffect(() => {
    load();
  }, [load]);

  const friends = friendsData.friends.filter((f) => !excludeIds.includes(f.id));
  const toggle = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (selected.length < max) onChange([...selected, id]);
  };

  if (friends.length === 0) {
    return <p className="text-[11px] text-muted-foreground">No friends to add yet. Add some on the Leaderboard page.</p>;
  }

  return (
    <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
      {friends.map((f) => {
        const isOn = selected.includes(f.id);
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => toggle(f.id)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-xl text-left cursor-pointer transition ${
              isOn ? "bg-primary/10" : "hover:bg-muted/60"
            }`}
          >
            <UserAvatar name={displayName(f)} avatarUrl={f.avatar} size="xs" />
            <span className="flex-1 text-xs font-semibold text-foreground truncate">{displayName(f)}</span>
            <span
              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                isOn ? "bg-primary border-primary text-primary-foreground" : "border-border"
              }`}
            >
              {isOn && <Check className="w-3 h-3" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
