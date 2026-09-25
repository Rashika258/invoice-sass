"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export interface ActionReasonOption {
  code: string;
  label: string;
}

const DEFAULT_REASONS: Record<string, ActionReasonOption[]> = {
  INVOICE_CANCEL: [
    { code: "CUSTOMER_REQUESTED", label: "Customer requested cancellation" },
    { code: "BILLING_ERROR", label: "Error in billing / incorrect tax calculation" },
    { code: "DUPLICATE_BILL", label: "Duplicate invoice created" },
    { code: "OTHER", label: "Other operational reason" },
  ],
  STOCK_ADJUSTMENT: [
    { code: "DAMAGED_GOODS", label: "Damaged or expired inventory write-off" },
    { code: "PHYSICAL_COUNT_VARIANCE", label: "Physical stock count variance" },
    { code: "MANUAL_CORRECTION", label: "Manual data entry correction" },
    { code: "OTHER", label: "Other stock adjustment" },
  ],
  REFUND_DISCOUNT: [
    { code: "GOODS_RETURN", label: "Goods returned by customer" },
    { code: "DISCOUNT_ALLOWANCE", label: "Approved goodwill discount" },
    { code: "DUPLICATE_PAYMENT", label: "Duplicate payment received" },
    { code: "OTHER", label: "Other refund or discount" },
  ],
};

interface ActionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: string, reasonText: string) => void;
  actionType: "INVOICE_CANCEL" | "STOCK_ADJUSTMENT" | "REFUND_DISCOUNT";
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ActionReasonModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  title = "Specify Reason Code",
  description = "Operational guidelines require documenting a reason for this audit event.",
  isLoading = false,
}: ActionReasonModalProps) {
  const options = DEFAULT_REASONS[actionType] || DEFAULT_REASONS.INVOICE_CANCEL;
  const [selectedCode, setSelectedCode] = useState<string>(options[0].code);
  const [customReason, setCustomReason] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedOption = options.find((o) => o.code === selectedCode);
    const finalReasonText =
      selectedCode === "OTHER"
        ? customReason.trim() || "Other reason specified"
        : matchedOption?.label || selectedCode;

    onConfirm(selectedCode, finalReasonText);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:rounded-2xl border border-border p-6 shadow-xl select-none">
        <DialogHeader className="space-y-1 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black tracking-tight text-foreground">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selectedCode === option.code;
              return (
                <div
                  key={option.code}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-brand bg-brand/[0.04] text-foreground font-semibold"
                      : "border-border bg-card hover:bg-muted/30 text-muted-foreground"
                  }`}
                  onClick={() => setSelectedCode(option.code)}
                >
                  <span className="text-xs">{option.label}</span>
                  {isSelected && <CheckCircle2 className="size-4 text-brand" />}
                </div>
              );
            })}
          </div>

          {selectedCode === "OTHER" && (
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground">Custom Notes / Reason</Label>
              <Input
                placeholder="Explain reason for audit log..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="text-xs h-9 rounded-xl"
                required
              />
            </div>
          )}

          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isLoading} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isLoading}
              className="bg-brand text-white font-bold text-xs gap-1.5 hover:opacity-90"
            >
              {isLoading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Save Audit Reason</span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
