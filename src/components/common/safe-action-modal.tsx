"use client";

import { useState } from "react";
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowLeft, 
  Check, 
  FileText, 
  Package, 
  Percent, 
  Receipt, 
  ShieldAlert, 
  ShieldCheck 
} from "lucide-react";
import { 
  type SafeActionImpact, 
  type ActionImpactItem 
} from "@/lib/safe-action-impact";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogBody 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SafeActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  impact: SafeActionImpact;
  onConfirm: () => void;
  loading?: boolean;
}

export function SafeActionModal({
  open,
  onOpenChange,
  impact,
  onConfirm,
  loading = false,
}: SafeActionModalProps) {
  const [confirmInput, setConfirmInput] = useState("");

  const requiresWord = impact.requiresConfirmationWord;
  const isWordValid = !requiresWord || confirmInput.trim().toUpperCase() === requiresWord.toUpperCase();

  const getImpactIcon = (type: ActionImpactItem["iconType"]) => {
    switch (type) {
      case "FINANCIAL":
        return <Receipt className="size-3.5 text-blue-500 shrink-0" />;
      case "INVENTORY":
        return <Package className="size-3.5 text-amber-500 shrink-0" />;
      case "TAX":
        return <Percent className="size-3.5 text-purple-500 shrink-0" />;
      case "AUDIT":
        return <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />;
      case "IRREVERSIBLE":
        return <AlertOctagon className="size-3.5 text-rose-500 shrink-0" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 select-none overflow-hidden border-border/80">
        <DialogHeader className="p-4 bg-muted/40 border-b">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              impact.confirmVariant === "danger" 
                ? "bg-rose-500/15 text-rose-600" 
                : "bg-amber-500/15 text-amber-600"
            }`}>
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-foreground">
                {impact.title}
              </DialogTitle>
              <DialogDescription className="text-xs font-mono text-muted-foreground">
                Target: {impact.targetIdentifier}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="p-4 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldAlert className="size-3.5 text-amber-500" />
              <span>This action will execute the following:</span>
            </span>

            <div className="p-3 rounded-xl bg-muted/30 border border-border/70 space-y-2 text-xs">
              {impact.impacts.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="mt-0.5">{getImpactIcon(item.iconType)}</div>
                  <span className={item.isNegative ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {requiresWord && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-foreground block">
                Type <strong className="font-mono text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded">{requiresWord}</strong> to confirm:
              </label>
              <Input
                placeholder={`Type "${requiresWord}" to enable`}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="font-mono text-xs uppercase"
              />
            </div>
          )}
        </DialogBody>

        <DialogFooter className="p-4 bg-muted/20 border-t flex flex-row items-center justify-between gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="text-xs gap-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Go back</span>
          </Button>

          <Button
            size="sm"
            disabled={loading || !isWordValid}
            onClick={onConfirm}
            className={`text-xs font-bold text-white shadow-xs ${
              impact.confirmVariant === "danger"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading ? "Processing..." : impact.confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
