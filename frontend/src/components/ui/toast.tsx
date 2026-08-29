"use client";

import React from "react";
import { create } from "zustand";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message, duration = 2800) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastItem = { id, type, message, duration };

    set((state) => ({
      // Keep at most 3 active toasts at a time
      toasts: [...state.toasts.slice(-2), newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (message: string, duration?: number) =>
    useToastStore.getState().addToast("success", message, duration),
  error: (message: string, duration?: number) =>
    useToastStore.getState().addToast("error", message, duration),
  warning: (message: string, duration?: number) =>
    useToastStore.getState().addToast("warning", message, duration),
  info: (message: string, duration?: number) =>
    useToastStore.getState().addToast("info", message, duration),
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      className="fixed z-[9999] pointer-events-none flex flex-col gap-2.5 transition-all duration-300
        /* Mobile: Top Right */
        top-4 right-4 items-end
        /* Desktop/Tablet: Center Bottom */
        sm:top-auto sm:right-auto sm:bottom-7 sm:left-1/2 sm:-translate-x-1/2 sm:items-center"
    >
      {toasts.map((t) => {
        const config = {
          success: {
            icon: CheckCircle2,
            iconColor: "text-emerald-300",
            bgGradient:
              "bg-gradient-to-r from-[#031810]/95 via-[#06291b]/92 to-[#031810]/95",
            borderColor: "border-emerald-500/40",
            glow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_12px_32px_rgba(0,0,0,0.65),0_0_24px_rgba(16,185,129,0.22)]",
            iconBadge:
              "bg-emerald-500/25 border border-emerald-400/40 shadow-xs shadow-emerald-500/30",
            topSheen: "before:via-emerald-300/60",
            textColor: "text-emerald-50/95",
          },
          error: {
            icon: AlertCircle,
            iconColor: "text-rose-300",
            bgGradient:
              "bg-gradient-to-r from-[#190407]/95 via-[#2b080e]/92 to-[#190407]/95",
            borderColor: "border-rose-500/40",
            glow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_12px_32px_rgba(0,0,0,0.65),0_0_24px_rgba(244,63,94,0.22)]",
            iconBadge:
              "bg-rose-500/25 border border-rose-400/40 shadow-xs shadow-rose-500/30",
            topSheen: "before:via-rose-300/60",
            textColor: "text-rose-50/95",
          },
          warning: {
            icon: AlertTriangle,
            iconColor: "text-amber-300",
            bgGradient:
              "bg-gradient-to-r from-[#1a1103]/95 via-[#2b1c06]/92 to-[#1a1103]/95",
            borderColor: "border-amber-500/40",
            glow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_12px_32px_rgba(0,0,0,0.65),0_0_24px_rgba(245,158,11,0.22)]",
            iconBadge:
              "bg-amber-500/25 border border-amber-400/40 shadow-xs shadow-amber-500/30",
            topSheen: "before:via-amber-300/60",
            textColor: "text-amber-50/95",
          },
          info: {
            icon: Sparkles,
            iconColor: "text-[#93C5FD]",
            bgGradient:
              "bg-gradient-to-r from-[#030d1c]/95 via-[#061833]/92 to-[#030d1c]/95",
            borderColor: "border-[#0052FF]/40",
            glow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_12px_32px_rgba(0,0,0,0.65),0_0_24px_rgba(0,82,255,0.22)]",
            iconBadge:
              "bg-[#0052FF]/25 border border-blue-400/40 shadow-xs shadow-blue-500/30",
            topSheen: "before:via-blue-300/60",
            textColor: "text-blue-50/95",
          },
        }[t.type];

        const Icon = config.icon;

        return (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto relative flex items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-full
              ${config.bgGradient} backdrop-blur-3xl border ${config.borderColor} ${config.glow}
              transition-all duration-300 transform animate-in fade-in-0 slide-in-from-bottom-3 duration-200 select-none
              before:absolute before:inset-x-6 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent ${config.topSheen} before:to-transparent before:opacity-80`}
          >
            <div className={`p-1 rounded-full ${config.iconBadge} shrink-0`}>
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>

            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight ${config.textColor} max-w-[220px] sm:max-w-md truncate`}
            >
              {t.message}
            </span>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 -mr-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
