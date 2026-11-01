"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import type { GroupDetail } from "@/lib/types";
import { useGroupStore } from "@/stores/groupStore";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FriendPicker } from "@/components/social/FriendPicker";

const MAX_MEMBERS = 10;

export function AddMembersModal({ group, onClose }: { group: GroupDetail; onClose: () => void }) {
  const addMembers = useGroupStore((s) => s.addMembers);
  const [selected, setSelected] = useState<number[]>([]);
  const room = MAX_MEMBERS - group.members.length;

  const submit = async () => {
    if (await addMembers(group.id, selected)) onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title="Add friends" icon={<UserPlus className="w-4 h-4" />} maxWidth="sm">
      <div className="space-y-4 pt-1">
        <p className="text-[11px] text-muted-foreground">{room} spot{room === 1 ? "" : "s"} left in this group.</p>
        <FriendPicker selected={selected} onChange={setSelected} excludeIds={group.members.map((m) => m.id)} max={room} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={selected.length === 0}>
            Add {selected.length || ""}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
