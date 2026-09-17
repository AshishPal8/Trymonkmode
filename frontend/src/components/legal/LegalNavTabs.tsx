"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, FileText, Lock, ArrowLeft } from "lucide-react";

export function LegalNavTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Privacy Policy",
      href: "/privacy",
      icon: Shield,
      color: "text-[#0052FF]",
      activeBg: "bg-[#0052FF] text-white shadow-[0_4px_12px_rgba(0,82,255,0.25)]",
    },
    {
      name: "Terms of Service",
      href: "/terms",
      icon: FileText,
      color: "text-indigo-600",
      activeBg: "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.25)]",
    },
    {
      name: "Security",
      href: "/security",
      icon: Lock,
      color: "text-emerald-600",
      activeBg: "bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.25)]",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200/80">
      {/* Back to Home button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center group-hover:-translate-x-0.5 group-hover:border-slate-300 transition-all">
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </div>
        <span>Back to Home</span>
      </Link>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/90 border border-slate-200 shadow-xs backdrop-blur-md overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? tab.activeBg
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

