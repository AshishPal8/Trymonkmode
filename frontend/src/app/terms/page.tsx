import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalNavTabs } from "@/components/legal/LegalNavTabs";
import { BrushHighlight } from "@/components/common/BrushHighlight";
import { FileText, Sparkles } from "lucide-react";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Terms of Service — TryMonkMode",
  description:
    "Honest, human-friendly terms of service for TryMonkMode users. 100% content ownership, fair usage, and no surprises.",
  openGraph: {
    title: "Terms of Service — TryMonkMode",
    description:
      "Simple, honest terms for TryMonkMode. You own every word and task you create.",
    url: "https://trymonkmode.in/terms",
    siteName: "TryMonkMode",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-indigo-500/10 via-purple-400/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-[#0052FF]/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-0 w-[500px] h-[500px] bg-[#10B981]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-20 flex-1 w-full">
        {/* Navigation Tabs */}
        <LegalNavTabs />

        {/* Page Header with Brush Design */}
        <div className="space-y-5 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#8B5CF6] text-xs font-bold shadow-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>Honest & Fair Agreement</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.3]">
            Simple & <BrushHighlight color="#8B5CF6">Fair Terms</BrushHighlight>
            .
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
            We believe terms of service shouldn’t require a law degree. Here is
            how we run TryMonkMode fairly and respectfully.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Last updated: September 2026</span>
            <span>•</span>
            <span>Takes 2 minutes to read</span>
          </div>
        </div>

        {/* 30-Second Summary Pill Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-purple-100 shadow-[0_4px_20px_rgba(139,92,246,0.04)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-[#8B5CF6] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>The Quick Summary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#8B5CF6]">✓</span> 100% Ownership
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You own all tasks, thoughts, and reflections you input into the
                app.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#0052FF]">✓</span> Fair & Respectful
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use it for productive focus. Do not spam, attack, or abuse our
                infrastructure.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Leave Anytime
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                No locked-in contracts. You can delete your workspace whenever
                you wish.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Detail Cards */}
        <div className="space-y-6 text-slate-700">
          {/* Card 1 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center font-bold text-sm shadow-xs">
                01
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Welcome to TryMonkMode
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              By using TryMonkMode, you agree to these simple terms. If you
              don&apos;t agree, that&apos;s totally fine, but please do not use
              the application.
            </p>
          </section>

          {/* Card 2 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold text-sm shadow-xs">
                02
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                You own your content 100%
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Everything you create inside TryMonkMode — your sprint goals,
              notes, Eisenhower priorities, daily journals, and budgets —
              remains <strong>100% your intellectual property</strong>. We will
              never claim ownership over your ideas.
            </p>
          </section>

          {/* Card 3 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold text-sm shadow-xs">
                03
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Fair Use & Responsible Behavior
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We provide TryMonkMode to help people focus and build good habits.
              You agree not to:
            </p>
            <ul className="space-y-2 text-sm text-slate-600 pl-1">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>
                  Attempt to exploit, hack, or overload our backend servers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>
                  Send automated bot traffic or reverse-engineer private APIs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>
                  Distribute malware or attempt unauthorized access to other
                  accounts.
                </span>
              </li>
            </ul>
          </section>

          {/* Card 4 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shadow-xs">
                04
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Service Reliability & Updates
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We continuously push updates and strive to maintain 99.9% uptime.
              While we work hard to keep everything running seamlessly,
              occasional short maintenance periods may occur.
            </p>
          </section>

          {/* Card 5 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shadow-xs">
                05
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Closing Your Account
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              You can stop using TryMonkMode at any time. We also reserve the
              right to close accounts that intentionally attack our
              infrastructure or harass our users.
            </p>
          </section>

          {/* Contact Card */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-white border border-purple-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Questions about our terms?
              </h3>
              <p className="text-xs text-slate-600 max-w-md">
                We are real builders building in public. Reach out directly on
                Instagram anytime.
              </p>
            </div>

            <a
              href="https://instagram.com/trymonkmode.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-105 shrink-0"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>DM @trymonkmode.in</span>
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
