"use client";

import React from "react";
import type { PublicUser } from "@/lib/types";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { displayName, handle } from "../friendHelpers";

/** Avatar + name + @username, with action buttons on the right. */
export function PersonRow({ user, children }: { user: PublicUser; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <UserAvatar name={displayName(user)} avatarUrl={user.avatar} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{displayName(user)}</p>
        {handle(user) && <p className="text-[11px] text-muted-foreground truncate">{handle(user)}</p>}
      </div>
      {children && <div className="flex items-center gap-1.5 shrink-0">{children}</div>}
    </div>
  );
}
