"use client";

import React from "react";
import { Copy, Eye, EyeOff, RefreshCw, Share2 } from "lucide-react";
import { useSocialStore } from "@/stores/socialStore";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { copyText, inviteLink } from "../friendHelpers";

const CONTROL = "h-9 rounded-xl text-xs";

/** Your username, your invite link and who can see your stats. */
export function YourProfileCard() {
  const { profile, setStatsVisibility, resetInvite } = useSocialStore();
  const { confirm, confirmDialog } = useConfirm();

  if (!profile) return null;
  const link = inviteLink(profile.inviteCode);
  const isPrivate = profile.statsVisibility === "private";

  const handleCopy = async () => {
    if (await copyText(link)) toast.success("Invite link copied.");
    else toast.error("Couldn't copy. Select the link and copy it.");
  };

  const handleShare = async () => {
    const text = "Join me on TryMonkMode. Let's keep each other focused 🔥";
    if (navigator.share) {
      await navigator.share({ title: "TryMonkMode", text, url: link }).catch(() => {});
    } else {
      await handleCopy();
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Create a new invite link?",
      description: "Your current link will stop working. Friends you already added stay.",
      confirmLabel: "New link",
    });
    if (ok) resetInvite();
  };

  return (
    <div className="ios-card rounded-3xl p-5 border border-border space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground">Your username</p>
        <p className="text-lg font-bold text-foreground">@{profile.username}</p>
        <p className="text-[11px] text-muted-foreground">Friends can add you by this name.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold text-muted-foreground">Your invite link</label>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy link"
          className="w-full flex items-center gap-2 px-3 h-9 rounded-xl border border-border bg-muted/40 hover:bg-muted/70 text-left cursor-pointer"
        >
          <span className="flex-1 truncate font-mono text-xs text-foreground">{link.replace(/^https?:\/\//, "")}</span>
          <Copy className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleShare} className={`${CONTROL} flex-1 gap-1.5`}>
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} className={`${CONTROL} px-3 gap-1.5`}>
            <RefreshCw className="w-3.5 h-3.5" /> New link
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Anyone who opens it becomes your friend. New sign-ups give you both +100 XP.
          {profile.referralCount > 0 && (
            <span className="font-semibold text-primary"> {profile.referralCount} joined so far 🎉</span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setStatsVisibility(isPrivate ? "public" : "private")}
        className="w-full flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/70 text-left cursor-pointer transition"
      >
        {isPrivate ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">
            {isPrivate ? "Your stats are private" : "Your stats are public"}
          </p>
          <p className="text-[11px] text-muted-foreground">{isPrivate ? "Hidden from friends and the leaderboard." : "Friends and the leaderboard see your streak, level and focus."} Tap to change.</p>
        </div>
      </button>

      {confirmDialog}
    </div>
  );
}
