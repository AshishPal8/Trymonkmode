'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Laptop, Smartphone } from 'lucide-react';
import { heroImg, rocketIcon, targetIcon, brainIcon, trophyIcon } from '@/assets';
import { BrushHighlight } from '../common/BrushHighlight';

export function LandingHero({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  return (
    <section className="pt-32 sm:pt-40 pb-20 max-w-7xl mx-auto px-4 sm:px-6 relative">
      {/* Floating Low-Opacity 3D Background Icons */}
      <div className="absolute top-24 left-6 w-14 h-14 opacity-25 pointer-events-none -z-0 animate-bounce duration-1000 hidden md:block select-none">
        <Image src={rocketIcon} alt="Rocket" width={56} height={56} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>
      <div className="absolute top-1/2 left-2 w-12 h-12 opacity-20 pointer-events-none -z-0 hidden md:block select-none">
        <Image src={brainIcon} alt="Brain" width={48} height={48} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center relative z-10">
        {/* Left Column: Heading with Colorful Highlight Pills & CTAs */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.25]">
            Master{' '}
            <BrushHighlight color="#0052FF">
              Deep Work
            </BrushHighlight>
            .<br className="hidden sm:inline" /> Build High-Velocity{' '}
            <BrushHighlight color="#8B5CF6">
              Routines
            </BrushHighlight>
            .
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            The all-in-one productivity operating system for deep focus sprints, atomic habit streaks, priority matrix, and financial clarity. Zero clutter. Pure execution.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
            <Button
              size="lg"
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto bg-[#0052FF] hover:bg-[#0043D6] text-white text-sm font-bold h-12 px-8 rounded-full shadow-[0_10px_25px_rgba(0,82,255,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-105"
            >
              <span>Enter Monk Mode Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold h-12 px-6 rounded-full border border-slate-300 shadow-xs transition-all cursor-pointer"
            >
              <span>Sign In to Workspace</span>
            </Button>
          </div>

          {/* Platform Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>Web Cloud</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
              <Laptop className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>macOS & Windows</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
              <Smartphone className="w-3.5 h-3.5 text-[#10B981]" />
              <span>iOS & Android PWA</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Image with Floating 3D Icons */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end select-none">
          {/* Floating Low-Opacity Icons around Hero Image */}
          <div className="absolute -top-6 -right-2 w-16 h-16 opacity-35 pointer-events-none z-20 hidden sm:block animate-pulse">
            <Image src={trophyIcon} alt="Trophy" width={64} height={64} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
          </div>
          <div className="absolute -bottom-6 -left-4 w-14 h-14 opacity-35 pointer-events-none z-20 hidden sm:block">
            <Image src={targetIcon} alt="Target" width={56} height={56} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
          </div>

          {/* Hero Image Container */}
          <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-[740px] transition-transform duration-500 hover:scale-[1.02] flex justify-center lg:justify-end select-none">
            <Image
              src={heroImg}
              alt="Monk Mode Hero Dashboard"
              priority
              draggable={false}
              className="w-full h-auto max-w-[620px] lg:max-w-[740px] object-contain drop-shadow-2xl no-drag select-none pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}