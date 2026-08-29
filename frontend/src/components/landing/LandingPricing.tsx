'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Award, Check } from 'lucide-react';

export function LandingPricing({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
          <Award className="w-3.5 h-3.5 text-[#0052FF]" />
          <span>Simple, Transparent Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Invest in Your Focus & Systems
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Free forever for personal focus. Upgrade to Pro for unlimited cloud sync, AI insights, and lifetime mastery.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-12 h-6 rounded-full bg-[#0052FF] p-1 transition cursor-pointer relative"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold border border-emerald-500/30">
              Save 25%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-3xl ios-card border border-border space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-foreground">Starter</h3>
            <p className="text-xs text-muted-foreground">For individuals building their first daily routine.</p>
            <div className="text-3xl font-extrabold text-foreground">$0 <span className="text-xs text-muted-foreground font-normal">/ forever</span></div>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Unlimited Tasks & Quadrants</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Focus Timer & Audio Bells</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Up to 5 Habit Streaks</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>8-Color Sticky Notes Canvas</span></div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onOpenAuth('signup')}
            className="w-full text-xs font-bold rounded-xl h-10 cursor-pointer"
          >
            Get Started Free
          </Button>
        </div>

        <div className="p-7 rounded-3xl ios-card border-2 border-[#0052FF] shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0052FF]/10 to-transparent">
          <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#0052FF] text-white text-[10px] font-extrabold shadow-sm">
            MOST POPULAR
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-foreground">Monk Mode Pro</h3>
            <p className="text-xs text-muted-foreground">For serious builders wanting zero limits and maximum speed.</p>
            <div className="text-3xl font-extrabold text-[#0052FF] dark:text-[#60A5FA]">
              {isAnnual ? '$7' : '$9'} <span className="text-xs text-muted-foreground font-normal">/ month</span>
            </div>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Everything in Starter</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Unlimited Habit Streaks & Confetti</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Financial Cashflow & Wave Analytics</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Cloud Multi-Device Instant Sync</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Priority Support & Early Features</span></div>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="w-full bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold rounded-xl h-10 shadow-lg cursor-pointer"
          >
            Start 14-Day Free Trial
          </Button>
        </div>

        <div className="p-7 rounded-3xl ios-card border border-border space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-foreground">Lifetime Access</h3>
            <p className="text-xs text-muted-foreground">Pay once, own all future updates forever.</p>
            <div className="text-3xl font-extrabold text-foreground">$149 <span className="text-xs text-muted-foreground font-normal">/ one-time</span></div>

            <div className="space-y-2.5 pt-4 text-xs">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Lifetime All Pro Features</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Founder Discord VIP Access</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Custom Themes & Liquid Glass Packs</span></div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /><span>Zero Subscription Fees Forever</span></div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onOpenAuth('signup')}
            className="w-full text-xs font-bold rounded-xl h-10 cursor-pointer"
          >
            Get Lifetime Access
          </Button>
        </div>
      </div>
    </section>
  );
}