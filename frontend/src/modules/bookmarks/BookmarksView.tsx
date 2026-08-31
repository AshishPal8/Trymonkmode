"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/store";
import {
  Plus,
  ExternalLink,
  Star,
  CheckCircle2,
  Trash2,
  Code2,
  Video,
  BookOpen,
  FileText,
  Globe,
  Bookmark,
  Search,
  X,
} from "lucide-react";
import { formatDatePretty } from "@/lib/utils";
import { BookmarkItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ModuleContainer } from "@/components/layout/ModuleContainer";
import { CustomSelect } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

export function BookmarksView() {
  const {
    bookmarks,
    addBookmark,
    toggleBookmarkFavorite,
    toggleBookmarkRead,
    deleteBookmark,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Bookmark State
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState<BookmarkItem["category"]>("GitHub");
  const [type, setType] = useState<BookmarkItem["type"]>("repo");
  const [tags, setTags] = useState("#Architecture");
  const [notes, setNotes] = useState("");

  const categories = ["all", "GitHub", "Books", "Articles", "YouTube", "Tools"];

  const filteredBookmarks = bookmarks.filter((bm) => {
    if (activeCategory !== "all" && bm.category !== activeCategory)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        bm.title.toLowerCase().includes(q) ||
        bm.notes?.toLowerCase().includes(q) ||
        bm.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    addBookmark({
      title: title.trim(),
      url: url.trim(),
      category,
      type,
      tags: tags.split(" ").filter((t) => t.startsWith("#") || t.length > 0),
      notes: notes.trim() || undefined,
      isFavorite: false,
      isRead: false,
    });

    setTitle("");
    setUrl("");
    setNotes("");
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: BookmarkItem["category"]) => {
    switch (cat) {
      case "GitHub":
        return <Code2 className="w-4 h-4 text-[#0052FF]" />;
      case "YouTube":
        return <Video className="w-4 h-4 text-rose-500" />;
      case "Books":
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case "Articles":
        return <FileText className="w-4 h-4 text-sky-500" />;
      default:
        return <Globe className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <ModuleContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Resources & Vault
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Curate GitHub repos, technical whitepapers, YouTube tutorials, and
            architectural blueprints
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Resource</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 ios-card rounded-2xl bg-card border border-border overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#0052FF] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Input
          leftIcon={<Search className="w-3.5 h-3.5" />}
          placeholder="Search resources & tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
          containerClassName="w-full sm:w-64"
        />
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl ios-card border border-border space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto shadow-sm">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              No Saved Resources Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Save key GitHub repositories, documentation links, and tools to
              build your developer vault.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-4 py-2 shadow-sm cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredBookmarks.map((bm) => (
            <div
              key={bm.id}
              className="ios-card rounded-3xl p-5 space-y-3 relative flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-muted">
                      {getCategoryIcon(bm.category)}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {bm.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleBookmarkFavorite(bm.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        bm.isFavorite
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBookmark(bm.id)}
                      className="p-1.5 text-muted-foreground hover:text-rose-500 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm sm:text-base font-bold text-card-foreground hover:text-[#0052FF] transition flex items-center gap-1.5 group"
                  >
                    <span className="truncate">{bm.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition shrink-0" />
                  </a>

                  {bm.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {bm.notes}
                    </p>
                  )}
                </div>

                {/* Tags */}
                {bm.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {bm.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-[11px] text-muted-foreground">
                <span>Added {formatDatePretty(bm.createdAt)}</span>

                <button
                  onClick={() => toggleBookmarkRead(bm.id)}
                  className={`flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                    bm.isRead
                      ? "text-emerald-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{bm.isRead ? "Reviewed" : "To Read"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Bookmark Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Save Resource to Vault"
        description="Bookmark high-leverage tools, repositories, books, and articles."
        icon={<Bookmark className="w-4 h-4" />}
        topAccentColor="#0052FF"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBookmark} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Title *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. System Design Primer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              URL *
            </label>
            <Input
              type="url"
              required
              placeholder="https://github.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Category
              </label>
              <CustomSelect
                value={category}
                onChange={(val) => setCategory(val as BookmarkItem["category"])}
                options={[
                  { value: "GitHub", label: "GitHub" },
                  { value: "Books", label: "Books" },
                  { value: "Articles", label: "Articles" },
                  { value: "YouTube", label: "YouTube" },
                  { value: "Tools", label: "Tools" },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Type
              </label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as BookmarkItem["type"])}
                options={[
                  { value: "repo", label: "Repository" },
                  { value: "book", label: "Book" },
                  { value: "article", label: "Article" },
                  { value: "video", label: "Video" },
                  { value: "tool", label: "Tool" },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Tags
            </label>
            <Input
              type="text"
              placeholder="#Architecture #Distributed"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Personal Notes
            </label>
            <textarea
              rows={2}
              placeholder="Why is this resource valuable? Key takeaways..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-[#0052FF] text-foreground transition resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-semibold rounded-xl px-5 py-2 shadow-sm cursor-pointer"
            >
              Save Resource
            </Button>
          </div>
        </form>
      </Modal>
    </ModuleContainer>
  );
}
