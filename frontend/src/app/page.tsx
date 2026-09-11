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

import {
  setupForegroundNotificationListener,
  requestAndRegisterFCMToken,
} from "@/lib/firebase";
import { soundFX } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Bell, X as CloseIcon } from "lucide-react";

function MainAppShell() {
  const { isAuthenticated, isCheckingAuth, activeModule, user } = useApp();
  const [showNotificationBanner, setShowNotificationBanner] =
    React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) return;

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default" &&
      user.notificationsEnabled !== false
    ) {
      setShowNotificationBanner(true);
    }
  }, [isAuthenticated, user.notificationsEnabled]);

  const handleEnableNotifications = async () => {
    try {
      const token = await requestAndRegisterFCMToken();
      if (token) {
        toast.success("Push notifications enabled & registered!");
      }
    } catch {
      toast.error("Could not register notifications.");
    } finally {
      setShowNotificationBanner(false);
    }
  };

  React.useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = setupForegroundNotificationListener((payload) => {
      if (user.notificationsEnabled === false) return;

      const title =
        payload.notification?.title ||
        payload.data?.title ||
        "⚡ Try Monk Mode";
      const body =
        payload.notification?.body ||
        payload.data?.body ||
        "New notification alert";

      if (user.soundEffects !== false) {
        soundFX.playCheckSound();
      }
      toast.info(`${title} — ${body}`);

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready
            .then((reg) => {
              reg.showNotification(title, {
                body,
                icon: "/icon.png",
                badge: "/icon.png",
                data: payload.data,
                tag: "trymonkmode-" + Date.now(),
                requireInteraction: true,
              });
            })
            .catch(() => {
              try {
                new Notification(title, { body, icon: "/icon.png" });
              } catch {}
            });
        } else {
          try {
            new Notification(title, { body, icon: "/icon.png" });
          } catch {}
        }
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isAuthenticated, user.notificationsEnabled, user.soundEffects]);

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

        {/* System Push Notification Permission Request Banner */}
        {showNotificationBanner && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-3 rounded-2xl bg-gradient-to-r from-[#0052FF]/10 via-[#0052FF]/5 to-transparent border border-[#0052FF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#0052FF] text-white shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Enable Push Notifications
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Get real-time reminders for your scheduled tasks, daily
                  habits, and focus sessions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowNotificationBanner(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="px-3.5 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0047E0] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Allow Notifications</span>
              </button>
            </div>
          </div>
        )}

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
