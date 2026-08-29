"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CustomTimePickerProps {
  value: string; // HH:MM
  onChange: (timeStr: string) => void;
  className?: string;
  placeholder?: string;
}

export function CustomTimePicker({
  value,
  onChange,
  className = "",
  placeholder = "Pick time...",
}: CustomTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [currentHour, currentMinute] = value ? value.split(":") : ["12", "00"];

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const handleHourSelect = (h: string) => {
    onChange(`${h}:${currentMinute || "00"}`);
  };

  const handleMinuteSelect = (m: string) => {
    onChange(`${currentHour || "12"}:${m}`);
    setOpen(false);
  };

  const handleNow = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, "0");
    onChange(`${h}:${m}`);
    setOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-8 w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 dark:bg-muted/30 px-3 py-1.5 text-xs text-foreground font-medium transition-all outline-none shadow-2xs hover:border-border/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Clock className="size-3.5 text-primary shrink-0" />
              <span className="font-mono">{value || placeholder}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-56 p-3 space-y-2.5"
        >
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <span>Select Time</span>
            <span className="font-mono text-foreground font-extrabold">{value || "12:00"}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground block mb-1">Hour</span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHourSelect(h)}
                    className={cn(
                      "w-full py-1 rounded-lg font-mono text-xs font-bold transition cursor-pointer",
                      currentHour === h
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground block mb-1">Minute</span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMinuteSelect(m)}
                    className={cn(
                      "w-full py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer",
                      currentMinute === m
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <button
              type="button"
              onClick={handleNow}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Done
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
