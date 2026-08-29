"use client";

import React, { useEffect } from "react";
import { ToastContainer } from "@/components/ui/toast";
import { pagesApi } from "@/lib/api";
import { getTodayDateString, triggerCelebrationConfetti } from "@/lib/utils";
import { DailyQuest } from "@/lib/types";

export * from "./userStore";
export * from "./taskStore";
export * from "./habitStore";
export * from "./journalStore";
export * from "./notesStore";
export * from "./goalsStore";
export * from "./calendarStore";
export * from "./financeStore";
export * from "./bookmarksStore";
export * from "./focusStore";
export * from "./analyticsStore";
export * from "./uiStore";

import { useUserStore } from "./userStore";
import { useTaskStore } from "./taskStore";
import { useHabitStore } from "./habitStore";
import { useJournalStore } from "./journalStore";
import { useNotesStore } from "./notesStore";
import { useGoalsStore } from "./goalsStore";
import { useCalendarStore } from "./calendarStore";
import { useFinanceStore } from "./financeStore";
import { useBookmarksStore } from "./bookmarksStore";
import { useFocusStore } from "./focusStore";
import { useAnalyticsStore } from "./analyticsStore";
import { useUIStore } from "./uiStore";

export function useApp() {
  const userStore = useUserStore();
  const taskStore = useTaskStore();
  const habitStore = useHabitStore();
  const journalStore = useJournalStore();
  const notesStore = useNotesStore();
  const goalsStore = useGoalsStore();
  const calendarStore = useCalendarStore();
  const financeStore = useFinanceStore();
  const bookmarksStore = useBookmarksStore();
  const focusStore = useFocusStore();
  const analyticsStore = useAnalyticsStore();
  const uiStore = useUIStore();

  const totalIncome = financeStore.transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = financeStore.transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;
  const todayFocusMinutes = focusStore.focusSessions.reduce(
    (acc, s) => acc + s.durationMinutes,
    0,
  );

  const quests: DailyQuest[] = [
    {
      id: "q-1",
      title: "Complete 3 Tasks",
      xp: 40,
      completed: taskStore.tasks.filter((t) => t.completed).length >= 3,
      icon: "CheckCircle",
    },
    {
      id: "q-2",
      title: "Finish Focus Session",
      xp: 50,
      completed: todayFocusMinutes >= 25,
      icon: "Clock",
    },
    {
      id: "q-3",
      title: "Write in Journal",
      xp: 30,
      completed: journalStore.journalEntries.some(
        (j) => j.date === getTodayDateString(),
      ),
      icon: "BookOpen",
    },
  ];

  return {
    ...userStore,
    ...taskStore,
    ...habitStore,
    ...journalStore,
    ...notesStore,
    ...goalsStore,
    ...calendarStore,
    ...financeStore,
    ...bookmarksStore,
    ...focusStore,
    ...analyticsStore,
    ...uiStore,
    totalIncome,
    totalExpense,
    balance,
    todayFocusMinutes,
    quests,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const userStore = useUserStore();
  const uiStore = useUIStore();

  useEffect(() => {
    userStore.setTheme(userStore.theme, false);

    // Handle Google OAuth Callback params in URL
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const googleAuth = urlParams.get("google_auth");
      const token = urlParams.get("token");
      const refresh = urlParams.get("refresh");
      const authError = urlParams.get("error");

      if (token) {
        localStorage.setItem("trymonk_access_token", token);
        localStorage.setItem("trymonk_token", token);
      }
      if (refresh) {
        localStorage.setItem("trymonk_refresh_token", refresh);
      }

      if (googleAuth === "success" || token) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        triggerCelebrationConfetti();
      } else if (authError) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }

    // Unconditionally sync auth session on mount/refresh/tab open!
    userStore.syncWithBackend().then(() => {
      const isAuth = useUserStore.getState().isAuthenticated;
      if (isAuth) {
        pagesApi
          .getPages()
          .then((res) => {
            if (
              res?.data?.data &&
              Array.isArray(res.data.data) &&
              res.data.data.length > 0
            ) {
              uiStore.setPages(res.data.data);
            }
          })
          .catch(() => {});

        uiStore.loadModuleData(useUIStore.getState().activeModule);
      }
    });
  }, []);

  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
