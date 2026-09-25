"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";

interface ConsequenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  recordIdentifier: string;
  consequences: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  loading?: boolean;
}

export function ConsequenceDialog({
  open,
  onOpenChange,
  title,
  recordIdentifier,
  consequences,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  loading = false,
}: ConsequenceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 select-none">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <AlertTriangle className={`size-5 ${variant === "danger" ? "text-rose-600" : "text-amber-600"}`} />
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="text-xs font-mono font-semibold text-muted-foreground">
            Target Record: {recordIdentifier}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-4 space-y-3">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2 text-xs">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-4 text-amber-500" />
              <span>Consequences of this action:</span>
            </div>

            <ul className="list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
              {consequences.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </DialogBody>

        <DialogFooter className="p-4 border-t flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            {cancelLabel}
          </Button>

          <Button
            size="sm"
            disabled={loading}
            onClick={onConfirm}
            className={`text-xs font-bold text-white shadow-xs ${
              variant === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
