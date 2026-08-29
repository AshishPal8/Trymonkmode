'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import {
  Plus,
  Flame,
  Calendar,
  Zap,
  Trash2
} from 'lucide-react';
import { TaskItem } from '@/lib/types';
import { getTodayDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModuleContainer } from '@/components/layout/ModuleContainer';

export function EisenhowerView() {
  const { tasks, toggleTask, updateTaskQuadrant, addTask } = useApp();

  const [activeModalQuadrant, setActiveModalQuadrant] = useState<TaskItem['quadrant'] | null>(null);
  const [quickTitle, setQuickTitle] = useState('');

  const quadrants: {
    id: TaskItem['quadrant'];
    title: string;
    action: string;
    icon: React.ElementType;
    badge: string;
    tagColor: string;
  }[] = [
    {
      id: 'urgent-important',
      title: 'Urgent & Important',
      action: '🔥 DO NOW',
      icon: Flame,
      badge: 'Crises & Deadlines',
      tagColor: 'text-[#FF5C39] bg-[#FF5C39]/10 border-[#FF5C39]/20'
    },
    {
      id: 'notUrgent-important',
      title: 'Not Urgent & Important',
      action: '🎯 SCHEDULE',
      icon: Calendar,
      badge: 'Growth & Strategy',
      tagColor: 'text-[#0052FF] bg-[#0052FF]/10 border-[#0052FF]/20'
    },
    {
      id: 'urgent-notImportant',
      title: 'Urgent & Not Important',
      action: '⚡ DELEGATE',
      icon: Zap,
      badge: 'Interruptions & Chores',
      tagColor: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20'
    },
    {
      id: 'notUrgent-notImportant',
      title: 'Not Urgent & Not Important',
      action: '🗑️ ELIMINATE',
      icon: Trash2,
      badge: 'Distractions & Waste',
      tagColor: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    }
  ];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !activeModalQuadrant) return;

    addTask({
      title: quickTitle.trim(),
      priority: activeModalQuadrant === 'urgent-important' ? 'P1' : 'P2',
      dueDate: getTodayDateString(),
      category: 'Work',
      tags: ['#Matrix'],
      subtasks: [],
      completed: false,
      quadrant: activeModalQuadrant
    });

    setQuickTitle('');
    setActiveModalQuadrant(null);
  };

  return (
    <ModuleContainer>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Priority Matrix
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Categorize tasks by Urgency and Importance to eliminate cognitive overload
        </p>
      </div>

      {/* 4-Quadrant 2x2 Grid (All clean OLED black variations in dark mode, pure white in light mode!) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map(q => {
          const Icon = q.icon;
          const quadrantTasks = tasks.filter(t => t.quadrant === q.id && !t.completed);

          return (
            <div
              key={q.id}
              className="p-6 rounded-3xl ios-card flex flex-col justify-between space-y-4 shadow-sm transition"
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${q.tagColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-card-foreground">
                      {q.action}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{q.title}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModalQuadrant(q.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Task Cards in this Quadrant */}
              <div className="space-y-2 min-h-[140px]">
                {quadrantTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-center text-xs text-muted-foreground">
                    No active tasks in this quadrant
                  </div>
                ) : (
                  quadrantTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-muted/60 border border-border flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="w-4 h-4 rounded-md border border-border hover:border-[#0052FF] flex items-center justify-center shrink-0 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-card-foreground truncate">
                          {task.title}
                        </span>
                      </div>

                      {/* Move Dropdown */}
                      <select
                        value={task.quadrant}
                        onChange={e => updateTaskQuadrant(task.id, e.target.value as TaskItem['quadrant'])}
                        className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-card text-card-foreground border border-border cursor-pointer focus:outline-none"
                      >
                        <option value="urgent-important">Do Now</option>
                        <option value="notUrgent-important">Schedule</option>
                        <option value="urgent-notImportant">Delegate</option>
                        <option value="notUrgent-notImportant">Eliminate</option>
                      </select>
                    </div>
                  ))
                )}
              </div>

              {/* Footer count */}
              <div className="text-[11px] font-semibold text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                <span>{q.badge}</span>
                <span>{quadrantTasks.length} tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add into Quadrant Modal */}
      {activeModalQuadrant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="ios-card rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-card-foreground">
              Add Task to {quadrants.find(q => q.id === activeModalQuadrant)?.action}
            </h3>

            <form onSubmit={handleQuickAdd} className="space-y-3">
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g., Review distributed caching PR"
                value={quickTitle}
                onChange={e => setQuickTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalQuadrant(null)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  className="px-5 py-2 bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Add to Matrix
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
