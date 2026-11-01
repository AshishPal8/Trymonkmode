"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useSocialStore } from "@/stores/socialStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/** "Add by username" input. */
export function AddFriendForm() {
  const sendRequest = useSocialStore((s) => s.sendRequest);
  const [username, setUsername] = useState("");
  const [isSending, setIsSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsSending(true);
    if (await sendRequest(username)) setUsername("");
    setIsSending(false);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Add a friend by username"
          maxLength={21}
          className="h-9 rounded-xl text-xs pl-7"
        />
      </div>
      <Button type="submit" disabled={!username.trim() || isSending} className="h-9 rounded-xl text-xs px-4 gap-1.5">
        <UserPlus className="w-3.5 h-3.5" /> Add
      </Button>
    </form>
  );
}
