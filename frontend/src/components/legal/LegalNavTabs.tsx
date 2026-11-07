"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
  { name: "Refunds", href: "/refund" },
  { name: "Security", href: "/security" },
  { name: "Contact", href: "/contact" },
];

/** Links between the policy pages. */
export function LegalNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-10 pb-4 border-b border-slate-200 text-sm font-semibold">
      <Link href="/" className="text-slate-400 hover:text-slate-900 transition">
        ← Home
      </Link>
      {PAGES.map((page) => (
        <Link
          key={page.href}
          href={page.href}
          aria-current={pathname === page.href ? "page" : undefined}
          className={pathname === page.href ? "text-[#0052FF]" : "text-slate-500 hover:text-slate-900 transition"}
        >
          {page.name}
        </Link>
      ))}
    </nav>
  );
}
