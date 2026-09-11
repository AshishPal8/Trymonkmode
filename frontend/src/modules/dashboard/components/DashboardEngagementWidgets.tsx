"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Shuffle,
  ShieldCheck,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { TaskItem, HabitItem } from "@/lib/types";

const STOIC_QUOTES = [
  {
    quote:
      "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    tag: "Mental Fortitude",
  },
  {
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    tag: "Clarity",
  },
  {
    quote:
      "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    tag: "Execution",
  },
  {
    quote:
      "Focus is saying NO to 1,000 good things to make room for the great thing.",
    author: "Steve Jobs",
    tag: "Ruthless Focus",
  },
  {
    quote:
      "A rational person can find peace by cultivating indifference to things outside their control.",
    author: "Naval Ravikant",
    tag: "Calm Mind",
  },
  {
    quote: "Think lightly of yourself and deeply of the world.",
    author: "Miyamoto Musashi",
    tag: "Monk Mindset",
  },
  {
    quote: "Discipline equals freedom.",
    author: "Jocko Willink",
    tag: "Self-Mastery",
  },
];

interface DashboardEngagementWidgetsProps {
  tasks: TaskItem[];
  habits: HabitItem[];
  todayStr: string;
  todayFocusMinutes: number;
  onNavigate: (module: any) => void;
}

export function DashboardEngagementWidgets({
  tasks,
  habits,
  todayStr,
  todayFocusMinutes,
  onNavigate,
}: DashboardEngagementWidgetsProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const handleShuffleQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % STOIC_QUOTES.length);
  };

  const currentQuote = STOIC_QUOTES[quoteIndex];

  // Calculate Daily Harmony Score (0 - 100)
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (!t.completed && t.dueDate < todayStr),
  );
  const completedTodayTasks = todayTasks.filter((t) => t.completed).length;
  const taskRatio =
    todayTasks.length > 0 ? completedTodayTasks / todayTasks.length : 0.5;

  const completedTodayHabits = habits.filter((h) =>
    h.completedDates.includes(todayStr),
  ).length;
  const habitRatio =
    habits.length > 0 ? completedTodayHabits / habits.length : 0.5;

  const focusTarget = 90; // 90 minutes deep work daily target
  const focusRatio = Math.min(1, todayFocusMinutes / focusTarget);

  const harmonyScore = Math.round(
    (taskRatio * 0.35 + habitRatio * 0.4 + focusRatio * 0.25) * 100,
  );

  const getScoreTier = (score: number) => {
    if (score >= 85)
      return {
        label: "Peak Flow State",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      };
    if (score >= 60)
      return {
        label: "High Momentum",
        color: "text-[#0052FF]",
        bg: "bg-[#0052FF]/10",
      };
    if (score >= 35)
      return {
        label: "Active Building",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      };
    return {
      label: "Warming Up",
      color: "text-zinc-500",
      bg: "bg-zinc-500/10",
    };
  };

  const tier = getScoreTier(harmonyScore);

  // Dynamic Micro-Quests
  const quests = [
    {
      id: "q1",
      title: "Complete 1 Focus Sprint (25m+)",
      xp: 30,
      completed: todayFocusMinutes >= 25,
      progress: `${Math.min(todayFocusMinutes, 25)}/25m`,
      action: () => onNavigate("pomodoro"),
    },
    {
      id: "q2",
      title: "Execute 2 Scheduled Tasks",
      xp: 25,
      completed: completedTodayTasks >= 2,
      progress: `${Math.min(completedTodayTasks, 2)}/2`,
      action: () => onNavigate("tasks"),
    },
    {
      id: "q3",
      title: "Lock In 2 Daily Habits",
      xp: 25,
      completed: completedTodayHabits >= 2,
      progress: `${Math.min(completedTodayHabits, 2)}/2`,
      action: () => onNavigate("habits"),
    },
  ];

  const completedQuestsCount = quests.filter((q) => q.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Stoic Quote Widget */}
      <div className="p-5 rounded-2xl ios-card flex flex-col justify-between space-y-3 relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052FF] bg-[#0052FF]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{currentQuote.tag}</span>
          </span>

          <button
            type="button"
            onClick={handleShuffleQuote}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
            title="Shuffle Quote"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm font-medium text-card-foreground italic leading-relaxed">
          &ldquo;{currentQuote.quote}&rdquo;
        </p>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <span className="font-semibold text-foreground">
            — {currentQuote.author}
          </span>
          <span className="text-[10px]">Tap shuffle for new insight</span>
        </div>
      </div>

      {/* 2. Daily Monk Harmony Score */}
      <div className="p-5 rounded-2xl ios-card flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#0052FF]/10 text-[#0052FF] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-card-foreground">
                Daily Monk Score
              </h4>
              <span className={`text-[10px] font-bold ${tier.color}`}>
                {tier.label}
              </span>
            </div>
          </div>

          <div className="text-2xl font-bold font-mono text-card-foreground">
            {harmonyScore}
            <span className="text-xs text-muted-foreground font-normal">
              /100
            </span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${Math.round(taskRatio * 35)}%` }}
              title="Tasks Contribution"
            />
            <div
              className="bg-[#0052FF] h-full transition-all duration-500"
              style={{ width: `${Math.round(habitRatio * 40)}%` }}
              title="Habits Contribution"
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${Math.round(focusRatio * 25)}%` }}
              title="Focus Contribution"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Tasks ({Math.round(taskRatio * 100)}%)</span>
            <span>Habits ({Math.round(habitRatio * 100)}%)</span>
            <span>Focus ({todayFocusMinutes}m)</span>
          </div>
        </div>

        <button
          onClick={() => onNavigate("pomodoro")}
          className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Boost Score with Deep Work</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Daily Micro-Quests */}
      <div className="p-5 rounded-2xl ios-card flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-card-foreground">
                Daily Micro-Quests
              </h4>
              <span className="text-[10px] text-muted-foreground">
                {completedQuestsCount}/3 Completed Today
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-amber-500 font-mono">
            +80 XP Max
          </span>
        </div>

        <div className="space-y-1.5">
          {quests.map((quest) => (
            <div
              key={quest.id}
              onClick={quest.action}
              className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition cursor-pointer ${
                quest.completed
                  ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground"
                  : "bg-muted/40 border-border hover:border-[#0052FF]/30 text-card-foreground"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${
                    quest.completed
                      ? "bg-emerald-500 text-white"
                      : "border border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {quest.completed ? "✓" : ""}
                </span>
                <span
                  className={`truncate text-[11px] ${quest.completed ? "line-through text-muted-foreground" : "font-medium"}`}
                >
                  {quest.title}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                <span className="text-muted-foreground">{quest.progress}</span>
                <span className="text-amber-500 font-bold">+{quest.xp}XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
