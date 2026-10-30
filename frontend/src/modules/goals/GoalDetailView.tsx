"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Minus,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import type { GoalItem, GoalStatus, TaskItem } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { GOAL_KINDS, deadlineLabel, formatMinutes, isMilestoneDone, progressDetail } from "./goalHelpers";

interface GoalDetailViewProps {
  goal: GoalItem;
  onBack: () => void;
  onEdit: (goal: GoalItem) => void;
}

const STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "done", label: "Done" },
];

// Shared height so inputs and buttons line up.
const CONTROL = "h-9 rounded-xl";

/** One goal, shown in place of the goal grid (no modal). */
export function GoalDetailView({ goal, onBack, onEdit }: GoalDetailViewProps) {
  const { tasks, updateGoal, deleteGoal, addMilestone, toggleGoalMilestone, deleteMilestone, setActiveModule } =
    useApp();
  const { confirm, confirmDialog } = useConfirm();
  const [newMilestone, setNewMilestone] = useState("");

  const goalTasks = tasks.filter((t) => t.goalId === goal.id);
  const looseTasks = goalTasks.filter(
    (t) => !t.milestoneId || !goal.milestones.some((m) => m.id === t.milestoneId),
  );
  const deadline = deadlineLabel(goal.deadline);
  const kind = GOAL_KINDS.find((k) => k.value === goal.kind);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestone.trim()) return;
    await addMilestone(goal.id, newMilestone.trim());
    setNewMilestone("");
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: `Delete "${goal.title}"?`,
      description: "The goal and its milestones will be removed. Your tasks are kept, just unlinked.",
      confirmLabel: "Delete goal",
      destructive: true,
    });
    if (!ok) return;
    await deleteGoal(goal.id);
    onBack();
  };

  const handleDeleteMilestone = async (milestoneId: string, title: string) => {
    const ok = await confirm({
      title: `Delete milestone "${title}"?`,
      description: "Its tasks stay in this goal.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMilestone(goal.id, milestoneId);
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All goals
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => onEdit(goal)} className={`${CONTROL} px-3 text-xs gap-1.5`}>
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className={`${CONTROL} px-3 text-xs gap-1.5 text-rose-500 hover:text-rose-500 hover:bg-rose-500/10`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Header + progress */}
      <div className="ios-card rounded-3xl p-5 sm:p-6 space-y-4 border border-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
              <span>
                {kind?.emoji} {kind?.label} · {goal.category}
              </span>
              {deadline && (
                <span
                  className={`flex items-center gap-1 ${
                    deadline.tone === "danger" ? "text-rose-500" : deadline.tone === "warn" ? "text-amber-500" : ""
                  }`}
                >
                  · <Calendar className="w-3 h-3" /> {deadline.text}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{goal.title}</h2>
            {goal.why && <p className="text-xs text-muted-foreground italic">“{goal.why}”</p>}
          </div>

          <div className="flex p-1 rounded-xl bg-muted/60 border border-border shrink-0">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => updateGoal(goal.id, { status: s.value })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  goal.status === s.value ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tracking-tight">{goal.progress}%</span>
              <span className="text-xs text-muted-foreground">{progressDetail(goal)}</span>
            </div>
            {goal.focusMinutes > 0 && goal.kind !== "focus" && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Timer className="w-3 h-3" /> {formatMinutes(goal.focusMinutes)} focused
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
            />
          </div>
        </div>

        {goal.kind === "target" && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold text-foreground">Update progress</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-label="Decrease"
                onClick={() => updateGoal(goal.id, { currentProgress: Math.max(0, goal.currentProgress - 1) })}
                className={`${CONTROL} w-9 p-0`}
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="text-sm font-bold font-mono min-w-20 text-center">
                {goal.currentProgress} / {goal.targetProgress}
                {goal.unit ? ` ${goal.unit}` : ""}
              </span>
              <Button
                type="button"
                variant="outline"
                aria-label="Increase"
                onClick={() => updateGoal(goal.id, { currentProgress: goal.currentProgress + 1 })}
                className={`${CONTROL} w-9 p-0`}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {goal.kind === "focus" && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setActiveModule("pomodoro")}
            className={`${CONTROL} px-3 text-xs gap-1.5`}
          >
            <Timer className="w-3.5 h-3.5" /> Start a focus session (every session counts)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Milestones with their tasks */}
        <div className="lg:col-span-2 ios-card rounded-3xl p-5 border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Milestones
            {goal.milestones.length > 0 &&
              ` · ${goal.milestones.filter(isMilestoneDone).length}/${goal.milestones.length}`}
          </h3>

          {goal.milestones.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Split the goal into a few steps, e.g. &quot;Arrays&quot;, &quot;Trees&quot;, &quot;DP&quot;.
            </p>
          )}

          {goal.milestones.map((m) => {
            const done = isMilestoneDone(m);
            return (
              <div key={m.id} className="rounded-2xl border border-border bg-muted/20 p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleGoalMilestone(goal.id, m.id)}
                    aria-label={m.completed ? "Mark milestone not done" : "Mark milestone done"}
                    className="cursor-pointer shrink-0"
                  >
                    {done ? (
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                    ) : (
                      <Circle className="w-4.5 h-4.5 text-muted-foreground" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                  >
                    {m.title}
                  </span>
                  {m.taskTotal > 0 && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {m.taskDone}/{m.taskTotal}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteMilestone(m.id, m.title)}
                    aria-label="Delete milestone"
                    className="p-1 rounded-md text-muted-foreground/60 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <TaskList tasks={goalTasks.filter((t) => t.milestoneId === m.id)} />
                <AddTaskInline goalId={goal.id} milestoneId={m.id} />
              </div>
            );
          })}

          <form onSubmit={handleAddMilestone} className="flex items-center gap-2">
            <Input
              placeholder="Add a milestone, e.g. Trees & graphs"
              value={newMilestone}
              maxLength={255}
              onChange={(e) => setNewMilestone(e.target.value)}
              className={`${CONTROL} py-0`}
            />
            <Button type="submit" disabled={!newMilestone.trim()} className={`${CONTROL} px-4 text-xs shrink-0`}>
              Add
            </Button>
          </form>
        </div>

        {/* Tasks without a milestone */}
        <div className="ios-card rounded-3xl p-5 border border-border space-y-2 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {goal.milestones.length > 0 ? "Other tasks" : "Tasks"}
          </h3>
          {looseTasks.length === 0 && (
            <p className="text-xs text-muted-foreground">Tasks for this goal that don&apos;t belong to a milestone.</p>
          )}
          <TaskList tasks={looseTasks} />
          <AddTaskInline goalId={goal.id} />
        </div>
      </div>

      {confirmDialog}
    </div>
  );
}

function TaskList({ tasks }: { tasks: TaskItem[] }) {
  const { toggleTask } = useApp();
  if (tasks.length === 0) return null;
  const sorted = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate),
  );
  return (
    <div className="space-y-0.5">
      {sorted.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => toggleTask(t.id)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 text-left cursor-pointer"
        >
          {t.completed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          <span className={`flex-1 text-xs ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {t.title}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">{t.dueDate.slice(5)}</span>
        </button>
      ))}
    </div>
  );
}

function AddTaskInline({ goalId, milestoneId }: { goalId: string; milestoneId?: string }) {
  const { addTask } = useApp();
  const [title, setTitle] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      priority: "P2",
      dueDate: getTodayDateString(),
      category: "Work",
      tags: [],
      subtasks: [],
      completed: false,
      quadrant: "notUrgent-important",
      goalId,
      milestoneId: milestoneId || null,
    });
    setTitle("");
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 px-2">
      <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        placeholder="Add a task and press Enter"
        className="flex-1 bg-transparent text-xs py-1.5 placeholder:text-muted-foreground/70 focus:outline-none"
      />
    </form>
  );
}
