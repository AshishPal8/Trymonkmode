import { useCallback, useEffect, useState } from "react";
import type { GroupLive } from "@/lib/types";
import { groupsApi } from "@/lib/api";

const POLL_MS = 20_000;

/**
 * Who in the group is focusing right now, and any shared timer.
 * Polls only while this page is open and the browser tab is visible.
 */
export function useGroupLive(groupId: number) {
  const [live, setLive] = useState<GroupLive>({ focusing: [], room: null });

  const refresh = useCallback(() => {
    groupsApi
      .live(groupId)
      .then((res) => setLive(res.data.data))
      .catch(() => {});
  }, [groupId]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      refresh();
      timer = setInterval(refresh, POLL_MS);
    };
    const stop = () => clearInterval(timer);
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return { live, refresh };
}
