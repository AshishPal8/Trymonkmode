import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import confetti from "canvas-confetti";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Confetti burst for milestone accomplishments
export function triggerCelebrationConfetti() {
  if (typeof window === "undefined") return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#0052FF", "#FF5C39", "#22C55E", "#F59E0B", "#8B5CF6"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#0052FF", "#FF5C39", "#22C55E", "#F59E0B", "#8B5CF6"],
    });
  }, 250);
}

// Date helpers
export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** "2026-10-31" + 2 -> "2026-11-02" (local calendar days). */
export function addDaysTo(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d + n);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** "2026-10-29T21:47:05" in the browser's local time (no Z), so
 *  `startsWith(getTodayDateString())` matches the user's own day. */
export function toLocalIsoString(date: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}T${p(
    date.getHours(),
  )}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
}

export function formatDatePretty(dateString: string): string {
  if (!dateString) return "";
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return dateString;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** ₹ with Indian grouping: 150000 -> "₹1,50,000", 30.5 -> "₹30.50". */
export function formatCurrency(amount: number): string {
  const hasPaise = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Web Audio micro-chimes (zero asset dependencies)
class SoundFX {
  private audioCtx: AudioContext | null = null;

  private isSoundEnabled(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const rawStore = localStorage.getItem("trymonk_user_store");
      if (rawStore) {
        const parsed = JSON.parse(rawStore);
        if (parsed?.state?.user?.soundEffects === false) {
          return false;
        }
      }
    } catch {}
    return true;
  }

  private init() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
  }

  playCheckSound() {
    if (!this.isSoundEnabled()) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(
        880,
        this.audioCtx.currentTime + 0.1,
      ); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 0.25,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch {
      // Audio playback silently guarded
    }
  }

  playTimerBell() {
    if (!this.isSoundEnabled()) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(
        659.25,
        this.audioCtx.currentTime + 0.2,
      ); // E5
      osc.frequency.exponentialRampToValueAtTime(
        783.99,
        this.audioCtx.currentTime + 0.4,
      ); // G5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioCtx.currentTime + 1.2,
      );

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 1.2);
    } catch {
      // Audio playback silently guarded
    }
  }
}

export const soundFX = new SoundFX();

/** The id the backend gave a newly created item (from `{ data: { id } }`). */
export function serverIdFrom(res: unknown): string | null {
  const id = (res as { data?: { data?: { id?: unknown } } })?.data?.data?.id;
  return id !== undefined && id !== null ? String(id) : null;
}

/** Data loaded within the last `maxAgeMs` doesn't need loading again. */
export const isFresh = (loadedAt: number, maxAgeMs = 60_000) => Date.now() - loadedAt < maxAgeMs;

/** Returns a copy of `list` with the item at `from` moved to `to`. */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** 95 -> "1h 35m", 30 -> "30m". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Compact form for small spaces: 45 -> "45m", 225 -> "3.8h". */
export function formatMinutesShort(min: number): string {
  return min < 60 ? `${min}m` : `${Number((min / 60).toFixed(1))}h`;
}

/** "12m left" from an ISO end time. */
export function minutesLeft(endsAt: string): string {
  const mins = Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 60_000));
  return `${mins}m left`;
}
