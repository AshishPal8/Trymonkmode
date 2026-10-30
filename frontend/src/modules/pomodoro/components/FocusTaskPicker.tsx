"use client";

import React from "react";
import { useTaskStore } from "@/stores/taskStore";
import { useGoalsStore } from "@/stores/goalsStore";
import { useFocusStore } from "@/stores/focusStore";
import { CustomSelect } from "@/components/ui/select";
import { getTodayDateString } from "@/lib/utils";

/** "What are you working on?" — links the session to a task (and its goal). */
export function FocusTaskPicker() {
  const tasks = useTaskStore((s) => s.tasks);
  const goals = useGoalsStore((s) => s.goals);
  const { currentTaskId, setCurrentTask, sessionStartTime } = useFocusStore();
  const today = getTodayDateString();
  const goalTitle = (id?: string | null) => goals.find((g) => g.id === id)?.title;

  // Open tasks; overdue and today first.
  const open = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate <= today ? 0 : 1) - (b.dueDate <= today ? 0 : 1) || a.dueDate.localeCompare(b.dueDate))
    .slice(0, 50);

  const options = [
    { value: "none", label: "No specific task" },
    ...open.map((t) => {
      const goal = goalTitle(t.goalId);
      return { value: t.id, label: goal ? `${t.title} · 🎯 ${goal}` : t.title };
    }),
  ];

  return (
    <div className="w-full max-w-md text-left">
      <label className="block text-[11px] font-semibold text-muted-foreground mb-1 px-1">
        What are you working on?
      </label>
      <CustomSelect
        value={currentTaskId && open.some((t) => t.id === currentTaskId) ? currentTaskId : "none"}
        onChange={(val) => {
          const task = open.find((t) => t.id === val);
          setCurrentTask(task ? { id: task.id, title: task.title } : null);
        }}
        options={options}
      />
      {sessionStartTime && (
        <p className="text-[10px] text-muted-foreground mt-1 px-1">
          Changing the task now applies to this whole session.
        </p>
      )}
    </div>
  );
}
