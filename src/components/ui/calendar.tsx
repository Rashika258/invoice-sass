"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = DayPickerProps;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3 relative",
        month_caption: "flex justify-center pt-1 relative items-center px-1 mb-2 h-7",
        caption_label: "text-sm font-semibold text-foreground dark:text-zinc-100",
        nav: "flex items-center justify-between w-full absolute inset-x-0 top-0 h-7 px-1 z-10 pointer-events-none *:pointer-events-auto",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7 bg-transparent p-0 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 cursor-pointer rounded-lg"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "size-7 bg-transparent p-0 text-muted-foreground dark:text-zinc-400 hover:text-foreground dark:hover:text-zinc-100 cursor-pointer rounded-lg"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex justify-between",
        weekday:
          "text-muted-foreground dark:text-zinc-400 rounded-md w-9 font-normal text-xs text-center pb-1",
        week: "flex w-full mt-1 justify-between",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-9 p-0 font-medium text-sm text-foreground dark:text-zinc-200 hover:bg-muted dark:hover:bg-zinc-800/80 rounded-xl cursor-pointer transition-colors"
        ),
        selected:
          "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground rounded-xl shadow-xs",
        range_start: "bg-primary text-primary-foreground font-bold rounded-l-xl",
        range_end: "bg-primary text-primary-foreground font-bold rounded-r-xl",
        range_middle: "bg-primary/20 text-foreground font-medium rounded-none",
        today: "font-bold text-primary border border-primary/40 rounded-xl",
        outside: "text-muted-foreground dark:text-zinc-600 opacity-40",
        disabled: "text-muted-foreground opacity-30 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="size-4" />;
          }
          return <ChevronRight className="size-4" />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };

