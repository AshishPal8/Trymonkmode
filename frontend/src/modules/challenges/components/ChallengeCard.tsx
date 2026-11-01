"use client";

import React from "react";
import { Users } from "lucide-react";
import type { ChallengeListItem } from "@/lib/types";
import { phaseText, ruleText } from "../challengeHelpers";
import { ChallengeProgress } from "./ChallengeProgress";

interface ChallengeCardProps {
  challenge: ChallengeListItem;
  onOpen: () => void;
  /** e.g. a Join button. */
  action?: React.ReactNode;
}

export function ChallengeCard({ challenge: c, onOpen, action }: ChallengeCardProps) {
  return (
    <div className="ios-card rounded-2xl border border-border p-4 space-y-3 flex flex-col">
      <button type="button" onClick={onOpen} className="text-left space-y-1 cursor-pointer flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className={c.phase === "active" ? "text-primary font-semibold" : ""}>{phaseText(c)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {c.memberCount} joined
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground">
          {c.emoji} {c.title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{ruleText(c)}</p>
      </button>

      {c.myStanding && (
        <ChallengeProgress
          standing={c.myStanding}
          metric={c.metric}
          dailyTarget={c.dailyTarget}
          durationDays={c.durationDays}
          showToday={c.phase === "active"}
        />
      )}

      {action}
    </div>
  );
}
