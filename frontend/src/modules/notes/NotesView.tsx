"use client";

import React, { useMemo, useState } from "react";
import { Check, FileText, Pin, Plus, Search, Trash2, X } from "lucide-react";
import { useApp } from "@/lib/store";
import type { NoteItem } from "@/lib/types";
import { soundFX } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { useConfirm } from "@/components/ui/confirm-dialog";

export const NOTE_COLORS = [
  { name: "Blue", hex: "#0052FF" },
  { name: "Green", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
  { name: "Violet", hex: "#8B5CF6" },
  { name: "Rose", hex: "#F43F5E" },
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Indigo", hex: "#6366F1" },
  { name: "Slate", hex: "#64748B" },
];

const CONTROL = "h-9 rounded-xl";

/** Title from the first line when the user only typed content. */
function splitTitle(text: string): { title: string; content: string } {
  const clean = text.trim();
  const firstLine = clean.split("\n")[0].trim();
  const title = firstLine.length > 60 ? `${firstLine.slice(0, 57).trimEnd()}…` : firstLine;
  return { title: title || "Untitled", content: clean };
}

function prettyDate(date: string) {
  const d = new Date(`${date.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

export function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const { confirm, confirmDialog } = useConfirm();

  const [query, setQuery] = useState("");
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [quickText, setQuickText] = useState("");
  const [editing, setEditing] = useState<NoteItem | "new" | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      const matches =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some((t) => t.toLowerCase().includes(q));
      return matches && (!colorFilter || n.color === colorFilter);
    });
  }, [notes, query, colorFilter]);

  // Pinned notes first (pinning used to have no effect on order).
  const pinned = filtered.filter((n) => n.isPinned);
  const others = filtered.filter((n) => !n.isPinned);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    const { title, content } = splitTitle(quickText);
    soundFX.playCheckSound();
    addNote({ title, content, color: NOTE_COLORS[0].hex, isPinned: false, tags: [] });
    setQuickText("");
  };

  const handleDelete = async (note: NoteItem) => {
    const ok = await confirm({
      title: `Delete "${note.title}"?`,
      description: "This note will be removed for good.",
      confirmLabel: "Delete note",
      destructive: true,
    });
    if (ok) deleteNote(note.id);
  };

  const usedColors = NOTE_COLORS.filter((c) => notes.some((n) => n.color === c.hex));

  return (
    <ModuleContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Notes & Ideas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Quick thoughts, snippets and ideas. Pin the ones you keep coming back to.
          </p>
        </div>
        <Button onClick={() => setEditing("new")} className={`${CONTROL} px-4 text-xs font-semibold gap-1.5`}>
          <Plus className="w-3.5 h-3.5" />
          New note
        </Button>
      </div>

      {/* Quick capture */}
      <form onSubmit={handleQuickAdd} className="flex items-center gap-2">
        <Input
          placeholder="Jot something down and press Enter…"
          value={quickText}
          maxLength={2000}
          onChange={(e) => setQuickText(e.target.value)}
          className={`${CONTROL} py-0 text-sm`}
        />
        <Button type="submit" disabled={!quickText.trim()} className={`${CONTROL} px-4 text-xs shrink-0`}>
          Add
        </Button>
      </form>

      {/* Search + color filter */}
      {notes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            leftIcon={<Search className="w-3.5 h-3.5" />}
            placeholder="Search notes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
            containerClassName="w-full sm:w-64"
            className={`${CONTROL} py-0`}
          />
          {usedColors.length > 1 && (
            <div className="flex items-center gap-1.5 h-9 px-2 rounded-xl bg-muted/50 border border-border">
              <button
                type="button"
                onClick={() => setColorFilter(null)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold cursor-pointer ${
                  colorFilter === null ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {usedColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColorFilter(colorFilter === c.hex ? null : c.hex)}
                  aria-label={`Show ${c.name} notes`}
                  style={{ backgroundColor: c.hex }}
                  className={`w-4 h-4 rounded-full cursor-pointer transition ${
                    colorFilter === c.hex ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/70" : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No notes yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Type an idea in the box above and press Enter. That&apos;s it.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-10">No notes match your search.</p>
      ) : (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <NoteSection label="Pinned" notes={pinned} onOpen={setEditing} onPin={updateNote} onDelete={handleDelete} />
          )}
          {others.length > 0 && (
            <NoteSection
              label={pinned.length > 0 ? "Others" : null}
              notes={others}
              onOpen={setEditing}
              onPin={updateNote}
              onDelete={handleDelete}
            />
          )}
        </div>
      )}

      {editing && (
        <NoteEditor
          key={editing === "new" ? "new" : editing.id}
          note={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            soundFX.playCheckSound();
            if (editing === "new") addNote(data);
            else updateNote(editing.id, data);
            setEditing(null);
          }}
        />
      )}

      {confirmDialog}
    </ModuleContainer>
  );
}

