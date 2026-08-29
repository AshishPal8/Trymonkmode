import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { FocusSession } from "@/lib/types";
import { soundFX, triggerCelebrationConfetti } from "@/lib/utils";
import { useUserStore } from "./userStore";
import { useAnalyticsStore } from "./analyticsStore";

export interface FocusStoreState {
  focusSessions: FocusSession[];
  setFocusSessions: (sessions: FocusSession[]) => void;
  logFocusSession: (session: Omit<FocusSession, "id">) => void;
}

export const useFocusStore = create<FocusStoreState>()(
  persist(
    (set) => ({
      focusSessions: [],

      setFocusSessions: (sessions: FocusSession[]) =>
        set({ focusSessions: sessions }),

      logFocusSession: (session) => {
        const newSession: FocusSession = { ...session, id: `fs-${Date.now()}` };
        set((state) => ({
          focusSessions: [newSession, ...state.focusSessions],
        }));
        soundFX.playTimerBell();
        useUserStore.getState().addXP(50);
        triggerCelebrationConfetti();
        useAnalyticsStore.getState().fetchAnalytics();
      },
    }),
    {
      name: "trymonk_focus_store",
      storage: createEncryptedStorage(),
    },
  ),
);
