"use client";

import React from "react";
import { ArrowLeft, CheckCircle2, LogOut, Trash2, Trophy } from "lucide-react";
import type { ChallengeDetail } from "@/lib/types";
import { useChallengeStore } from "@/stores/challengeStore";
import { useUserStore } from "@/stores/userStore";
import { formatDatePretty } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { displayName } from "@/modules/leaderboard/friendHelpers";
import { isAdminRole, phaseText, ruleText } from "./challengeHelpers";
import { ChallengeProgress } from "./components/ChallengeProgress";
import { ChallengeLeaderboard } from "./components/ChallengeLeaderboard";

/** Winner and your place, once a challenge is over. */
function ResultsCard({ challenge }: { challenge: ChallengeDetail }) {
  const winner = challenge.leaderboard[0];
  if (!winner) return null;
  return (
    <div className="ios-card rounded-3xl border border-border p-5 text-center space-y-1">
      <Trophy className="w-7 h-7 mx-auto text-amber-500" />
      <p className="text-sm font-bold text-foreground">{displayName(winner.user)} won</p>
      <p className="text-xs text-muted-foreground">
        {winner.standing.daysDone} of {challenge.durationDays} days done
        {challenge.me ? ` · You finished #${challenge.me.rank} of ${challenge.leaderboard.length}` : ""}
      </p>
    </div>
  );
}

export function ChallengeDetailView({ challenge: c }: { challenge: ChallengeDetail }) {
  const { open, join, leave, checkIn, remove } = useChallengeStore();
  const isAdmin = isAdminRole(useUserStore((s) => s.user.role));
  const { confirm, confirmDialog } = useConfirm();
  const todayDone = !!c.me && c.me.standing.todayValue >= c.dailyTarget;

  const handleLeave = async () => {
    const ok = await confirm({
      title: "Leave this challenge?",
      description: "You'll drop off its leaderboard. You can join again while it's running.",
      confirmLabel: "Leave",
      destructive: true,
    });
    if (ok) leave(c.id);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${c.title}"?`,
      description: "It will be removed for everyone in it.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) remove(c.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => open(null)}>
          <ArrowLeft /> All challenges
        </Button>
        <div className="flex gap-2">
          {c.isMember && (
            <Button variant="outline" onClick={handleLeave}>
              <LogOut /> Leave
            </Button>
          )}
          {isAdmin && (
            <Button variant="destructive" onClick={handleDelete} aria-label="Delete challenge">
              <Trash2 /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="ios-card rounded-3xl p-5 sm:p-6 border border-border space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] text-muted-foreground">
            <span className={c.phase === "active" ? "text-primary font-semibold" : ""}>{phaseText(c)}</span>
            {" · "}
            {formatDatePretty(c.startDate)} – {formatDatePretty(c.endDate)} · {c.memberCount} joined
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {c.emoji} {c.title}
          </h2>
          <p className="text-xs font-semibold text-foreground/80">{ruleText(c)}</p>
          {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
        </div>

        {c.me && (
          <ChallengeProgress
            standing={c.me.standing}
            metric={c.metric}
            dailyTarget={c.dailyTarget}
            durationDays={c.durationDays}
            showToday={c.phase === "active"}
          />
        )}

        {!c.isMember && c.phase !== "ended" && (
          <Button size="lg" onClick={() => join(c.id)} className="w-full">
            Join challenge
          </Button>
        )}

        {c.canCheckIn && (
          <Button size="lg" onClick={() => checkIn(c.id)} disabled={todayDone} className="w-full">
            <CheckCircle2 /> {todayDone ? "Checked in today" : "I did it today"}
          </Button>
        )}

        {c.isMember && c.metric !== "manual" && c.phase === "active" && (
          <p className="text-[11px] text-muted-foreground">
            Counted automatically from your saved {c.metricLabel}. Days are counted in India time.
          </p>
        )}
      </div>

      {c.phase === "ended" && <ResultsCard challenge={c} />}
      <ChallengeLeaderboard challenge={c} />
      {confirmDialog}
    </div>
  );
}
