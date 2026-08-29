import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { TaskItem } from "@/lib/types";
import { tasksApi } from "@/lib/api";
import { getTodayDateString, soundFX } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";
import { useAnalyticsStore } from "./analyticsStore";

export interface TaskStoreState {
  tasks: TaskItem[];
  setTasks: (tasks: TaskItem[]) => void;
  addTask: (task: Omit<TaskItem, "id" | "createdAt">) => void;
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
          })
          .then(() => {
            useAnalyticsStore.getState().fetchAnalytics();
          })
          .catch(() => {});
      },

      toggleTask: (id) => {
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
            })
            .catch(() => {});
        }
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
        toast.info("Task deleted");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          tasksApi
            .deleteTask(numId)
            .then(() => {
              useAnalyticsStore.getState().fetchAnalytics();
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
