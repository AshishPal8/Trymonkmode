"use client";

import React, { useState } from "react";
import { NotebookPen, X } from "lucide-react";
import { useFocusStore } from "@/stores/focusStore";

/** Jot down a thought without leaving the session. Saved with the session. */
export function DistractionNotes({ compact = false }: { compact?: boolean }) {
  const { distractionNotes, addDistractionNote, removeDistractionNote } = useFocusStore();
  const [text, setText] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addDistractionNote(text);
    setText("");
  };

  return (
    <div className={`w-full ${compact ? "max-w-sm" : "max-w-md"} space-y-1.5 text-left`}>
      <form onSubmit={submit} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border">
        <NotebookPen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder="Distracted? Jot it down and keep going…"
          className="flex-1 bg-transparent text-xs focus:outline-none placeholder:text-muted-foreground/70"
        />
      </form>
      {distractionNotes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {distractionNotes.map((n, i) => (
            <span
              key={`${i}-${n}`}
              className="text-[11px] pl-2 pr-1 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 flex items-center gap-1 max-w-full"
            >
              <span className="truncate">{n}</span>
              <button
                type="button"
                onClick={() => removeDistractionNote(i)}
                aria-label="Remove note"
                className="p-0.5 rounded cursor-pointer hover:bg-amber-500/20"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
