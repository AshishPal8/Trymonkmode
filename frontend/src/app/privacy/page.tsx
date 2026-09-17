import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalNavTabs } from "@/components/legal/LegalNavTabs";
import { BrushHighlight } from "@/components/common/BrushHighlight";
import { Shield, CheckCircle2, Sparkles } from "lucide-react";

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
  title: "Privacy Policy — TryMonkMode",
  description:
    "We believe your focus logs, habits, and daily reflections belong to you. Zero data selling and 100% user data ownership.",
  openGraph: {
    title: "Privacy Policy — TryMonkMode",
    description:
      "Simple, honest privacy policy. Your thoughts and daily focus logs stay strictly yours.",
    url: "https://trymonkmode.in/privacy",
    siteName: "TryMonkMode",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Soft Ambient Glows matching Landing Page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#0052FF]/10 via-purple-400/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-[#10B981]/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-20 flex-1 w-full">
        {/* Navigation Tabs */}
        <LegalNavTabs />

        {/* Page Header with Brush Design */}
        <div className="space-y-5 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#0052FF] text-xs font-bold shadow-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Honest & Plain English</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.3]">
            Your <BrushHighlight color="#0052FF">Privacy</BrushHighlight> is
            100% Yours.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
            We built TryMonkMode to help you do deep work without noise. We
            never sell your data to brokers, and we never spy on your private
            notes or reflections.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Last updated: September 2026</span>
            <span>•</span>
            <span>Takes 2 minutes to read</span>
          </div>
        </div>

        {/* 30-Second Summary Pill Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-blue-100 shadow-[0_4px_20px_rgba(0,82,255,0.04)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0052FF] mb-4">
            <Sparkles className="w-4 h-4" />
            <span>The Quick Summary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#0052FF]">✓</span> Zero Data Selling
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We will never sell, rent, or trade your personal journals, habits,
                or focus data.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#8B5CF6]">✓</span> Minimal Storage
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We only store what is needed to sync your tasks and account
                across your devices.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#10B981]">✓</span> Delete Anytime
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can permanently delete your account and all stored data with
                a single click.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Detail Cards */}
        <div className="space-y-6 text-slate-700">
          {/* Card 1 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold text-sm shadow-xs">
                01
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                What information do we collect?
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We collect only the bare minimum needed for TryMonkMode to
              function properly:
            </p>
            <div className="space-y-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-sm">
                <strong className="text-slate-900 font-bold block mb-0.5">
                  1. Your Google Login Info
                </strong>
                When you log in via Google, Google securely shares your name,
                email, and avatar picture. We <strong>never</strong> see or
                store your Google password.
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-sm">
                <strong className="text-slate-900 font-bold block mb-0.5">
                  2. Your Workspace Entries
                </strong>
                The tasks you create, daily Pomodoro minutes, reflection journal
                notes, habit check-ins, and expense tracker entries. These are
                stored securely so you can access them from your phone or
                laptop.
              </div>
            </div>
          </section>

          {/* Card 2 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center font-bold text-sm shadow-xs">
                02
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                How do we use your data?
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Strictly to power your personal dashboard:
            </p>
            <ul className="space-y-2.5 text-sm text-slate-600 pl-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <span>
                  To sync your tasks, streak, and focus timer across all your
                  browser tabs and devices.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <span>
                  To calculate your 7-day focus stats, daily productivity score,
                  and habit consistency.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
                <span>
                  We <strong>never</strong> read your journal entries or train
                  public AI models on your personal notes.
                </span>
              </li>
            </ul>
          </section>

          {/* Card 3 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold text-sm shadow-xs">
                03
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Where is your data stored?
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We host TryMonkMode on battle-tested cloud infrastructure:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                <strong className="text-slate-900 font-bold block mb-1">
                  Encrypted Database
                </strong>
                Managed PostgreSQL on Neon with SSL connections and automated
                snapshots.
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100">
                <strong className="text-slate-900 font-bold block mb-1">
                  Forced HTTPS & TLS 1.3
                </strong>
                All network traffic is encrypted in transit between your browser
                and our servers.
              </div>
            </div>
          </section>

          {/* Card 4 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm shadow-xs">
                04
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Cookies & Local Storage
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We use <strong>HttpOnly secure cookies</strong> to keep you logged
              in safely without exposing tokens to browser scripts. We also
              store offline cache data in your browser so pages open with zero
              delay.
            </p>
          </section>

          {/* Card 5 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm shadow-xs">
                05
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Your Right to Delete
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              You own your data. If you ever decide to leave TryMonkMode, you
              can delete your account and all associated workspace records will
              be permanently removed from our active database.
            </p>
          </section>

          {/* Contact & Questions Card */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Have questions about your privacy?
              </h3>
              <p className="text-xs text-slate-600 max-w-md">
                We are always open to feedback. Message us directly on Instagram
                and we will be happy to help.
              </p>
            </div>

            <a
              href="https://instagram.com/trymonkmode.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
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
