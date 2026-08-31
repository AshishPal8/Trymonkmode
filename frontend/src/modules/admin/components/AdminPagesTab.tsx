"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

export interface AdminPageRecord {
  id: number;
  key: string;
  name: string;
  path: string;
  hub: string;
  icon: string;
  orderIndex: number;
  isEnabled: boolean;
  minRole: string;
  minTier: string;
}

interface AdminPagesTabProps {
  pagesList: AdminPageRecord[];
  isLoading: boolean;
  onTogglePage: (pageId: number) => Promise<void>;
}

export function AdminPagesTab({
  pagesList,
  isLoading,
  onTogglePage,
}: AdminPagesTabProps) {
  if (isLoading && pagesList.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground ios-card bg-card border border-border rounded-3xl">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs">Loading navigation modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in-50 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {pagesList.map((page) => (
          <div
            key={page.id}
            className={`p-4 rounded-2xl ios-card bg-card border border-border transition-all ${
              page.isEnabled ? "" : "opacity-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                  #{page.orderIndex}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-xs">
                    {page.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {page.path}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onTogglePage(page.id)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition cursor-pointer ${
                  page.isEnabled
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                }`}
              >
                {page.isEnabled ? "Active" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/60 text-muted-foreground">
              <span>
                Hub: <strong className="text-foreground">{page.hub}</strong>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">
                Min Role: {page.minRole || "user"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
