"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { BellRing, CheckCircle2, Eye, Megaphone, RefreshCw, Smartphone, XCircle } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminMetricCard } from "./AdminMetricCard";

type Stats = {
  days: number;
  total: number;
  delivered: number;
  failed: number;
  readRate: number;
  byTypeStatus: { type: string; status: string; count: number }[];
  queue: { kind: string; status: string; count: number }[];
  devices: { tokens: number; usersWithDevices: number };
};

const TYPE_LABELS: Record<string, string> = {
  task_reminder: "Task reminders",
  calendar_event: "Event reminders",
  habit_reminder: "Habit reminders",
  system: "Broadcasts & system",
  focus: "Focus",
};

const STATUS_LABELS: Record<string, string> = {
  sent: "Delivered",
  failed: "Failed",
  no_devices: "No device (inbox only)",
  in_app: "Push off (inbox only)",
};

const AUDIENCES = [
  { value: "all", label: "Everyone" },
  { value: "free", label: "Free users" },
  { value: "paid", label: "Paid users" },
] as const;

const OPEN_MODULES = [
  { value: "", label: "Home (no specific page)" },
  { value: "tasks", label: "Tasks" },
  { value: "habits", label: "Habits" },
  { value: "calendar", label: "Calendar" },
  { value: "goals", label: "Goals" },
  { value: "journal", label: "Journal" },
  { value: "pomodoro", label: "Focus timer" },
];

export function AdminNotificationsTab() {
  const { confirm, confirmDialog } = useConfirm();
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(7);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "free" | "paid">("all");
  const [moduleId, setModuleId] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getAdminStats(days);
      if (res?.data?.data) setStats(res.data.data);
    } catch {
      toast.error("Failed to load notification stats.");
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    // Data fetch: state is set after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
  }, [fetchStats]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const audienceLabel = AUDIENCES.find((a) => a.value === audience)?.label.toLowerCase();
    const ok = await confirm({
      title: `Send to ${audienceLabel}?`,
      description: `"${title.trim()}" goes out as a push and lands in their inbox. This can't be undone.`,
      confirmLabel: "Send announcement",
    });
    if (!ok) return;

    setIsSending(true);
    try {
      const res = await notificationsApi.broadcast({
        title: title.trim(),
        body: body.trim(),
        audience,
        moduleId: moduleId || undefined,
      });
      toast.success(res?.data?.message || "Broadcast started.");
      setTitle("");
      setBody("");
      setTimeout(fetchStats, 3000);
    } catch {
      toast.error("Broadcast failed to start.");
    } finally {
      setIsSending(false);
    }
  };

  const byType = new Map<string, { total: number; statuses: Record<string, number> }>();
  for (const row of stats?.byTypeStatus || []) {
    const entry = byType.get(row.type) || { total: 0, statuses: {} };
    entry.total += row.count;
    entry.statuses[row.status] = (entry.statuses[row.status] || 0) + row.count;
    byType.set(row.type, entry);
  }
  const pendingInQueue = (stats?.queue || [])
    .filter((q) => q.status === "pending")
    .reduce((n, q) => n + q.count, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Notifications</h3>
          <p className="text-xs text-muted-foreground">
            Delivery health and announcements to your users
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-xs font-semibold rounded-lg border border-border bg-background px-2 py-1.5 cursor-pointer"
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button size="sm" variant="outline" onClick={fetchStats} disabled={isLoading} className="gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard title="Delivered" value={stats?.delivered ?? "–"} icon={CheckCircle2} iconColor="text-emerald-500" />
        <AdminMetricCard title="Failed" value={stats?.failed ?? "–"} icon={XCircle} iconColor="text-rose-500" />
        <AdminMetricCard title="Opened in inbox" value={stats ? `${stats.readRate}%` : "–"} icon={Eye} />
        <AdminMetricCard
          title="Users with push"
          value={stats?.devices.usersWithDevices ?? "–"}
          icon={Smartphone}
          iconColor="text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Breakdown */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-primary" />
              By type
            </h4>
            <span className="text-[11px] text-muted-foreground">
              {pendingInQueue} scheduled reminders waiting
            </span>
          </div>

          {byType.size === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              {isLoading ? "Loading…" : "Nothing sent in this period yet."}
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {[...byType.entries()].map(([type, entry]) => (
                <div key={type} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{TYPE_LABELS[type] || type}</span>
                    <span className="font-bold text-foreground">{entry.total}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    {Object.entries(entry.statuses).map(([status, count]) => (
                      <span key={status}>
                        {STATUS_LABELS[status] || status}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast */}
        <form onSubmit={handleBroadcast} className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-primary" />
            Send an announcement
          </h4>
          <p className="text-[11px] text-muted-foreground">
            Goes out as a push and lands in everyone&apos;s in-app inbox, even if they turned push off.
          </p>

          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title, e.g. New: weekly focus report 📊"
            maxLength={80}
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message, e.g. See where your focus hours went this week."
            maxLength={200}
            rows={3}
            className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof audience)}
              className="text-xs font-semibold rounded-lg border border-border bg-background px-2 py-2 cursor-pointer"
            >
              {AUDIENCES.map((a) => (
                <option key={a.value} value={a.value}>
                  To: {a.label}
                </option>
              ))}
            </select>
            <select
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-border bg-background px-2 py-2 cursor-pointer"
            >
              {OPEN_MODULES.map((m) => (
                <option key={m.value} value={m.value}>
                  Opens: {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/60 text-xs">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Preview</div>
              <div className="font-semibold text-foreground">{title || "Title"}</div>
              <div className="text-muted-foreground">{body || "Message"}</div>
            </div>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full gap-1.5 text-xs"
          >
            <Megaphone className="w-3.5 h-3.5" />
            {isSending ? "Sending…" : "Send announcement"}
          </Button>
        </form>
      </div>
      {confirmDialog}
    </div>
  );
}
