"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

function TooltipProvider({
  delay = 200,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} data-slot="tooltip-provider" {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({
  ...props
}: TooltipPrimitive.Trigger.Props) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
    />
  );
}

function TooltipContent({
  side = "top",
  sideOffset = 6,
  align = "center",
  className,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "side" | "sideOffset" | "align"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className="isolate z-[100] outline-none"
        side={side}
        sideOffset={sideOffset}
        align={align}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "z-[100] max-w-xs rounded-lg border border-border/80 bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md duration-150 outline-none select-none",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

/**
 * Quick wrapper to attach a tooltip to any element.
 * Usage:
 * <SimpleTooltip content="Help text here">
 *   <Button>Hover Me</Button>
 * </SimpleTooltip>
 */
export function SimpleTooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  if (!content) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger render={children as any} />
      <TooltipContent side={side} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * An inline info icon `(i)` with a hover explanation tooltip.
 * Great for form labels, financial metrics, and table headers.
 */
export function InfoTooltip({
  text,
  side = "top",
  className,
}: {
  text: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span
            className={cn(
              "inline-flex items-center justify-center text-muted-foreground/80 hover:text-foreground transition-colors cursor-help p-0.5 rounded-full hover:bg-muted/60",
              className
            )}
            tabIndex={0}
            role="button"
            aria-label={text}
          >
            <Info className="size-3.5" />
          </span>
        }
      />
      <TooltipContent side={side} className="max-w-[260px] text-[11px] leading-relaxed font-normal">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};
