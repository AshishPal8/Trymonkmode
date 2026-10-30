"use client";

import React from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useApp } from "@/lib/store";
import { notificationsApi, type InboxItem } from "@/lib/api";
import type { ActiveModuleId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPENABLE_MODULES = new Set(["tasks", "calendar", "habits", "dashboard", "goals", "journal", "pomodoro"]);
// Refresh the badge when the tab regains focus, at most this often.
const FOCUS_REFRESH_MS = 60 * 1000;

/** Fired by the page when a push arrives while the app is open. */
export const INBOX_REFRESH_EVENT = "monk-inbox-refresh";

function timeAgo(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

export function NotificationBell() {
  const { setActiveModule } = useApp();
  const [items, setItems] = React.useState<InboxItem[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const lastFetchRef = React.useRef(0);

  const load = React.useCallback(async (before?: number) => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getInbox({ limit: 20, before });
      const data = res?.data?.data;
      if (!data) return;
      setItems((prev) => (before ? [...prev, ...data.items] : data.items));
      setHasMore(Boolean(data.hasMore));
      setUnread(data.unreadCount ?? 0);
      lastFetchRef.current = Date.now();
    } catch {
      // Inbox is non-critical; keep whatever we had.
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Initial load is async (state is set after the request resolves).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();

    const onRefresh = () => load();
    const onFocus = () => {
      if (Date.now() - lastFetchRef.current > FOCUS_REFRESH_MS) load();
    };
    window.addEventListener(INBOX_REFRESH_EVENT, onRefresh);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(INBOX_REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const markAllRead = async () => {
    if (unread === 0) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((i) => (i.readAt ? i : { ...i, readAt: now })));
    setUnread(0);
    notificationsApi.markRead().catch(() => {});
  };

  const openItem = (item: InboxItem) => {
    if (!item.readAt) {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, readAt: new Date().toISOString() } : i)),
      );
      setUnread((n) => Math.max(0, n - 1));
      notificationsApi.markRead([item.id]).catch(() => {});
    }
    const moduleId = item.data?.moduleId;
    if (moduleId && OPENABLE_MODULES.has(moduleId)) {
      setActiveModule(moduleId as ActiveModuleId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold leading-4 text-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] p-0 text-xs border border-border shadow-2xl bg-card/95 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/60">
          <span className="font-bold text-foreground text-sm">Notifications</span>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex items-center gap-1 text-[11px] font-semibold text-primary disabled:text-muted-foreground disabled:cursor-default cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && !isLoading && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Inbox className="w-6 h-6" />
              <p className="text-xs font-semibold">You&apos;re all caught up</p>
              <p className="text-[11px]">Reminders and updates will show up here.</p>
            </div>
          )}

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              className={`w-full text-left flex gap-2.5 px-3.5 py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/60 transition cursor-pointer ${
                item.readAt ? "" : "bg-primary/5"
              }`}
            >
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  item.readAt ? "bg-transparent" : "bg-primary"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground leading-snug">
                  {item.title}
                </span>
                <span className="block text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                  {item.body}
                </span>
                <span className="block text-[10px] text-muted-foreground/80 mt-1">
                  {timeAgo(item.createdAt)}
                </span>
              </span>
            </button>
          ))}

          {hasMore && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => load(items[items.length - 1]?.id)}
              className="w-full py-2.5 text-[11px] font-semibold text-primary hover:bg-muted/60 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? "Loading…" : "Show older"}
            </button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
