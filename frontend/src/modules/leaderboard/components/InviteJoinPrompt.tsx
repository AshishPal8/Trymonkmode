"use client";

import React, { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { UserPlus } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { socialApi } from "@/lib/api";
import { clearPendingInvite, getPendingInvite } from "@/lib/pendingInvite";
import { useSocialStore } from "@/stores/socialStore";
import { useUIStore } from "@/stores/uiStore";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { displayName, handle } from "../friendHelpers";

/**
 * Shown once after sign-in when the user arrived through a friend's invite
 * link: "Asha invited you. Add as friend?"
 */
export function InviteJoinPrompt() {
  const joinInvite = useSocialStore((s) => s.joinInvite);
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const [code] = useState(getPendingInvite);
  const [inviter, setInviter] = useState<PublicUser | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!code) return;
    socialApi
      .previewInvite(code)
      .then((res) => setInviter(res.data.data))
      .catch((err) => {
        // Dead or own link: forget it quietly. Keep it on other errors
        // (e.g. signed out or offline) so it works after the next sign-in.
        const status = (err as AxiosError)?.response?.status;
        if (status === 400 || status === 404) clearPendingInvite();
      });
  }, [code]);

  if (!code || !inviter) return null;

  const close = () => {
    clearPendingInvite();
    setInviter(null);
  };

  const handleJoin = async () => {
    setIsJoining(true);
    const ok = await joinInvite(code);
    setIsJoining(false);
    close();
    if (ok) setActiveModule("leaderboard");
  };

  return (
    <Modal isOpen onClose={close} title="You've been invited" icon={<UserPlus className="w-4 h-4" />} maxWidth="sm">
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <UserAvatar name={displayName(inviter)} avatarUrl={inviter.avatar} size="lg" />
        <div>
          <p className="text-sm font-bold text-foreground">{displayName(inviter)}</p>
          {handle(inviter) && <p className="text-xs text-muted-foreground">{handle(inviter)}</p>}
        </div>
        <p className="text-xs text-muted-foreground">
          wants to be your friend on TryMonkMode. You&apos;ll see each other&apos;s streaks and focus time.
        </p>
        <div className="flex gap-2 w-full pt-1">
          <Button variant="ghost" onClick={close} className="flex-1 text-xs">
            Not now
          </Button>
          <Button onClick={handleJoin} disabled={isJoining} className="flex-1 text-xs">
            {isJoining ? "Adding…" : "Add friend"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
