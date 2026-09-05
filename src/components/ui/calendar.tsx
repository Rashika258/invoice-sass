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
      className={cn("p-3 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-between pt-1 relative items-center px-1 mb-2",
        caption_label: "text-sm font-bold text-foreground",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          "size-7 bg-transparent p-0 opacity-70 hover:opacity-100 cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-8 font-medium text-[0.8rem] text-center",
        week: "flex w-full mt-1",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal hover:bg-accent rounded-md cursor-pointer transition-colors"
        ),
        selected: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
        range_start: "bg-primary text-primary-foreground font-bold rounded-l-md",
        range_end: "bg-primary text-primary-foreground font-bold rounded-r-md",
        range_middle: "bg-primary/20 text-foreground font-medium rounded-none",
        today: "font-bold text-primary border border-primary/50",
        outside: "text-muted-foreground opacity-30",
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

