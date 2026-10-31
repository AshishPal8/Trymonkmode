"use client";

import React, { useEffect, useRef, useState } from "react";
import { Flame, Wrench } from "lucide-react";
import type { StreakStatus, StreakDayState } from "@/lib/types";
import { streakApi } from "@/lib/api";
import { formatDatePretty, triggerCelebrationConfetti } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

const DOT_STYLE: Record<StreakDayState, string> = {
  active: "bg-amber-500 text-white",
  repaired: "bg-amber-500/40 text-white",
  rest: "bg-sky-500/20 text-sky-500",
  missed: "bg-muted text-muted-foreground/60",
  today: "border border-dashed border-amber-500 text-amber-500",
  future: "bg-muted/40 text-muted-foreground/40",
};

const DOT_LABEL: Record<StreakDayState, string> = {
  active: "Active",
  repaired: "Repaired",
  rest: "Rest day",
  missed: "Missed",
  today: "Today (not yet)",
  future: "Coming up",
};

interface StreakTileProps {
  streak: number;
  status?: StreakStatus;
  /** Called after a repair so the dashboard reloads its numbers. */
  onChanged: () => void;
}

/** Streak number, this week's days, rest days, repair button and weekly bonus. */
export function StreakTile({ streak, status, onChanged }: StreakTileProps) {
  const { confirm, confirmDialog } = useConfirm();
  const [isRepairing, setIsRepairing] = useState(false);
  const celebrated = useRef<string | null>(null);

  // The server tells us once when the weekly bonus was just earned.
  useEffect(() => {
    if (status?.bonusJustEarned && celebrated.current !== status.weekStart) {
      celebrated.current = status.weekStart;
      triggerCelebrationConfetti();
      toast.success(
        `${status.weeklyGoalDays} active days this week! +${status.weeklyBonusXp} XP`,
      );
    }
  }, [status]);

  const handleRepair = async () => {
    if (!status?.brokenOn) return;
    const ok = await confirm({
      title: `Repair your streak?`,
      description: `You missed ${formatDatePretty(status.brokenOn)}. Using 1 repair brings your streak back to ${status.streakIfRepaired} days. You have ${status.repairsLeft} of ${status.repairsPerMonth} left this month.`,
      confirmLabel: "Use 1 repair",
    });
    if (!ok) return;
    setIsRepairing(true);
    try {
      const res = await streakApi.repair();
      toast.success(res?.data?.message || "Streak repaired!");
      onChanged();
    } catch {
      toast.error("Couldn't repair the streak. Please try again.");
    } finally {
      setIsRepairing(false);
    }
  };

  const subtitle = !status
    ? streak > 0
      ? "Days in a row with progress"
      : "Finish a task, habit or focus session"
    : status.todayIsRest && !status.activeToday
      ? "🛌 Rest day: your streak is safe"
      : status.activeToday
        ? "🔥 Done for today"
        : status.current > 0
          ? "Do one thing today to keep it"
          : "Finish a task, habit or focus session";

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm space-y-2">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] font-bold uppercase tracking-wider">
          Streak
        </span>
        <Flame className="w-4 h-4 text-amber-500" />
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-card-foreground font-mono">
        {streak}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
      <p className="text-[11px] font-semibold text-amber-500">{subtitle}</p>

      {status && (
        <>
          {/* This week, Monday to Sunday */}
          <div className="flex items-center gap-1" aria-label="This week">
            {status.week.map((d, i) => (
              <span
                key={d.date}
                title={`${formatDatePretty(d.date)}: ${DOT_LABEL[d.state]}`}
                className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center ${DOT_STYLE[d.state]}`}
              >
                {DAY_LETTERS[i]}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground">
            {status.weeklyBonusEarned
              ? `🏅 Weekly bonus earned (+${status.weeklyBonusXp} XP)`
              : `${status.activeDaysThisWeek}/${status.weeklyGoalDays} active days this week → +${status.weeklyBonusXp} XP`}
          </p>

          {status.brokenOn && (
            <button
              type="button"
              onClick={handleRepair}
              disabled={!status.canRepair || isRepairing}
              className="w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            >
              <Wrench className="w-3.5 h-3.5" />
              {status.canRepair
                ? `Repair to ${status.streakIfRepaired} days (${status.repairsLeft} left)`
                : "No repairs left this month"}
            </button>
          )}
        </>
      )}
      {confirmDialog}
    </div>
  );
}
