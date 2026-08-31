"use client";

import React from "react";
import Link from "next/link";
import { Clock, ArrowUpRight, BookOpen, User } from "lucide-react";

export interface BlogItemProps {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  author: string;
  authorAvatar?: string | null;
  tags: string[];
  readTimeMinutes: number;
  viewCount?: number;
  createdAt: string;
}

export function BlogCard({ blog }: { blog: BlogItemProps }) {
  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col rounded-[28px] bg-white/80 backdrop-blur-xl border border-slate-200/80 hover:border-[#0052FF]/30 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,82,255,0.09)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden relative">
      {/* Top Image Container */}
      <Link
        href={`/blog/${blog.slug}`}
        className="relative h-52 w-full overflow-hidden bg-slate-100/80 block"
      >
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
            <BookOpen className="w-8 h-8" />
          </div>
        )}

        {/* Liquid Glass Floating Read Time Pill */}
        <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
          <Clock className="w-3 h-3 text-blue-300" />
          <span>{blog.readTimeMinutes || 5} min read</span>
        </div>

        {/* Floating Top-Right Hover Action Arrow */}
        <div className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 shadow-md">
          <ArrowUpRight className="w-4 h-4 text-[#0052FF]" />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(blog.tags || ["Productivity"]).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-full bg-[#0052FF]/8 text-[#0052FF] text-[10px] font-bold tracking-tight border border-[#0052FF]/15"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <Link href={`/blog/${blog.slug}`} className="block">
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0052FF] transition-colors line-clamp-2 leading-snug tracking-tight">
              {blog.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {blog.description}
          </p>
        </div>

        {/* Author & Date Footer */}
        <div className="pt-4 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {blog.authorAvatar ? (
              <img
                src={blog.authorAvatar}
                alt={blog.author}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">
                {blog.author ? blog.author.slice(0, 1).toUpperCase() : "M"}
              </div>
            )}
            <span className="font-semibold text-slate-700 text-xs">
              {blog.author || "Monk Team"}
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-400">
            {formattedDate}
          </span>
        </div>
      </div>
    </article>
  );
}
