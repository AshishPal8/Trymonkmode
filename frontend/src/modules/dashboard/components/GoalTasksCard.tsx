"use client";

import React from "react";
import { Circle, Target } from "lucide-react";
import type { ActiveModuleId, GoalItem, TaskItem } from "@/lib/types";
import { getTodayDateString } from "@/lib/utils";
import { deadlineLabel, TONE_CLASS } from "@/modules/goals/goalHelpers";

const MAX_TASKS = 5;

interface GoalTasksCardProps {
  tasks: TaskItem[];
  goals: GoalItem[];
  onToggleTask: (id: string) => void;
  onNavigate: (module: ActiveModuleId) => void;
}

/** Open tasks linked to an active goal, most urgent first. */
export function goalTasksForToday(tasks: TaskItem[], goals: GoalItem[]) {
  const activeGoals = new Map(goals.filter((g) => g.status === "active").map((g) => [g.id, g]));
  return tasks
    .filter((t) => !t.completed && t.goalId && activeGoals.has(t.goalId))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, MAX_TASKS)
    .map((task) => ({ task, goal: activeGoals.get(task.goalId!)! }));
}

export function GoalTasksCard({ tasks, goals, onToggleTask, onNavigate }: GoalTasksCardProps) {
  const items = goalTasksForToday(tasks, goals);
  const today = getTodayDateString();

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-card-foreground">Moves a goal forward</h3>
          <p className="text-[11px] text-muted-foreground">Next tasks from your active goals</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("goals")}
          className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          All goals
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState hasGoals={goals.some((g) => g.status === "active")} onOpenGoals={() => onNavigate("goals")} />
      ) : (
        <ul className="space-y-1">
          {items.map(({ task, goal }) => {
            const due = task.dueDate <= today ? deadlineLabel(task.dueDate) : null;
            return (
              <li key={task.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-muted/50">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  aria-label={`Mark "${task.title}" done`}
                  className="cursor-pointer shrink-0 text-muted-foreground hover:text-emerald-500"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{task.title}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
                    {goal.title}
                  </p>
                </div>
                {due && <span className={`text-[10px] font-semibold shrink-0 ${TONE_CLASS[due.tone]}`}>{due.text}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyState({ hasGoals, onOpenGoals }: { hasGoals: boolean; onOpenGoals: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpenGoals}
      className="w-full py-5 text-center text-xs text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/80 hover:bg-muted/50 cursor-pointer"
    >
      <Target className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
      {hasGoals ? "Add tasks to your goals to see them here." : "Set a goal to see the tasks that move it forward."}
    </button>
  );
}
