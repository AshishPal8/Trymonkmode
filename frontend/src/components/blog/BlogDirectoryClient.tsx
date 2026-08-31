"use client";

import React, { useState, useMemo } from "react";
import { BlogCard, BlogItemProps } from "./BlogCard";
import {
  Search,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { BrushHighlight } from "../common/BrushHighlight";

const CATEGORIES = [
  "All",
  "Deep Work",
  "Monk Mode",
  "Mindset",
  "Habits",
  "Time Management",
  "Productivity",
];

export function BlogDirectoryClient({
  initialBlogs,
}: {
  initialBlogs: BlogItemProps[];
}) {
  const [blogs] = useState<BlogItemProps[]>(initialBlogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Filtered by Search & Category
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTag =
        selectedTag === "All" ||
        b.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [blogs, searchQuery, selectedTag]);

  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {/* Hero Header with Brush Highlight */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3 h-3" />
          <span>THE MONK JOURNAL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Frameworks for{" "}
          <BrushHighlight color="#0052FF">Deep Focus</BrushHighlight> & Habit
          Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          Science-backed systems, neurochemical focus protocols, and actionable
          execution blueprints to help you win your day.
        </p>
      </div>

      {/* Interactive Controls Bar: Search & Category Pills */}
      <div className="space-y-3.5 max-w-3xl mx-auto">
        {/* Search Input Box */}
        <div className="relative w-full max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search articles, topics, or keywords..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xs focus:shadow-md focus:border-[#0052FF] text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 pt-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedTag === cat;
            return (
              <button
                key={cat}
                onClick={() => handleTagChange(cat)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0052FF] text-white shadow-xs scale-105"
                    : "bg-white/80 backdrop-blur-md text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {paginatedBlogs.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-xs space-y-2.5 max-w-md mx-auto">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            No Articles Found
          </h3>
          <p className="text-xs text-slate-500">
            We couldn&apos;t find any articles matching &quot;{searchQuery}
            &quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("All");
            }}
            className="text-xs font-bold text-[#0052FF] hover:underline cursor-pointer pt-1"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2.5 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#0052FF] hover:text-[#0052FF] disabled:opacity-40 disabled:pointer-events-none transition shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-600 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-700 hover:border-[#0052FF] hover:text-[#0052FF] disabled:opacity-40 disabled:pointer-events-none transition shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
