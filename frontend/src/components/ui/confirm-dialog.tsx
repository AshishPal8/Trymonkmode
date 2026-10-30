"use client";

import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for deletes and other things that can't be undone. */
  destructive?: boolean;
}

/**
 * In-app replacement for `window.confirm`.
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title: "Delete goal?", destructive: true }))) return;
 *   ...
 *   return <>{...}{confirmDialog}</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((ok: boolean) => {
    resolverRef.current?.(ok);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirmDialog = (
    <Modal
      isOpen={!!options}
      onClose={() => close(false)}
      maxWidth="sm"
      topAccentColor={options?.destructive ? "#EF4444" : "#0052FF"}
    >
      {options && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                options.destructive ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-1 pt-0.5">
              <h3 className="text-sm font-bold text-foreground">{options.title}</h3>
              {options.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{options.description}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" className="h-9 px-4 text-xs rounded-xl" onClick={() => close(false)}>
              {options.cancelLabel || "Cancel"}
            </Button>
            <Button
              type="button"
              autoFocus
              className={`h-9 px-4 text-xs rounded-xl ${
                options.destructive ? "bg-rose-500 hover:bg-rose-600 text-white" : ""
              }`}
              onClick={() => close(true)}
            >
              {options.confirmLabel || "Confirm"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  return { confirm, confirmDialog };
}
