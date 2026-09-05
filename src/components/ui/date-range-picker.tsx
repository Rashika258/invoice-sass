"use client";

import { useState } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, RotateCcw } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DatePresetKey =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "ALL_TIME"
  | "CUSTOM";

export interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string, preset?: DatePresetKey) => void;
  activePreset?: DatePresetKey;
  className?: string;
}

const PRESETS: { key: DatePresetKey; label: string }[] = [
  { key: "TODAY", label: "Today" },
  { key: "YESTERDAY", label: "Yesterday" },
  { key: "THIS_WEEK", label: "This Week" },
  { key: "LAST_WEEK", label: "Last Week" },
  { key: "THIS_MONTH", label: "This Month" },
  { key: "LAST_MONTH", label: "Previous Month" },
  { key: "THIS_QUARTER", label: "This Quarter" },
  { key: "THIS_YEAR", label: "This Year" },
  { key: "ALL_TIME", label: "All Time" },
];

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  activePreset = "THIS_MONTH",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const startObj = startDate ? new Date(startDate) : undefined;
  const endObj = endDate ? new Date(endDate) : undefined;

  const dateRange: DateRange = {
    from: startObj,
    to: endObj,
  };

  const handleSelectRange = (range: DateRange | undefined) => {
    if (!range) return;
    const fromStr = range.from ? format(range.from, "yyyy-MM-dd") : startDate;
    const toStr = range.to ? format(range.to, "yyyy-MM-dd") : fromStr;
    onRangeChange(fromStr, toStr, "CUSTOM");
  };

  const handlePresetSelect = (preset: DatePresetKey) => {
    const today = new Date();
    let s = today;
    let e = today;

    switch (preset) {
      case "TODAY":
        s = startOfDay(today);
        e = endOfDay(today);
        break;
      case "YESTERDAY": {
        const yest = subDays(today, 1);
        s = startOfDay(yest);
        e = endOfDay(yest);
        break;
      }
      case "THIS_WEEK":
        s = startOfWeek(today, { weekStartsOn: 1 });
        e = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case "LAST_WEEK": {
        const prevW = subDays(today, 7);
        s = startOfWeek(prevW, { weekStartsOn: 1 });
        e = endOfWeek(prevW, { weekStartsOn: 1 });
        break;
      }
      case "THIS_MONTH":
        s = startOfMonth(today);
        e = endOfMonth(today);
        break;
      case "LAST_MONTH": {
        const prevM = subMonths(today, 1);
        s = startOfMonth(prevM);
        e = endOfMonth(prevM);
        break;
      }
      case "THIS_QUARTER":
        s = startOfQuarter(today);
        e = endOfQuarter(today);
        break;
      case "THIS_YEAR":
        s = startOfYear(today);
        e = endOfYear(today);
        break;
      case "ALL_TIME":
        s = new Date("2020-01-01");
        e = new Date("2035-12-31");
        break;
    }

    onRangeChange(format(s, "yyyy-MM-dd"), format(e, "yyyy-MM-dd"), preset);
  };

  const formatDisplay = () => {
    if (!startObj) return "Select Dates";
    if (!endObj || startDate === endDate) {
      return format(startObj, "dd MMM yyyy");
    }
    return `${format(startObj, "dd MMM yyyy")} - ${format(endObj, "dd MMM yyyy")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors shadow-2xs cursor-pointer outline-none",
              className
            )}
          >
            <CalendarIcon className="size-3.5 text-brand" />
            <span>{formatDisplay()}</span>
            <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0 shadow-2xl border border-border bg-card">
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Preset Buttons Column */}
          <div className="p-2 sm:w-40 flex flex-wrap sm:flex-col gap-1 bg-muted/20">
            <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 hidden sm:block">
              Quick Presets
            </span>
            {PRESETS.map((p) => {
              const isSelected = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    handlePresetSelect(p.key);
                  }}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer w-full font-medium",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Shadcn Range Calendar */}
          <div className="p-2">
            <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-border mb-2">
              <span className="text-xs font-bold text-foreground">Custom Date Range</span>
              <button
                type="button"
                onClick={() => handlePresetSelect("THIS_MONTH")}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span>Reset</span>
              </button>
            </div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleSelectRange}
              numberOfMonths={1}
              defaultMonth={startObj}
            />
            <div className="flex items-center justify-between p-2 pt-1 border-t border-border mt-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                {startDate} to {endDate}
              </span>
              <Button
                size="sm"
                className="h-7 text-xs px-3 font-bold"
                onClick={() => setOpen(false)}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

