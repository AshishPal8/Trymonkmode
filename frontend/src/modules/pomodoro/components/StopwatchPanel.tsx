"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useFocusStore } from "@/stores/focusStore";
import { Button } from "@/components/ui/button";
import { FocusTaskPicker } from "./FocusTaskPicker";
import { DistractionNotes } from "./DistractionNotes";

/** 125_430 ms -> "02:05.43". */
function formatStopwatch(ms: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${pad(mins)}:${pad(secs)}.${pad(hundredths)}`;
}

/** Open-ended focus: count up, then "Finish & save" logs it like a Pomodoro. */
export function StopwatchPanel() {
  const { isStopwatchRunning, startStopwatch, pauseStopwatch, resetStopwatch, finishStopwatch, getStopwatchElapsedMs } =
    useFocusStore();
  const [elapsedMs, setElapsedMs] = useState(getStopwatchElapsedMs());

  useEffect(() => {
    const interval = setInterval(() => setElapsedMs(getStopwatchElapsedMs()), 250);
    return () => clearInterval(interval);
  }, [getStopwatchElapsedMs]);

  const hasTime = elapsedMs >= 1000;

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl ios-card text-center space-y-6">
      <FocusTaskPicker />

      <div className="text-5xl font-bold font-mono tracking-tight text-card-foreground py-4">
        {formatStopwatch(elapsedMs)}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={resetStopwatch}
          disabled={!hasTime}
          className="px-5 py-2.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold hover:text-foreground disabled:opacity-50 cursor-pointer transition active:scale-95"
        >
          Discard
        </button>
        <Button
          onClick={() => (isStopwatchRunning ? pauseStopwatch() : startStopwatch())}
          className={`px-8 py-3 rounded-full text-white text-xs font-bold shadow-md cursor-pointer transition active:scale-95 ${
            isStopwatchRunning ? "bg-[#FF5C39] hover:bg-[#E04B2A]" : "bg-[#0052FF] hover:bg-[#0043D6]"
          }`}
        >
          {isStopwatchRunning ? "Pause" : hasTime ? "Resume" : "Start"}
        </Button>
        <button
          onClick={finishStopwatch}
          disabled={!hasTime}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer transition active:scale-95"
        >
          <Check className="w-3.5 h-3.5" /> Finish & save
        </button>
      </div>

      {hasTime && <DistractionNotes />}
      <p className="text-[11px] text-muted-foreground">Saved like a Pomodoro: counts for your streak, XP and goals.</p>
    </div>
  );
}
