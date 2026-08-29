"use client";

import React from "react";
import Image from "next/image";
import { appIcon } from "@/assets";

export function LandingFooter() {
  return (
    <footer className="pt-20 pb-12 bg-[#070B14] text-slate-300 border-t border-slate-800 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-[#0052FF]/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-purple-500/8 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-10">
          {/* Column 1 & 2: Brand Info & Description */}
          <div className="md:col-span-2 space-y-5">
            {/* Dark Mode Brand Logo */}
            <div className="inline-flex items-center gap-3 select-none">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 shrink-0 select-none">
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
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The all-in-one productivity operating system for deep focus,
              atomic habits, sprint matrix, and financial clarity. Designed for
              ambitious builders.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Cloud Systems Operational</span>
            </div>
          </div>

          {/* Column 3: Features */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#tasks" className="hover:text-white transition">
                  Sprint Tasks Matrix
                </a>
              </li>
              <li>
                <a href="#journal" className="hover:text-white transition">
                  Daily Reflection Journal
                </a>
              </li>
              <li>
                <a href="#finance" className="hover:text-white transition">
                  Financial Wave Charts
                </a>
              </li>
              <li>
                <a href="#tasks" className="hover:text-white transition">
                  Eisenhower Priority Grid
                </a>
              </li>
              <li>
                <a href="#tasks" className="hover:text-white transition">
                  Pomodoro Deep Focus
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
              <li>
                <a href="#" className="hover:text-white transition">
                  Web Cloud Workspace
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  macOS & Windows App
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  iOS & Android PWA
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Offline-First Cloud Sync
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  256-bit Encrypted Vault
                </a>
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
                  className="hover:text-[#0052FF] text-white font-semibold transition flex items-center gap-1.5"
                >
                  <span>Instagram: @trymonkmode.in</span>
                </a>
              </li>
              <li>
                <a
                  href="https://trymonkmode.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#0052FF] text-white font-semibold transition"
                >
                  <span>Domain: trymonkmode.in</span>
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <span>© 2026 TryMonkMode Technologies. All rights reserved.</span>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-300 transition">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
