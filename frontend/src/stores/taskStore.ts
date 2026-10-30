import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { TaskItem } from "@/lib/types";
import { tasksApi } from "@/lib/api";
import { getTodayDateString, soundFX, serverIdFrom } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";
import { useAnalyticsStore } from "./analyticsStore";
import { useGoalsStore } from "./goalsStore";

/** Goal progress depends on its tasks, so re-read those goals. */
function refreshGoals(...goalIds: (string | null | undefined)[]) {
  for (const id of new Set(goalIds.filter(Boolean) as string[])) {
    useGoalsStore.getState().refreshGoal(id);
  }
}

const toNumOrNull = (v: string | null | undefined) => (v ? Number(v) : null);

export interface TaskStoreState {
  tasks: TaskItem[];
  setTasks: (tasks: TaskItem[]) => void;
  addTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskQuadrant: (id: string, quadrant: TaskItem["quadrant"]) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  persist(
    (set, get) => ({
      tasks: [],

      setTasks: (tasks: TaskItem[]) => set({ tasks }),

      addTask: (task) => {
        const newTask: TaskItem = {
          ...task,
          id: `t-${Date.now()}`,
          createdAt: getTodayDateString(),
        };
        set((state) => ({ tasks: [newTask, ...state.tasks] }));
        useUserStore.getState().addXP(10);
        soundFX.playCheckSound();
        toast.success("Task created successfully! +10 XP");

        tasksApi
          .createTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate || getTodayDateString(),
            dueTime: task.dueTime,
            tags: task.tags,
            subtasks: task.subtasks,
            completed: task.completed,
            quadrant: task.quadrant,
            ...(task.goalId ? { goalId: Number(task.goalId) } : {}),
            ...(task.milestoneId ? { milestoneId: Number(task.milestoneId) } : {}),
          })
          // Swap the temporary local id for the real one, so edits, toggles
          // and deletes right after creating reach the right row.
          .then((res) => {
            const sid = serverIdFrom(res);
            if (sid) {
              set((state) => ({
                tasks: state.tasks.map((x) => (x.id === newTask.id ? { ...x, id: sid } : x)),
              }));
            }
            return res;
          })
          .then(() => {
            useAnalyticsStore.getState().fetchAnalytics();
            refreshGoals(task.goalId);
          })
          .catch(() => {});
      },

      updateTask: (id, updates) => {
        const before = get().tasks.find((t) => t.id === id);
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        toast.success("Task updated successfully!");

        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          tasksApi
            .updateTask(numId, {
              title: updates.title,
              description: updates.description,
              priority: updates.priority,
              dueDate: updates.dueDate,
              dueTime: updates.dueTime,
              tags: updates.tags,
              subtasks: updates.subtasks,
              completed: updates.completed,
              quadrant: updates.quadrant,
              ...("goalId" in updates ? { goalId: toNumOrNull(updates.goalId) } : {}),
              ...("milestoneId" in updates ? { milestoneId: toNumOrNull(updates.milestoneId) } : {}),
            })
            .then(() => {
              useAnalyticsStore.getState().fetchAnalytics();
              refreshGoals(before?.goalId, updates.goalId);
            })
            .catch(() => {});
        }
      },

      toggleTask: (id) => {
        const goalId = get().tasks.find((t) => t.id === id)?.goalId;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const next = !t.completed;
              if (next) {
                soundFX.playCheckSound();
                useUserStore.getState().addXP(20);
                toast.success("Task completed! +20 XP");
              }
              return {
                ...t,
                completed: next,
                completedAt: next ? new Date().toISOString() : undefined,
              };
            }
            return t;
          }),
        }));

        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          tasksApi
            .toggleTask(numId)
            .then(() => {
              useAnalyticsStore.getState().fetchAnalytics();
              refreshGoals(goalId);
            })
            .catch(() => {});
        }
      },

      deleteTask: (id) => {
        const goalId = get().tasks.find((t) => t.id === id)?.goalId;
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        toast.info("Task deleted");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          tasksApi
            .deleteTask(numId)
            .then(() => {
              useAnalyticsStore.getState().fetchAnalytics();
              refreshGoals(goalId);
            })
            .catch(() => {});
        }
      },

      updateTaskQuadrant: (id, quadrant) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, quadrant } : t)),
        }));
      },
    }),
    {
      name: "trymonk_tasks_store",
      storage: createEncryptedStorage(),
    },
  ),
);
