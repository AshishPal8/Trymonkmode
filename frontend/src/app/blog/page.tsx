import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { BlogDirectoryClient } from "@/components/blog/BlogDirectoryClient";
import { BlogItemProps } from "@/components/blog/BlogCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Monk Journal — Deep Work & Habit Mastery | TryMonkMode",
  description:
    "Explore neurochemical frameworks for 4-hour deep work, dopamine detox blueprints, atomic habit stacking, and daily execution.",
  openGraph: {
    title: "The Monk Journal — Deep Work & Habit Mastery | TryMonkMode",
    description:
      "Explore neurochemical frameworks for 4-hour deep work, dopamine detox blueprints, atomic habit stacking, and daily execution.",
    url: "https://trymonkmode.in/blog",
    siteName: "TryMonkMode",
    type: "website",
  },
};

// Fetch public blogs on Server (SSR)
async function getBlogs(): Promise<BlogItemProps[]> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/blogs?limit=50`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.items || [];
  } catch (err) {
    console.error("Error fetching blogs on server:", err);
    return [];
  }
}

export default async function BlogDirectoryPage() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Soft Pastel Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-[#0052FF]/10 via-purple-400/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[35%] right-0 w-[500px] h-[500px] bg-[#10B981]/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[160px] pointer-events-none -z-10" />

      {/* 1. Universal Landing Navbar */}
      <LandingNavbar />

      {/* 2. Interactive Blog Client (Hero, Search, Category Filter & Cards) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex-1">
        <BlogDirectoryClient initialBlogs={blogs} />
      </main>

      {/* 3. Universal Landing Footer */}
      <LandingFooter />
    </div>
  );
}
