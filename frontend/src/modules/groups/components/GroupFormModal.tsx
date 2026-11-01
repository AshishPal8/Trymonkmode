"use client";

import React, { useState } from "react";
import { UsersRound } from "lucide-react";
import type { GroupDetail } from "@/lib/types";
import { useGroupStore } from "@/stores/groupStore";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { FriendPicker } from "@/components/social/FriendPicker";
import { GOAL_HOURS_OPTIONS } from "../groupHelpers";

const label = "block text-xs font-semibold text-muted-foreground mb-1.5";
const MAX_OTHERS = 9; // 10 people in all

/** Create a group (with friends), or edit name / emoji / weekly goal. */
export function GroupFormModal({ group, onClose }: { group: GroupDetail | null; onClose: () => void }) {
  const { create, update } = useGroupStore();
  const [name, setName] = useState(group?.name ?? "");
  const [emoji, setEmoji] = useState(group?.emoji ?? "🛡️");
  const [goal, setGoal] = useState(String(group?.weeklyGoalMinutes ?? 600));
  const [memberIds, setMemberIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const values = { name: name.trim(), emoji, weeklyGoalMinutes: Number(goal) };
    const ok = group ? await update(group.id, values) : await create({ ...values, memberIds });
    setIsSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={group ? "Edit group" : "New accountability group"}
      description="Friends with one shared weekly focus goal."
      icon={<UsersRound className="w-4 h-4" />}
      maxWidth="md"
    >
      <form onSubmit={submit} className="space-y-4 pt-1">
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <div>
            <label className={label}>Emoji</label>
            <Input value={emoji} maxLength={4} onChange={(e) => setEmoji(e.target.value)} className="text-center" />
          </div>
          <div>
            <label className={label}>Name *</label>
            <Input required minLength={2} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="DSA squad" />
          </div>
        </div>
        <div>
          <label className={label}>Weekly goal (everyone together)</label>
          <CustomSelect value={goal} onChange={setGoal} options={GOAL_HOURS_OPTIONS} />
        </div>
        {!group && (
          <div>
            <label className={label}>Add friends (up to {MAX_OTHERS})</label>
            <FriendPicker selected={memberIds} onChange={setMemberIds} max={MAX_OTHERS} />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || name.trim().length < 2}>
            {isSaving ? "Saving…" : group ? "Save" : "Create group"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
