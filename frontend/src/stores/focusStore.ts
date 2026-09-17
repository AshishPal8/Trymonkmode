import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { FocusSession } from "@/lib/types";
import { soundFX, triggerCelebrationConfetti, getTodayDateString } from "@/lib/utils";
import { triggerTimerCompletionAlert, AmbientSoundType } from "@/lib/audio";
import { useUserStore } from "./userStore";
import { useAnalyticsStore } from "./analyticsStore";

export interface DayFocusStat {
  date: string;       // YYYY-MM-DD
  dayName: string;   // Monday, Tuesday, ...
  shortDay: string;  // Mon, Tue, ...
  fullDate: string;  // Sep 17
  minutes: number;
  sessionsCount: number;
  isToday: boolean;
}

export interface FocusStoreState {
  // Session history
  focusSessions: FocusSession[];

  // Timer configuration & modes
  activeTab: 'pomodoro' | 'stopwatch';
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  durationMins: { pomodoro: number; shortBreak: number; longBreak: number };
  currentTag: string;

  // Background/Persistent Timer State
  isRunning: boolean;
  targetEndTime: number | null; // Exact epoch timestamp ms when timer expires
  pausedTimeLeft: number;        // Remaining seconds when paused
  sessionStartTime: number | null; // Epoch timestamp ms when current session began

  // Stopwatch Persistent State
  isStopwatchRunning: boolean;
  stopwatchStartTime: number | null;
  stopwatchPausedElapsed: number;

  // Media presets
  activeAmbient: AmbientSoundType;
  ambientVolume: number;
  spotifyUri: string;
  customSpotifyUrl: string;

  // Actions
  setActiveTab: (tab: 'pomodoro' | 'stopwatch') => void;
  setMode: (mode: 'pomodoro' | 'shortBreak' | 'longBreak') => void;
  setSprintDuration: (mins: number) => void;
  setCurrentTag: (tag: string) => void;
  
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: (savePartial?: boolean) => void;
  completeTimerSession: () => void;

  startStopwatch: () => void;
  pauseStopwatch: () => void;
  resetStopwatch: () => void;

  setActiveAmbient: (type: AmbientSoundType) => void;
  setAmbientVolume: (vol: number) => void;
  setSpotifyUri: (uri: string) => void;
  setCustomSpotifyUrl: (url: string) => void;

  setFocusSessions: (sessions: FocusSession[]) => void;
  logFocusSession: (session: Omit<FocusSession, "id">) => void;

  // Analytics Helpers
  getRemainingSeconds: () => number;
  getStopwatchElapsedMs: () => number;
  getTodayFocusMinutes: () => number;
  getPast7DaysFocus: () => DayFocusStat[];
  get7DayTotalMinutes: () => number;
  getDailyAverageMinutes: () => number;
  getFocusStreak: () => number;
}

