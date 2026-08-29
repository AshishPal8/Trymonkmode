'use client';

import React from 'react';

export function LandingMetrics() {
  return (
    <section className="py-12 border-y border-border/60 bg-muted/30 dark:bg-zinc-950/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">50k+</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Daily Builders</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0052FF] dark:text-[#60A5FA] tracking-tight">4.9 / 5</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community Rating</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-500 tracking-tight">94%</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Streak Completion Rate</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">1.5M+</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deep Focus Minutes</p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/40 text-center">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Seamlessly integrates with your modern stack
          </span>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted-foreground font-bold text-xs sm:text-sm">
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ Notion</span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ Linear</span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ Google Calendar</span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ GitHub</span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ Apple Health</span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition">✦ Raycast</span>
          </div>
        </div>
      </div>
    </section>
  );
}