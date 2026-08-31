"use client";

import React, { useEffect } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  topAccentColor?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  children: React.ReactNode;
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  topAccentColor = "#0052FF",
  maxWidth = "lg",
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Backdrop Overlay */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
        />

        {/* Modal Container with Liquid Glass Border */}
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[94%] -translate-x-1/2 -translate-y-1/2 rounded-3xl ios-card border border-black/[0.08] dark:border-white/[0.14] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.45)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.9),inset_0_1px_1px_0_rgba(255,255,255,0.2)] text-foreground outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            maxWidthMap[maxWidth] || "max-w-lg",
            className
          )}
        >
          {/* Top Accent Tape Glow */}
          {topAccentColor && (
            <div
              style={{ backgroundColor: topAccentColor }}
              className="absolute top-0 left-8 right-8 h-1.5 rounded-b-full shadow-sm transition-colors duration-300 pointer-events-none"
            />
          )}

          {/* Header */}
          {(title || description || icon) && (
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <DialogPrimitive.Title className="font-bold text-foreground text-sm sm:text-base leading-snug">
                      {title}
                    </DialogPrimitive.Title>
                  )}
                  {description && (
                    <DialogPrimitive.Description className="text-xs text-muted-foreground mt-0.5 leading-normal">
                      {description}
                    </DialogPrimitive.Description>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <DialogPrimitive.Close asChild>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl border border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogPrimitive.Close>
            </div>
          )}

          {/* Modal Content */}
          <div className="relative">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
