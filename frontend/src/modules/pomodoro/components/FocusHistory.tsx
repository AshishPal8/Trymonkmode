"use client";

import React, { useState } from "react";
import { CheckCircle2, History, NotebookPen } from "lucide-react";
import { useFocusStore } from "@/stores/focusStore";
import type { FocusSession } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";

function dayLabel(date: string) {
  const today = getTodayDateString();
  const y = new Date(`${today}T00:00:00`);
  y.setDate(y.getDate() - 1);
  const p = (n: number) => String(n).padStart(2, "0");
  const yesterday = `${y.getFullYear()}-${p(y.getMonth() + 1)}-${p(y.getDate())}`;
  if (date === today) return "Today";
  if (date === yesterday) return "Yesterday";
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? `${m % 60}m` : ""}`.trim() : `${m}m`);

/** Past sessions grouped by day, with task, notes and totals. */
export function FocusHistory() {
  const sessions = useFocusStore((s) => s.focusSessions);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const byDay = new Map<string, FocusSession[]>();
  for (const s of sessions) {
    const day = (s.timestamp || s.date || s.completedAt || "").slice(0, 10);
    if (!day) continue;
    byDay.set(day, [...(byDay.get(day) || []), s]);
  }
  const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const visibleDays = showAll ? days : days.slice(0, 5);

  return (
    <div className="p-5 sm:p-6 rounded-3xl ios-card space-y-4">
      <h3 className="text-sm font-bold text-card-foreground flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        Session history
      </h3>

      {days.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          No sessions yet. Even 10 focused minutes count.
        </p>
      ) : (
        <div className="space-y-4">
          {visibleDays.map(([day, list]) => (
            <div key={day} className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>{dayLabel(day)}</span>
                <span>
                  {fmt(list.reduce((n, s) => n + (s.durationMinutes || 0), 0))} · {list.length} session{list.length === 1 ? "" : "s"}
                </span>
              </div>
              {list.map((s) => (
                <div key={s.id} className="rounded-xl bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-muted-foreground w-11 shrink-0">
                      {(s.timestamp || "").slice(11, 16)}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-foreground">
                      {s.taskTitle || s.tag || "Focus"}
                    </span>
                    {s.notes && (
                      <button
                        type="button"
                        onClick={() => setOpenNotes(openNotes === s.id ? null : s.id)}
                        className="p-1 rounded-md text-amber-500 hover:bg-amber-500/10 cursor-pointer"
                        aria-label="Show distraction notes"
                      >
                        <NotebookPen className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {s.completed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Full session" />}
                    <span className="font-mono font-semibold text-foreground w-12 text-right shrink-0">
                      {fmt(s.durationMinutes || 0)}
                    </span>
                  </div>
                  {openNotes === s.id && s.notes && (
                    <ul className="mt-1.5 ml-12 space-y-0.5 text-[11px] text-muted-foreground list-disc pl-4">
                      {s.notes.split("\n").map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ))}
          {days.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-[11px] font-semibold text-primary py-1 cursor-pointer"
            >
              {showAll ? "Show less" : `Show ${days.length - 5} more days`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
