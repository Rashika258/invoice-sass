"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MonthFilter({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState(defaultValue);

  const applyMonth = (newMonth: string) => {
    setSelectedMonth(newMonth);
    startTransition(() => {
      router.push(`/attendance?month=${newMonth}`);
    });
  };

  const handlePrev = () => {
    try {
      const current = parseISO(`${selectedMonth}-01`);
      const prev = format(subMonths(current, 1), "yyyy-MM");
      applyMonth(prev);
    } catch {
      // Fallback
    }
  };

  const handleNext = () => {
    try {
      const current = parseISO(`${selectedMonth}-01`);
      const next = format(addMonths(current, 1), "yyyy-MM");
      applyMonth(next);
    } catch {
      // Fallback
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyMonth(selectedMonth);
      }}
      className="flex items-center gap-1.5"
    >
      <div className="flex items-center rounded-lg border border-input bg-card shadow-xs overflow-hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          disabled={isPending}
          className="size-8 rounded-none border-r border-border hover:bg-muted"
          title="Previous Month"
        >
          <ChevronLeft className="size-3.5" />
        </Button>

        <div className="relative flex items-center">
          <input
            id="month"
            name="month"
            type="month"
            value={selectedMonth}
            onChange={(e) => applyMonth(e.target.value)}
            disabled={isPending}
            className="h-8 w-32 border-none bg-transparent px-2.5 text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={isPending}
          className="size-8 rounded-none border-l border-border hover:bg-muted"
          title="Next Month"
        >
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="h-8 rounded-lg bg-secondary hover:bg-secondary/80 px-2.5 text-xs font-semibold text-secondary-foreground shadow-xs gap-1.5 active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Loader2 className="size-3 animate-spin" />
            <span>Filtering...</span>
          </>
        ) : (
          <>
            <Calendar className="size-3 text-muted-foreground" />
            <span>Filter Month</span>
          </>
        )}
      </Button>
    </form>
  );
}
