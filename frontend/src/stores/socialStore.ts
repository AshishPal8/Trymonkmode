import { create } from "zustand";
import type { FriendsData, SocialProfile, StatsVisibility } from "@/lib/types";
import { apiErrorMessage, socialApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { isFresh } from "@/lib/utils";

const EMPTY: FriendsData = { friends: [], incoming: [], outgoing: [], blocked: [] };

export interface SocialStoreState {
  profile: SocialProfile | null;
  friendsData: FriendsData;
  isLoading: boolean;

  loadedAt: number;
  /** Profile + friends. Skipped if loaded in the last minute, unless `force`. */
  load: (force?: boolean) => Promise<void>;
  refreshFriends: () => Promise<void>;
  setStatsVisibility: (visibility: StatsVisibility) => Promise<void>;
  resetInvite: () => Promise<void>;
  sendRequest: (username: string) => Promise<boolean>;
  joinInvite: (code: string) => Promise<boolean>;
  accept: (userId: number) => Promise<void>;
  decline: (userId: number) => Promise<void>;
  remove: (userId: number) => Promise<void>;
  block: (userId: number) => Promise<void>;
  unblock: (userId: number) => Promise<void>;
}

export const useSocialStore = create<SocialStoreState>()((set, get) => {
  /**
   * Runs one friend action: call the API, toast the server's message,
   * reload the lists. Returns true on success.
   */
  const run = async (call: () => Promise<{ data?: { message?: string } }>, failMessage: string) => {
    try {
      const res = await call();
      if (res?.data?.message) toast.success(res.data.message);
      await get().refreshFriends();
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, failMessage));
      return false;
    }
  };

  const saveProfile = async (data: Parameters<typeof socialApi.updateProfile>[0], failMessage: string) => {
    try {
      const res = await socialApi.updateProfile(data);
      set({ profile: res.data.data });
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, failMessage));
      return false;
    }
  };

  return {
    profile: null,
    friendsData: EMPTY,
    isLoading: false,
    loadedAt: 0,

    load: async (force = false) => {
      if (!force && isFresh(get().loadedAt)) return;
      set({ isLoading: true, loadedAt: Date.now() });
      try {
        const [profile, friends] = await Promise.all([socialApi.getProfile(), socialApi.getFriends()]);
        set({ profile: profile.data.data, friendsData: friends.data.data ?? EMPTY });
      } catch {
        // keep what we have
      } finally {
        set({ isLoading: false });
      }
    },

    refreshFriends: async () => {
      try {
        const res = await socialApi.getFriends();
        set({ friendsData: res.data.data ?? EMPTY });
      } catch {
        // ignore
      }
    },

    setStatsVisibility: async (statsVisibility) => {
      const before = get().profile;
      if (before) set({ profile: { ...before, statsVisibility } });
      if (!(await saveProfile({ statsVisibility }, "Couldn't save your privacy setting."))) set({ profile: before });
    },

    resetInvite: async () => {
      try {
        const res = await socialApi.resetInvite();
        const profile = get().profile;
        if (profile) set({ profile: { ...profile, inviteCode: res.data.data.inviteCode } });
        toast.success("New invite link created. The old one no longer works.");
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't create a new link."));
      }
    },

    sendRequest: (username) => run(() => socialApi.sendRequest(username), "Couldn't send the request."),
    joinInvite: (code) => run(() => socialApi.joinInvite(code), "This invite link didn't work."),
    accept: async (userId) => void (await run(() => socialApi.accept(userId), "Couldn't accept.")),
    decline: async (userId) => void (await run(() => socialApi.decline(userId), "Couldn't decline.")),
    remove: async (userId) => void (await run(() => socialApi.remove(userId), "Couldn't remove.")),
    block: async (userId) => void (await run(() => socialApi.block(userId), "Couldn't block.")),
    unblock: async (userId) => void (await run(() => socialApi.unblock(userId), "Couldn't unblock.")),
  };
});
