"use client";

import React, { useState } from "react";
import { Timer, Users } from "lucide-react";
import type { GroupDetail, GroupLive } from "@/lib/types";
import { apiErrorMessage, groupsApi } from "@/lib/api";
import { useFocusStore } from "@/stores/focusStore";
import { useUIStore } from "@/stores/uiStore";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { displayName } from "@/modules/leaderboard/friendHelpers";
import { minutesLeft } from "@/lib/utils";

const LENGTHS = [25, 50, 90];

interface FocusTogetherCardProps {
  group: GroupDetail;
  live: GroupLive;
  onChanged: () => void;
}

/** Start a shared timer, or join the one running. Everyone finishes together. */
export function FocusTogetherCard({ group, live, onChanged }: FocusTogetherCardProps) {
  const startRoomTimer = useFocusStore((s) => s.startRoomTimer);
  const setActiveModule = useUIStore((s) => s.setActiveModule);
  const [isBusy, setIsBusy] = useState(false);

  const { room } = live;
  const inRoom = room ? live.focusing.filter((f) => f.roomId === room.id) : [];
  const nameOf = (id: number) => {
    const m = group.members.find((x) => x.id === id);
    return m ? displayName(m) : "Someone";
  };
  const iAmIn = inRoom.some((f) => f.userId === group.myId);

  /** Runs start/join, then starts my timer to end with the room and opens the timer. */
  const go = async (call: () => Promise<{ data: { data: { endsAt: string } } }>) => {
    setIsBusy(true);
    try {
      const res = await call();
      startRoomTimer(new Date(res.data.data.endsAt).getTime());
      onChanged();
      setActiveModule("pomodoro");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't start focusing."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="ios-card rounded-3xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus together</h3>
        {live.focusing.length > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {live.focusing.length} focusing now
          </span>
        )}
      </div>

      {room ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-primary" />
            {room.durationMinutes}-min session by {nameOf(room.hostId)} · {minutesLeft(room.endsAt)}
          </p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {inRoom.length ? inRoom.map((f) => nameOf(f.userId)).join(", ") : "No one yet"}
          </p>
          {!iAmIn && (
            <Button onClick={() => go(() => groupsApi.joinRoom(group.id, room.id))} disabled={isBusy} size="lg" className="w-full">
              Join and focus
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">Start a timer; everyone in the group gets a ping to join and finish with you.</p>
          <div className="flex gap-2">
            {LENGTHS.map((mins) => (
              <Button
                key={mins}
                variant="outline"
                disabled={isBusy}
                onClick={() => go(() => groupsApi.startRoom(group.id, mins))}
                className="flex-1"
              >
                {mins} min
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
