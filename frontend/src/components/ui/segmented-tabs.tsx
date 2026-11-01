"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Small count bubble, e.g. pending requests. */
  badge?: number;
}

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedTabOption<T>[];
  /** "sm" for tabs inside a card. */
  size?: "md" | "sm";
  className?: string;
}

/** The app's pill tab switcher (same look as Overview / Analytics on the dashboard). */
export function SegmentedTabs<T extends string>({ value, onChange, options, size = "md", className }: SegmentedTabsProps<T>) {
  return (
    <div role="tablist" className={cn("flex w-fit p-1 ios-card rounded-2xl bg-card border border-border", className)}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.icon}
            <span>{option.label}</span>
            {!!option.badge && (
              <span
                className={cn(
                  "px-1.5 rounded-full text-[10px]",
                  isActive ? "bg-primary-foreground/20" : "bg-primary text-primary-foreground",
                )}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
