"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { UnlockedBadge } from "@/lib/types";
import { achievementsApi } from "@/lib/api";
import { triggerCelebrationConfetti } from "@/lib/utils";
import { useAnalyticsStore } from "@/stores/analyticsStore";
import { useUserStore } from "@/stores/userStore";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/**
 * Shows a "Badge unlocked" popup. Checks when the app opens and whenever the
 * dashboard numbers refresh (which happens after tasks, habits and focus).
 */
export function AchievementUnlockWatcher() {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const addXP = useUserStore((s) => s.addXP);
  const [queue, setQueue] = useState<UnlockedBadge[]>([]);
  const isChecking = useRef(false);
  const lastCheckAt = useRef(0);

  const check = useCallback(async (runFullCheck = false) => {
    // Skip if one is running or just ran (e.g. the first dashboard load right after the open check).
    if (isChecking.current || Date.now() - lastCheckAt.current < 4000) return;
    isChecking.current = true;
    lastCheckAt.current = Date.now();
    try {
      const res = await achievementsApi.unseen(runFullCheck);
      const badges: UnlockedBadge[] = res.data.data ?? [];
      if (badges.length) {
        setQueue(badges);
        triggerCelebrationConfetti();
        addXP(badges.reduce((sum, b) => sum + b.xpReward, 0)); // the server already added it
      }
    } catch {
      // try again on the next refresh
    } finally {
      isChecking.current = false;
    }
  }, [addXP]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // On open: a full check (catches anything earned while away). After that, a
    // cheap read whenever the dashboard numbers change, since the server unlocks
    // badges itself right after activity is saved.
    const initial = setTimeout(() => check(true), 1500);
    let pending: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = useAnalyticsStore.subscribe((state, prev) => {
      if (state.analyticsData === prev.analyticsData) return;
      clearTimeout(pending);
      pending = setTimeout(() => check(), 2500); // after the server's 2-second check
    });
    return () => {
      clearTimeout(initial);
      clearTimeout(pending);
      unsubscribe();
    };
  }, [isAuthenticated, check]);

  if (queue.length === 0) return null;

  const close = () => {
    achievementsApi.markSeen(queue.map((b) => b.id)).catch(() => {});
    setQueue([]);
  };

  return (
    <Modal isOpen onClose={close} title={queue.length === 1 ? "Badge unlocked!" : `${queue.length} badges unlocked!`} maxWidth="sm">
      <div className="space-y-3 pt-1">
        {queue.map((badge) => (
          <div key={badge.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
            <span className="text-4xl">{badge.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
            {badge.xpReward > 0 && <span className="text-xs font-bold text-primary shrink-0">+{badge.xpReward} XP</span>}
          </div>
        ))}
        <Button onClick={close} size="lg" className="w-full">
          Nice!
        </Button>
      </div>
    </Modal>
  );
}
