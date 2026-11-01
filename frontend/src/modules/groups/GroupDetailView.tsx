"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, LogOut, Settings, Trash2, UserPlus } from "lucide-react";
import type { GroupDetail } from "@/lib/types";
import { apiErrorMessage, socialApi } from "@/lib/api";
import { useGroupStore } from "@/stores/groupStore";
import { useSocialStore } from "@/stores/socialStore";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useGroupLive } from "./useGroupLive";
import { WeeklyGoalBar } from "./components/WeeklyGoalBar";
import { FocusTogetherCard } from "./components/FocusTogetherCard";
import { GroupMembers } from "./components/GroupMembers";
import { GroupFeed } from "./components/GroupFeed";
import { GroupFormModal } from "./components/GroupFormModal";
import { AddMembersModal } from "./components/AddMembersModal";

const MAX_MEMBERS = 10;

export function GroupDetailView({ group }: { group: GroupDetail }) {
  const { open, removeMember, remove } = useGroupStore();
  const { friendsData, load: loadFriends } = useSocialStore();
  const { live, refresh } = useGroupLive(group.id);
  const { confirm, confirmDialog } = useConfirm();
  const [modal, setModal] = useState<"edit" | "add" | null>(null);

  // Needed for "Nudge" (friends only); uses the cached list when fresh.
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);
  const friendIds = new Set(friendsData.friends.map((f) => f.id));

  const nudge = async (userId: number) => {
    try {
      const res = await socialApi.nudge(userId);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't send the nudge."));
    }
  };

  const confirmRemove = async (userId: number) => {
    const isMe = userId === group.myId;
    const ok = await confirm({
      title: isMe ? `Leave "${group.name}"?` : "Remove from the group?",
      description: isMe ? "You can be added back by a member later." : "They can be added back later.",
      confirmLabel: isMe ? "Leave" : "Remove",
      destructive: true,
    });
    if (ok) removeMember(group.id, userId, isMe);
  };

  const confirmDelete = async () => {
    const ok = await confirm({
      title: `Delete "${group.name}"?`,
      description: "The group is removed for everyone. Focus history stays with each person.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) remove(group.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => open(null)}>
          <ArrowLeft /> All groups
        </Button>
        <div className="flex gap-2">
          {group.members.length < MAX_MEMBERS && (
            <Button variant="outline" onClick={() => setModal("add")}>
              <UserPlus /> Add
            </Button>
          )}
          {group.isOwner && (
            <Button variant="outline" size="icon" onClick={() => setModal("edit")} aria-label="Edit group">
              <Settings />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => confirmRemove(group.myId)} aria-label="Leave group">
            <LogOut />
          </Button>
          {group.isOwner && (
            <Button variant="destructive" size="icon" onClick={confirmDelete} aria-label="Delete group">
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      <div className="ios-card rounded-3xl p-5 sm:p-6 border border-border space-y-3">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {group.emoji} {group.name}
        </h2>
        <WeeklyGoalBar group={group} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <FocusTogetherCard group={group} live={live} onChanged={refresh} />
          <GroupMembers
            group={group}
            live={live}
            myId={group.myId}
            friendIds={friendIds}
            onNudge={nudge}
            onRemove={confirmRemove}
          />
        </div>
        <GroupFeed group={group} />
      </div>

      {modal === "edit" && <GroupFormModal group={group} onClose={() => setModal(null)} />}
      {modal === "add" && <AddMembersModal group={group} onClose={() => setModal(null)} />}
      {confirmDialog}
    </div>
  );
}
