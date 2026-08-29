import { create } from "zustand";
import { ActiveModuleId, CategoryHub, AppPageItem } from "@/lib/types";
import {
  tasksApi,
  habitsApi,
  calendarApi,
  journalApi,
  notesApi,
  goalsApi,
  bookmarksApi,
  financeApi,
} from "@/lib/api";
import { getTodayDateString } from "@/lib/utils";
import { useTaskStore } from "./taskStore";
import { useHabitStore } from "./habitStore";
import { useCalendarStore } from "./calendarStore";
import { useJournalStore } from "./journalStore";
import { useNotesStore } from "./notesStore";
import { useGoalsStore } from "./goalsStore";
import { useBookmarksStore } from "./bookmarksStore";
import { useFinanceStore } from "./financeStore";
import { useAnalyticsStore } from "./analyticsStore";
import { useUserStore } from "./userStore";

export const DEFAULT_PAGES: AppPageItem[] = [
  {
    id: 1,
    key: "dashboard",
    name: "Dashboard",
    path: "/dashboard",
    hub: "Productivity",
    icon: "LayoutDashboard",
    orderIndex: 1,
  },
  {
    id: 2,
    key: "tasks",
    name: "Tasks",
    path: "/tasks",
    hub: "Productivity",
    icon: "CheckSquare",
    orderIndex: 2,
  },
  {
    id: 3,
    key: "calendar",
    name: "Calendar",
    path: "/calendar",
    hub: "Productivity",
    icon: "Calendar",
    orderIndex: 3,
  },
  {
    id: 4,
    key: "matrix",
    name: "Matrix",
    path: "/matrix",
    hub: "Productivity",
    icon: "Grid",
    orderIndex: 4,
  },
  {
    id: 5,
    key: "goals",
    name: "Goals & OKRs",
    path: "/goals",
    hub: "Productivity",
    icon: "Target",
    orderIndex: 5,
  },
  {
    id: 6,
    key: "pomodoro",
    name: "Focus Timer",
    path: "/pomodoro",
    hub: "Focus",
    icon: "Clock",
    orderIndex: 6,
  },
  {
    id: 7,
    key: "habits",
    name: "Habits",
    path: "/habits",
    hub: "Mind & Wellness",
    icon: "Zap",
    orderIndex: 7,
  },
  {
    id: 8,
    key: "journal",
    name: "Journal",
    path: "/journal",
    hub: "Mind & Wellness",
    icon: "BookOpen",
    orderIndex: 8,
  },
  {
    id: 9,
    key: "notes",
    name: "Notes & Ideas",
    path: "/notes",
    hub: "Mind & Wellness",
    icon: "FileText",
    orderIndex: 9,
  },
  {
    id: 10,
    key: "bookmarks",
    name: "Resources",
    path: "/bookmarks",
    hub: "Growth & Finance",
    icon: "Bookmark",
    orderIndex: 10,
  },
  {
    id: 11,
    key: "finance",
    name: "Finance",
    path: "/finance",
    hub: "Growth & Finance",
    icon: "DollarSign",
    orderIndex: 11,
  },
];

export interface UIStoreState {
  activeModule: ActiveModuleId;
  setActiveModule: (id: ActiveModuleId) => void;
  activeCategory: CategoryHub;
  setActiveCategory: (cat: CategoryHub) => void;

  pages: AppPageItem[];
  setPages: (pages: AppPageItem[]) => void;

