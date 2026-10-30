"use client";

import React, { useState } from "react";
import { Target, X } from "lucide-react";
import { useApp } from "@/lib/store";
import type { GoalItem, GoalKind } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/select";
import { CustomDatePicker } from "@/components/ui/date-picker";
import { GOAL_CATEGORIES, GOAL_COLORS, GOAL_KINDS } from "./goalHelpers";

interface GoalFormModalProps {
  isOpen: boolean;
  goal: GoalItem | null; // null = create
  onClose: () => void;
  onSaved?: (goal: GoalItem | null) => void;
}

const label = "block text-xs font-semibold text-muted-foreground mb-1.5";

export function GoalFormModal({ isOpen, goal, onClose, onSaved }: GoalFormModalProps) {
  if (!isOpen) return null;
  // Keyed so the form resets each time it opens for a different goal.
  return <GoalForm key={goal?.id || "new"} goal={goal} onClose={onClose} onSaved={onSaved} />;
}

function GoalForm({ goal, onClose, onSaved }: Omit<GoalFormModalProps, "isOpen">) {
  const { addGoal, updateGoal } = useApp();
  const isEdit = !!goal;

  const [title, setTitle] = useState(goal?.title || "");
  const [why, setWhy] = useState(goal?.why || "");
  const [kind, setKind] = useState<GoalKind>(goal?.kind || "project");
  const [category, setCategory] = useState(goal?.category || "Learning");
  const [deadline, setDeadline] = useState(goal?.deadline || "");
  const [color, setColor] = useState(goal?.color || GOAL_COLORS[0]);
  const [unit, setUnit] = useState(goal?.unit || "");
  const [targetNumber, setTargetNumber] = useState(String(goal?.targetProgress ?? 10));
  const [currentNumber, setCurrentNumber] = useState(String(goal?.currentProgress ?? 0));
  const [targetHours, setTargetHours] = useState(
    String(goal?.targetFocusMinutes ? Math.round(goal.targetFocusMinutes / 60) : 20),
  );
  const [milestonesText, setMilestonesText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);

    const payload = {
      title: title.trim(),
      why: why.trim() || undefined,
      kind,
      category,
      deadline: deadline || null,
      color,
      ...(kind === "target"
        ? {
            unit: unit.trim() || undefined,
            targetProgress: Math.max(1, Number(targetNumber) || 1),
            currentProgress: Math.max(0, Number(currentNumber) || 0),
          }
        : {}),
      ...(kind === "focus"
        ? { targetFocusMinutes: Math.max(1, Math.round((Number(targetHours) || 1) * 60)) }
        : {}),
    };

    if (isEdit && goal) {
      await updateGoal(goal.id, payload);
      onSaved?.(goal);
    } else {
      const milestones = milestonesText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => ({ title: t }));
      const created = await addGoal({ ...payload, milestones });
      onSaved?.(created);
    }
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isEdit ? "Edit goal" : "New goal"}
      description="Something you want to finish, and how you'll measure it."
      icon={<Target className="w-4 h-4" />}
      topAccentColor={color}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        <div>
          <label className={label}>What do you want to achieve? *</label>
          <Input
            required
            autoFocus
            maxLength={255}
            placeholder="e.g. Learn DSA, Launch my startup, Read 24 books"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className={label}>How should progress be measured?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {GOAL_KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => setKind(k.value)}
                className={`text-left p-3 rounded-xl border transition cursor-pointer ${
                  kind === k.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40 hover:bg-muted/70"
                }`}
              >
                <div className="text-xs font-bold text-foreground">
                  {k.emoji} {k.label}
                </div>
                <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{k.hint}</div>
              </button>
            ))}
          </div>
        </div>

        {kind === "target" && (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={label}>Now</label>
              <Input type="number" min={0} value={currentNumber} onChange={(e) => setCurrentNumber(e.target.value)} />
            </div>
            <div>
              <label className={label}>Target</label>
              <Input type="number" min={1} value={targetNumber} onChange={(e) => setTargetNumber(e.target.value)} />
            </div>
            <div>
              <label className={label}>Unit</label>
              <Input placeholder="books" maxLength={30} value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
          </div>
        )}

        {kind === "focus" && (
          <div>
            <label className={label}>Target focus hours</label>
            <Input type="number" min={1} value={targetHours} onChange={(e) => setTargetHours(e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-1">
              Every focus session from today on counts toward it.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Category</label>
            <CustomSelect value={category} onChange={setCategory} options={GOAL_CATEGORIES} />
          </div>
          <div>
            <label className={label}>Deadline (optional)</label>
            <div className="flex items-center gap-1">
              <CustomDatePicker value={deadline} onChange={setDeadline} placeholder="No deadline" className="flex-1" />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline("")}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Clear deadline"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={label}>Why does this matter to you? (optional)</label>
          <textarea
            rows={2}
            maxLength={1000}
            placeholder="e.g. To crack product-company interviews by March"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {!isEdit && kind === "project" && (
          <div>
            <label className={label}>Milestones (one per line, optional)</label>
            <textarea
              rows={3}
              placeholder={"Arrays & strings\nTrees & graphs\nDynamic programming"}
              value={milestonesText}
              onChange={(e) => setMilestonesText(e.target.value)}
              className="w-full text-sm rounded-xl border border-border bg-background px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        <div>
          <label className={label}>Color</label>
          <div className="flex gap-2">
            {GOAL_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className={`w-7 h-7 rounded-full cursor-pointer transition ${
                  color === c ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/60" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving || !title.trim()} className="text-xs">
            {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
