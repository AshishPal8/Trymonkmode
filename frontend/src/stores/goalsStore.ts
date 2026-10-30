import { create } from "zustand";
import { GoalItem, GoalInput, GoalMilestone } from "@/lib/types";
import { goalsApi } from "@/lib/api";
import { soundFX, triggerCelebrationConfetti } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Server goal -> UI goal. */
export function toGoalItem(g: any): GoalItem {
  return {
    id: String(g.id),
    title: g.title,
    description: g.description || "",
    why: g.why || "",
    category: g.category || "Learning",
    timeframe: g.timeframe || "quarterly",
    kind: g.kind || "project",
    status: g.status || "active",
    targetMetric: g.targetMetric || "",
    unit: g.unit || "",
    currentProgress: g.currentProgress ?? 0,
    targetProgress: g.targetProgress ?? 100,
    targetFocusMinutes: g.targetFocusMinutes ?? null,
    startDate: g.startDate ?? null,
    deadline: g.deadline ?? null,
    color: g.color || "#0052FF",
    icon: g.icon || "Target",
    progress: g.progress ?? 0,
    focusMinutes: g.focusMinutes ?? 0,
    taskTotal: g.taskTotal ?? 0,
    taskDone: g.taskDone ?? 0,
    nextTask: g.nextTask ?? null,
    milestones: (g.milestones || []).map(
      (m: any): GoalMilestone => ({
        id: String(m.id),
        title: m.title,
        dueDate: m.dueDate ?? null,
        completed: !!m.completed,
        taskTotal: m.taskTotal ?? 0,
        taskDone: m.taskDone ?? 0,
      }),
    ),
    createdAt: g.createdAt ? String(g.createdAt).slice(0, 10) : "",
  };
}

export interface GoalsStoreState {
  goals: GoalItem[];
  isLoadingGoals: boolean;
  setGoals: (goals: GoalItem[]) => void;
  fetchGoals: () => Promise<void>;
  /** Re-reads one goal (after its tasks or milestones change). */
  refreshGoal: (id: string) => Promise<void>;
  addGoal: (input: GoalInput) => Promise<GoalItem | null>;
  updateGoal: (id: string, updates: Partial<GoalInput>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string, dueDate?: string | null) => Promise<void>;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
}

// Goals always come from the server now (they used to live in the browser,
// and milestones/deadlines were never saved).
export const useGoalsStore = create<GoalsStoreState>()((set, get) => {
  const replace = (goal: GoalItem) =>
    set((s) => ({ goals: s.goals.map((g) => (g.id === goal.id ? goal : g)) }));

  return {
    goals: [],
    isLoadingGoals: false,

    setGoals: (goals) => set({ goals }),

    fetchGoals: async () => {
      set({ isLoadingGoals: true });
      try {
        const res = await goalsApi.getGoals();
        if (Array.isArray(res?.data?.data)) set({ goals: res.data.data.map(toGoalItem) });
      } catch {
        // keep what we have
      } finally {
        set({ isLoadingGoals: false });
      }
    },

    refreshGoal: async (id) => {
      try {
        const res = await goalsApi.getGoal(Number(id));
        if (res?.data?.data) replace(toGoalItem(res.data.data));
      } catch {
        // ignore
      }
    },

    addGoal: async (input) => {
      try {
        const res = await goalsApi.createGoal(input);
        const goal = toGoalItem(res.data.data);
        set((s) => ({ goals: [goal, ...s.goals] }));
        useUserStore.getState().addXP(30);
        soundFX.playCheckSound();
        toast.success("Goal created! +30 XP");
        return goal;
      } catch {
        toast.error("Couldn't create the goal. Please try again.");
        return null;
      }
    },

    updateGoal: async (id, updates) => {
      const before = get().goals.find((g) => g.id === id);
      // Show the change right away; the server's version replaces it.
      if (before) replace({ ...before, ...updates } as GoalItem);
      try {
        const res = await goalsApi.updateGoal(Number(id), updates);
        const goal = toGoalItem(res.data.data);
        replace(goal);
        if (updates.status === "done" && before?.status !== "done") {
          triggerCelebrationConfetti();
          useUserStore.getState().addXP(100);
          toast.success("Goal completed! +100 XP 🏆");
        }
      } catch {
        if (before) replace(before);
        toast.error("Couldn't save that change.");
      }
    },

    deleteGoal: async (id) => {
      const before = get().goals;
      set({ goals: before.filter((g) => g.id !== id) });
      try {
        await goalsApi.deleteGoal(Number(id));
        toast.info("Goal deleted. Its tasks were kept.");
      } catch {
        set({ goals: before });
        toast.error("Couldn't delete the goal.");
      }
    },

    addMilestone: async (goalId, title, dueDate) => {
      try {
        await goalsApi.createMilestone(Number(goalId), { title, dueDate: dueDate || null });
        await get().refreshGoal(goalId);
      } catch {
        toast.error("Couldn't add the milestone.");
      }
    },

    toggleGoalMilestone: async (goalId, milestoneId) => {
      const goal = get().goals.find((g) => g.id === goalId);
      const m = goal?.milestones.find((x) => x.id === milestoneId);
      if (!goal || !m) return;
      const completed = !m.completed;
      replace({
        ...goal,
        milestones: goal.milestones.map((x) => (x.id === milestoneId ? { ...x, completed } : x)),
      });
      try {
        await goalsApi.updateMilestone(Number(milestoneId), { completed });
        if (completed) {
          soundFX.playCheckSound();
          useUserStore.getState().addXP(25);
          toast.success("Milestone done! +25 XP");
        }
        await get().refreshGoal(goalId);
      } catch {
        replace(goal);
        toast.error("Couldn't update the milestone.");
      }
    },

    deleteMilestone: async (goalId, milestoneId) => {
      try {
        await goalsApi.deleteMilestone(Number(milestoneId));
        await get().refreshGoal(goalId);
      } catch {
        toast.error("Couldn't delete the milestone.");
      }
    },
  };
});
