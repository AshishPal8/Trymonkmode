import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { JournalEntry } from "@/lib/types";
import { journalApi } from "@/lib/api";
import { getTodayDateString, soundFX, serverIdFrom } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface JournalStoreState {
  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
}

export const useJournalStore = create<JournalStoreState>()(
  persist(
    (set) => ({
      journalEntries: [],

      setJournalEntries: (entries: JournalEntry[]) =>
        set({ journalEntries: entries }),

      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: `j-${Date.now()}`,
          createdAt: getTodayDateString(),
        };
        set((state) => ({
          journalEntries: [newEntry, ...state.journalEntries],
        }));
        soundFX.playCheckSound();
        useUserStore.getState().addXP(25);
        toast.success("Journal entry logged! +25 XP");

        journalApi
          .saveEntry({
            date: entry.date,
            content: entry.howWasYourDay || entry.highlights || "",
            mood: entry.mood,
            energyLevel: entry.rating ? entry.rating * 2 : 8,
            gratitudeItems: entry.gratitude,
            promptQuestion: entry.dailyPrompt,
            promptAnswer: entry.dailyPromptAnswer,
            tags: entry.stickers,
          })
          // Swap the temporary local id for the real one, so edits, toggles
          // and deletes right after creating reach the right row.
          .then((res) => {
            const sid = serverIdFrom(res);
            if (sid) {
              set((state) => ({
                journalEntries: state.journalEntries.map((x) => (x.id === newEntry.id ? { ...x, id: sid } : x)),
              }));
            }
            return res;
          })
          .catch(() => {});
      },
    }),
    {
      name: "trymonk_journal_store",
      storage: createEncryptedStorage(),
    },
  ),
);
