"use client";

import React, { useState, useEffect, useMemo } from "react";
import { blogsApi } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Modal } from "@/components/ui/modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export function generateUrlFriendlySlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface BlogRecord {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  author: string;
  authorAvatar?: string | null;
  tags: string[];
  readTimeMinutes: number;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
}

export function AdminBlogsTab() {
  const [blogsList, setBlogsList] = useState<BlogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Editor Modal State
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("Ashish Pal");
  const [tagsStr, setTagsStr] = useState("Productivity, Deep Work");
  const [readTime, setReadTime] = useState(5);
  const [isActive, setIsActive] = useState(true);
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch blogs
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await blogsApi.getAllBlogsAdmin({ limit: 100 });
      if (res?.data?.data?.items && Array.isArray(res.data.data.items)) {
        setBlogsList(res.data.data.items);
      }
    } catch {
      toast.error("Failed to load blog articles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Open Editor for New
  const handleOpenNew = () => {
    setEditingBlogId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContent(
      `# Introduction\n\nWrite your inspiring article here in markdown format.\n\n## Key Takeaways\n- Point 1\n- Point 2\n`,
    );
    setCoverImage(
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    );
    setAuthor("Ashish Pal");
    setTagsStr("Productivity, Deep Work");
    setReadTime(5);
    setIsActive(true);
    setEditorTab("write");
    setShowEditor(true);
  };

  // Open Editor for Edit
  const handleOpenEdit = (blog: BlogRecord) => {
    setEditingBlogId(blog.id);
    setTitle(blog.title);
    setSlug(blog.slug);
    setDescription(blog.description || "");
    setContent(blog.content || "");
    setCoverImage(blog.coverImage || "");
    setAuthor(blog.author || "Ashish Pal");
    setTagsStr(
      Array.isArray(blog.tags) ? blog.tags.join(", ") : "Productivity",
    );
    setReadTime(blog.readTimeMinutes || 5);
    setIsActive(blog.isActive);
    setEditorTab("write");
    setShowEditor(true);
  };

  // Auto-slug generator on title change
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingBlogId) {
      setSlug(generateUrlFriendlySlug(val));
    }
  };

  // Save Blog
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.warning("Title, slug, and content are required.");
      return;
    }

    setIsSaving(true);
    const parsedTags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      content: content.trim(),
      coverImage: coverImage.trim(),
      author: author.trim() || "Monk Mode Team",
      tags: parsedTags.length > 0 ? parsedTags : ["Productivity"],
      readTimeMinutes: Number(readTime) || 5,
      isActive,
    };

    try {
      if (editingBlogId) {
        await blogsApi.updateBlog(editingBlogId, payload);
        toast.success("Article updated successfully!");
      } else {
        await blogsApi.createBlog(payload);
        toast.success("Article published successfully!");
      }
      setShowEditor(false);
      fetchBlogs();
    } catch {
      toast.error("Failed to save article. Make sure slug is unique.");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Toggle Active/Draft
  const handleToggleStatus = async (blog: BlogRecord) => {
    const nextStatus = !blog.isActive;
    setBlogsList((prev) =>
      prev.map((b) => (b.id === blog.id ? { ...b, isActive: nextStatus } : b)),
    );

    try {
      await blogsApi.updateBlog(blog.id, { isActive: nextStatus });
      toast.success(
        nextStatus ? "Article is now Live" : "Article set to Draft",
      );
    } catch {
      toast.error("Failed to toggle article status.");
      fetchBlogs();
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (blog: BlogRecord) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return;

    setBlogsList((prev) => prev.filter((b) => b.id !== blog.id));
    try {
      await blogsApi.deleteBlog(blog.id);
      toast.success("Article deleted.");
    } catch {
      toast.error("Failed to delete article.");
      fetchBlogs();
    }
  };

  // Filtered Blogs
  const filteredBlogs = useMemo(() => {
    return blogsList.filter((b) => {
      return (
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [blogsList, searchQuery]);

  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, currentPage]);

  return (
    <div className="space-y-3 animate-in fade-in-50 duration-200">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Input
          leftIcon={<Search className="w-3.5 h-3.5" />}
          placeholder="Search articles by title or slug..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          onClear={() => setSearchQuery("")}
          containerClassName="w-full sm:w-72"
        />

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchBlogs}
            disabled={isLoading}
            variant="outline"
            className="p-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
            title="Refresh articles"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>

          <Button
            onClick={handleOpenNew}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-4 py-2 shadow-xs transition transform active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </Button>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="rounded-3xl ios-card bg-card border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border font-bold">
              <tr>
                <th className="px-5 py-3.5">Article</th>
                <th className="px-5 py-3.5">Slug & URL</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Tags & Stats</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span>Loading published articles...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedBlogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No articles found. Click &quot;New Article&quot; to publish
                    your first post!
                  </td>
                </tr>
              ) : (
                paginatedBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Article Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border shrink-0 overflow-hidden">
                          {blog.coverImage ? (
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-foreground truncate">
                            {blog.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {blog.description || "No excerpt provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug & URL */}
                    <td className="px-5 py-3.5">
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-primary hover:underline"
                      >
                        <span>/blog/{blog.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition cursor-pointer ${
                          blog.isActive
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        }`}
                      >
                        {blog.isActive ? "Published" : "Draft / Inactive"}
                      </button>
                    </td>

                    {/* Tags & Views */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-foreground font-semibold">
                          {blog.readTimeMinutes || 5} min read
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {blog.viewCount || 0}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-foreground transition cursor-pointer"
                          title="Edit article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t border-border text-xs text-muted-foreground">
          <span>
            Showing {paginatedBlogs.length} of {filteredBlogs.length} articles
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-semibold text-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingBlogId ? "Edit Blog Article" : "Create New SEO Article"}
        description="Markdown-powered content engine with automatic SEO indexing."
        icon={<BookOpen className="w-4 h-4" />}
        topAccentColor="#0052FF"
        maxWidth="3xl"
        className="max-h-[90vh]"
      >
        <form
          onSubmit={handleSaveBlog}
          className="max-h-[72vh] overflow-y-auto px-1.5 py-1 space-y-4 pt-1"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Article Title *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. The 4-Hour Deep Work Protocol"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {/* URL Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                URL Slug * (https://trymonkmode.in/blog/...)
              </label>
              <Input
                type="text"
                required
                placeholder="the-4-hour-deep-work-protocol"
                value={slug}
                onChange={(e) =>
                  setSlug(generateUrlFriendlySlug(e.target.value))
                }
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Cover Image Upload */}
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Cover Image (Auto-Optimized with Sharp & ImageKit)
              </label>
              <ImageUpload
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
                folder="trymonkmode/blogs"
              />
            </div>

            {/* Read Time & Author */}
            <div className="sm:col-span-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Read Time (Mins)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={readTime}
                  onChange={(e) => setReadTime(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Author Name
                </label>
                <Input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Tags (Comma Separated)
              </label>
              <Input
                type="text"
                placeholder="Productivity, Monk Mode, Habits"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Author Name
              </label>
              <Input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          {/* Description / Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              SEO Meta Description & Excerpt
            </label>
            <textarea
              rows={2}
              placeholder="Short 2-sentence summary that appears in Google search results..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition resize-none"
            />
          </div>

          {/* Markdown Content Editor */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground">
                Article Markdown Content *
              </label>
              <div className="flex items-center gap-1 p-0.5 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    editorTab === "write"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Markdown Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    editorTab === "preview"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live Preview
                </button>
              </div>
            </div>

            {editorTab === "write" ? (
              <textarea
                rows={10}
                required
                placeholder="# Heading 1&#10;&#10;Write your body text here in standard Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-muted/40 border border-border font-mono text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-muted/20 border border-border min-h-[200px] max-h-[300px] overflow-y-auto">
                {content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1
                          className="text-lg sm:text-xl font-extrabold text-foreground mt-4 mb-2 tracking-tight pb-1 border-b border-border"
                          {...props}
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2 tracking-tight pb-1 border-b border-border"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1.5"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="text-xs text-muted-foreground leading-relaxed mb-3"
                          {...props}
                        />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote
                          className="border-l-3 border-primary bg-primary/10 px-3.5 py-2 my-2.5 rounded-r-xl text-foreground italic text-xs leading-relaxed"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="my-2 pl-4 space-y-1 list-disc text-foreground text-xs leading-relaxed"
                          {...props}
                        />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol
                          className="my-2 pl-4 space-y-1 list-decimal text-foreground text-xs leading-relaxed"
                          {...props}
                        />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="pl-1" {...props} />
                      ),
                      code: ({ node, className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary font-semibold"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      pre: ({ node, ...props }) => (
                        <pre
                          className="bg-slate-950 text-slate-100 p-3.5 rounded-xl overflow-x-auto my-3 font-mono text-xs"
                          {...props}
                        />
                      ),
                      hr: ({ node, ...props }) => (
                        <hr className="my-4 border-border" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a
                          className="text-primary font-semibold underline underline-offset-2 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No content written yet. Switch to &quot;Markdown
                    Editor&quot; to write.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border">
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Publishing Status
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isActive
                  ? "Article is immediately visible on /blog."
                  : "Article is saved as Draft."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              {isActive ? "Live Public" : "Draft / Inactive"}
            </button>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditor(false)}
              className="rounded-xl border-border text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-5 py-2 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isSaving
                  ? "Saving..."
                  : editingBlogId
                    ? "Update Article"
                    : "Publish Article"}
              </span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
