import { create } from "zustand";
import type { GroupDetail, GroupSummary, NewGroupInput } from "@/lib/types";
import { apiErrorMessage, groupsApi } from "@/lib/api";
import { isFresh } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type ApiCall = () => Promise<{ data?: { message?: string; data?: unknown } }>;

export interface GroupStoreState {
  groups: GroupSummary[];
  loadedAt: number;
  isLoading: boolean;
  /** The group open on screen (null = the list). */
  openId: number | null;
  detail: GroupDetail | null;

  /** Skipped if loaded in the last minute, unless `force`. */
  loadGroups: (force?: boolean) => Promise<void>;
  open: (id: number | null) => Promise<void>;
  create: (input: NewGroupInput) => Promise<boolean>;
  update: (id: number, input: Partial<Omit<NewGroupInput, "memberIds">>) => Promise<boolean>;
  addMembers: (id: number, userIds: number[]) => Promise<boolean>;
  /** Leave (own id) or remove someone (owner). */
  removeMember: (id: number, userId: number, isMe: boolean) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useGroupStore = create<GroupStoreState>()((set, get) => {
  /** Runs an action; a returned group detail replaces the open one. */
  const run = async (call: ApiCall, failMessage: string) => {
    try {
      const res = await call();
      if (res?.data?.message) toast.success(res.data.message);
      const detail = res?.data?.data as GroupDetail | undefined;
      if (detail && "members" in detail) set({ detail, openId: detail.id });
      get().loadGroups(true);
      return true;
    } catch (err) {
      toast.error(apiErrorMessage(err, failMessage));
      return false;
    }
  };

  const close = () => set({ openId: null, detail: null });

  return {
    groups: [],
    loadedAt: 0,
    isLoading: false,
    openId: null,
    detail: null,

    loadGroups: async (force = false) => {
      if (!force && isFresh(get().loadedAt)) return;
      set({ isLoading: true, loadedAt: Date.now() });
      try {
        const res = await groupsApi.list();
        set({ groups: res.data.data ?? [] });
      } catch {
        // keep what we have
      } finally {
        set({ isLoading: false });
      }
    },

    open: async (id) => {
      set({ openId: id, detail: id && get().detail?.id === id ? get().detail : null });
      if (!id) return;
      try {
        const res = await groupsApi.get(id);
        if (get().openId === id) set({ detail: res.data.data });
      } catch (err) {
        toast.error(apiErrorMessage(err, "Couldn't open the group."));
        close();
      }
    },

    create: (input) => run(() => groupsApi.create(input), "Couldn't create the group."),
    update: (id, input) => run(() => groupsApi.update(id, input), "Couldn't save the group."),
    addMembers: (id, userIds) => run(() => groupsApi.addMembers(id, userIds), "Couldn't add them."),

    removeMember: async (id, userId, isMe) => {
      const ok = await run(() => groupsApi.removeMember(id, userId), "Couldn't update the group.");
      if (!ok) return;
      if (isMe) close();
      else get().open(id);
    },

    remove: async (id) => {
      if (await run(() => groupsApi.remove(id), "Couldn't delete the group.")) close();
    },
  };
});
