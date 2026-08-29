"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "@/lib/store";
import { toast } from "@/components/ui/toast";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AuraLogo } from "../brand/AuraLogo";
import googleIcon from "@/assets/icons/google.png";
import {
  Mail,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { triggerCelebrationConfetti } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "signup";
  onClose: () => void;
}

export function AuthModal({
  isOpen,
  initialMode = "login",
  onClose,
}: AuthModalProps) {
  const { setUser, setIsAuthenticated, syncWithBackend } = useApp();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [step, setStep] = useState<"form" | "otp">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testOtpNotice, setTestOtpNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setIsLoading(true);
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      "http://localhost:4000";
    window.location.href = `${backendUrl}/api/google`;
  };

  /* 
  // Email & OTP Authentication Handlers (Commented out to use Google OAuth)
  const handleTabSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setStep("form");
    setErrorMsg(null);
    setTestOtpNotice(null);
  };

  const handleSendOtp = async () => {
    setErrorMsg(null);
    if (!email || !email.includes("@")) {
      const msg = "Please enter a valid email address.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }
    if (mode === "signup" && !name.trim()) {
      const msg = "Please enter your full name.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const trimmedName = name.trim() || undefined;
      const res = await authApi.sendOtp(email, trimmedName, mode);
      const data = res.data;
      if (data?.test_otp) {
        setTestOtpNotice(data.test_otp);
        setOtp(data.test_otp);
      }
      setStep("otp");
      toast.success(data?.message || "OTP verification code sent!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otp || otp.length !== 6) {
      const msg = "Please enter the complete 6-digit numeric OTP.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const trimmedName = name.trim() || undefined;
      const res = await authApi.verifyOtp(email, otp, trimmedName, mode);
      const data = res.data;
      const token = data?.data?.accessToken || data?.token || data?.data?.token;
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;
      if (token) {
        localStorage.setItem("trymonk_access_token", token);
        localStorage.setItem("trymonk_token", token);
      }
      if (refreshToken) {
        localStorage.setItem("trymonk_refresh_token", refreshToken);
      }

      const backendUser = data?.data?.user || data?.user;
      const userName = backendUser?.name || name.trim() || email.split("@")[0];

      if (backendUser) {
        setUser({
          name: backendUser.name || userName,
          avatar: backendUser.avatar || "",
          title: backendUser.title || "",
          bio: backendUser.bio || "",
          theme: backendUser.theme || "dark",
          favorites: backendUser.favorites || [],
          timezone: backendUser.timezone || "UTC",
          notificationsEnabled: backendUser.notificationsEnabled ?? true,
          emailNotifications: backendUser.emailNotifications ?? true,
          soundEffects: backendUser.soundEffects ?? true,
          role: backendUser.role || "user",
          planTier: backendUser.planTier || "free",
          level: backendUser.level || 1,
          xp: backendUser.xp || 0,
          xpToNextLevel: Math.floor(
            1000 * Math.pow(1.3, (backendUser.level || 1) - 1),
          ),
          streak: backendUser.streak || 1,
          joinedDate: backendUser.createdAt
            ? new Date(backendUser.createdAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "Recent",
        });
      }

      setIsAuthenticated(true);
      triggerCelebrationConfetti();
      toast.success(`Welcome to Try Monk Mode, ${userName}!`);

      syncWithBackend().catch(console.error);
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP code.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
  */

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.18)] space-y-6 text-slate-900">
        {/* 1. Modal Top Header: Logo on Left, Close Button on Right */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <AuraLogo size="sm" forceDarkText={true} />

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === "login"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {mode === "signup" ? "Create your Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {mode === "signup"
              ? "Start with a fresh workspace and build your life OS"
              : "Sign in to your workspace seamlessly with Google"}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Continue with Google Outline Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99] text-slate-800 font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <>
                <Image
                  src={googleIcon}
                  alt="Google"
                  width={20}
                  height={20}
                  className="w-5 h-5 object-contain"
                />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        {/*
        // Email & OTP Form Inputs (Commented out)
        {step === "form" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendOtp();
            }}
            className="space-y-4"
          >
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ashish Pal"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work or Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "signup" ? "Get Started with OTP" : "Send OTP"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {testOtpNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    OTP Code: <strong>{testOtpNotice}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase opacity-80">
                  (Auto-filled)
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-lg font-mono font-bold tracking-widest text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-2.5 bg-[#0052FF] hover:bg-[#0043D6] text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? "Complete Sign Up"
                      : "Verify & Sign In"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-900 font-semibold cursor-pointer pt-1"
            >
              ← Change email address
            </button>
          </form>
        )}
        */}
      </div>
    </div>
  );
}
