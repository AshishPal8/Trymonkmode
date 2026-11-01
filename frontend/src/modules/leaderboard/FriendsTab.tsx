"use client";

import React, { useEffect } from "react";
import { Check, Users, X } from "lucide-react";
import type { PublicUser } from "@/lib/types";
import { useSocialStore } from "@/stores/socialStore";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { displayName } from "./friendHelpers";
import { YourProfileCard } from "./components/YourProfileCard";
import { AddFriendForm } from "./components/AddFriendForm";
import { FriendCard } from "./components/FriendCard";
import { PersonRow } from "./components/PersonRow";
import { apiErrorMessage, socialApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";

const SMALL_BUTTON = "h-8 rounded-xl text-xs px-3";

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
        {count ? ` · ${count}` : ""}
      </h3>
      {children}
    </section>
  );
}

/** Your friends, requests, invite link and privacy. */
export function FriendsTab() {
  const { friendsData, isLoading, load, accept, decline, remove, block, unblock } = useSocialStore();
  const { confirm, confirmDialog } = useConfirm();
  const { friends, incoming, outgoing, blocked } = friendsData;

  useEffect(() => {
    load();
  }, [load]);

  const nudge = async (userId: number) => {
    try {
      const res = await socialApi.nudge(userId);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't send the nudge."));
    }
  };

  const confirmRemove = async (user: PublicUser) => {
    const ok = await confirm({
      title: `Remove ${displayName(user)}?`,
      description: "You'll stop seeing each other's stats. You can add them again later.",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) remove(user.id);
  };

  const confirmBlock = async (user: PublicUser) => {
    const ok = await confirm({
      title: `Block ${displayName(user)}?`,
      description: "They'll be removed from your friends and can't send you requests. They won't be told.",
      confirmLabel: "Block",
      destructive: true,
    });
    if (ok) block(user.id);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-4 lg:order-2">
          <YourProfileCard />
        </div>

        <div className="lg:col-span-2 space-y-5 lg:order-1">
          <AddFriendForm />

          {incoming.length > 0 && (
            <Section title="Requests" count={incoming.length}>
              <div className="ios-card rounded-2xl px-3 border border-border divide-y divide-border">
                {incoming.map((u) => (
                  <PersonRow key={u.id} user={u}>
                    <Button onClick={() => accept(u.id)} className={`${SMALL_BUTTON} gap-1`}>
                      <Check className="w-3.5 h-3.5" /> Accept
                    </Button>
                    <Button variant="ghost" onClick={() => decline(u.id)} aria-label="Decline" className={`${SMALL_BUTTON} px-2`}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </PersonRow>
                ))}
              </div>
            </Section>
          )}

          <Section title="Friends" count={friends.length}>
            {friends.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border/80">
                <Users className="w-6 h-6 mx-auto mb-2 opacity-50" />
                {isLoading ? "Loading…" : "No friends yet. Share your invite link: it's more fun to focus together."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friends.map((f) => (
                  <FriendCard
                    key={f.id}
                    friend={f}
                    onRemove={() => confirmRemove(f)}
                    onBlock={() => confirmBlock(f)}
                    onNudge={() => nudge(f.id)}
                  />
                ))}
              </div>
            )}
          </Section>

          {outgoing.length > 0 && (
            <Section title="Sent" count={outgoing.length}>
              <div className="ios-card rounded-2xl px-3 border border-border divide-y divide-border">
                {outgoing.map((u) => (
                  <PersonRow key={u.id} user={u}>
                    <Button variant="ghost" onClick={() => remove(u.id)} className={SMALL_BUTTON}>
                      Cancel
                    </Button>
                  </PersonRow>
                ))}
              </div>
            </Section>
          )}

          {blocked.length > 0 && (
            <Section title="Blocked" count={blocked.length}>
              <div className="ios-card rounded-2xl px-3 border border-border divide-y divide-border">
                {blocked.map((u) => (
                  <PersonRow key={u.id} user={u}>
                    <Button variant="ghost" onClick={() => unblock(u.id)} className={SMALL_BUTTON}>
                      Unblock
                    </Button>
                  </PersonRow>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
      {confirmDialog}
    </>
  );
}
