"use client";

import React from "react";
import { Lock, MoreVertical, UserX, Ban } from "lucide-react";
import type { Friend } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonRow } from "./PersonRow";
import { StatPills } from "./StatPill";

interface FriendCardProps {
  friend: Friend;
  onRemove: () => void;
  onBlock: () => void;
}

export function FriendCard({ friend, onRemove, onBlock }: FriendCardProps) {
  const { stats } = friend;

  return (
    <div className="ios-card rounded-2xl p-3 border border-border space-y-2">
      <PersonRow user={friend}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Friend options"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRemove} className="gap-2 text-xs cursor-pointer">
              <UserX className="w-3.5 h-3.5" /> Remove friend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBlock} className="gap-2 text-xs text-rose-500 cursor-pointer">
              <Ban className="w-3.5 h-3.5" /> Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PersonRow>

      {stats ? (
        <StatPills stats={stats} />
      ) : (
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-1">
          <Lock className="w-3 h-3" /> Keeps their stats private
        </p>
      )}
    </div>
  );
}
