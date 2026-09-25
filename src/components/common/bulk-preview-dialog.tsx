"use client";

import { AlertTriangle, CheckCircle2, ChevronRight, Info } from "lucide-react";
import { type BulkImpactPreview } from "@/lib/bulk-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";

interface BulkPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: BulkImpactPreview | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function BulkPreviewDialog({
  open,
  onOpenChange,
  preview,
  onConfirm,
  loading = false,
}: BulkPreviewDialogProps) {
  if (!preview) return null;

  const hasBlockingWarnings = preview.warnings.some((w) => w.severity === "WARNING");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-border/80">
        <DialogHeader className="p-4 bg-muted/40 border-b">
          <DialogTitle className="text-sm font-extrabold text-foreground">
            Bulk Operation Preview
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {preview.operationLabel}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/60">
              <div className="text-2xl font-black font-mono text-foreground">
                {preview.totalRecordsAffected}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
                Records Selected
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                {preview.safeToUpdate}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
                Safe to Update
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">
                {preview.warnings.length}
              </div>
              <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mt-0.5">
                Warnings
              </div>
            </div>
          </div>

          {/* Field Changes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">Field Changes</span>
            <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
              {preview.fieldChanges.map((fc, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs bg-card">
                  <span className="font-semibold text-muted-foreground">{fc.field}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono bg-rose-500/10 text-rose-600 px-2 py-0.5 rounded">
                      {fc.currentValue}
                    </span>
                    <ChevronRight className="size-3 text-muted-foreground" />
                    <span className="font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded">
                      {fc.newValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Impact */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground">Estimated Impact</span>
            <div className="space-y-1">
              {preview.estimatedImpact.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {preview.warnings.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground">Warnings & Notices</span>
              <div className="space-y-2">
                {preview.warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 p-2.5 rounded-lg text-xs border ${
                      w.severity === "WARNING"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300"
                    }`}
                  >
                    {w.severity === "WARNING" ? (
                      <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="size-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.requiresApproval && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>
                This bulk operation exceeds standard thresholds and will be submitted for Admin approval before execution.
              </span>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="p-4 bg-muted/20 border-t flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Cancel — Do Not Apply
          </Button>
          <Button
            size="sm"
            disabled={loading}
            onClick={onConfirm}
            className="text-xs font-bold bg-primary text-white"
          >
            {loading ? "Applying..." : `Confirm — Apply to ${preview.safeToUpdate} Records`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
