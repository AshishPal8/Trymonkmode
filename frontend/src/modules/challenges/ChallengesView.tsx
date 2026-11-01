"use client";

import React, { useEffect, useState } from "react";
import { Plus, Swords } from "lucide-react";
import type { ChallengeListItem } from "@/lib/types";
import { useChallengeStore } from "@/stores/challengeStore";
import { useUserStore } from "@/stores/userStore";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "./challengeHelpers";
import { ChallengeCard } from "./components/ChallengeCard";
import { CreateChallengeModal } from "./components/CreateChallengeModal";
import { ChallengeDetailView } from "./ChallengeDetailView";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{children}</div>
    </section>
  );
}

export function ChallengesView() {
  const { lists, isLoadingList, openId, detail, loadList, open, join } = useChallengeStore();
  const isAdmin = isAdminRole(useUserStore((s) => s.user.role));
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const card = (c: ChallengeListItem, canJoin = false) => (
    <ChallengeCard
      key={c.id}
      challenge={c}
      onOpen={() => open(c.id)}
      action={canJoin && <Button onClick={() => join(c.id)}>Join</Button>}
    />
  );
  const isEmpty = !lists.joined.length && !lists.available.length;

  if (openId && detail) {
    return (
      <ModuleContainer>
        <ChallengeDetailView challenge={detail} />
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer>
      <PageHeader
        title="Challenges"
        description="Join a challenge, show up every day and watch everyone's streaks. Progress counts itself."
        actions={
          isAdmin && (
            <Button onClick={() => setIsCreating(true)} className="text-xs font-semibold rounded-xl px-4 py-2 gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New challenge
            </Button>
          )
        }
      />

      {lists.joined.length > 0 && <Section title="Your challenges">{lists.joined.map((c) => card(c))}</Section>}

      {lists.available.length > 0 && <Section title="Join a challenge">{lists.available.map((c) => card(c, true))}</Section>}

      {isEmpty && (
        <div className="py-14 text-center text-xs text-muted-foreground ios-card rounded-3xl border border-dashed border-border">
          <Swords className="w-7 h-7 mx-auto mb-2 opacity-50" />
          {isLoadingList ? "Loading…" : "No challenges running right now. New ones are coming soon."}
        </div>
      )}

      {isCreating && <CreateChallengeModal onClose={() => setIsCreating(false)} />}
    </ModuleContainer>
  );
}
