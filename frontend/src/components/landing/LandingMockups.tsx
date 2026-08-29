'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  ArrowUpRight,
  Pin,
  Check,
  Tag,
  DollarSign,
  Shield,
  Layers
} from 'lucide-react';

/**
 * Base Smartphone Frame with Dynamic Island, Status Bar, and Liquid Glass Backdrop
 */
export function SmartphoneFrame({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-[280px] sm:w-[310px] md:w-[330px] rounded-[48px] p-3.5 bg-zinc-950/90 dark:bg-black/95 border-4 border-zinc-800/80 dark:border-zinc-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_30px_rgba(0,82,255,0.15)] ring-1 ring-white/20 backdrop-blur-3xl transition-transform duration-300 hover:scale-[1.02] ${className}`}
    >
      {/* Inner Screen */}
      <div className="relative w-full h-[540px] sm:h-[580px] rounded-[38px] bg-card/95 dark:bg-[#070D18]/95 overflow-hidden flex flex-col justify-between border border-border/50 text-foreground">
        {/* Status Bar & Dynamic Island */}
        <div className="pt-3 px-6 flex items-center justify-between z-20">
          <span className="text-[11px] font-bold tracking-tight text-foreground/80">09:41</span>
          <div className="w-20 h-4 rounded-full bg-zinc-950 dark:bg-black border border-white/10 flex items-center justify-center gap-1.5 px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[8px] font-bold text-white/90">Focus</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground/80">
            <div className="w-3.5 h-2 rounded-xs border border-current flex items-center p-0.5">
              <div className="w-full h-full bg-current rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col justify-between pt-2">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="pb-2 flex justify-center">
          <div className="w-28 h-1 rounded-full bg-foreground/20" />
        </div>
      </div>
    </div>
  );
}

/**
 * 1. Phone Mockup: Task Manager & Deep Work Sprints
 */
export function PhoneMockupTasks() {
  return (
    <SmartphoneFrame className="rotate-[-2deg]">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Focus</h4>
            <h3 className="text-base font-extrabold text-foreground">Winter Arc Day 18</h3>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-[#0052FF]/15 text-[#0052FF] dark:text-[#60A5FA] border border-[#0052FF]/30 text-[10px] font-bold flex items-center gap-1">
            <Flame className="w-3 h-3 fill-current text-amber-500" />
            <span>18d Streak</span>
          </div>
        </div>

        {/* Progress Pill Bar */}
        <div className="p-3 rounded-2xl bg-muted/60 border border-border/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-muted-foreground">Daily Progress</span>
            <span className="text-emerald-500 font-bold">4 / 5 Done (80%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-background overflow-hidden p-0.5 border border-border/40">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0052FF] to-emerald-400 w-[80%]" />
          </div>
        </div>

        {/* Task Items List */}
        <div className="space-y-2">
          {[
            { title: 'Deploy Cloud Infrastructure API', priority: 'P1', done: true, tag: 'Work' },
            { title: '45m Deep Workout & Cardio', priority: 'P1', done: true, tag: 'Health' },
            { title: '15m Daily Journal Reflection', priority: 'P2', done: true, tag: 'Mindset' },
            { title: 'Review System Architecture PRs', priority: 'P2', done: true, tag: 'Sprint' },
            { title: 'Read 10 Pages of Atomic Habits', priority: 'P3', done: false, tag: 'Learning' },
          ].map((task, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                task.done
                  ? 'bg-muted/40 border-border/50 opacity-85'
                  : 'bg-card border-[#0052FF]/40 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {task.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground">#{task.tag}</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  task.priority === 'P1'
                    ? 'bg-rose-500/15 text-rose-500'
                    : task.priority === 'P2'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-blue-500/15 text-blue-500'
                }`}
              >
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Card */}
      <div className="p-2.5 rounded-2xl bg-gradient-to-r from-[#0052FF]/20 to-purple-500/20 border border-[#0052FF]/30 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#0052FF] dark:text-[#60A5FA]" />
          <div>
            <div className="text-[11px] font-bold text-foreground">XP Boost Active</div>
            <div className="text-[9px] text-muted-foreground">+75 XP earned today</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-[#0052FF] text-white text-[10px] font-bold">Lvl 4</span>
      </div>
    </SmartphoneFrame>
  );
}

