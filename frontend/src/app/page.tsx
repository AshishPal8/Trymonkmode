"use client";

import React from "react";
import { AppProvider, useApp } from "@/lib/store";
import { LandingPage } from "@/components/landing/LandingPage";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { TopHeader } from "@/components/navigation/TopHeader";
import { MobileTabBar } from "@/components/navigation/MobileTabBar";
import { QuickAddModal } from "@/components/common/QuickAddModal";
import { UserProfileModal } from "@/components/profile/UserProfileModal";

// Modules
import { DashboardView } from "@/modules/dashboard/DashboardView";
import { TasksView } from "@/modules/tasks/TasksView";
import { CalendarView } from "@/modules/calendar/CalendarView";
import { EisenhowerView } from "@/modules/eisenhower/EisenhowerView";
import { GoalsView } from "@/modules/goals/GoalsView";
import { PomodoroView } from "@/modules/pomodoro/PomodoroView";
import { HabitsView } from "@/modules/habits/HabitsView";
import { JournalView } from "@/modules/journal/JournalView";
import { NotesView } from "@/modules/notes/NotesView";
import { BookmarksView } from "@/modules/bookmarks/BookmarksView";
import { FinanceView } from "@/modules/finance/FinanceView";
import { AnalyticsView } from "@/modules/analytics/AnalyticsView";
import { AdminView } from "@/modules/admin/AdminView";

function MainAppShell() {
  const { isAuthenticated, isCheckingAuth, activeModule } = useApp();

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] select-none">
        <div className="flex flex-col items-center gap-3 animate-in fade-in-50 duration-300">
          <div className="w-9 h-9 border-2 border-[#0052FF]/20 border-t-[#0052FF] rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 tracking-wide animate-pulse">
            Loading Monk Mode...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardView />;
      case "tasks":
        return <TasksView />;
      case "calendar":
        return <CalendarView />;
      case "matrix":
        return <EisenhowerView />;
      case "goals":
        return <GoalsView />;
      case "pomodoro":
      case "stopwatch":
        return <PomodoroView />;
      case "habits":
        return <HabitsView />;
      case "journal":
        return <JournalView />;
      case "notes":
        return <NotesView />;
      case "bookmarks":
        return <BookmarksView />;
      case "finance":
        return <FinanceView />;
      case "analytics":
        return <AnalyticsView />;
      case "admin":
        return <AdminView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] transition-colors">
      {/* 1. Desktop Sidebar with 3-Dot Menus & Top Favorites */}
      <DesktopSidebar />

      {/* 2. Main Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-y-auto">
        {/* Top Sticky Header */}
        <TopHeader />

        {/* Dynamic Module Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-0">
          {renderActiveModule()}
        </main>
      </div>

      {/* 3. Mobile Bottom Floating Tab Bar */}
      <MobileTabBar />

      {/* 4. Global Quick Add Modal */}
      <QuickAddModal />

      {/* 5. User Profile & Preferences Settings Modal */}
      <UserProfileModal />
    </div>
  );
}

export default function RootPage() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
