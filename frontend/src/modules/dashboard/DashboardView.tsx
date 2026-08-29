'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { getTodayDateString } from '@/lib/utils';
import { ModuleContainer } from '@/components/layout/ModuleContainer';
import { RotateCcw, Sparkles } from 'lucide-react';

// Modular Dashboard Sub-Components
import { DashboardHeader } from './components/DashboardHeader';
import { HeroFocusTask } from './components/HeroFocusTask';
import { CategoryHubsGrid } from './components/CategoryHubsGrid';
import { AnalyticsMetricsBar } from './components/AnalyticsMetricsBar';
import { PeakPerformanceCard } from './components/PeakPerformanceCard';
import { WeeklyVelocityChart } from './components/WeeklyVelocityChart';
import { HabitsAndCalendarWidget } from './components/HabitsAndCalendarWidget';

export function DashboardView() {
  const {
    user,
    tasks,
    toggleTask,
    habits,
    toggleHabitForDate,
    calendarEvents,
    todayFocusMinutes,
    analyticsData,
    setActiveModule,
    openQuickAdd
  } = useApp();

  const todayStr = getTodayDateString();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const todayPendingTasks = tasks.filter(t => !t.completed && (t.dueDate === todayStr || t.dueDate <= todayStr));
  const completedTasks = tasks.filter(t => t.completed);
  const activeFocusTask = todayPendingTasks[0] || tasks[0];

  const [showToast, setShowToast] = useState(false);
  const [lastToggledId, setLastToggledId] = useState<string | null>(null);

  const handleMarkDone = (id: string) => {
    toggleTask(id);
    setLastToggledId(id);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleUndo = () => {
    if (lastToggledId) {
      toggleTask(lastToggledId);
      setShowToast(false);
    }
  };

  // Purely Backend-Driven Analytics (Zero Client-Side Loops/Calculations)
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const adherenceRate = analyticsData?.weeklyAdherenceRate ?? 0;
  const habitRate = analyticsData?.habitCompletionRate ?? 0;
  const flowStateTier = analyticsData?.consistencyScorecard?.flowStateTier ?? (user.streak >= 3 ? 'Top 15%' : 'Building Flow');
  const taskCompletionRate = analyticsData?.taskCompletionRate ?? 0;
  const totalFocusHours = String(analyticsData?.totalFocusHours ?? 0);

  return (
    <ModuleContainer>
      {/* 1. Header with Overview & Analytics Tab Switcher */}
      <DashboardHeader
        pendingTasksCount={todayPendingTasks.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStartFocus={() => setActiveModule('pomodoro')}
      />

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* Key Metrics Strip */}
          <AnalyticsMetricsBar
            user={user}
            totalFocusHours={totalFocusHours}
            taskCompletionRate={taskCompletionRate}
          />

          {/* Hero Featured Task Card */}
          {activeFocusTask && (
            <HeroFocusTask
              task={activeFocusTask}
              onMarkDone={handleMarkDone}
              onEdit={openQuickAdd}
            />
          )}

          {/* Categories & Hubs */}
          <CategoryHubsGrid
            pendingTasksCount={todayPendingTasks.length}
            completedTasksCount={completedTasks.length}
            todayFocusMinutes={todayFocusMinutes}
            onNavigate={setActiveModule}
          />

          {/* Habits & Calendar Quick Widgets */}
          <HabitsAndCalendarWidget
            habits={habits}
            calendarEvents={calendarEvents}
            todayStr={todayStr}
            onToggleHabit={toggleHabitForDate}
            onNavigate={setActiveModule}
          />
        </div>
      )}

      {/* DEEP ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          {/* Peak Performance Highlight Banner */}
          <PeakPerformanceCard />

          {/* Core Telemetry Metrics Bar */}
          <AnalyticsMetricsBar
            user={user}
            totalFocusHours={totalFocusHours}
            taskCompletionRate={taskCompletionRate}
          />

          {/* 7-Day Velocity Chart */}
          <WeeklyVelocityChart />

          {/* Category Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl ios-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-card-foreground">Focus Session Distribution</h3>
                <span className="text-[11px] text-muted-foreground font-medium">By Category & Tags</span>
              </div>

              {categoryDistribution.length > 0 ? (
                <div className="space-y-2 pt-1">
                  {categoryDistribution.map(item => (
                    <div key={item.tag} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-card-foreground">{item.tag}</span>
                        <span className="text-muted-foreground font-mono">{item.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/80">
                  <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-muted-foreground opacity-50" />
                  <p>No focus categories recorded yet.</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">Tag tasks or complete focus sessions to see your distribution.</p>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl ios-card space-y-3 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-card-foreground">Consistency Scorecard</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time cognitive stamina rating across active weeks
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-2">
                <div className="p-3 rounded-2xl bg-muted/60 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Adherence</span>
                  <div className="text-xl font-bold font-mono text-emerald-500 mt-0.5">{adherenceRate}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Habit Rate</span>
                  <div className="text-xl font-bold font-mono text-[#0052FF] mt-0.5">{habitRate}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Flow State</span>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">{flowStateTier}</div>
                </div>
              </div>

              <button
                onClick={() => setActiveModule('pomodoro')}
                className="w-full py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold transition cursor-pointer text-center shadow-sm"
              >
                Launch Deep Work Session (+50 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Undo Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 animate-bounce">
          <div className="ios-card bg-card/95 border border-border px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
            <span className="text-xs font-semibold text-foreground">Task marked as completed!</span>
            <button
              onClick={handleUndo}
              className="text-xs font-bold text-[#0052FF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>
        </div>
      )}
    </ModuleContainer>
  );
}
