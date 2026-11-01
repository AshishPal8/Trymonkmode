"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Award, Edit2, Plus, Trash2 } from "lucide-react";
import type { AchievementInput, AchievementRule, AdminAchievement } from "@/lib/types";
import { achievementsApi, apiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CustomSelect } from "@/components/ui/select";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RULE_OPTIONS, ruleLabel } from "@/modules/achievements/achievementHelpers";

const label = "block text-xs font-semibold text-muted-foreground mb-1.5";

const BLANK: AchievementInput = {
  key: "",
  title: "",
  description: "",
  emoji: "🏅",
  rule: "streak_days",
  threshold: 7,
  xpReward: 50,
  isActive: true,
  orderIndex: 0,
};

/** Admins: the badge catalog (what can be earned, and how many have it). */
export function AdminAchievementsTab() {
  const [badges, setBadges] = useState<AdminAchievement[]>([]);
  const [editing, setEditing] = useState<AdminAchievement | "new" | null>(null);
  const { confirm, confirmDialog } = useConfirm();

  const load = useCallback(() => {
    achievementsApi
      .adminList()
      .then((res) => setBadges(res.data.data ?? []))
      .catch(() => toast.error("Couldn't load badges."));
  }, []);

  useEffect(load, [load]);

  const toggleActive = async (badge: AdminAchievement) => {
    try {
      await achievementsApi.update(badge.id, { isActive: !badge.isActive });
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't update the badge."));
    }
  };

  const handleDelete = async (badge: AdminAchievement) => {
    const ok = await confirm({
      title: `Delete "${badge.title}"?`,
      description: `${badge.unlockCount} user(s) will lose it. To hide it but keep what people earned, switch it off instead.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    try {
      await achievementsApi.remove(badge.id);
      toast.success("Badge deleted.");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't delete the badge."));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Badges unlock on their own when a user&apos;s number reaches the threshold. Users get the XP and an inbox note.
        </p>
        <Button onClick={() => setEditing("new")} className="shrink-0">
          <Plus /> New badge
        </Button>
      </div>

      <div className="ios-card rounded-3xl border border-border divide-y divide-border">
        {badges.map((badge) => (
          <div key={badge.id} className={`flex items-center gap-3 p-3 ${badge.isActive ? "" : "opacity-50"}`}>
            <span className="text-2xl w-9 text-center">{badge.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{badge.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {ruleLabel(badge.rule)} ≥ {badge.threshold} · +{badge.xpReward} XP · {badge.unlockCount} unlocked
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toggleActive(badge)}>
              {badge.isActive ? "On" : "Off"}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(badge)} aria-label="Edit badge">
              <Edit2 />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(badge)} aria-label="Delete badge">
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>

      {editing && (
        <BadgeForm
          badge={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
      {confirmDialog}
    </div>
  );
}

function BadgeForm({ badge, onClose, onSaved }: { badge: AdminAchievement | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<AchievementInput>(() => (badge ? { ...badge } : BLANK));
  const [isSaving, setIsSaving] = useState(false);
  const update = (patch: Partial<AchievementInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { key, title, description, emoji, rule, threshold, xpReward, isActive, orderIndex } = form;
      const payload = { key, title, description, emoji, rule, threshold, xpReward, isActive, orderIndex };
      if (badge) await achievementsApi.update(badge.id, payload);
      else await achievementsApi.create(payload);
      toast.success(badge ? "Badge updated." : "Badge created.");
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't save the badge."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={badge ? "Edit badge" : "New badge"} icon={<Award className="w-4 h-4" />} maxWidth="md">
      <form onSubmit={submit} className="space-y-4 pt-1">
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <div>
            <label className={label}>Emoji</label>
            <Input value={form.emoji} maxLength={4} onChange={(e) => update({ emoji: e.target.value })} className="text-center" />
          </div>
          <div>
            <label className={label}>Name *</label>
            <Input required minLength={2} maxLength={80} value={form.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={label}>Description</label>
          <Input maxLength={500} value={form.description} onChange={(e) => update({ description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Unlocks when</label>
            <CustomSelect value={form.rule} onChange={(rule) => update({ rule: rule as AchievementRule })} options={RULE_OPTIONS} />
          </div>
          <div>
            <label className={label}>reaches</label>
            <Input type="number" min={1} value={form.threshold} onChange={(e) => update({ threshold: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
          <div>
            <label className={label}>XP reward</label>
            <Input type="number" min={0} max={5000} value={form.xpReward} onChange={(e) => update({ xpReward: Math.max(0, Number(e.target.value) || 0) })} />
          </div>
          <div>
            <label className={label}>Key (unique, a–z 0–9 _)</label>
            <Input
              required
              pattern="[a-z0-9_]{2,60}"
              disabled={!!badge}
              value={form.key}
              onChange={(e) => update({ key: e.target.value.toLowerCase() })}
              placeholder="streak_14"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : badge ? "Save" : "Create badge"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
