"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { taskImg, clockIcon, timerIcon, calendarIcon } from "@/assets";
import { BrushHighlight } from "../common/BrushHighlight";

export function LandingTasks({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  return (
    <section
      id="tasks"
      className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative border-t border-slate-200/60"
    >
      {/* Floating Low-Opacity Icons */}
      <div className="absolute top-12 left-10 w-16 h-16 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image
          src={clockIcon}
          alt="Clock"
          width={64}
          height={64}
          draggable={false}
          className="object-contain no-drag select-none pointer-events-none"
        />
      </div>
      <div className="absolute bottom-10 right-12 w-14 h-14 opacity-25 pointer-events-none -z-0 hidden md:block select-none">
        <Image
          src={timerIcon}
          alt="Timer"
          width={56}
          height={56}
          draggable={false}
          className="object-contain no-drag select-none pointer-events-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        {/* Left Column: Task Mockup Image */}
        <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center select-none">
          <div className="absolute -top-4 -right-4 w-12 h-12 opacity-25 pointer-events-none z-20 hidden sm:block">
            <Image
              src={calendarIcon}
              alt="Calendar"
              width={48}
              height={48}
              draggable={false}
              className="object-contain no-drag select-none pointer-events-none"
            />
          </div>

          <div className="relative p-3 max-w-md sm:max-w-lg transition-transform duration-500 hover:scale-[1.02] select-none">
            <Image
              src={taskImg}
              alt="Tasks Management Screen"
              draggable={false}
              className="rounded-2xl w-full h-auto object-cover no-drag select-none pointer-events-none"
            />
          </div>
        </div>

        {/* Right Column: Tasks Text & Highlights */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sprint Architecture & Matrix</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.25]">
            Organize Every Task with{" "}
            <BrushHighlight color="#10B981">Ruthless Clarity</BrushHighlight>.
          </h2>

          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Prioritize with Eisenhower matrix (P1 to P4), break down goals into
            subtasks, and track due times effortlessly. Say goodbye to scattered
            to-do lists.
          </p>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl font-extrabold text-slate-900">83%</div>
              <div className="text-[11px] font-bold text-slate-500">
                Less Procrastination
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl font-extrabold text-[#0052FF]">4.8x</div>
              <div className="text-[11px] font-bold text-slate-500">
                Execution Velocity
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="text-2xl font-extrabold text-[#10B981]">100%</div>
              <div className="text-[11px] font-bold text-slate-500">
                Cloud Sync
              </div>
            </div>
          </div>

          <Button
            onClick={() => onOpenAuth("signup")}
            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(16,185,129,0.35)] cursor-pointer flex items-center gap-1.5"
          >
            <span>Start Managing Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
