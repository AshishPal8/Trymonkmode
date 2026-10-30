"use client";

import React, { useEffect } from "react";
import { Minimize2, Pause, Play, Square } from "lucide-react";
import { useFocusStore } from "@/stores/focusStore";
import { DistractionNotes } from "./DistractionNotes";

interface FocusFullscreenProps {
  seconds: number;
  totalSeconds: number;
  onExit: () => void;
}

const MODE_LABEL = { pomodoro: "Focus", shortBreak: "Short break", longBreak: "Long break" } as const;

/** Distraction-free view: big timer, current task, notes. Esc to exit. */
export function FocusFullscreen({ seconds, totalSeconds, onExit }: FocusFullscreenProps) {
  const { mode, isRunning, startTimer, pauseTimer, resetTimer, currentTaskTitle } = useFocusStore();

  useEffect(() => {
    // Ask the browser for real full screen too (ignored if not allowed).
    document.documentElement.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
      if (e.key === " " && (e.target as HTMLElement)?.tagName !== "INPUT") {
        e.preventDefault();
        if (useFocusStore.getState().isRunning) {
          useFocusStore.getState().pauseTimer();
        } else {
          useFocusStore.getState().startTimer();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [onExit]);

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  const pct = totalSeconds > 0 ? Math.min(100, ((totalSeconds - seconds) / totalSeconds) * 100) : 0;
  const isBreak = mode !== "pomodoro";

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col items-center justify-center gap-8 px-4">
      <button
        type="button"
        onClick={onExit}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
      >
        <Minimize2 className="w-3.5 h-3.5" /> Exit (Esc)
      </button>

      <div className="text-center space-y-2">
        <div className={`text-xs font-bold uppercase tracking-[0.2em] ${isBreak ? "text-emerald-500" : "text-primary"}`}>
          {MODE_LABEL[mode]}
        </div>
        {currentTaskTitle && !isBreak && (
          <div className="text-base sm:text-lg font-semibold text-foreground max-w-xl">{currentTaskTitle}</div>
        )}
      </div>

      <div className="font-mono font-bold tracking-tight text-foreground text-7xl sm:text-9xl tabular-nums">
        {mins}:{secs}
      </div>

      <div className="w-full max-w-md h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isBreak ? "bg-emerald-500" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (isRunning ? pauseTimer() : startTimer())}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-bold cursor-pointer active:scale-95 transition"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={() => {
            resetTimer(true);
            onExit();
          }}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold cursor-pointer hover:text-foreground"
          title="Stop and save the time so far"
        >
          <Square className="w-4 h-4" /> Stop & save
        </button>
      </div>

      {!isBreak && <DistractionNotes compact />}
      <p className="text-[11px] text-muted-foreground">Space to pause or resume</p>
    </div>
  );
}
