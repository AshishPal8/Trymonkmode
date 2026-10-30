import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEncryptedStorage } from "@/lib/encryptedStorage";
import { FocusSession } from "@/lib/types";
import { soundFX, triggerCelebrationConfetti, getTodayDateString, toLocalIsoString } from "@/lib/utils";
import { focusApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { triggerTimerCompletionAlert, AmbientSoundType } from "@/lib/audio";
import { useUserStore } from "./userStore";
import { useAnalyticsStore } from "./analyticsStore";
import { useTaskStore } from "./taskStore";
import { useGoalsStore } from "./goalsStore";

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
  /** Task this session is for (time is counted toward it and its goal). */
  currentTaskId: string | null;
  currentTaskTitle: string | null;
  /** Thoughts jotted down during the current session. */
  distractionNotes: string[];
  /** Start the break automatically when focus ends (and focus after a break). */
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  /** Focus sessions finished since the last long break (long break every 4). */
  sessionsSinceLongBreak: number;

  // Background/Persistent Timer State
  isRunning: boolean;
  targetEndTime: number | null; // Exact epoch timestamp ms when timer expires
  pausedTimeLeft: number;        // Remaining seconds when paused
  sessionStartTime: number | null; // Epoch timestamp ms when current session began
  sessionTotalSecs: number | null; // Planned length of the current session, fixed at start

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
  setCurrentTask: (task: { id: string; title: string } | null) => void;
  addDistractionNote: (note: string) => void;
  removeDistractionNote: (index: number) => void;
  setAutoStart: (opts: { breaks?: boolean; focus?: boolean }) => void;
  
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
  /** Saves the current focus session (actual focused time, pauses excluded)
   *  if at least 1 minute was focused. Safe to call when nothing is running. */
  saveCurrentFocus: (completed: boolean) => void;

  // Analytics Helpers
  getRemainingSeconds: () => number;
  getStopwatchElapsedMs: () => number;
  getTodayFocusMinutes: () => number;
  getPast7DaysFocus: () => DayFocusStat[];
  get7DayTotalMinutes: () => number;
  getDailyAverageMinutes: () => number;
  getFocusStreak: () => number;
}


// ─── Pure stats helpers ──────────────────────────────────────────────────────
// Components should call these with `focusSessions` (not the store getters):
// the React Compiler caches calls by their inputs, so a getter with no
// arguments would keep showing stale numbers after sessions load.

const sessionDay = (s: FocusSession) => (s.timestamp || s.date || s.completedAt || "").slice(0, 10);

const localDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function todayFocusMinutes(sessions: FocusSession[]): number {
  const today = getTodayDateString();
  return sessions.filter((s) => sessionDay(s) === today).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
}

export function past7DaysFocus(sessions: FocusSession[]): DayFocusStat[] {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days: DayFocusStat[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = localDateStr(d);
    const daySessions = sessions.filter((s) => sessionDay(s) === dateStr);
    days.push({
      date: dateStr,
      dayName: dayNames[d.getDay()],
      shortDay: shortDays[d.getDay()],
      fullDate: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      minutes: daySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
      sessionsCount: daySessions.length,
      isToday: i === 0,
    });
  }
  return days;
}

export function focusStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map(sessionDay));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (days.has(localDateStr(d))) streak++;
    else if (i === 0) continue; // no session yet today doesn't break yesterday's streak
    else break;
  }
  return streak;
}