/**
 * 2. Phone Mockup: Financial Overview & Wave Analytics
 */
export function PhoneMockupFinance() {
  return (
    <SmartphoneFrame className="rotate-[2deg]">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Balance</h4>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight">$14,890.40</h3>
          </div>
          <div className="px-2 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+24.8%</span>
          </div>
        </div>

        {/* Live Glass Wave Chart Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#0052FF]/15 to-transparent border border-[#0052FF]/30 space-y-2">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
            <span>Weekly Net Inflow</span>
            <span className="text-[#0052FF] dark:text-[#60A5FA] font-bold">+$3,240.00</span>
          </div>
          {/* Wave SVG */}
          <div className="h-16 w-full flex items-end">
            <svg viewBox="0 0 100 40" className="w-full h-full text-[#0052FF]" fill="none" stroke="currentColor" strokeWidth="2.5" preserveAspectRatio="none">
              <path d="M0 30 Q 20 5, 40 22 T 70 8 T 100 18" className="stroke-[#0052FF] dark:stroke-[#60A5FA]" />
              <path d="M0 30 Q 20 5, 40 22 T 70 8 T 100 18 L 100 40 L 0 40 Z" fill="url(#blue-grad)" opacity="0.25" />
              <defs>
                <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0052FF" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Transactions Feed */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent Inflow / Outflow</span>
          {[
            { title: 'Stripe SaaS Payout', date: 'Today, 2:15 PM', amount: '+$3,400.00', type: 'income', color: '#10B981' },
            { title: 'AWS Cloud Server Cluster', date: 'Yesterday', amount: '-$149.00', type: 'expense', color: '#F43F5E' },
            { title: 'Annual Figma Pro License', date: 'Aug 24', amount: '-$144.00', type: 'expense', color: '#F43F5E' },
            { title: 'Client Consulting Retainer', date: 'Aug 22', amount: '+$1,850.00', type: 'income', color: '#10B981' },
          ].map((tx, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${tx.color}20`, color: tx.color }}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-foreground block">{tx.title}</span>
                  <span className="text-[9px] text-muted-foreground">{tx.date}</span>
                </div>
              </div>
              <span className="text-xs font-bold" style={{ color: tx.color }}>{tx.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Pill */}
      <div className="p-2.5 rounded-2xl bg-muted/60 border border-border flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted-foreground">Budget Savings Rate</span>
        <span className="text-emerald-500">76.4% on track</span>
      </div>
    </SmartphoneFrame>
  );
}

/**
 * 3. Phone Mockup: Color-Coded Liquid Sticky Notes
 */
export function PhoneMockupNotes() {
  return (
    <SmartphoneFrame className="rotate-[-1deg]">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pt-1">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Canvas & Ideas</h4>
            <h3 className="text-base font-extrabold text-foreground">Sticky Pinboard</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
            8 Colors
          </span>
        </div>

        {/* 2x2 Mini Sticky Notes Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Note 1 - Electric Blue */}
          <div className="p-3 rounded-2xl border bg-[#0052FF]/10 border-[#0052FF]/30 space-y-1.5 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground line-clamp-1">System Engine</span>
              <Pin className="w-3 h-3 text-amber-500 fill-current" />
            </div>
            <p className="text-[10px] text-foreground/80 leading-snug line-clamp-3">
              Event-driven async patterns with retry mechanics.
            </p>
            <span className="text-[8px] font-semibold text-muted-foreground">#architecture</span>
          </div>

          {/* Note 2 - Emerald Green */}
          <div className="p-3 rounded-2xl border bg-[#10B981]/10 border-[#10B981]/30 space-y-1.5 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground line-clamp-1">Daily Flow</span>
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            </div>
            <p className="text-[10px] text-foreground/80 leading-snug line-clamp-3">
              90m deep work before opening Slack or email.
            </p>
            <span className="text-[8px] font-semibold text-muted-foreground">#monkmode</span>
          </div>

          {/* Note 3 - Purple Violet */}
          <div className="p-3 rounded-2xl border bg-[#8B5CF6]/10 border-[#8B5CF6]/30 space-y-1.5 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground line-clamp-1">Q4 Roadmap</span>
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            </div>
            <p className="text-[10px] text-foreground/80 leading-snug line-clamp-3">
              Ship Winter Arc dashboard & live analytics.
            </p>
            <span className="text-[8px] font-semibold text-muted-foreground">#launch</span>
          </div>

          {/* Note 4 - Amber Gold */}
          <div className="p-3 rounded-2xl border bg-[#F59E0B]/10 border-[#F59E0B]/30 space-y-1.5 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground line-clamp-1">Book Wisdom</span>
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            </div>
            <p className="text-[10px] text-foreground/80 leading-snug line-clamp-3">
              You do not rise to your goals, you fall to systems.
            </p>
            <span className="text-[8px] font-semibold text-muted-foreground">#habits</span>
          </div>
        </div>

        {/* Live Color Dot Selector Strip */}
        <div className="p-2 rounded-2xl bg-card border border-border flex items-center justify-between px-3">
          <span className="text-[10px] font-bold text-muted-foreground">Quick Palette</span>
          <div className="flex items-center gap-1.5">
            {['#0052FF', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E', '#06B6D4'].map((hex) => (
              <div key={hex} style={{ backgroundColor: hex }} className="w-3.5 h-3.5 rounded-full shadow-xs ring-1 ring-white/30" />
            ))}
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded-2xl bg-muted/60 border border-border text-center text-[10px] font-semibold text-muted-foreground">
        ✦ Double tap any note to expand inline
      </div>
    </SmartphoneFrame>
  );
}

/**
 * 4. Floating 3D/Glass Accent Badges (Surrounding Hero Mockups)
 */
export function FloatingHeroWidgets() {
  return (
    <>
      {/* Top Left: Deep Work Timer Completed */}
      <div className="hidden lg:flex absolute -top-4 -left-12 p-3.5 rounded-2xl bg-card/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-blue-500/30 shadow-2xl items-center gap-3 z-30 animate-bounce duration-1000">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
          <Check className="w-5 h-5" strokeWidth={3} />
        </div>
        <div>
          <span className="text-xs font-extrabold text-foreground block">90m Deep Work</span>
          <span className="text-[10px] font-semibold text-emerald-500">Session Complete • +50 XP</span>
        </div>
      </div>

      {/* Bottom Right: Daily Streak Flame */}
      <div className="hidden lg:flex absolute -bottom-6 -right-10 p-3.5 rounded-2xl bg-card/90 dark:bg-black/90 backdrop-blur-2xl border border-white/20 dark:border-amber-500/30 shadow-2xl items-center gap-3 z-30">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center">
          <Flame className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="text-xs font-extrabold text-foreground block">18-Day Streak</span>
          <span className="text-[10px] font-semibold text-amber-500">Winter Arc Protocol Locked</span>
        </div>
      </div>

      {/* Center Top Floating Badge */}
      <div className="hidden lg:flex absolute -top-8 right-12 px-4 py-2 rounded-full bg-[#0052FF]/20 backdrop-blur-2xl border border-[#0052FF]/40 shadow-xl items-center gap-2 z-30 text-[#0052FF] dark:text-[#60A5FA]">
        <Sparkles className="w-4 h-4" />
        <span className="text-xs font-bold">100% Offline-First Cloud Sync</span>
      </div>
    </>
  );
}