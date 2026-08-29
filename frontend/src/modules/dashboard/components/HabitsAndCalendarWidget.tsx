'use client';

import React from 'react';
import { Zap, CheckCircle2, Flame, Calendar as CalendarIcon } from 'lucide-react';
import { HabitItem, CalendarEvent, ActiveModuleId } from '@/lib/types';

interface HabitsAndCalendarWidgetProps {
  habits: HabitItem[];
  calendarEvents: CalendarEvent[];
  todayStr: string;
  onToggleHabit: (id: string, dateStr: string) => void;
  onNavigate: (module: ActiveModuleId) => void;
}

export function HabitsAndCalendarWidget({
  habits,
  calendarEvents,
  todayStr,
  onToggleHabit,
  onNavigate
}: HabitsAndCalendarWidgetProps) {
  const todayHabits = habits.filter(h => h.targetDays.includes(new Date().getDay()));
  const completedHabits = todayHabits.filter(h => h.completedDates.includes(todayStr));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
      {/* Habits Checklist */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-card-foreground uppercase">Daily Habits</h3>
          </div>
          <span className="text-xs font-bold text-amber-500 font-mono">
            {completedHabits.length}/{todayHabits.length}
          </span>
        </div>

        <div className="space-y-2">
          {habits.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">No habits added yet</p>
          ) : (
            habits.slice(0, 3).map(h => {
              const isDone = h.completedDates.includes(todayStr);
              return (
                <div
                  key={h.id}
                  onClick={() => onToggleHabit(h.id, todayStr)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-card-foreground'
                      : 'bg-muted/60 border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-[#22C55E] text-white'
                          : 'border-2 border-muted-foreground/60'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <span className={`text-xs font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {h.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>{h.streak}d</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Schedule Calendar Widget */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl ios-card space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#0052FF]" />
            <h3 className="text-xs font-bold text-card-foreground uppercase">Today&apos;s Schedule</h3>
          </div>
          <button onClick={() => onNavigate('calendar')} className="text-xs text-[#0052FF] font-medium hover:underline cursor-pointer">
            View All
          </button>
        </div>

        <div className="space-y-2">
          {calendarEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">No events scheduled today</p>
          ) : (
            calendarEvents.slice(0, 3).map(e => (
              <div key={e.id} className="p-2.5 rounded-xl bg-muted/60 border border-border flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{e.title}</h4>
                  <span className="text-[10px] text-muted-foreground font-mono">{e.startTime} - {e.endTime}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold capitalize">
                  {e.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}