export const useFocusStore = create<FocusStoreState>()(
  persist(
    (set, get) => ({
      focusSessions: [],

      activeTab: 'pomodoro',
      mode: 'pomodoro',
      durationMins: { pomodoro: 25, shortBreak: 5, longBreak: 15 },
      currentTag: 'Deep Work',
      currentTaskId: null,
      currentTaskTitle: null,
      distractionNotes: [],
      autoStartBreaks: false,
      autoStartFocus: false,
      sessionsSinceLongBreak: 0,

      isRunning: false,
      targetEndTime: null,
      pausedTimeLeft: 25 * 60,
      sessionStartTime: null,
      sessionTotalSecs: null,

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
        // Switching tabs mid-session used to throw the session away.
        get().saveCurrentFocus(false);
        set({
          mode: newMode,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          sessionTotalSecs: null,
          pausedTimeLeft: durationMins[newMode] * 60,
        });
      },

      setSprintDuration: (mins) => {
        const { mode, isRunning } = get();
        // Changing the length while paused resets the timer, so keep what was done.
        if (mode === 'pomodoro' && !isRunning) {
          get().saveCurrentFocus(false);
          set({ sessionStartTime: null, sessionTotalSecs: null });
        }
        set((state) => ({
          durationMins: { ...state.durationMins, pomodoro: mins },
          ...(mode === 'pomodoro' && !isRunning
            ? { pausedTimeLeft: mins * 60, targetEndTime: null }
            : {}),
        }));
      },

      setCurrentTag: (tag) => set({ currentTag: tag }),
      setCurrentTask: (task) =>
        set({ currentTaskId: task?.id || null, currentTaskTitle: task?.title || null }),
      addDistractionNote: (note) => {
        const clean = note.trim().slice(0, 300);
        if (clean) set((st) => ({ distractionNotes: [...st.distractionNotes, clean].slice(-20) }));
      },
      removeDistractionNote: (index) =>
        set((st) => ({ distractionNotes: st.distractionNotes.filter((_, i) => i !== index) })),
      setAutoStart: ({ breaks, focus }) =>
        set((st) => ({
          autoStartBreaks: breaks ?? st.autoStartBreaks,
          autoStartFocus: focus ?? st.autoStartFocus,
        })),

      startTimer: () => {
        const { isRunning, pausedTimeLeft, durationMins, mode, sessionStartTime } = get();
        if (isRunning) return;

        const secondsToRun = pausedTimeLeft > 0 ? pausedTimeLeft : durationMins[mode] * 60;
        const targetEndTime = Date.now() + secondsToRun * 1000;

        const isNewSession = !sessionStartTime;
        set({
          isRunning: true,
          targetEndTime,
          sessionStartTime: sessionStartTime || Date.now(),
          ...(isNewSession ? { sessionTotalSecs: secondsToRun } : {}),
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
        const { mode, durationMins } = get();

        // Save what was focused, even if the timer was paused before reset.
        if (savePartial) get().saveCurrentFocus(false);

        set({
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          sessionTotalSecs: null,
          pausedTimeLeft: durationMins[mode] * 60,
        });
      },

      completeTimerSession: () => {
        const { mode, durationMins } = get();

        // 1. Log the session with the time actually focused. The "skip" button
        //    also calls this, and used to log the full length even if you
        //    stopped at 15 minutes.
        const ranFullLength = get().getRemainingSeconds() <= 0;
        get().saveCurrentFocus(ranFullLength);

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

        // 4. Next mode: a long break after every 4th focus session
        const finishedFocus = mode === 'pomodoro';
        const since = finishedFocus ? get().sessionsSinceLongBreak + 1 : get().sessionsSinceLongBreak;
        const nextMode =
          !finishedFocus ? 'pomodoro' : since >= 4 ? 'longBreak' : 'shortBreak';
        set({
          mode: nextMode,
          isRunning: false,
          targetEndTime: null,
          sessionStartTime: null,
          sessionTotalSecs: null,
          pausedTimeLeft: durationMins[nextMode] * 60,
          sessionsSinceLongBreak: nextMode === 'longBreak' ? 0 : since,
        });

        // 5. Optionally keep the cycle going on its own
        const { autoStartBreaks, autoStartFocus } = get();
        if ((nextMode !== 'pomodoro' && autoStartBreaks) || (nextMode === 'pomodoro' && autoStartFocus)) {
          get().startTimer();
        }
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
        // Show XP right away; the server adds the same amount (2 XP per minute).
        useUserStore.getState().addXP((session.durationMinutes || 0) * 2);
      },

      saveCurrentFocus: (completed) => {
        const {
          mode,
          sessionStartTime,
          sessionTotalSecs,
          durationMins,
          currentTag,
          currentTaskId,
          currentTaskTitle,
          distractionNotes,
        } = get();
        if (mode !== 'pomodoro' || !sessionStartTime) return;

        const plannedSecs = sessionTotalSecs ?? durationMins.pomodoro * 60;
        const focusedSecs = completed
          ? plannedSecs
          : Math.max(0, plannedSecs - get().getRemainingSeconds());
        const minutes = Math.round(focusedSecs / 60);
        if (minutes < 1) return; // under ~30 seconds: not worth saving

        const endedAt = new Date();
        const notes = distractionNotes.join('\n') || undefined;
        // Only real (server) task ids can be linked.
        const taskId = currentTaskId && /^\d+$/.test(currentTaskId) ? Number(currentTaskId) : undefined;
        get().logFocusSession({
          durationMinutes: minutes,
          mode: 'pomodoro',
          tag: currentTag,
          taskTitle: currentTaskTitle || undefined,
          notes,
          completed,
          timestamp: toLocalIsoString(endedAt),
        });
        set({ distractionNotes: [] });

        focusApi
          .createSession({
            durationMinutes: minutes,
            plannedMinutes: Math.max(1, Math.round(plannedSecs / 60)),
            completed,
            mode: 'pomodoro',
            tag: currentTag || 'Deep Work',
            taskId,
            notes,
            startedAt: new Date(sessionStartTime).toISOString(),
            endedAt: endedAt.toISOString(),
          })
          .then(() => {
            useAnalyticsStore.getState().fetchAnalytics();
            // Time on a task counts toward its goal.
            if (taskId) {
              const goalId = useTaskStore.getState().tasks.find((t) => t.id === String(taskId))?.goalId;
              if (goalId) useGoalsStore.getState().refreshGoal(goalId);
            }
          })
          .catch(() => {
            toast.error("Couldn't save this focus session to your account.");
          });
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

      getTodayFocusMinutes: () => todayFocusMinutes(get().focusSessions),
      getPast7DaysFocus: () => past7DaysFocus(get().focusSessions),
      get7DayTotalMinutes: () => past7DaysFocus(get().focusSessions).reduce((acc, d) => acc + d.minutes, 0),
      getDailyAverageMinutes: () =>
        Math.round(past7DaysFocus(get().focusSessions).reduce((acc, d) => acc + d.minutes, 0) / 7),
      getFocusStreak: () => focusStreak(get().focusSessions),
    }),
    {
      name: "trymonk_focus_store",
      storage: createEncryptedStorage(),
    },
  ),
);
