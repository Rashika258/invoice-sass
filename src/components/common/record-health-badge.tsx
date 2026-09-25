"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ShieldAlert, ChevronDown, Wrench, X } from "lucide-react";
import type { RecordHealthResult } from "@/lib/data-quality";

interface RecordHealthBadgeProps {
  health: RecordHealthResult;
  onFix?: (field: string) => void;
  className?: string;
}

export function RecordHealthBadge({ health, onFix, className = "" }: RecordHealthBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusBadge = () => {
    switch (health.status) {
      case "HEALTHY":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full cursor-pointer">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Healthy</span>
            <ChevronDown className="size-3 opacity-60" />
          </Badge>
        );
      case "NEEDS_REVIEW":
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full cursor-pointer">
            <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>Needs Review</span>
            <ChevronDown className="size-3 opacity-60" />
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold text-[11px] gap-1 px-2.5 py-0.5 rounded-full cursor-pointer">
            <ShieldAlert className="size-3.5 text-rose-600 dark:text-rose-400" />
            <span>Critical Issue</span>
            <ChevronDown className="size-3 opacity-60" />
          </Badge>
        );
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>{getStatusBadge()}</div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-border bg-card p-4 shadow-xl select-none animate-in fade-in-50 zoom-in-95">
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-foreground">
                Health Score: {health.score}/100
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </div>

          {health.issues.length === 0 ? (
            <div className="text-center py-3 space-y-1">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-foreground">No Issues Detected</p>
              <p className="text-[11px] text-muted-foreground">
                This record complies with all GST, contact, and data completeness checks.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Detected Quality Issues ({health.issues.length})
              </p>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {health.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                      issue.severity === "CRITICAL"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-[11px] leading-snug">{issue.message}</span>
                    </div>

                    {issue.fixLabel && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (onFix) onFix(issue.field);
                          setIsOpen(false);
                        }}
                        className="h-6 text-[10px] font-bold gap-1 px-2 py-0 bg-background text-foreground shadow-2xs hover:bg-muted"
                      >
                        <Wrench className="size-3 text-brand" />
                        <span>{issue.fixLabel}</span>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
