import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock, Sparkles, ArrowRight } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const dynamic = "force-dynamic";

interface BlogPostDetail {
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
  viewCount: number;
  createdAt: string;
}

// Fetch single blog on Server (SSR)
async function getBlogBySlug(slug: string): Promise<BlogPostDetail | null> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/blogs/${slug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error("Error fetching blog post by slug:", err);
    return null;
  }
}

// Dynamic SEO Metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Article Not Found | TryMonkMode",
    };
  }

  const siteUrl = "https://trymonkmode.in";
  const postUrl = `${siteUrl}/blog/${blog.slug}`;

  return {
    title: `${blog.title} | TryMonkMode Blog`,
    description: blog.description || "Master deep work and mental clarity.",
    authors: [{ name: blog.author || "Monk Mode Team" }],
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: postUrl,
      siteName: "TryMonkMode",
      images: [
        {
          url: blog.coverImage || `${siteUrl}/landingimg.png`,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      type: "article",
      publishedTime: blog.createdAt,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: [blog.coverImage || `${siteUrl}/landingimg.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Strip redundant top-level # heading if it repeats the article title
  const cleanMarkdown = (blog.content || "").replace(/^#\s+[^\n]+\n+/, "");

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-[#0052FF]/8 via-purple-400/4 to-transparent blur-[130px] pointer-events-none -z-10" />

      {/* 1. Universal Landing Navbar */}
      <LandingNavbar />

      {/* 2. Main Article Reader */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16 flex-1 space-y-6">
        {/* Back Button (Fixed single arrow) */}
        <div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0052FF] transition bg-white/90 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs hover:shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to all articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <div className="space-y-3 text-center max-w-2xl mx-auto pt-1">
          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {(blog.tags || ["Productivity"]).map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-0.5 rounded-full bg-[#0052FF]/8 text-[#0052FF] text-[11px] font-bold tracking-tight border border-[#0052FF]/15"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-snug">
            {blog.title}
          </h1>

          {/* Author & Stats Pill */}
          <div className="inline-flex items-center justify-center gap-3 text-xs text-slate-500 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200/70 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              {blog.authorAvatar ? (
                <img
                  src={blog.authorAvatar}
                  alt={blog.author}
                  className="w-4 h-4 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-[8px]">
                  {blog.author ? blog.author.slice(0, 1).toUpperCase() : "M"}
                </div>
              )}
              <span>{blog.author || "Monk Mode Team"}</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {blog.readTimeMinutes || 5} min read
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Cover Image */}
        {blog.coverImage && (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 max-h-[360px] sm:max-h-[400px] w-full bg-slate-100">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Clean React-Markdown Body Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ node, ...props }) => (
                <h2
                  className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 tracking-tight pb-1.5 border-b border-slate-100"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-lg sm:text-xl font-bold text-slate-900 mt-6 mb-2.5 tracking-tight pb-1 border-b border-slate-100"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-base sm:text-lg font-bold text-slate-800 mt-4 mb-2 tracking-tight"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed sm:leading-7 mb-3.5"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-3 border-[#0052FF] bg-slate-50/80 px-4 py-2.5 my-3 rounded-r-xl text-slate-700 italic text-xs sm:text-sm leading-relaxed"
                  {...props}
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  className="my-2.5 pl-5 space-y-1.5 list-disc text-slate-700 text-xs sm:text-sm leading-relaxed"
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  className="my-2.5 pl-5 space-y-1.5 list-decimal text-slate-700 text-xs sm:text-sm leading-relaxed"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
              code: ({ node, className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code
                    className="px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-[#0052FF] font-semibold"
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
                  className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl overflow-x-auto my-4 font-mono text-xs shadow-sm"
                  {...props}
                />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-slate-200" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-[#0052FF] font-semibold underline underline-offset-2 hover:text-[#0043D6] transition"
                  target="_blank"
                  rel="noreferrer"
                  {...props}
                />
              ),
            }}
          >
            {cleanMarkdown}
          </ReactMarkdown>
        </div>

        {/* Bottom CTA Box */}
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>START YOUR JOURNEY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to execute in Monk Mode?
            </h3>
            <p className="text-xs text-slate-300 max-w-md">
              Start logging daily focus sessions, tracking atomic habits, and mastering your time with TryMonkMode.
            </p>
          </div>

          <Link
            href="/"
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md transition-all text-center flex items-center justify-center gap-1.5 hover:scale-105 shrink-0 relative z-10"
          >
            <span>Launch Free App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      {/* 3. Universal Landing Footer */}
      <LandingFooter />
    </div>
  );
}
