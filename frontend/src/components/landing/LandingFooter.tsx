"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { appIcon } from "@/assets";
import { Shield, FileText, Lock, ExternalLink, Heart } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="pt-20 pb-12 bg-[#070B14] text-slate-300 border-t border-slate-800/80 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#0052FF]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-purple-500/8 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12">
          {/* Column 1 & 2: Brand Info & Tagline */}
          <div className="md:col-span-2 space-y-4">
            {/* Dark Mode Brand Logo */}
            <Link href="/" className="inline-flex items-center gap-3 select-none group">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 shrink-0 select-none group-hover:scale-105 transition-transform">
                <Image
                  src={appIcon}
                  alt="TryMonkMode Logo"
                  width={40}
                  height={40}
                  draggable={false}
                  className="w-full h-full object-contain rounded-xl no-drag select-none pointer-events-none"
                />
              </div>
              <div className="flex items-center tracking-tight font-sans text-xl font-extrabold">
                <span className="text-white">Try</span>
                <span className="text-[#0052FF]">MonkMode</span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The all-in-one productivity operating system for deep focus, atomic
              habits, sprint matrix, and daily reflections. Built for ambitious
              builders and students.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Column 3: Features & Tools */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/#tasks" className="hover:text-white transition">
                  Eisenhower Priority Matrix
                </Link>
              </li>
              <li>
                <Link href="/#tasks" className="hover:text-white transition">
                  Deep Work Pomodoro Timer
                </Link>
              </li>
              <li>
                <Link href="/#journal" className="hover:text-white transition">
                  Daily Reflection Journal
                </Link>
              </li>
              <li>
                <Link href="/#finance" className="hover:text-white transition">
                  Financial Wave Tracker
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  The Monk Journal Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Legal */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security & Encryption</span>
                </Link>
              </li>
              <li>
                <span className="text-slate-500 text-[11px] block pt-1">
                  100% User Data Ownership
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect & Community */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a
                  href="https://instagram.com/trymonkmode.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <span>Instagram (@trymonkmode.in)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              {/* Currently commented until live
              <li>
                <a
                  href="https://x.com/trymonkmode"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <span>Twitter / X (@trymonkmode)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@trymonkmode.in"
                  className="hover:text-[#0052FF] text-slate-300 transition flex items-center gap-1.5"
                >
                  <span>support@trymonkmode.in</span>
                </a>
              </li>
              */}
              <li>
                <span className="text-slate-500 text-[11px] block pt-1">
                  Made with <Heart className="w-3 h-3 inline text-red-400" /> for focused minds
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <span>© 2026 TryMonkMode. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-300 transition">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/security" className="hover:text-slate-300 transition">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

