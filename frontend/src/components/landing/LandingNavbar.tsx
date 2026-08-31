"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuraLogo } from "../brand/AuraLogo";
import { ArrowRight, Flame } from "lucide-react";
import { AuthModal } from "../auth/AuthModal";
import { useUserStore } from "@/stores/userStore";

export function LandingNavbar({
  onOpenAuth,
}: {
  onOpenAuth?: (mode: "login" | "signup") => void;
}) {
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [internalAuthMode, setInternalAuthMode] = useState<"login" | "signup">(
    "login",
  );
  const [mounted, setMounted] = useState(false);

  const { isAuthenticated, user, syncWithBackend } = useUserStore();

  useEffect(() => {
    setMounted(true);
    syncWithBackend().catch(() => {});
  }, [syncWithBackend]);

  const handleAuth = (mode: "login" | "signup") => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      setInternalAuthMode(mode);
      setInternalModalOpen(true);
    }
  };

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl rounded-full bg-white/80 backdrop-blur-2xl border border-slate-200/80 px-4 sm:px-6 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all">
        <Link href="/" className="flex items-center gap-2">
          <AuraLogo size="sm" forceDarkText={true} />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <Link href="/#tasks" className="hover:text-[#0052FF] transition">
            Tasks & Sprint
          </Link>
          <Link href="/#journal" className="hover:text-[#8B5CF6] transition">
            Journal & Notes
          </Link>
          <Link href="/#finance" className="hover:text-[#10B981] transition">
            Finance & Analytics
          </Link>
          <Link href="/blog" className="hover:text-[#0052FF] transition">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {mounted && isAuthenticated ? (
            /* Authenticated User Pill */
            <Link
              href="/"
              className="flex items-center gap-2.5 p-1 pl-2.5 pr-1.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 border border-slate-200/80 transition-all group"
            >
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0052FF] to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : "U"}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-800 hidden sm:inline truncate max-w-[100px]">
                  {user.name ? user.name.split(" ")[0] : "Workspace"}
                </span>
                {user.streak > 0 && (
                  <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded-full hidden sm:inline-flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-amber-500" />
                    {user.streak}
                  </span>
                )}
              </div>

              <span className="bg-[#0052FF] group-hover:bg-[#0043D6] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,82,255,0.3)] transition-all flex items-center gap-1">
                <span>Enter App</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ) : (
            /* Guest Buttons */
            <>
              <button
                onClick={() => handleAuth("login")}
                className="text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer bg-[#0052FF] text-white hover:bg-[#0043D6] shadow-[0_4px_12px_rgba(0,82,255,0.28)] active:scale-95 sm:bg-transparent sm:text-slate-600 sm:hover:text-slate-900 sm:shadow-none sm:rounded-xl sm:px-3 sm:py-1.5"
              >
                Log In
              </button>

              <Button
                size="sm"
                onClick={() => handleAuth("signup")}
                className="hidden sm:flex bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(0,82,255,0.35)] transition-all cursor-pointer items-center gap-1.5 hover:scale-105"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Standalone Auth Modal fallback when on public SSR pages */}
      <AuthModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
        initialMode={internalAuthMode}
      />
    </>
  );
}
