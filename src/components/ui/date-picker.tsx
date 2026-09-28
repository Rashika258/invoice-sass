"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
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
  dateFormat?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  dateFormat = "dd-MM-yyyy",
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
              "w-full h-9 justify-start text-left font-normal text-xs px-3 bg-background dark:bg-zinc-950/80 border border-input dark:border-zinc-800 text-foreground dark:text-zinc-200 rounded-lg shadow-2xs hover:bg-accent/80 hover:text-accent-foreground cursor-pointer transition-colors",
              !selectedDate && "text-muted-foreground dark:text-zinc-500",
              className
            )}
          >
            <CalendarIcon className="size-3.5 mr-2 text-muted-foreground dark:text-zinc-400 opacity-80 shrink-0" />
            <span className="flex-1 truncate">{selectedDate ? format(selectedDate, dateFormat) : placeholder}</span>
            <ChevronDown className="size-3 text-muted-foreground dark:text-zinc-400 opacity-60 shrink-0 ml-1.5" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-3 z-[100] shadow-2xl border border-border dark:border-zinc-800 bg-popover text-popover-foreground rounded-2xl">
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
