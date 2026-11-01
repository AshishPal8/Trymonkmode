"use client";

import React, { useRef } from "react";
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Circle, GripVertical, Trash2, X } from "lucide-react";
import type { GoalMilestone, TaskItem } from "@/lib/types";
import { formatDatePretty } from "@/lib/utils";
import { deadlineLabel, isMilestoneDone, TONE_CLASS } from "./goalHelpers";
import { AddGoalTaskInline, GoalTaskList } from "./GoalTaskList";

interface MilestoneCardProps {
  goalId: string;
  milestone: GoalMilestone;
  tasks: TaskItem[];
  isFirst: boolean;
  isLast: boolean;
  isDragOver: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onDueDateChange: (date: string | null) => void;
  onMove: (direction: -1 | 1) => void;
  /** Native drag & drop (desktop). The arrows do the same on touch screens. */
  dragProps: React.HTMLAttributes<HTMLDivElement>;
}

const iconButton = "p-1 rounded-md text-muted-foreground/60 hover:text-foreground disabled:opacity-30 cursor-pointer";

export function MilestoneCard({
  goalId,
  milestone: m,
  tasks,
  isFirst,
  isLast,
  isDragOver,
  onToggle,
  onDelete,
  onDueDateChange,
  onMove,
  dragProps,
}: MilestoneCardProps) {
  const done = isMilestoneDone(m);

  return (
    <div
      {...dragProps}
      className={`rounded-2xl border bg-muted/20 p-3 space-y-1.5 transition ${
        isDragOver ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 cursor-grab shrink-0 hidden sm:block" />
        <button
          type="button"
          onClick={onToggle}
          aria-label={m.completed ? "Mark milestone not done" : "Mark milestone done"}
          className="cursor-pointer shrink-0"
        >
          {done ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
          ) : (
            <Circle className="w-4.5 h-4.5 text-muted-foreground" />
          )}
        </button>
        <span className={`flex-1 text-sm font-semibold ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {m.title}
        </span>
        {m.taskTotal > 0 && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {m.taskDone}/{m.taskTotal}
          </span>
        )}
        <button type="button" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move up" className={iconButton}>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={isLast} aria-label="Move down" className={iconButton}>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={onDelete} aria-label="Delete milestone" className={`${iconButton} hover:text-rose-500`}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <MilestoneDueDate dueDate={m.dueDate || null} done={done} onChange={onDueDateChange} />

      <GoalTaskList tasks={tasks} />
      <AddGoalTaskInline goalId={goalId} milestoneId={m.id} />
    </div>
  );
}

/** "Add due date" link, or "Nov 12 · 5 days left". Opens the browser's date picker. */
function MilestoneDueDate({
  dueDate,
  done,
  onChange,
}: {
  dueDate: string | null;
  done: boolean;
  onChange: (date: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const due = done ? null : deadlineLabel(dueDate);
  const text = dueDate ? `${formatDatePretty(dueDate)}${due ? ` · ${due.text}` : ""}` : "Add due date";

  return (
    <div className="flex items-center gap-1 pl-7">
      <button
        type="button"
        onClick={() => inputRef.current?.showPicker()}
        className={`relative flex items-center gap-1.5 text-[11px] cursor-pointer hover:underline ${
          due ? TONE_CLASS[due.tone] : "text-muted-foreground"
        }`}
      >
        <Calendar className="w-3 h-3" />
        {text}
        <input
          ref={inputRef}
          type="date"
          tabIndex={-1}
          aria-hidden
          value={dueDate || ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      </button>
      {dueDate && (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove due date"
          className="p-0.5 rounded text-muted-foreground/60 hover:text-foreground cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
