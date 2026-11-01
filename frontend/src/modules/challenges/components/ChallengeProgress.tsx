import React from "react";
import { Check, Flame } from "lucide-react";
import type { ChallengeMetric, ChallengeStanding } from "@/lib/types";
import { formatMetricValue } from "../challengeHelpers";

interface ChallengeProgressProps {
  standing: ChallengeStanding;
  metric: ChallengeMetric;
  dailyTarget: number;
  durationDays: number;
  showToday?: boolean;
}

/** Days done bar, plus today's progress toward the daily target. */
export function ChallengeProgress({ standing, metric, dailyTarget, durationDays, showToday = true }: ChallengeProgressProps) {
  const pct = Math.round((standing.daysDone / durationDays) * 100);
  const todayDone = standing.todayValue >= dailyTarget;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-foreground">
          {standing.daysDone}/{durationDays} days done
        </span>
        {standing.streak > 0 && (
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Flame className="w-3 h-3" /> {standing.streak} in a row
          </span>
        )}
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {showToday && (
        <p className={`text-[11px] flex items-center gap-1 ${todayDone ? "text-emerald-500 font-semibold" : "text-muted-foreground"}`}>
          {todayDone && <Check className="w-3 h-3" />}
          Today: {metric === "manual"
            ? todayDone ? "checked in" : "not checked in yet"
            : `${formatMetricValue(metric, standing.todayValue)} / ${formatMetricValue(metric, dailyTarget)}`}
        </p>
      )}
    </div>
  );
}
