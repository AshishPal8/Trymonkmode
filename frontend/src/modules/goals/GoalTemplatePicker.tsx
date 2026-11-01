"use client";

import React from "react";
import { GOAL_TEMPLATES, type GoalTemplate } from "./goalTemplates";

interface GoalTemplatePickerProps {
  selectedId: string | null;
  onPick: (template: GoalTemplate) => void;
}

/** "Start from a template" chips at the top of the new-goal form. */
export function GoalTemplatePicker({ selectedId, onPick }: GoalTemplatePickerProps) {
  return (
    <div>
      <p className="block text-xs font-semibold text-muted-foreground mb-1.5">Start from a template (optional)</p>
      <div className="flex flex-wrap gap-2">
        {GOAL_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
              selectedId === t.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            {t.emoji} {t.title}
          </button>
        ))}
      </div>
    </div>
  );
}
