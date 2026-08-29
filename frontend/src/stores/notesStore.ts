import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { NoteItem } from "@/lib/types";
import { notesApi } from "@/lib/api";
import { getTodayDateString } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface NotesStoreState {
  notes: NoteItem[];
  setNotes: (notes: NoteItem[]) => void;
  addNote: (note: Omit<NoteItem, "id" | "createdAt">) => void;
  updateNote: (
    id: string,
    data: Partial<Omit<NoteItem, "id" | "createdAt">>,
  ) => void;
  deleteNote: (id: string) => void;
}

export const useNotesStore = create<NotesStoreState>()(
  persist(
    (set) => ({
      notes: [],

      setNotes: (notes: NoteItem[]) => set({ notes }),

      addNote: (note) => {
        const newNote: NoteItem = {
          ...note,
          id: `n-${Date.now()}`,
          createdAt: getTodayDateString(),
        };
        set((state) => ({ notes: [newNote, ...state.notes] }));
        useUserStore.getState().addXP(10);
        toast.success("Note saved successfully");

        notesApi
          .createNote({
            title: note.title,
            content: note.content,
            tags: note.tags,
            isPinned: note.isPinned,
            color: note.color,
          })
          .catch(() => {});
      },

      updateNote: (id, data) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
        }));

        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          notesApi.updateNote(numId, data).catch(() => {});
        }
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
        toast.info("Note deleted");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          notesApi.deleteNote(numId).catch(() => {});
        }
      },
    }),
    {
      name: "trymonk_notes_store",
      storage: createEncryptedStorage(),
    },
  ),
);
