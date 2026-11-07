import { create } from "zustand";
import { AnalyticsData } from "@/lib/types";
import { analyticsApi } from "@/lib/api";

/** Refresh requests within this window are merged into one call. */
const MERGE_WINDOW_MS = 600;

export interface AnalyticsStoreState {
  analyticsData: AnalyticsData | null;
  setAnalyticsData: (data: AnalyticsData | null) => void;
  /**
   * Reloads the dashboard numbers. Safe to call often: calls that arrive
   * together (e.g. ticking three tasks) become a single request, and only
   * one request runs at a time.
   */
  fetchAnalytics: () => Promise<void>;
  /** For opening a page: skipped if the numbers loaded in the last 30 seconds. */
  ensureAnalytics: () => Promise<void>;
}

const FRESH_MS = 30_000;
let loadedAt = 0;

let timer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
let waiting: Promise<void> | null = null;

export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => {
  const load = async () => {
    try {
      const res = await analyticsApi.getAnalytics();
      if (res?.data?.data) {
        set({ analyticsData: res.data.data });
        loadedAt = Date.now();
      }
    } catch {
      // keep the last numbers
    }
  };

  return {
    analyticsData: null,

    setAnalyticsData: (data) => set({ analyticsData: data }),

    fetchAnalytics: () => {
      waiting ??= new Promise<void>((resolve) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(async () => {
          timer = null;
          waiting = null;
          if (inFlight) await inFlight; // never two at once
          inFlight = load();
          await inFlight;
          inFlight = null;
          resolve();
        }, MERGE_WINDOW_MS);
      });
      return waiting;
    },

    ensureAnalytics: () => {
      if (waiting || inFlight) return waiting ?? inFlight!;
      if (Date.now() - loadedAt < FRESH_MS) return Promise.resolve();
      return get().fetchAnalytics();
    },
  };
});
