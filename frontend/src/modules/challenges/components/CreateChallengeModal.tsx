"use client";

import React, { useState } from "react";
import { Swords } from "lucide-react";
import type { ChallengeMetric, NewChallengeInput } from "@/lib/types";
import { useChallengeStore } from "@/stores/challengeStore";
import { getTodayDateString } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { CHALLENGE_TEMPLATES, METRIC_OPTIONS, ruleText, type ChallengeTemplate } from "../challengeHelpers";

const label = "block text-xs font-semibold text-muted-foreground mb-1.5";

const blankForm = (): NewChallengeInput => ({
  ...CHALLENGE_TEMPLATES[0],
  startDate: getTodayDateString(),
});

/** Admins only: a new challenge every user can join. */
export function CreateChallengeModal({ onClose }: { onClose: () => void }) {
  const create = useChallengeStore((s) => s.create);
  const [form, setForm] = useState<NewChallengeInput>(blankForm);
  const [isSaving, setIsSaving] = useState(false);

  const update = (patch: Partial<NewChallengeInput>) => setForm((f) => ({ ...f, ...patch }));
  const metric = METRIC_OPTIONS.find((m) => m.value === form.metric)!;

  const applyTemplate = (t: ChallengeTemplate) => update({ ...t });

  const setMetric = (value: string) => {
    const next = METRIC_OPTIONS.find((m) => m.value === value)!;
    update({ metric: value as ChallengeMetric, dailyTarget: Math.min(form.dailyTarget, next.maxTarget) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await create(form);
    setIsSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="New challenge"
      description={ruleText(form)}
      icon={<Swords className="w-4 h-4" />}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div className="flex flex-wrap gap-2">
          {CHALLENGE_TEMPLATES.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => applyTemplate(t)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                form.title === t.title
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.emoji} {t.title}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <div>
            <label className={label}>Emoji</label>
            <Input value={form.emoji} maxLength={4} onChange={(e) => update({ emoji: e.target.value })} className="text-center" />
          </div>
          <div>
            <label className={label}>Name *</label>
            <Input required minLength={3} maxLength={120} value={form.title} onChange={(e) => update({ title: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>What counts</label>
            <CustomSelect value={form.metric} onChange={setMetric} options={METRIC_OPTIONS} />
          </div>
          <div>
            <label className={label}>Daily target{form.metric === "focus_minutes" ? " (minutes)" : ""}</label>
            <Input
              type="number"
              min={1}
              max={metric.maxTarget}
              disabled={form.metric === "manual"}
              value={form.dailyTarget}
              onChange={(e) => update({ dailyTarget: Math.max(1, Math.min(metric.maxTarget, Number(e.target.value) || 1)) })}
            />
          </div>
          <div>
            <label className={label}>Length (days)</label>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.durationDays}
              onChange={(e) => update({ durationDays: Math.max(1, Math.min(90, Number(e.target.value) || 1)) })}
            />
          </div>
          <div>
            <label className={label}>Starts</label>
            <CustomDatePicker value={form.startDate} onChange={(startDate) => update({ startDate })} />
          </div>
        </div>

        <div>
          <label className={label}>Description (optional)</label>
          <textarea
            rows={2}
            maxLength={1000}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || form.title.trim().length < 3} className="text-xs">
            {isSaving ? "Creating…" : "Create challenge"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
