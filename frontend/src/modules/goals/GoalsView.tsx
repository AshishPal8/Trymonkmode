"use client";

import React, { useState } from "react";
import { ArrowRight, Calendar, Plus, Target, Timer } from "lucide-react";
import { useApp } from "@/lib/store";
import type { GoalItem, GoalStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { GoalFormModal } from "./GoalFormModal";
import { GoalDetailView } from "./GoalDetailView";
import { GOAL_KINDS, deadlineLabel, formatMinutes, progressDetail } from "./goalHelpers";

const FILTERS: { value: GoalStatus | "all"; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

export function GoalsView() {
  const { goals, isLoadingGoals } = useApp();
  const [filter, setFilter] = useState<GoalStatus | "all">("active");
  const [formGoal, setFormGoal] = useState<GoalItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const visible = goals.filter((g) => filter === "all" || g.status === filter);
  const detailGoal = goals.find((g) => g.id === detailId) || null;
  const counts = {
    active: goals.filter((g) => g.status === "active").length,
    paused: goals.filter((g) => g.status === "paused").length,
    done: goals.filter((g) => g.status === "done").length,
    all: goals.length,
  };

  const openCreate = () => {
    setFormGoal(null);
    setIsFormOpen(true);
  };

  const formModal = (
    <GoalFormModal
      isOpen={isFormOpen}
      goal={formGoal}
      onClose={() => setIsFormOpen(false)}
      onSaved={(g) => {
        if (!formGoal && g) setDetailId(g.id); // open a new goal right away
      }}
    />
  );

  // A goal is open: show its page instead of the grid.
  if (detailGoal) {
    return (
      <ModuleContainer>
        <GoalDetailView
          goal={detailGoal}
          onBack={() => setDetailId(null)}
          onEdit={(g) => {
            setFormGoal(g);
            setIsFormOpen(true);
          }}
        />
        {formModal}
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Goals & Projects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Break big goals into milestones and tasks, and see your daily work add up.
          </p>
        </div>
        <Button onClick={openCreate} className="text-xs font-semibold rounded-xl px-4 py-2 gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          New goal
        </Button>
      </div>

      <div className="flex items-center gap-1.5 p-1.5 ios-card rounded-2xl w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              filter === f.value ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            <span className="text-[10px] opacity-70">{counts[f.value]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {isLoadingGoals ? "Loading your goals…" : filter === "active" || filter === "all" ? "No goals yet" : `No ${filter} goals`}
            </h3>
            {!isLoadingGoals && (filter === "active" || filter === "all") && (
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Start with one: &quot;Learn DSA&quot;, &quot;Launch my startup&quot; or &quot;Read 24 books&quot;.
              </p>
            )}
          </div>
          {!isLoadingGoals && (filter === "active" || filter === "all") && (
            <Button onClick={openCreate} className="text-xs font-semibold rounded-xl px-4 py-2 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Create your first goal
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {visible.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onOpen={() => setDetailId(goal.id)} />
          ))}
        </div>
      )}

      {formModal}
    </ModuleContainer>
  );
}

function GoalCard({ goal, onOpen }: { goal: GoalItem; onOpen: () => void }) {
  const kind = GOAL_KINDS.find((k) => k.value === goal.kind);
  const deadline = deadlineLabel(goal.deadline);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`text-left ios-card rounded-3xl p-5 space-y-3.5 border border-border hover:border-primary/40 transition cursor-pointer flex flex-col ${
        goal.status !== "active" ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          {kind?.emoji} {goal.category}
        </span>
        {goal.status === "done" ? (
          <span className="text-[11px] font-bold text-emerald-500">Done 🏆</span>
        ) : goal.status === "paused" ? (
          <span className="text-[11px] font-semibold text-muted-foreground">Paused</span>
        ) : (
          deadline && (
            <span
              className={`text-[11px] font-semibold flex items-center gap-1 ${
                deadline.tone === "danger" ? "text-rose-500" : deadline.tone === "warn" ? "text-amber-500" : "text-muted-foreground"
              }`}
            >
              <Calendar className="w-3 h-3" />
              {deadline.text}
            </span>
          )
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-card-foreground leading-snug">{goal.title}</h3>
        {goal.why && <p className="text-xs text-muted-foreground line-clamp-2 italic">“{goal.why}”</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{progressDetail(goal)}</span>
          <span className="font-mono font-bold text-card-foreground">{goal.progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
          />
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        {goal.nextTask ? (
          <span className="flex items-center gap-1 min-w-0">
            <ArrowRight className="w-3 h-3 shrink-0 text-primary" />
            <span className="truncate">Next: {goal.nextTask.title}</span>
          </span>
        ) : (
          <span>{goal.kind === "project" ? "No open tasks" : ""}</span>
        )}
        {goal.focusMinutes > 0 && goal.kind !== "focus" && (
          <span className="flex items-center gap-1 shrink-0">
            <Timer className="w-3 h-3" />
            {formatMinutes(goal.focusMinutes)}
          </span>
        )}
      </div>
    </button>
  );
}
