import { useEffect, useState } from "react";
import type { LeaderboardPage, LeaderboardSort } from "@/lib/types";
import { socialApi } from "@/lib/api";

type Result = { key: string; data: LeaderboardPage | null; failed: boolean };

/** Loads one page of the all-users leaderboard whenever sort or page changes. */
export function useLeaderboard(sort: LeaderboardSort, page: number) {
  const key = `${sort}:${page}`;
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    socialApi
      .getLeaderboard({ sort, page })
      .then((res) => !cancelled && setResult({ key, data: res.data.data, failed: false }))
      .catch(() => !cancelled && setResult((r) => ({ key, data: r?.data ?? null, failed: true })));
    return () => {
      cancelled = true;
    };
  }, [key, sort, page]);

  return {
    data: result?.data ?? null,
    // Still showing the previous page until the new one arrives.
    isLoading: result?.key !== key,
    failed: result?.key === key && result.failed,
  };
}
