"use client";

import React, { useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { LandingNavbar } from "./LandingNavbar";
import { LandingHero } from "./LandingHero";
import { LandingTasks } from "./LandingTasks";
import { LandingJournal } from "./LandingJournal";
import { LandingFinance } from "./LandingFinance";
import { LandingBlogs } from "./LandingBlogs";
import { LandingFooter } from "./LandingFooter";

export function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-[#0052FF] selection:text-white relative overflow-hidden">
      {/* Soft Pastel Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#0052FF]/10 via-purple-400/5 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-0 w-[500px] h-[500px] bg-[#10B981]/6 blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[65%] left-0 w-[500px] h-[500px] bg-[#8B5CF6]/6 blur-[160px] pointer-events-none -z-10" />

      {/* 1. Navbar */}
      <LandingNavbar onOpenAuth={openAuth} />

      {/* 2. Hero Section (Left Text with colorful highlights, Right Hero Image + Floating 3D Icons) */}
      <LandingHero onOpenAuth={openAuth} />

      {/* 3. Tasks Section */}
      <LandingTasks onOpenAuth={openAuth} />

      {/* 4. Journal & Notes Section */}
      <LandingJournal onOpenAuth={openAuth} />

      {/* 5. Finance Section */}
      <LandingFinance onOpenAuth={openAuth} />

      {/* 6. Blog Articles Section */}
      <LandingBlogs />

      {/* 7. Footer */}
      <LandingFooter />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
