import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { BookmarkItem } from "@/lib/types";
import { bookmarksApi } from "@/lib/api";
import { getTodayDateString } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useUserStore } from "./userStore";

export interface BookmarksStoreState {
  bookmarks: BookmarkItem[];
  setBookmarks: (bookmarks: BookmarkItem[]) => void;
  addBookmark: (bm: Omit<BookmarkItem, "id" | "createdAt">) => void;
  toggleBookmarkFavorite: (id: string) => void;
  toggleBookmarkRead: (id: string) => void;
  deleteBookmark: (id: string) => void;
}

export const useBookmarksStore = create<BookmarksStoreState>()(
  persist(
    (set) => ({
      bookmarks: [],

      setBookmarks: (bookmarks: BookmarkItem[]) => set({ bookmarks }),

      addBookmark: (bm) => {
        const newBm: BookmarkItem = {
          ...bm,
          id: `b-${Date.now()}`,
          createdAt: getTodayDateString(),
        };
        set((state) => ({ bookmarks: [newBm, ...state.bookmarks] }));
        useUserStore.getState().addXP(10);
        toast.success("Resource saved to bookmarks");

        bookmarksApi
          .createBookmark({
            title: bm.title,
            url: bm.url,
            category: bm.category,
            description: bm.notes,
            tags: bm.tags,
            isPinned: bm.isFavorite,
          })
          .catch(() => {});
      },

      toggleBookmarkFavorite: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, isFavorite: !b.isFavorite } : b,
          ),
        }));
      },

      toggleBookmarkRead: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.map((b) =>
            b.id === id ? { ...b, isRead: !b.isRead } : b,
          ),
        }));
      },

      deleteBookmark: (id) => {
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        }));
        toast.info("Resource deleted");
        const numId = parseInt(id.replace(/\D/g, ""), 10);
        if (!isNaN(numId)) {
          bookmarksApi.deleteBookmark(numId).catch(() => {});
        }
      },
    }),
    {
      name: "trymonk_bookmarks_store",
      storage: createEncryptedStorage(),
    },
  ),
);
