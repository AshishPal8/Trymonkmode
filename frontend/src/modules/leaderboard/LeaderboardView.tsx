"use client";

import React, { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { useSocialStore } from "@/stores/socialStore";
import { FriendsTab } from "./FriendsTab";
import { GlobalLeaderboardTab } from "./GlobalLeaderboardTab";

type Tab = "friends" | "leaderboard";

/** Leaderboard page: your friends, and every user ranked. */
export function LeaderboardView() {
  const [tab, setTab] = useState<Tab>("friends");
  const requests = useSocialStore((s) => s.friendsData.incoming.length);

  return (
    <ModuleContainer>
      <PageHeader
        title="Leaderboard"
        description="Your friends and how every monk is doing. Stats come from real activity."
        actions={
          <SegmentedTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: "friends", label: "Friends", icon: <Users className="w-3.5 h-3.5" />, badge: requests },
              { value: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-3.5 h-3.5" /> },
            ]}
          />
        }
      />

      {tab === "friends" ? <FriendsTab /> : <GlobalLeaderboardTab />}
    </ModuleContainer>
  );
}