  loadedModules: Record<string, boolean>;
  loadModuleData: (moduleId: ActiveModuleId, force?: boolean) => Promise<void>;

  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;

  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

export const useUIStore = create<UIStoreState>((set, get) => ({
  activeModule: "dashboard",
  setActiveModule: (id: ActiveModuleId) => {
    set({ activeModule: id });
    get().loadModuleData(id);
  },

  activeCategory: "productivity",
  setActiveCategory: (cat: CategoryHub) => set({ activeCategory: cat }),

  pages: DEFAULT_PAGES,
  setPages: (pages: AppPageItem[]) => set({ pages }),

  loadedModules: {},

  loadModuleData: async (moduleId: ActiveModuleId, force = false) => {
    const { loadedModules } = get();
    const isAuthenticated = useUserStore.getState().isAuthenticated;
    if (!isAuthenticated) return;
    if (loadedModules[moduleId] && !force) return;

    set((state) => ({
      loadedModules: { ...state.loadedModules, [moduleId]: true },
    }));

    try {
      switch (moduleId) {
        case "analytics": {
          await useAnalyticsStore.getState().fetchAnalytics();
          break;
        }

        case "tasks":
        case "matrix":
        case "dashboard": {
          const tasksRes = await tasksApi.getTasks().catch(() => null);
          if (tasksRes?.data?.data) {
            useTaskStore.getState().setTasks(
              tasksRes.data.data.map((t: any) => ({
                id: String(t.id),
                title: t.title,
                description: t.description || "",
                priority: t.priority || "P2",
                dueDate: t.dueDate || getTodayDateString(),
                dueTime: t.dueTime || "09:00",
                category: "General",
                tags: t.tags || [],
                subtasks: t.subtasks || [],
                completed: !!t.completed,
                quadrant: t.quadrant || "notUrgent-important",
                createdAt: t.createdAt
                  ? String(t.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          if (moduleId === "dashboard") {
            useAnalyticsStore.getState().fetchAnalytics();
          }
          break;
        }

        case "habits": {
          const habitsRes = await habitsApi.getHabits().catch(() => null);
          if (habitsRes?.data?.data) {
            useHabitStore.getState().setHabits(
              habitsRes.data.data.map((h: any) => ({
                id: String(h.id),
                title: h.title,
                description: "",
                timeFrom: "08:00",
                timeTo: "08:45",
                priority: "high",
                category: (h.category as any) || "Work",
                icon: "Zap",
                targetDays: h.targetDays || [0, 1, 2, 3, 4, 5, 6],
                completedDates: h.completedDates || [],
                streak: h.streak || 0,
                color: "#0052FF",
                createdAt: h.createdAt
                  ? String(h.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          break;
        }

        case "calendar": {
          const calRes = await calendarApi.getEvents().catch(() => null);
          if (calRes?.data?.data) {
            useCalendarStore.getState().setCalendarEvents(
              calRes.data.data.map((e: any) => ({
                id: String(e.id),
                title: e.title,
                description: e.description || "",
                date: e.date,
                startTime: e.startTime,
                endTime: e.endTime,
                category: (e.category?.toLowerCase() as any) || "deep-work",
                color: "#6366F1",
              })),
            );
          }
          break;
        }

        case "journal": {
          const jRes = await journalApi.getEntries().catch(() => null);
          if (jRes?.data?.data) {
            useJournalStore.getState().setJournalEntries(
              jRes.data.data.map((j: any) => ({
                id: String(j.id),
                date: j.date || getTodayDateString(),
                mood: (j.mood as any) || "neutral",
                rating: j.energyLevel ? Math.round(j.energyLevel / 2) : 4,
                howWasYourDay: j.content || "",
                highlights: "",
                gratitude: Array.isArray(j.gratitudeItems)
                  ? j.gratitudeItems
                  : [],
                proudestAchievement: "",
                tomorrowPriority: "",
                stickers: Array.isArray(j.tags) ? j.tags : [],
                affirmation: "",
                dailyPrompt: j.promptQuestion || "",
                dailyPromptAnswer: j.promptAnswer || "",
                createdAt: j.createdAt
                  ? String(j.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          break;
        }

        case "notes": {
          const nRes = await notesApi.getNotes().catch(() => null);
          if (nRes?.data?.data) {
            useNotesStore.getState().setNotes(
              nRes.data.data.map((n: any) => ({
                id: String(n.id),
                title: n.title,
                content: n.content || "",
                tags: Array.isArray(n.tags) ? n.tags : [],
                isPinned: !!n.isPinned,
                color: n.color || "#3B82F6",
                createdAt: n.createdAt
                  ? String(n.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          break;
        }

        case "goals": {
          const gRes = await goalsApi.getGoals().catch(() => null);
          if (gRes?.data?.data) {
            useGoalsStore.getState().setGoals(
              gRes.data.data.map((g: any) => ({
                id: String(g.id),
                title: g.title,
                category: (g.category as any) || "Career",
                timeframe: (g.timeframe as any) || "yearly",
                deadline: g.targetDate || getTodayDateString(),
                progress: g.progress || 0,
                color: "#0052FF",
                milestones: Array.isArray(g.milestones) ? g.milestones : [],
                targetMetric: g.description || "",
                createdAt: g.createdAt
                  ? String(g.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          break;
        }

        case "bookmarks": {
          const bRes = await bookmarksApi.getBookmarks().catch(() => null);
          if (bRes?.data?.data) {
            useBookmarksStore.getState().setBookmarks(
              bRes.data.data.map((b: any) => ({
                id: String(b.id),
                title: b.title,
                url: b.url,
                category: (b.category as any) || "Articles",
                type: "article",
                notes: b.description || "",
                tags: Array.isArray(b.tags) ? b.tags : [],
                isFavorite: !!b.isPinned,
                isRead: false,
                createdAt: b.createdAt
                  ? String(b.createdAt).slice(0, 10)
                  : getTodayDateString(),
              })),
            );
          }
          break;
        }

        case "finance": {
          const fRes = await financeApi.getOverview().catch(() => null);
          const rawTxs = fRes?.data?.data?.transactions || fRes?.data?.data;
          if (Array.isArray(rawTxs)) {
            useFinanceStore.getState().setTransactions(
              rawTxs.map((tx: any) => ({
                id: String(tx.id),
                title: tx.title,
                amount: Number(tx.amount) || 0,
                type: (tx.type as any) || "expense",
                category: (tx.category as any) || "General",
                paymentMethod: (tx.paymentMethod as any) || "Credit Card",
                date: tx.date || getTodayDateString(),
                time: tx.time || "12:00",
              })),
            );
          }
          break;
        }
      }
    } catch {}
  },

  isQuickAddOpen: false,
  openQuickAdd: () => set({ isQuickAddOpen: true }),
  closeQuickAdd: () => set({ isQuickAddOpen: false }),

  isProfileModalOpen: false,
  openProfileModal: () => set({ isProfileModalOpen: true }),
  closeProfileModal: () => set({ isProfileModalOpen: false }),
}));
