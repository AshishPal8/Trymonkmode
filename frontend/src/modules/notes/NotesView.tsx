"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { NoteItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Pin,
  Trash2,
  Check,
  Search,
  MoreVertical,
  Calendar,
  X,
  Edit2,
} from "lucide-react";
import { soundFX } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export const NOTE_COLORS = [
  {
    name: "Electric Blue",
    hex: "#0052FF",
    bgGlass: "rgba(0, 82, 255, 0.10)",
    border: "rgba(0, 82, 255, 0.28)",
    glow: "rgba(0, 82, 255, 0.25)",
  },
  {
    name: "Emerald Green",
    hex: "#10B981",
    bgGlass: "rgba(16, 185, 129, 0.10)",
    border: "rgba(16, 185, 129, 0.28)",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  {
    name: "Amber Gold",
    hex: "#F59E0B",
    bgGlass: "rgba(245, 158, 11, 0.10)",
    border: "rgba(245, 158, 11, 0.28)",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  {
    name: "Purple Violet",
    hex: "#8B5CF6",
    bgGlass: "rgba(139, 92, 246, 0.10)",
    border: "rgba(139, 92, 246, 0.28)",
    glow: "rgba(139, 92, 246, 0.25)",
  },
  {
    name: "Rose Coral",
    hex: "#F43F5E",
    bgGlass: "rgba(244, 63, 94, 0.10)",
    border: "rgba(244, 63, 94, 0.28)",
    glow: "rgba(244, 63, 94, 0.25)",
  },
  {
    name: "Cyan Teal",
    hex: "#06B6D4",
    bgGlass: "rgba(6, 182, 212, 0.10)",
    border: "rgba(6, 182, 212, 0.28)",
    glow: "rgba(6, 182, 212, 0.25)",
  },
  {
    name: "Indigo Navy",
    hex: "#6366F1",
    bgGlass: "rgba(99, 102, 241, 0.10)",
    border: "rgba(99, 102, 241, 0.28)",
    glow: "rgba(99, 102, 241, 0.25)",
  },
  {
    name: "Minimal Slate",
    hex: "#64748B",
    bgGlass: "rgba(100, 116, 139, 0.10)",
    border: "rgba(100, 116, 139, 0.28)",
    glow: "rgba(100, 116, 139, 0.25)",
  },
];

export function NotesView() {
  const { notes, addNote, updateNote, deleteNote } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterColor, setSelectedFilterColor] = useState<string | null>(
    null,
  );

  // Centered Modal State (For Add & Update)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].hex);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  const openCreateModal = () => {
    setModalMode("create");
    setActiveNoteId(null);
    setTitle("");
    setContent("");
    setSelectedColor(NOTE_COLORS[0].hex);
    setTags([]);
    setTagInput("");
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: NoteItem) => {
    setModalMode("edit");
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color || NOTE_COLORS[0].hex);
    setTags(note.tags || []);
    setTagInput("");
    setIsPinned(Boolean(note.isPinned));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveNoteId(null);
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSaveNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (modalMode === "create") {
      soundFX.playCheckSound();
      addNote({
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
        isPinned,
        tags,
      });
    } else if (modalMode === "edit" && activeNoteId) {
      soundFX.playCheckSound();
      updateNote(activeNoteId, {
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
        isPinned,
        tags,
      });
    }

    closeModal();
  };

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.tags &&
          n.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ));

      const matchesColor = selectedFilterColor
        ? n.color === selectedFilterColor
        : true;
      return matchesSearch && matchesColor;
    });
  }, [notes, searchQuery, selectedFilterColor]);

  const activeColorConfig =
    NOTE_COLORS.find((c) => c.hex === selectedColor) || NOTE_COLORS[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Title, Live Search & Color Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-[#0052FF]/10 text-[#0052FF] dark:text-[#60A5FA] shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Sticky Notes
              </h2>
              <p className="text-xs text-muted-foreground">
                Liquid glass canvas for your quick thoughts, code snippets, and
                ideas.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar & Color Filter Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Input
            leftIcon={<Search className="w-3.5 h-3.5" />}
            placeholder="Search sticky notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
            containerClassName="w-44 sm:w-56"
          />

          {/* Color Filter Pill */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-card/80 backdrop-blur-md border border-border shadow-xs">
            <button
              onClick={() => setSelectedFilterColor(null)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                selectedFilterColor === null
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notes.length})
            </button>
            {NOTE_COLORS.map((c) => {
              const count = notes.filter((n) => n.color === c.hex).length;
              if (count === 0 && selectedFilterColor !== c.hex) return null;
              return (
                <button
                  key={c.hex}
                  onClick={() =>
                    setSelectedFilterColor(
                      selectedFilterColor === c.hex ? null : c.hex,
                    )
                  }
                  title={`${c.name} (${count})`}
                  style={{ backgroundColor: c.hex }}
                  className={`w-4 h-4 rounded-full transition transform active:scale-90 cursor-pointer ${
                    selectedFilterColor === c.hex
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                      : "opacity-80 hover:opacity-100"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* CARD 1: DEDICATED "NEW STICKY NOTE" CARD (Opens Center Modal) */}
        <button
          onClick={openCreateModal}
          className="group min-h-[220px] rounded-3xl border-2 border-dashed border-border/80 hover:border-[#0052FF]/60 bg-muted/20 hover:bg-[#0052FF]/5 backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#0052FF]/10 group-hover:bg-[#0052FF] text-[#0052FF] group-hover:text-white flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground tracking-tight">
              New Sticky Note
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Click to jot down a quick idea
            </p>
          </div>
        </button>

        {/* EXISTING STICKY NOTES CARDS */}
        {filteredNotes.map((note) => {
          const colorCfg =
            NOTE_COLORS.find((c) => c.hex === note.color) || NOTE_COLORS[0];

          return (
            <div
              key={note.id}
              onClick={() => openEditModal(note)}
              style={{
                backgroundColor: colorCfg.bgGlass,
                borderColor: colorCfg.border,
              }}
              className="group min-h-[220px] rounded-3xl border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden backdrop-blur-xl cursor-pointer"
            >
              {/* Frosted Tape / Top Glow Accent */}
              <div
                style={{ backgroundColor: note.color }}
                className="absolute top-0 left-8 right-8 h-1 rounded-b-full opacity-80 shadow-xs"
              />

              {/* STICKY NOTE VIEW MODE */}
              <div className="space-y-2 pt-1">
                {/* Header: Title + Pin + 3-Dot Options */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground tracking-tight line-clamp-2 leading-snug">
                    {note.title}
                  </h4>

                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Pin Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateNote(note.id, { isPinned: !note.isPinned });
                      }}
                      title={note.isPinned ? "Pinned" : "Pin to top"}
                      className={`p-1 rounded-lg transition cursor-pointer ${
                        note.isPinned
                          ? "text-amber-500 bg-amber-500/20"
                          : "text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* 3-Dot Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition cursor-pointer">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-36 rounded-2xl ios-card border border-border shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(note);
                          }}
                          className="text-xs flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>Edit Note</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="text-xs flex items-center gap-2 text-rose-500 focus:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Body Content */}
                <p className="text-xs text-foreground/85 leading-relaxed whitespace-pre-wrap line-clamp-5">
                  {note.content}
                </p>

                {/* Tag Badges */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-background/50 text-[9px] font-semibold text-muted-foreground border border-border/50"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer: Created Date & Glowing Color Dot */}
              <div className="flex items-center justify-between pt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5 opacity-80">
                  <Calendar className="w-3 h-3" />
                  <span>{note.createdAt}</span>
                </div>

                <div
                  style={{ backgroundColor: note.color }}
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  title={colorCfg.name}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SPACIOUS CENTERED MODAL FOR ADDING & UPDATING STICKY NOTES */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "New Sticky Note" : "Edit Sticky Note"}
        description={
          modalMode === "create"
            ? "Capture your thoughts, code snippets, or sprint ideas"
            : "Update note content, tags, or theme color"
        }
        icon={<FileText className="w-5 h-5" />}
        topAccentColor={selectedColor}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveNote} className="space-y-4 pt-1">
          {/* Note Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                Note Title
              </label>
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                title={isPinned ? "Pinned to top" : "Pin to top"}
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                  isPinned
                    ? "text-amber-500 bg-amber-500/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Pin className="w-3.5 h-3.5 fill-current" />
                <span>{isPinned ? "Pinned" : "Pin"}</span>
              </button>
            </div>
            <Input
              type="text"
              required
              placeholder="e.g., API Architecture Spec, Sprint ideas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content & Details Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              Content & Details
            </label>
            <textarea
              rows={4}
              required
              placeholder="Write your note, checklist, instructions, code snippet..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-muted/40 border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-2xs resize-none"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags & Categories
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-muted/30 border border-border/80 min-h-[42px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-background text-xs font-semibold text-foreground border border-border shadow-2xs"
                >
                  <span className="text-muted-foreground">#</span>
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ Add tag (Press Enter)..."
                className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none px-2 py-1 flex-1 min-w-[140px]"
              />
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Canvas Color Theme
              </label>
              <span className="text-[11px] font-semibold text-foreground">
                {activeColorConfig.name}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-2xl bg-muted/40 border border-border">
              {NOTE_COLORS.map((c) => {
                const isSelected = selectedColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "scale-120 shadow-md ring-3 ring-foreground"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-white drop-shadow-xs"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={!title.trim() || !content.trim()}
              style={{ backgroundColor: selectedColor }}
              className="text-white text-xs font-bold px-5 py-2.5 rounded-2xl shadow-lg transition hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {modalMode === "create" ? (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Stick It</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
