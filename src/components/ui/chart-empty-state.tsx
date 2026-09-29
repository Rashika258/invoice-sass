"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Wallet, 
  Users, 
  Package, 
  Sparkles,
  Plus
} from "lucide-react";

interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  icon?: "trend" | "category" | "payment" | "party" | "inventory" | "ai" | "bar";
  actionText?: string;
  actionHref?: string;
  className?: string;
  minHeight?: string;
}

export function ChartEmptyState({
  title = "No Data Available",
  description = "No transaction data has been recorded for this timeframe yet.",
  icon = "trend",
  actionText,
  actionHref,
  className = "",
  minHeight = "min-h-[220px]",
}: ChartEmptyStateProps) {
  return (
    <div
      className={`relative w-full ${minHeight} flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10 overflow-hidden ${className}`}
    >
      {/* Background Graphic SVG Illustration */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 flex items-center justify-center">
        <svg
          viewBox="0 0 400 160"
          className="w-full h-full max-w-lg object-contain text-muted-foreground/30 stroke-current fill-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Horizontal grid lines */}
          <line x1="20" y1="40" x2="380" y2="40" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="20" y1="80" x2="380" y2="80" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="20" y1="120" x2="380" y2="120" strokeDasharray="4 4" strokeWidth="1" />
          
          {/* Subtle ghost bars or dashed wave */}
          {icon === "category" ? (
            <g transform="translate(200, 80)">
              <circle r="45" strokeWidth="10" strokeDasharray="70 20 40 30" opacity="0.3" />
            </g>
          ) : icon === "party" || icon === "payment" ? (
            <g opacity="0.3">
              <rect x="50" y="90" width="40" height="30" rx="4" strokeWidth="1.5" />
              <rect x="130" y="70" width="40" height="50" rx="4" strokeWidth="1.5" />
              <rect x="210" y="50" width="40" height="70" rx="4" strokeWidth="1.5" />
              <rect x="290" y="80" width="40" height="40" rx="4" strokeWidth="1.5" />
            </g>
          ) : (
            <path
              d="M 30 120 Q 120 110, 180 80 T 320 60 T 380 90"
              strokeDasharray="6 6"
              strokeWidth="2"
              opacity="0.4"
            />
          )}
        </svg>
      </div>

      {/* Center Icon badge with soft gradient glow */}
      <div className="relative mb-3.5 flex size-12 items-center justify-center rounded-2xl bg-muted/60 dark:bg-zinc-800/80 border border-border shadow-xs backdrop-blur-xs">
        {icon === "trend" && <TrendingUp className="size-6 text-muted-foreground/80" />}
        {icon === "category" && <PieChart className="size-6 text-muted-foreground/80" />}
        {icon === "payment" && <Wallet className="size-6 text-muted-foreground/80" />}
        {icon === "party" && <Users className="size-6 text-muted-foreground/80" />}
        {icon === "inventory" && <Package className="size-6 text-muted-foreground/80" />}
        {icon === "ai" && <Sparkles className="size-6 text-muted-foreground/80" />}
        {icon === "bar" && <BarChart3 className="size-6 text-muted-foreground/80" />}
        
        {/* Soft pulse ring */}
        <span className="absolute -inset-1 rounded-2xl bg-primary/5 animate-pulse" />
      </div>

      {/* Content */}
      <h3 className="relative text-sm font-semibold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="relative mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>

      {/* Optional action */}
      {actionText && actionHref && (
        <div className="relative mt-3.5">
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1.5 rounded-lg">
            <Link href={actionHref}>
              <Plus className="size-3" />
              <span>{actionText}</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
