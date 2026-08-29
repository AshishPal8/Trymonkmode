'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { journalImg, notesIcon, ideaIcon, booksIcon } from '@/assets';
import { BrushHighlight } from '../common/BrushHighlight';

export function LandingJournal({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  return (
    <section id="journal" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative border-t border-slate-200/60">
      {/* Floating Low-Opacity Icons */}
      <div className="absolute top-12 right-12 w-16 h-16 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image src={notesIcon} alt="Notes" width={64} height={64} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>
      <div className="absolute bottom-12 left-8 w-14 h-14 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image src={booksIcon} alt="Books" width={56} height={56} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Journal Text & Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Daily Reflection & Mindset Log</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.25]">
            Reflect & Grow with{' '}
            <BrushHighlight color="#8B5CF6">
              Daily Journaling
            </BrushHighlight>
            .
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-medium">
            End each day with mental clarity and intentionality. Track daily mood ratings, answer curated thought prompts, and log your achievements in an aesthetic digital notebook.
          </p>

          <div className="space-y-3 pt-2 text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px]">✓</div>
              <span>Curated daily prompts to build stoic self-awareness</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[10px]">✓</div>
              <span>Interactive mood emoji selector & 5-star day ratings</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EC4899] text-white flex items-center justify-center text-[10px]">✓</div>
              <span>Distraction-free lined stationary notebook layout</span>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth('signup')}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(139,92,246,0.35)] cursor-pointer flex items-center gap-1.5"
          >
            <span>Start Daily Journaling</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right Column: Journal Image Mockup */}
        <div className="lg:col-span-6 relative flex justify-center select-none">
          <div className="absolute -top-4 -left-4 w-12 h-12 opacity-30 pointer-events-none z-20 hidden sm:block">
            <Image src={ideaIcon} alt="Idea" width={48} height={48} draggable={false} className="object-contain no-drag select-none pointer-events-none" />
          </div>

          <div className="relative p-2 max-w-[310px] sm:max-w-[350px] md:max-w-[360px] transition-transform duration-500 hover:scale-[1.02] flex justify-center select-none">
            <Image
              src={journalImg}
              alt="Daily Journal & Reflection Screen"
              draggable={false}
              className="rounded-2xl w-full h-auto object-contain drop-shadow-md no-drag select-none pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}