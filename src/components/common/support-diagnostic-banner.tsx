"use client";

import React, { useState } from "react";
import { AlertCircle, Copy, Check, LifeBuoy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createDiagnosticPayload,
  formatDiagnosticTextForCopy,
  type DiagnosticInfo,
} from "@/lib/support-diagnostics";

interface SupportDiagnosticBannerProps {
  error: Error | string;
  userRole?: string;
  onRetry?: () => void;
}

export function SupportDiagnosticBanner({ error, userRole = "ADMIN", onRetry }: SupportDiagnosticBannerProps) {
  const [copied, setCopied] = useState(false);
  const [diagnostic] = useState<DiagnosticInfo>(() => createDiagnosticPayload(error, userRole));

  const handleCopy = () => {
    const text = formatDiagnosticTextForCopy(diagnostic);
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Diagnostic info copied to clipboard (PII sanitized)");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/[0.03] space-y-3 select-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
            <AlertCircle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">Operational System Exception</h4>
              <Badge className="bg-rose-600 text-white font-mono text-[10px] font-bold">
                {diagnostic.supportId}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{diagnostic.errorMessage}</p>
          </div>
        </div>

        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry} className="h-8 text-xs font-bold shrink-0">
            Retry Action
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rose-500/20 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
          <LifeBuoy className="size-3.5 text-brand" />
          <span>Quote Support ID when contacting technical assistance</span>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={handleCopy}
          className="h-7 text-[11px] font-bold gap-1.5 bg-card hover:bg-muted text-foreground border border-border shrink-0"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span>Copied Payload</span>
            </>
          ) : (
            <>
              <Copy className="size-3 text-brand" />
              <span>Copy Diagnostic Info</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
