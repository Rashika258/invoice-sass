"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ShieldCheck, AlertTriangle, ArrowRight, User, Package, Calculator, Receipt } from "lucide-react";

export interface ReviewPostingLineItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  stockRemainingAfter?: number;
}

export interface ReviewPostingData {
  customerName: string;
  customerGstin?: string;
  invoiceNumber?: string;
  date: string;
  items: ReviewPostingLineItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  grandTotal: number;
  paymentTerms?: string;
  invariantsPassed: boolean;
  warnings?: string[];
}

interface ReviewBeforePostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPosting?: boolean;
  data: ReviewPostingData;
}

export function ReviewBeforePostingModal({
  isOpen,
  onClose,
  onConfirm,
  isPosting = false,
  data,
}: ReviewBeforePostingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl border border-border p-6 shadow-xl">
        <DialogHeader className="space-y-1.5 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-foreground">
                Pre-Posting Operational Audit
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verify line totals, tax calculations, party information, and inventory deduction before finalizing record.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4 select-none">
          {/* Invariants Integrity Status */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              data.invariantsPassed
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {data.invariantsPassed ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>
                {data.invariantsPassed
                  ? "Operational Invariants Verified: Line items sum matches total & stock limits met."
                  : "Validation Warning: Discrepancies detected in record math or inventory."}
              </span>
            </div>
            <Badge
              className={
                data.invariantsPassed
                  ? "bg-emerald-600 text-white font-mono text-[10px]"
                  : "bg-rose-600 text-white font-mono text-[10px]"
              }
            >
              {data.invariantsPassed ? "PASSED" : "REVIEW"}
            </Badge>
          </div>

          {/* Customer & Document Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <User className="size-3.5 text-brand" /> Billed Customer
              </span>
              <p className="font-bold text-foreground text-sm">{data.customerName}</p>
              {data.customerGstin && (
                <p className="font-mono text-[11px] text-muted-foreground">GSTIN: {data.customerGstin}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-muted-foreground font-medium flex items-center sm:justify-end gap-1.5">
                <Receipt className="size-3.5 text-brand" /> Record Info
              </span>
              <p className="font-mono font-bold text-foreground text-sm">
                {data.invoiceNumber || "DRAFT #INV-NEW"}
              </p>
              <p className="text-[11px] text-muted-foreground">Date: {data.date}</p>
            </div>
          </div>

          {/* Line Items & Stock Deduction */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Package className="size-3.5 text-brand" /> Line Items &amp; Stock Deduction ({data.items.length})
            </h4>

            <div className="border border-border rounded-xl overflow-hidden divide-y divide-border text-xs">
              {data.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-card hover:bg-muted/20">
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.qty} qty × ₹{item.unitPrice.toLocaleString("en-IN")} ({item.taxRate}% GST)
                    </p>
                  </div>

                  <div className="text-right font-mono">
                    <p className="font-bold text-foreground">₹{item.amount.toLocaleString("en-IN")}</p>
                    {item.stockRemainingAfter !== undefined && (
                      <p
                        className={`text-[10px] ${
                          item.stockRemainingAfter < 5 ? "text-amber-600 font-bold" : "text-muted-foreground"
                        }`}
                      >
                        Stock left: {item.stockRemainingAfter}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-mono">₹{data.subtotal.toLocaleString("en-IN")}</span>
            </div>

            {data.discount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Discount Applied</span>
                <span className="font-mono">- ₹{data.discount.toLocaleString("en-IN")}</span>
              </div>
            )}

            {data.cgst > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>CGST</span>
                <span className="font-mono">₹{data.cgst.toLocaleString("en-IN")}</span>
              </div>
            )}

            {data.sgst > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>SGST</span>
                <span className="font-mono">₹{data.sgst.toLocaleString("en-IN")}</span>
              </div>
            )}

            {data.igst > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>IGST</span>
                <span className="font-mono">₹{data.igst.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="pt-2 border-t border-border flex items-center justify-between font-black text-sm text-foreground">
              <span className="flex items-center gap-1.5">
                <Calculator className="size-4 text-brand" /> Final Post Amount
              </span>
              <span className="font-mono text-base text-brand">₹{data.grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Warnings if any */}
          {data.warnings && data.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="size-3.5" /> Note before posting:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {data.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4 gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPosting} className="text-xs">
            Back to Edit
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isPosting}
            className="bg-brand text-white font-bold text-xs gap-1.5 hover:opacity-90"
          >
            {isPosting ? (
              <span>Posting...</span>
            ) : (
              <>
                <span>Confirm &amp; Post Record</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
