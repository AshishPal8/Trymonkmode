import { create } from "zustand";
import type { ChallengeDetail, ChallengeLists, NewChallengeInput } from "@/lib/types";
import { apiErrorMessage, challengesApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { isFresh, triggerCelebrationConfetti } from "@/lib/utils";

const EMPTY: ChallengeLists = { joined: [], available: [] };

type ApiCall = () => Promise<{ data?: { message?: string; data?: unknown } }>;

export interface ChallengeStoreState {
  lists: ChallengeLists;
  isLoadingList: boolean;
  /** The challenge open on screen (null = the lists). */
  openId: number | null;
  detail: ChallengeDetail | null;

  listLoadedAt: number;
  /** Skipped if loaded in the last minute, unless `force`. */
  loadList: (force?: boolean) => Promise<void>;
  open: (id: number | null) => Promise<void>;
  /** Admins only. */
  create: (input: NewChallengeInput) => Promise<boolean>;
  join: (id: number) => Promise<void>;
  leave: (id: number) => Promise<void>;
  checkIn: (id: number) => Promise<void>;
  /** Admins only. */
  remove: (id: number) => Promise<void>;
}

export const useChallengeStore = create<ChallengeStoreState>()((set, get) => {
  /**
   * Runs one action: toast the server's message, keep the returned detail
   * (if any) and reload the lists. Returns true on success.
   */
  const run = async (call: ApiCall, failMessage: string) => {
    try {
      const res = await call();
      if (res?.data?.message) toast.success(res.data.message);
      const detail = res?.data?.data as ChallengeDetail | undefined;
      if (detail && "leaderboard" in detail) set({ detail, openId: detail.id });
      get().loadList(true);
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, failMessage));
      return false;
    }
  };

  return {
    lists: EMPTY,
    isLoadingList: false,
    listLoadedAt: 0,
    openId: null,
    detail: null,

    loadList: async (force = false) => {
      if (!force && isFresh(get().listLoadedAt)) return;
      set({ isLoadingList: true, listLoadedAt: Date.now() });
      try {
        const res = await challengesApi.list();
        set({ lists: res.data.data ?? EMPTY });
      } catch {
        // keep what we have
      } finally {
        set({ isLoadingList: false });
      }
    },

    open: async (id) => {
      set({ openId: id, detail: id && get().detail?.id === id ? get().detail : null });
      if (!id) return;
      try {
        const res = await challengesApi.get(id);
        if (get().openId === id) set({ detail: res.data.data });
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't open the challenge."));
        set({ openId: null });
      }
    },

    create: async (input) => {
      const ok = await run(() => challengesApi.create(input), "Couldn't create the challenge.");
      if (ok) triggerCelebrationConfetti();
      return ok;
    },
    join: async (id) => void (await run(() => challengesApi.join(id), "Couldn't join.")),
    checkIn: async (id) => void (await run(() => challengesApi.checkIn(id), "Couldn't check in.")),

    leave: async (id) => {
      if (await run(() => challengesApi.leave(id), "Couldn't leave.")) set({ openId: null, detail: null });
    },
    remove: async (id) => {
      if (await run(() => challengesApi.remove(id), "Couldn't delete.")) set({ openId: null, detail: null });
    },
  };
});
