"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { blogsApi } from "@/lib/api";
import { ArrowRight, Sparkles } from "lucide-react";
import { BlogCard, BlogItemProps } from "../blog/BlogCard";
import { BrushHighlight } from "../common/BrushHighlight";

export function LandingBlogs() {
  const [blogs, setBlogs] = useState<BlogItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    blogsApi
      .getPublicBlogs({ limit: 6 })
      .then((res) => {
        if (res?.data?.data?.items && Array.isArray(res.data.data.items)) {
          setBlogs(res.data.data.items);
        }
      })
      .catch((err) => console.error("Error loading featured blogs:", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && blogs.length === 0) {
    return null;
  }

  return (
    <section
      id="blog"
      className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 relative"
    >
      {/* Section Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-r from-[#0052FF]/6 via-purple-500/4 to-emerald-500/4 blur-[130px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center space-y-3 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#0052FF]/10 border border-[#0052FF]/20 text-[#0052FF] text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3 h-3" />
          <span>PROVEN FRAMEWORKS</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Latest from the{" "}
          <BrushHighlight color="#0052FF">Monk Journal</BrushHighlight>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          Actionable blueprints, neurochemical insights, and science-backed
          systems to maximize your daily flow state.
        </p>
      </div>

      {/* 6 Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? [1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-[28px] bg-white/50 border border-slate-200/60 animate-pulse"
              />
            ))
          : blogs
              .slice(0, 6)
              .map((blog) => <BlogCard key={blog.id} blog={blog} />)}
      </div>

      {/* View All Button */}
      <div className="text-center pt-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:border-[#0052FF] hover:text-[#0052FF] hover:shadow-md transition-all hover:scale-105"
        >
          <span>Explore All Articles</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
