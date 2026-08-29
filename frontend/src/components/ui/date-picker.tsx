"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDatePretty, getTodayDateString } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
  placeholder?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  className = "",
  placeholder = "Pick a date...",
}: CustomDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Initial viewing date based on value or today
  const initialDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewDate, setViewDate] = React.useState<Date>(initialDate);

  React.useEffect(() => {
    if (value) {
      setViewDate(new Date(value + "T00:00:00"));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dayNum: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    onChange(formatted);
    setOpen(false);
  };

  const handleSelectShortcut = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const formatted = `${yyyy}-${mm}-${dd}`;
    onChange(formatted);
    setViewDate(d);
    setOpen(false);
  };

  const todayStr = getTodayDateString();

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
              <CalendarIcon className="size-3.5 text-primary shrink-0" />
              <span className="truncate">
                {value ? formatDatePretty(value) : placeholder}
              </span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-72 p-3.5 space-y-3"
        >
          {/* Quick Preset Shortcuts */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
            <button
              type="button"
              onClick={() => handleSelectShortcut(0)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted hover:bg-primary/15 hover:text-primary text-foreground transition cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectShortcut(1)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted hover:bg-primary/15 hover:text-primary text-foreground transition cursor-pointer"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectShortcut(7)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-muted hover:bg-primary/15 hover:text-primary text-foreground transition cursor-pointer"
            >
              Next Week
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs font-bold text-foreground">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: totalDaysInMonth }).map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={cn(
                    "h-7 w-7 rounded-xl text-xs font-semibold flex items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-md scale-105"
                      : isToday
                        ? "border border-primary/60 text-primary font-bold bg-primary/10 hover:bg-primary/20"
                        : "text-foreground hover:bg-muted"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
            <span className="text-[11px] font-mono text-muted-foreground">
              {value ? formatDatePretty(value) : "No date selected"}
            </span>
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
