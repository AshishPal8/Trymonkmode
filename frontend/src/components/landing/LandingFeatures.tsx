'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, FileText, TrendingUp } from 'lucide-react';
import { PhoneMockupTasks, PhoneMockupNotes, PhoneMockupFinance } from './LandingMockups';

export function LandingFeatures({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  return (
    <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 space-y-28">
      {/* Feature 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052FF]/10 text-[#0052FF] dark:text-[#60A5FA] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sprint Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            From Overwhelm to Unstoppable Execution.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Organize daily deliverables by priority (P1 to P4), due dates, and timeblocks. Break complex goals into bite-sized subtasks with live progress feedback.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-xl font-extrabold text-foreground">83%</div>
              <div className="text-[10px] font-semibold text-muted-foreground">Procrastination Cut</div>
            </div>
            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-xl font-extrabold text-[#0052FF]">4.8x</div>
              <div className="text-[10px] font-semibold text-muted-foreground">Output Velocity</div>
            </div>
            <div className="p-3 rounded-2xl bg-muted/60 border border-border">
              <div className="text-xl font-extrabold text-emerald-500">100%</div>
              <div className="text-[10px] font-semibold text-muted-foreground">Offline Sync</div>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md cursor-pointer"
          >
            Try Sprint Planner
          </Button>
        </div>

        <div className="flex justify-center">
          <PhoneMockupTasks />
        </div>
      </div>

      {/* Feature 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex justify-center order-2 lg:order-1">
          <PhoneMockupNotes />
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            <span>Liquid Sticky Pinboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Aesthetic Notes & Ideas at the Speed of Thought.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Never lose a breakthrough idea again. Capture notes instantly with 8 predefined liquid glass color themes, pin high-priority thoughts to the top, and tag your research.
          </p>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
              <div className="w-5 h-5 rounded-full bg-[#0052FF] flex items-center justify-center text-white text-[10px]">✓</div>
              <span>Inline composer embedded right in your pinboard grid</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
              <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center text-white text-[10px]">✓</div>
              <span>8 vibrant frosted-glass color themes with glowing accents</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
              <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-[10px]">✓</div>
              <span>Global Quick Create modal accessible from any screen</span>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md cursor-pointer"
          >
            Explore Pinboard
          </Button>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cashflow & Energy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Total Financial Clarity Alongside Daily Output.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            True productivity includes financial peace of mind. Log income streams, monitor recurring cloud expenses, and view interactive wave charts in seconds.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Savings Rate</span>
              <span className="text-lg font-extrabold text-emerald-500">+76.4% Goal</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-muted/60 border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Burn Rate Shield</span>
              <span className="text-lg font-extrabold text-[#0052FF]">0% Waste</span>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md cursor-pointer"
          >
            Track Financial Flow
          </Button>
        </div>

        <div className="flex justify-center">
          <PhoneMockupFinance />
        </div>
      </div>
    </section>
  );
}