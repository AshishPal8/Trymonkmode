'use client';

import React from 'react';
import { TaskItem } from '@/lib/types';
import { MapPin, Clock, Edit2, ChevronRight, Check, Sparkles, Plus } from 'lucide-react';

interface HeroFocusTaskProps {
  task?: TaskItem;
  onMarkDone: (id: string) => void;
  onEdit: () => void;
}

export function HeroFocusTask({ task, onMarkDone, onEdit }: HeroFocusTaskProps) {
  if (!task) {
    return (
      <div className="ios-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden transition shadow-sm border border-border">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0052FF] flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-card-foreground">All Clear & Ready for Flow</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You have no pending tasks scheduled. Plan your day and start building momentum.
          </p>
        </div>
        <button
          onClick={onEdit}
          className="px-5 py-2.5 rounded-full bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Plan First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="ios-card rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-3.5 sm:space-y-4 relative overflow-hidden transition shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-2xl">
            ⚡
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-card-foreground flex items-center gap-2">
              <span>{task.title}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0052FF] font-mono font-bold">
                {task.priority}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {task.description || 'Priority task for today'}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{task.dueTime || 'Today'}</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="p-2.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* Action Row: Slide / Click Mark Done Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => onMarkDone(task.id)}
          className="flex-1 py-3 px-4 rounded-full bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition transform active:scale-98 cursor-pointer flex items-center justify-between"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </div>
          <span className="flex-1 text-center">Click to mark done</span>
          <Check className="w-4 h-4 opacity-0" />
        </button>
      </div>
    </div>
  );
}