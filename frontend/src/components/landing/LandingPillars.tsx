'use client';

import React from 'react';
import { Layers, Clock, Flame, Grid, FileText, ChevronRight } from 'lucide-react';

export function LandingPillars() {
  return (
    <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
          <Layers className="w-3.5 h-3.5 text-[#0052FF]" />
          <span>The 4 Non-Negotiable Pillars</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Built for Extreme Focus & Execution
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Every feature is engineered to eliminate friction, prevent burnout, and give you crystal-clear clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl ios-card border border-border/80 hover:border-[#0052FF]/50 transition-all duration-300 hover:-translate-y-1 shadow-lg space-y-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-blue-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">Deep Focus Engine</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            25m Pomodoros and 90m deep work sprints with custom ambient audio bell triggers and XP rewards.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#0052FF] dark:text-[#60A5FA]">
            <span>Learn deep flow</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="p-6 rounded-3xl ios-card border border-border/80 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg space-y-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">Atomic Habit Matrix</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Track daily habits, 7-day target cycles, and milestone streaks with instant celebration confetti.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-500">
            <span>View streak mechanics</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="p-6 rounded-3xl ios-card border border-border/80 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg space-y-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Grid className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">Eisenhower Matrix</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            4-quadrant visual prioritization (Urgent & Important) so you execute high-leverage tasks first.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
            <span>Prioritize with ease</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        <div className="p-6 rounded-3xl ios-card border border-border/80 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 shadow-lg space-y-4 relative overflow-hidden group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">Color Sticky Notes</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            8-color aesthetic pinboard for lightning-fast thoughts, research tags, snippets, and ideas.
          </p>
          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-purple-500">
            <span>Explore pinboard</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </section>
  );
}