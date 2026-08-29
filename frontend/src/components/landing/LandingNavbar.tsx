"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AuraLogo } from "../brand/AuraLogo";
import { ArrowRight } from "lucide-react";

export function LandingNavbar({
  onOpenAuth,
}: {
  onOpenAuth: (mode: "login" | "signup") => void;
}) {
  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl rounded-full bg-white/90 backdrop-blur-2xl border border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all">
      <AuraLogo size="sm" forceDarkText={true} />

      <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
        <a href="#tasks" className="hover:text-[#0052FF] transition">
          Tasks & Sprint
        </a>
        <a href="#journal" className="hover:text-[#8B5CF6] transition">
          Journal & Notes
        </a>
        <a href="#finance" className="hover:text-[#10B981] transition">
          Finance & Analytics
        </a>
      </nav>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenAuth("login")}
          className="text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer bg-[#0052FF] text-white hover:bg-[#0043D6] shadow-[0_4px_12px_rgba(0,82,255,0.28)] active:scale-95 sm:bg-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:shadow-none sm:rounded-xl sm:px-3 sm:py-1.5"
        >
          Log In
        </button>

        <Button
          size="sm"
          onClick={() => onOpenAuth("signup")}
          className="hidden sm:flex bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(0,82,255,0.35)] transition-all cursor-pointer items-center gap-1.5 hover:scale-105"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </header>
  );
}
