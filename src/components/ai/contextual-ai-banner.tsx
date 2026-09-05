"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContextualAiBannerProps {
  type: "INVENTORY" | "CUSTOMERS" | "ACCOUNTING" | "SALES";
  title: string;
  description: string;
  metricLabel?: string;
  metricValue?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function ContextualAiBanner({
  type,
  title,
  description,
  metricLabel,
  metricValue,
  actionLabel,
  actionHref,
}: ContextualAiBannerProps) {
  const BADGES: Record<string, { label: string; color: string }> = {
    INVENTORY: { label: "REORDER FORECAST", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    CUSTOMERS: { label: "AGING DUES ALERT", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
    ACCOUNTING: { label: "MARGIN DIAGNOSTIC", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    SALES: { label: "COLLECTION AUTOPILOT", color: "bg-brand-light text-brand border-brand/20" },
  };

  const badge = BADGES[type] || BADGES.SALES;

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand-light/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
      <div className="flex items-start gap-3">
        <div className="size-9 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Sparkles className="size-4" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-foreground">{title}</h4>
            <Badge variant="outline" className={`text-[9px] font-bold ${badge.color}`}>
              {badge.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {metricLabel && metricValue && (
          <div className="text-right hidden md:block border-r border-border/60 pr-3">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">{metricLabel}</span>
            <div className="text-sm font-black font-mono text-brand">{metricValue}</div>
          </div>
        )}

        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:opacity-90 text-white font-bold text-xs shadow-xs transition-opacity"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
