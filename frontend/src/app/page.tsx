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

import { requestAndRegisterFCMToken } from "@/lib/firebase";
import { notificationsApi } from "@/lib/api";
import { INBOX_REFRESH_EVENT } from "@/components/navigation/NotificationBell";
import type { ActiveModuleId } from "@/lib/types";
import { soundFX } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { Bell, X as CloseIcon } from "lucide-react";

const NOTIFICATION_MODULES = new Set<string>(["tasks", "calendar", "habits"]);

function MainAppShell() {
  const {
    isAuthenticated,
    isCheckingAuth,
    activeModule,
    setActiveModule,
    loadModuleData,
    user,
  } = useApp();

  // Done / Snooze tapped on a notification.
  const runNotificationAction = React.useCallback(
    async (action: string, kind: string, refId: number) => {
      if ((action !== "done" && action !== "snooze") || (kind !== "task" && kind !== "habit") || !refId) {
        return;
      }
      try {
        const res = await notificationsApi.action({ action, kind, refId });
        toast.success(res?.data?.message || "Done.");
        if (action === "done") {
          loadModuleData(kind === "task" ? "tasks" : "habits", true);
        }
      } catch {
        toast.error("Couldn't update that. Please try again in the app.");
      }
    },
    [loadModuleData],
  );
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

  // Open the module from a notification link (/?module=tasks), then clean the URL.
  React.useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const moduleId = params.get("module");
    const notifAction = params.get("notifAction");
    if (!moduleId && !notifAction) return;

    if (moduleId && NOTIFICATION_MODULES.has(moduleId)) {
      setActiveModule(moduleId as ActiveModuleId);
    }
    if (notifAction) {
      runNotificationAction(notifAction, params.get("kind") || "", Number(params.get("refId")));
    }
    for (const key of ["module", "notifAction", "kind", "refId"]) params.delete(key);
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
  }, [isAuthenticated, setActiveModule, runNotificationAction]);

  // Messages from the service worker: a push that arrived while the app was
  // on screen (show a toast, no OS notification) or a notification click.
  React.useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "monk-open-module" && NOTIFICATION_MODULES.has(msg.moduleId)) {
        setActiveModule(msg.moduleId as ActiveModuleId);
        return;
      }

      if (msg.type === "monk-action") {
        runNotificationAction(msg.action, msg.kind, Number(msg.refId));
        return;
      }

      if (msg.type === "monk-push") {
        window.dispatchEvent(new Event(INBOX_REFRESH_EVENT));
        if (user.notificationsEnabled === false) return;
        if (user.soundEffects !== false) soundFX.playCheckSound();
        toast.info(`${msg.title} — ${msg.body}`);
      }
    };

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [isAuthenticated, user.notificationsEnabled, user.soundEffects, setActiveModule, runNotificationAction]);

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
