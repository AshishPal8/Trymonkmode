"use client";

import React, { useEffect, useState } from "react";
import { Plus, UsersRound } from "lucide-react";
import { useGroupStore } from "@/stores/groupStore";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { GroupCard } from "./components/GroupCard";
import { GroupFormModal } from "./components/GroupFormModal";
import { GroupDetailView } from "./GroupDetailView";

export function GroupsView() {
  const { groups, isLoading, openId, detail, loadGroups, open } = useGroupStore();
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  if (openId && detail) {
    return (
      <ModuleContainer>
        <GroupDetailView group={detail} />
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer>
      <PageHeader
        title="Groups"
        description="Small groups of friends with one weekly focus goal. Show up for each other."
        actions={
          <Button onClick={() => setIsCreating(true)} className="text-xs font-semibold rounded-xl px-4 py-2 gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New group
          </Button>
        }
      />

      {groups.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} onOpen={() => open(g.id)} />
          ))}
        </div>
      ) : (
        <div className="py-14 text-center text-xs text-muted-foreground ios-card rounded-3xl border border-dashed border-border">
          <UsersRound className="w-7 h-7 mx-auto mb-2 opacity-50" />
          {isLoading ? "Loading…" : "No groups yet. Start one with 2–10 friends and a weekly goal."}
        </div>
      )}

      {isCreating && <GroupFormModal group={null} onClose={() => setIsCreating(false)} />}
    </ModuleContainer>
  );
}
