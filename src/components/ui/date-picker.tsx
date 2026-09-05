"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (dateString: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    try {
      const parsed = parseISO(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const formatted = format(date, "yyyy-MM-dd");
    onChange?.(formatted);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-9 justify-between items-center text-left font-normal text-xs px-3 bg-background dark:bg-zinc-950/80 border border-input dark:border-zinc-800 text-foreground dark:text-zinc-200 rounded-lg shadow-2xs hover:bg-accent/80 hover:text-accent-foreground cursor-pointer transition-colors",
              !selectedDate && "text-muted-foreground dark:text-zinc-500",
              className
            )}
          >
            <span>{selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}</span>
            <ChevronDown className="size-4 text-muted-foreground dark:text-zinc-400 opacity-70 shrink-0 ml-2" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-3.5 z-[100] shadow-2xl border border-border dark:border-zinc-800 bg-card dark:bg-zinc-950 rounded-2xl">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
