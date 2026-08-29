'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { financeImg, mugIcon, laptopIcon } from '@/assets';
import { BrushHighlight } from '../common/BrushHighlight';

export function LandingFinance({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  return (
    <section id="finance" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative border-t border-slate-200/60">
      {/* Floating Low-Opacity Icons */}
      <div className="absolute top-12 left-10 w-16 h-16 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image src={laptopIcon} alt="Laptop" width={64} height={64} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>
      <div className="absolute bottom-10 right-10 w-14 h-14 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image src={mugIcon} alt="Mug" width={56} height={56} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Finance Mockup Image */}
        <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center select-none">
          <div className="relative p-2 max-w-[310px] sm:max-w-[350px] md:max-w-[360px] transition-transform duration-500 hover:scale-[1.02] flex justify-center select-none">
            <Image
              src={financeImg}
              alt="Financial Overview & Wave Charts"
              draggable={false}
              className="rounded-2xl w-full h-auto object-contain drop-shadow-md no-drag select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Right Column: Finance Text & Highlights */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cashflow & Realtime Wave Analytics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.25]">
            Total Peace of Mind with{' '}
            <BrushHighlight color="#F59E0B">
              Financial Clarity
            </BrushHighlight>
            .
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Keep your income streams and recurring subscriptions in check. Visual balance indicators, dynamic wave charts, and budget health tracking all in one lightweight screen.
          </p>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Savings Velocity</span>
              <span className="text-xl font-extrabold text-[#10B981] mt-0.5 block">+76.4% Goal Target</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Burn Rate Shield</span>
              <span className="text-xl font-extrabold text-[#0052FF] mt-0.5 block">0% Overspend</span>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(245,158,11,0.35)] cursor-pointer flex items-center gap-1.5"
          >
            <span>Track Your Finances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}