function NoteSection({
  label,
  notes,
  onOpen,
  onPin,
  onDelete,
}: {
  label: string | null;
  notes: NoteItem[];
  onOpen: (n: NoteItem) => void;
  onPin: (id: string, data: Partial<NoteItem>) => void;
  onDelete: (n: NoteItem) => void;
}) {
  return (
    <section className="space-y-2">
      {label && <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">{label}</h3>}
      {/* Masonry columns: each note is as tall as its content */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 [column-fill:_balance]">
        {notes.map((n) => (
          <NoteCard key={n.id} note={n} onOpen={onOpen} onPin={onPin} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

function NoteCard({
  note,
  onOpen,
  onPin,
  onDelete,
}: {
  note: NoteItem;
  onOpen: (n: NoteItem) => void;
  onPin: (id: string, data: Partial<NoteItem>) => void;
  onDelete: (n: NoteItem) => void;
}) {
  const color = note.color || NOTE_COLORS[0].hex;
  // Don't repeat the title when the note's first line is the title.
  const lines = note.content.trim().split("\n");
  const body = (lines[0].trim() === note.title.trim() ? lines.slice(1).join("\n") : note.content).trim();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(note)}
      onKeyDown={(e) => e.key === "Enter" && onOpen(note)}
      style={{ backgroundColor: `${color}14`, borderColor: `${color}40` }}
      className="group break-inside-avoid mb-3 rounded-2xl border p-4 space-y-2 cursor-pointer transition hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex items-start gap-2">
        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <h4 className="flex-1 text-sm font-semibold text-foreground leading-snug break-words">{note.title}</h4>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPin(note.id, { isPinned: !note.isPinned });
          }}
          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
          className={`p-1 rounded-lg shrink-0 cursor-pointer transition ${
            note.isPinned
              ? "text-amber-500"
              : "text-muted-foreground hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? "fill-current" : ""}`} />
        </button>
      </div>

      {body && (
        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-words line-clamp-[10]">
          {body}
        </p>
      )}

      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded-md bg-background/60 text-[10px] font-medium text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
        <span>{prettyDate(note.updatedAt || note.createdAt)}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          aria-label="Delete note"
          className="p-1 rounded-lg cursor-pointer hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function NoteEditor({
  note,
  onClose,
  onSave,
}: {
  note: NoteItem | null;
  onClose: () => void;
  onSave: (data: Omit<NoteItem, "id" | "createdAt">) => void;
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState(note?.color || NOTE_COLORS[0].hex);
  const [isPinned, setIsPinned] = useState(!!note?.isPinned);
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    const derived = splitTitle(content || title);
    onSave({
      title: title.trim() || derived.title,
      content: content.trim() || title.trim(),
      color,
      isPinned,
      tags,
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={note ? "Edit note" : "New note"}
      icon={<FileText className="w-4 h-4" />}
      topAccentColor={color}
      maxWidth="lg"
    >
      <form onSubmit={submit} className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            autoFocus={!note}
            placeholder="Title (optional)"
            value={title}
            maxLength={255}
            onChange={(e) => setTitle(e.target.value)}
            className={`${CONTROL} py-0 text-sm font-semibold`}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPinned(!isPinned)}
            aria-label={isPinned ? "Unpin" : "Pin"}
            className={`${CONTROL} w-9 p-0 shrink-0 ${isPinned ? "text-amber-500" : ""}`}
          >
            <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
          </Button>
        </div>

        <textarea
          rows={8}
          placeholder="Write anything: ideas, a checklist, a code snippet…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3.5 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y min-h-32"
        />

        <div className="flex flex-wrap items-center gap-1.5 min-h-9 px-2 py-1 rounded-xl bg-muted/50 border border-border">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background text-xs text-foreground">
              #{t}
              <button
                type="button"
                onClick={() => setTags(tags.filter((x) => x !== t))}
                aria-label={`Remove tag ${t}`}
                className="text-muted-foreground hover:text-rose-500 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={addTag}
            placeholder={tags.length ? "Add tag" : "Tags (press Enter)"}
            className="flex-1 min-w-28 bg-transparent text-xs py-1 focus:outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            {NOTE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                aria-label={c.name}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition ${
                  color === c.hex ? "ring-2 ring-offset-2 ring-offset-background ring-foreground/70" : "opacity-70 hover:opacity-100"
                }`}
              >
                {color === c.hex && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className={`${CONTROL} px-4 text-xs`}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() && !content.trim()} className={`${CONTROL} px-4 text-xs`}>
              {note ? "Save" : "Add note"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
