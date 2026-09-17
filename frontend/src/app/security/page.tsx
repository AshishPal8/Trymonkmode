import React from "react";
import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LegalNavTabs } from "@/components/legal/LegalNavTabs";
import { BrushHighlight } from "@/components/common/BrushHighlight";
import { Lock, Sparkles, Check } from "lucide-react";

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
  title: "Security & Data Protection — TryMonkMode",
  description:
    "Learn how TryMonkMode protects your workspace with TLS 1.3 encryption, zero-password Google OAuth, and managed cloud isolation.",
  openGraph: {
    title: "Security & Data Protection — TryMonkMode",
    description:
      "Modern encryption, zero-password Google OAuth, and secure cloud storage for TryMonkMode.",
    url: "https://trymonkmode.in/security",
    siteName: "TryMonkMode",
    type: "website",
  },
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-emerald-500/10 via-cyan-400/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-[#0052FF]/5 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Navbar */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-20 flex-1 w-full">
        {/* Navigation Tabs */}
        <LegalNavTabs />

        {/* Page Header with Brush Design */}
        <div className="space-y-5 mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold shadow-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Infrastructure & Protection</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.3]">
            Built for{" "}
            <BrushHighlight color="#10B981">Deep Security</BrushHighlight>.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
            How we protect your workspace, encrypt your data, and ensure your
            private thoughts and daily focus logs stay strictly secure.
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Last updated: September 2026</span>
            <span>•</span>
            <span>Takes 2 minutes to read</span>
          </div>
        </div>

        {/* 30-Second Summary Pill Box */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.04)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 mb-4">
            <Sparkles className="w-4 h-4" />
            <span>The Quick Summary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> No Passwords
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We use Google OAuth so you never risk sharing or exposing a
                password.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#0052FF]">✓</span> TLS 1.3 HTTPS
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                All data in transit is encrypted using the highest modern TLS
                standards.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/60">
              <div className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <span className="text-[#8B5CF6]">✓</span> Cloud Isolation
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Database backups and SSL connection pools guard against
                unauthorized access.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Detail Cards */}
        <div className="space-y-6 text-slate-700">
          {/* Card 1 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-xs">
                01
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Zero-Password Authentication
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Traditional password databases are the most common source of data
              leaks. That’s why TryMonkMode uses{" "}
              <strong>Google OAuth 2.0</strong>:
            </p>
            <div className="space-y-2.5 pt-1 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  We never handle, see, or store your master password.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Your login sessions are stored in encrypted{" "}
                  <code>HttpOnly</code>, <code>SameSite=Lax</code> cookies that
                  cannot be stolen by client-side browser scripts.
                </span>
              </div>
            </div>
          </section>

          {/* Card 2 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0052FF] flex items-center justify-center font-bold text-sm shadow-xs">
                02
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                End-to-End Encryption in Transit
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Every request between your browser and our servers is forced over{" "}
              <strong>HTTPS with TLS 1.3</strong>. This guarantees that your
              tasks, journal entries, and focus logs cannot be intercepted on
              public Wi-Fi or coffee shop networks.
            </p>
          </section>

          {/* Card 3 */}
          <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center font-bold text-sm shadow-xs">
                03
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Database Isolation & Backups
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              We run managed PostgreSQL on Neon with:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-1">
                  Encrypted Disk Storage
                </strong>
                Data at rest is stored on encrypted NVMe volumes with AES-256
                standards.
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <strong className="text-slate-900 font-bold block mb-1">
                  Daily Automated Snapshots
                </strong>
                Continuous point-in-time recovery protects against accidental
                data corruption.
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
                Client-Side Sandbox & Offline Cache
              </h2>
            </div>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Your browser stores temporary offline cache data in IndexedDB and
              LocalStorage, isolated strictly to the <code>trymonkmode.in</code>{" "}
              domain. We don&apos;t embed third-party tracking pixels that could
              leak your browsing context.
            </p>
          </section>

          {/* Contact Card */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white border border-emerald-200/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Found a vulnerability or have a security question?
              </h3>
              <p className="text-xs text-slate-600 max-w-md">
                We welcome responsible reports from developers and researchers.
                DM us on Instagram for immediate attention.
              </p>
            </div>

            <a
              href="https://instagram.com/trymonkmode.in"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-105 shrink-0"
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
