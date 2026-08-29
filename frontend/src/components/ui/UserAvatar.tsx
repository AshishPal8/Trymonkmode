"use client";

import React, { useState, useMemo } from "react";

export interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const GRADIENT_PALETTES = [
  "from-[#0052FF] to-[#3B82F6] text-white shadow-blue-500/20", // Blue
  "from-[#7C3AED] to-[#A855F7] text-white shadow-purple-500/20", // Violet
  "from-[#059669] to-[#10B981] text-white shadow-emerald-500/20", // Emerald
  "from-[#E11D48] to-[#FB7185] text-white shadow-rose-500/20", // Rose
  "from-[#D97706] to-[#F59E0B] text-white shadow-amber-500/20", // Amber
  "from-[#4F46E5] to-[#6366F1] text-white shadow-indigo-500/20", // Indigo
  "from-[#0284C7] to-[#38BDF8] text-white shadow-sky-500/20", // Sky
  "from-[#0D9488] to-[#14B8A6] text-white shadow-teal-500/20", // Teal
];

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "TM";

  // If email passed, clean it
  const cleanName = name.includes("@") ? name.split("@")[0] : name;
  const parts = cleanName
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);

  if (parts.length === 0) return "TM";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserAvatar({
  name = "",
  avatarUrl,
  size = "sm",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);

  const initials = useMemo(() => getInitials(name), [name]);

  // Deterministic gradient selection based on user's name
  const gradientClass = useMemo(() => {
    let hash = 0;
    const str = name || initials || "TryMonk";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENT_PALETTES.length;
    return GRADIENT_PALETTES[index];
  }, [name, initials]);

  // Size styling map
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px] rounded-lg",
    sm: "w-8 h-8 text-xs font-bold rounded-xl",
    md: "w-10 h-10 text-sm font-bold rounded-2xl",
    lg: "w-14 h-14 text-lg font-bold rounded-2xl",
    xl: "w-20 h-20 text-2xl font-bold rounded-3xl",
  };

  const hasValidImage = Boolean(avatarUrl && avatarUrl.trim() && !imgError);

  if (hasValidImage) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden shadow-sm ${sizeClasses[size]} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl!}
          alt={name || "User Avatar"}
          draggable={false}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover border border-white/10 dark:border-white/5 no-drag select-none pointer-events-none"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-bold tracking-tight bg-linear-to-br select-none shadow-sm border border-white/20 dark:border-white/10 ${gradientClass} ${sizeClasses[size]} ${className}`}
      title={name || "User"}
    >
      {/* Specular gloss highlight */}
      <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/10 to-white/25 pointer-events-none rounded-[inherit]" />
      <span className="relative z-10 drop-shadow-xs">{initials}</span>
    </div>
  );
}
