"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { useApp } from "@/lib/store";
import type { TaskItem } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";

const byDoneThenDue = (a: TaskItem, b: TaskItem) =>
  Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate);

/** Tasks of a goal or milestone: open first, then by due date. Click to tick. */
export function GoalTaskList({ tasks }: { tasks: TaskItem[] }) {
  const { toggleTask } = useApp();
  if (tasks.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {[...tasks].sort(byDoneThenDue).map((t) => (
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

/** One-line "add a task" input that links the task to the goal (and milestone). */
export function AddGoalTaskInline({ goalId, milestoneId }: { goalId: string; milestoneId?: string }) {
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
