import { create } from "zustand";
import { AnalyticsData } from "@/lib/types";
import { analyticsApi } from "@/lib/api";

export interface AnalyticsStoreState {
  analyticsData: AnalyticsData | null;
  setAnalyticsData: (data: AnalyticsData | null) => void;
  fetchAnalytics: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  analyticsData: null,

  setAnalyticsData: (data: AnalyticsData | null) =>
    set({ analyticsData: data }),

  fetchAnalytics: async () => {
    try {
      const res = await analyticsApi.getAnalytics();
      if (res?.data?.data) {
        set({ analyticsData: res.data.data });
      }
    } catch {}
  },
}));