export const useFocusStore = create<FocusStoreState>()(
  persist(
    (set, get) => ({
      focusSessions: [],

      activeTab: 'pomodoro',
      mode: 'pomodoro',
      durationMins: { pomodoro: 25, shortBreak: 5, longBreak: 15 },
      currentTag: 'Deep Work',

      isRunning: false,
      targetEndTime: null,
      pausedTimeLeft: 25 * 60,
      sessionStartTime: null,

      isStopwatchRunning: false,
      stopwatchStartTime: null,
      stopwatchPausedElapsed: 0,

      activeAmbient: 'none',
      ambientVolume: 0.5,
      spotifyUri: 'playlist/37i9dQZF1DX8Uebhn9wzrS',
      customSpotifyUrl: '',

      setActiveTab: (tab) => set({ activeTab: tab }),

      setMode: (newMode) => {
        const { durationMins } = get();
        set({
          mode: newMode,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          pausedTimeLeft: durationMins[newMode] * 60,
        });
      },

      setSprintDuration: (mins) => {
        const { mode, isRunning } = get();
        set((state) => ({
          durationMins: { ...state.durationMins, pomodoro: mins },
          ...(mode === 'pomodoro' && !isRunning
            ? { pausedTimeLeft: mins * 60, targetEndTime: null }
            : {}),
        }));
      },

      setCurrentTag: (tag) => set({ currentTag: tag }),

      startTimer: () => {
        const { isRunning, pausedTimeLeft, durationMins, mode, sessionStartTime } = get();
        if (isRunning) return;

        const secondsToRun = pausedTimeLeft > 0 ? pausedTimeLeft : durationMins[mode] * 60;
        const targetEndTime = Date.now() + secondsToRun * 1000;

        set({
          isRunning: true,
          targetEndTime,
          sessionStartTime: sessionStartTime || Date.now(),
        });
      },

      pauseTimer: () => {
        const { isRunning, targetEndTime } = get();
        if (!isRunning || !targetEndTime) return;

        const remaining = Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        set({
          isRunning: false,
          targetEndTime: null,
          pausedTimeLeft: remaining,
        });
      },

      resetTimer: (savePartial = true) => {
        const { sessionStartTime, isRunning, mode, currentTag, durationMins, logFocusSession } = get();
        
        // If user was actively focusing and reset, save partial focus if >= 1 minute
        if (savePartial && sessionStartTime && isRunning && mode === 'pomodoro') {
          const elapsedSecs = Math.floor((Date.now() - sessionStartTime) / 1000);
          const elapsedMins = Math.floor(elapsedSecs / 60);
          if (elapsedMins >= 1) {
            logFocusSession({
              durationMinutes: elapsedMins,
              mode: 'pomodoro',
              tag: currentTag,
              timestamp: new Date().toISOString(),
            });
          }
        }

        set({
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          pausedTimeLeft: durationMins[mode] * 60,
        });
      },

      completeTimerSession: () => {
        const { mode, durationMins, currentTag, logFocusSession } = get();

        // 1. Log completed session
        if (mode === 'pomodoro') {
          logFocusSession({
            durationMinutes: durationMins.pomodoro,
            mode: 'pomodoro',
            tag: currentTag,
            timestamp: new Date().toISOString(),
          });
        }

        // 2. Play audio feedback & alert
        triggerTimerCompletionAlert(mode !== 'pomodoro');
        triggerCelebrationConfetti();

        // 3. Trigger OS Notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(mode === 'pomodoro' ? '🎯 Focus Sprint Complete!' : '☕ Break Finished!', {
              body:
                mode === 'pomodoro'
                  ? `Phenomenal discipline! Your ${durationMins.pomodoro}-minute deep work session has ended.`
                  : 'Break time is over. Ready to step back into the zone?',
              icon: '/favicon.ico',
            });
          } catch (e) {
            console.warn('Notification error:', e);
          }
        }

        // 4. Auto switch to next mode or reset
        const nextMode = mode === 'pomodoro' ? 'shortBreak' : 'pomodoro';
        set({
          mode: nextMode,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          pausedTimeLeft: durationMins[nextMode] * 60,
        });
      },

      startStopwatch: () => {
        const { isStopwatchRunning, stopwatchPausedElapsed } = get();
        if (isStopwatchRunning) return;

        set({
          isStopwatchRunning: true,
          stopwatchStartTime: Date.now() - stopwatchPausedElapsed,
        });
      },

      pauseStopwatch: () => {
        const { isStopwatchRunning, stopwatchStartTime } = get();
        if (!isStopwatchRunning || !stopwatchStartTime) return;

        set({
          isStopwatchRunning: false,
          stopwatchPausedElapsed: Date.now() - stopwatchStartTime,
          stopwatchStartTime: null,
        });
      },

      resetStopwatch: () => {
        set({
          isStopwatchRunning: false,
          stopwatchStartTime: null,
          stopwatchPausedElapsed: 0,
        });
      },

      setActiveAmbient: (type) => set({ activeAmbient: type }),
      setAmbientVolume: (vol) => set({ ambientVolume: vol }),
      setSpotifyUri: (uri) => set({ spotifyUri: uri }),
      setCustomSpotifyUrl: (url) => set({ customSpotifyUrl: url }),

      setFocusSessions: (sessions) => set({ focusSessions: sessions }),

      logFocusSession: (session) => {
        const newSession: FocusSession = { ...session, id: `fs-${Date.now()}` };
        set((state) => ({
          focusSessions: [newSession, ...state.focusSessions],
        }));
        soundFX.playTimerBell();
        useUserStore.getState().addXP(50);
        useAnalyticsStore.getState().fetchAnalytics();
      },

      getRemainingSeconds: () => {
        const { isRunning, targetEndTime, pausedTimeLeft } = get();
        if (isRunning && targetEndTime) {
          return Math.max(0, Math.ceil((targetEndTime - Date.now()) / 1000));
        }
        return pausedTimeLeft;
      },

      getStopwatchElapsedMs: () => {
        const { isStopwatchRunning, stopwatchStartTime, stopwatchPausedElapsed } = get();
        if (isStopwatchRunning && stopwatchStartTime) {
          return Date.now() - stopwatchStartTime;
        }
        return stopwatchPausedElapsed;
      },

      getTodayFocusMinutes: () => {
        const todayStr = getTodayDateString();
        const { focusSessions } = get();
        return focusSessions
          .filter((s) => (s.timestamp || s.date || s.completedAt || '').startsWith(todayStr))
          .reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      },

      getPast7DaysFocus: () => {
        const { focusSessions } = get();
        const days: DayFocusStat[] = [];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const today = new Date();

        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);

          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const daySessions = focusSessions.filter((s) =>
            (s.timestamp || s.date || s.completedAt || '').startsWith(dateStr)
          );
          const totalMins = daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

          days.push({
            date: dateStr,
            dayName: dayNames[d.getDay()],
            shortDay: shortDays[d.getDay()],
            fullDate: `${monthNames[d.getMonth()]} ${d.getDate()}`,
            minutes: totalMins,
            sessionsCount: daySessions.length,
            isToday: i === 0,
          });
        }

        return days;
      },

      get7DayTotalMinutes: () => {
        const past7Days = get().getPast7DaysFocus();
        return past7Days.reduce((acc, d) => acc + d.minutes, 0);
      },

      getDailyAverageMinutes: () => {
        const total = get().get7DayTotalMinutes();
        return Math.round(total / 7);
      },

      getFocusStreak: () => {
        const { focusSessions } = get();
        if (focusSessions.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const hasSession = focusSessions.some((s) =>
            (s.timestamp || s.date || s.completedAt || '').startsWith(dateStr)
          );
          if (hasSession) {
            streak++;
          } else if (i === 0) {
            // If no session yet today, don't break streak from yesterday
            continue;
          } else {
            break;
          }
        }
        return streak;
      },
    }),
    {
      name: "trymonk_focus_store",
      storage: createEncryptedStorage(),
    },
  ),
);
