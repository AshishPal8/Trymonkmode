"use client";

import React, { useState, useEffect } from "react";
import { settingsApi, SystemFlag } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Cpu, Clock, Plus, Trash2, RefreshCw, Sliders } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminSystemSettingsTab() {
  const [flags, setFlags] = useState<SystemFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  // New Flag Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("cron");
  const [isCreating, setIsCreating] = useState(false);

  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const res = await settingsApi.getAllFlags();
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setFlags(res.data.data);
      }
    } catch {
      toast.error("Failed to load system flags.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggleFlag = async (flag: SystemFlag) => {
    const isCurrentlyActive = flag.value === "1" || flag.value === "true";
    const nextVal = isCurrentlyActive ? "0" : "1";
    setUpdatingKey(flag.key);

    // Optimistic UI update
    setFlags((prev) =>
      prev.map((f) => (f.key === flag.key ? { ...f, value: nextVal } : f)),
    );

    try {
      await settingsApi.updateFlag(flag.key, { value: nextVal });
      toast.success(
        `${flag.key} is now ${nextVal === "1" ? "active" : "disabled"}`,
      );
    } catch {
      toast.error(`Failed to update ${flag.key}`);
      fetchFlags(); // Rollback
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) {
      toast.error("Please enter a flag key.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await settingsApi.createFlag({
        key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
        value: "1",
        description: newDescription.trim(),
        category: newCategory.trim().toLowerCase() || "cron",
      });

      if (res?.data?.data) {
        setFlags((prev) => [...prev, res.data.data]);
      }
      toast.success(`Flag '${newKey}' created.`);
      setIsAddModalOpen(false);
      setNewKey("");
      setNewDescription("");
      setNewCategory("cron");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create flag.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteFlag = async (key: string) => {
    if (!confirm(`Delete flag '${key}'?`)) return;

    try {
      await settingsApi.deleteFlag(key);
      setFlags((prev) => prev.filter((f) => f.key !== key));
      toast.success(`Flag '${key}' deleted.`);
    } catch {
      toast.error(`Failed to delete '${key}'.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw className="w-5 h-5 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium">
          Loading system flags...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/70 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Background Crons & System Flags
            </h3>
            <p className="text-xs text-muted-foreground">
              Toggle any background job or feature switch instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFlags}
            className="p-2 rounded-xl border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-3.5 py-2 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Flag</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {flags.map((flag) => {
          const isActive = flag.value === "1" || flag.value === "true";
          const isCron = flag.category === "cron";

          return (
            <div
              key={flag.id || flag.key}
              className={`group p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                isActive
                  ? "bg-card border-border hover:border-primary/40 shadow-xs"
                  : "bg-muted/30 border-border/50 opacity-75 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCron ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Cpu className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-mono text-foreground tracking-tight truncate">
                      {flag.key}
                    </span>
                    {flag.category && flag.category !== "cron" && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {flag.category}
                      </span>
                    )}
                  </div>

                  {flag.description && (
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {flag.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDeleteFlag(flag.key)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete flag"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Sleek Switch Toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  disabled={updatingKey === flag.key}
                  onClick={() => handleToggleFlag(flag)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isActive ? "bg-primary" : "bg-muted"
                  } ${updatingKey === flag.key ? "opacity-50 cursor-wait" : ""}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Flag Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Cron / Feature Flag"
        >
          <form onSubmit={handleCreateFlag} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Flag Key
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. reminders_cron, weekly_digest"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold"
              >
                <option value="cron">cron (Background Worker)</option>
                <option value="system">system (System Core)</option>
                <option value="feature">feature (Feature Flag)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Description
              </label>
              <Input
                type="text"
                placeholder="Brief description of what this controls..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isCreating ? "Adding..." : "Add Flag"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
