import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEncryptedStorage } from '@/lib/encryptedStorage';
import { HabitItem } from '@/lib/types';
import { habitsApi } from '@/lib/api';
import { getTodayDateString, soundFX, triggerCelebrationConfetti } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { useUserStore } from './userStore';
import { useAnalyticsStore } from './analyticsStore';

export interface HabitStoreState {
  habits: HabitItem[];
  setHabits: (habits: HabitItem[]) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'createdAt' | 'streak' | 'completedDates'>) => void;
  toggleHabitForDate: (habitId: string, dateStr: string) => void;
  deleteHabit: (id: string) => void;
}

export const useHabitStore = create<HabitStoreState>()(
  persist(
    (set, get) => ({
      habits: [],

      setHabits: (habits: HabitItem[]) => set({ habits }),

      addHabit: habit => {
        const newHabit: HabitItem = {
          ...habit,
          id: `h-${Date.now()}`,
          streak: 0,
          completedDates: [],
          createdAt: getTodayDateString()
        };
        set(state => ({ habits: [...state.habits, newHabit] }));
        useUserStore.getState().addXP(15);
        toast.success('Habit created! +15 XP');

        habitsApi.createHabit({
          title: habit.title,
          category: habit.category,
          targetDays: habit.targetDays,
        }).then(() => {
          useAnalyticsStore.getState().fetchAnalytics();
        }).catch(() => {});
      },

      toggleHabitForDate: (habitId, dateStr) => {
        set(state => ({
          habits: state.habits.map(h => {
            if (h.id === habitId) {
              const isDone = h.completedDates.includes(dateStr);
              let updatedDates: string[];
              let updatedStreak = h.streak;

              if (isDone) {
                updatedDates = h.completedDates.filter(d => d !== dateStr);
                updatedStreak = Math.max(0, updatedStreak - 1);
              } else {
                updatedDates = [...h.completedDates, dateStr];
                updatedStreak += 1;
                soundFX.playCheckSound();
                useUserStore.getState().addXP(15);
                if (updatedStreak % 7 === 0) triggerCelebrationConfetti();
              }
              return { ...h, completedDates: updatedDates, streak: updatedStreak };
            }
            return h;
          })
        }));

        const numId = parseInt(habitId.replace(/\D/g, ''), 10);
        if (!isNaN(numId)) {
          habitsApi.toggleCheckIn(numId, dateStr).then(() => {
            useAnalyticsStore.getState().fetchAnalytics();
          }).catch(() => {});
        }
      },

      deleteHabit: id => {
        set(state => ({ habits: state.habits.filter(h => h.id !== id) }));
        toast.info('Habit removed');
        const numId = parseInt(id.replace(/\D/g, ''), 10);
        if (!isNaN(numId)) {
          habitsApi.deleteHabit(numId).then(() => {
            useAnalyticsStore.getState().fetchAnalytics();
          }).catch(() => {});
        }
      }
    }),
    {
      name: 'trymonk_habits_store',
      storage: createEncryptedStorage()
    }
  )
);
