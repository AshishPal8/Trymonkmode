import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { GoalItem } from "@/lib/types";
import { goalsApi } from "@/lib/api";
import {
  getTodayDateString,
  soundFX,
  triggerCelebrationConfetti,
} from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface GoalsStoreState {
  goals: GoalItem[];
  setGoals: (goals: GoalItem[]) => void;
  addGoal: (goal: Omit<GoalItem, "id" | "createdAt">) => void;
  updateGoal: (id: string, updates: Partial<Omit<GoalItem, "id" | "createdAt">>) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsStoreState>()(
  persist(
    (set) => ({
      goals: [],

      setGoals: (goals: GoalItem[]) => set({ goals }),

      addGoal: (goal) => {
        const newGoal: GoalItem = {
          ...goal,
          id: `g-${Date.now()}`,
          createdAt: getTodayDateString(),
        };
        set((state) => ({ goals: [newGoal, ...state.goals] }));
        useUserStore.getState().addXP(30);
        toast.success("Goal target established! +30 XP");

        goalsApi
          .createGoal({
            title: goal.title,
            description: goal.targetMetric || "",
            category: goal.category,
            targetDate: goal.deadline,
            milestones: goal.milestones,
            progress: goal.progress,
          })
          .catch(() => {});
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
        toast.success("Goal updated successfully!");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          goalsApi
            .updateGoal(numId, {
              title: updates.title,
              description: updates.targetMetric,
              category: updates.category,
              targetDate: updates.deadline,
              milestones: updates.milestones,
              progress: updates.progress,
            })
            .catch(() => {});
        }
      },

      toggleGoalMilestone: (goalId, milestoneId) => {
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === goalId) {
              const updated = g.milestones.map((m) =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m,
              );
              const compCount = updated.filter((m) => m.completed).length;
              const progress =
                updated.length > 0
                  ? Math.round((compCount / updated.length) * 100)
                  : 0;
              if (progress === 100) {
                triggerCelebrationConfetti();
                useUserStore.getState().addXP(100);
                toast.success("Goal accomplished! +100 XP");
              } else {
                soundFX.playCheckSound();
                useUserStore.getState().addXP(15);
              }
              return { ...g, milestones: updated, progress };
            }
            return g;
          }),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
        toast.info("Goal removed");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          goalsApi.deleteGoal(numId).catch(() => {});
        }
      },
    }),
    {
      name: "trymonk_goals_store",
      storage: createEncryptedStorage(),
    },
  ),
);
