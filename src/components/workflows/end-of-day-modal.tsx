"use client";

import { useState } from "react";
import { CheckCircle2, DollarSign, Store, AlertTriangle, Printer, ArrowRight, X, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface EndOfDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EndOfDayModal({ open, onOpenChange }: EndOfDayModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [physicalCash, setPhysicalCash] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Mock computed figures for today
  const todaySales = 42500;
  const upiCollected = 28000;
  const cashExpected = 14500;
  const unpaidDues = 8500;

  const cashDiff = physicalCash ? Number(physicalCash) - cashExpected : 0;

  const handleFinishRegisterClose = () => {
    toast.success("End-of-Day Register Closed Successfully! Daybook reconciled.");
    onOpenChange(false);
    setStep(1);
    setPhysicalCash("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 select-none">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <CalendarCheck className="size-5 text-emerald-600" />
            <span>End-of-Day Business Reconciliation Wizard</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Review daily register sales, reconcile cash drawer, and close business books for today.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="p-4 space-y-4">
          {/* Step 1: Sales & Collection Summary */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1 border-b">
                <span>Step 1 of 3: Sales &amp; Payments Breakdown</span>
                <span className="text-[10px] font-mono text-muted-foreground">Today</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Total Sales Today</div>
                  <div className="text-xl font-black font-mono">₹ {todaySales.toLocaleString("en-IN")}</div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400">
                  <div className="text-[10px] uppercase font-bold text-blue-600">UPI / Online Received</div>
                  <div className="text-xl font-black font-mono">₹ {upiCollected.toLocaleString("en-IN")}</div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
                  <div className="text-[10px] uppercase font-bold text-amber-600">Expected Counter Cash</div>
                  <div className="text-xl font-black font-mono">₹ {cashExpected.toLocaleString("en-IN")}</div>
                </div>

                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400">
                  <div className="text-[10px] uppercase font-bold text-rose-600">Unpaid Customer Dues</div>
                  <div className="text-xl font-black font-mono">₹ {unpaidDues.toLocaleString("en-IN")}</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cash Reconciliation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1 border-b">
                <span>Step 2 of 3: Physical Cash Register Audit</span>
                <span className="text-[10px] font-mono text-muted-foreground">Cash Drawer</span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Enter Actual Physical Cash in Drawer (₹) *</Label>
                <Input
                  type="number"
                  placeholder={`Expected: ₹${cashExpected}`}
                  value={physicalCash}
                  onChange={(e) => setPhysicalCash(e.target.value)}
                  className="h-10 text-base font-mono font-bold"
                  autoFocus
                />
              </div>

              {physicalCash && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                    cashDiff === 0
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                      : cashDiff > 0
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-700"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-700"
                  }`}
                >
                  <span>
                    {cashDiff === 0
                      ? "✓ Cash drawer matches expected system total perfectly!"
                      : cashDiff > 0
                      ? `+ Excess cash of ₹ ${cashDiff.toLocaleString("en-IN")}`
                      : `- Shortage of ₹ ${Math.abs(cashDiff).toLocaleString("en-IN")}`}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase">
                    {cashDiff === 0 ? "BALANCED" : cashDiff > 0 ? "SURPLUS" : "SHORTAGE"}
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Notes / Discrepancy Reason (Optional)</Label>
                <Input
                  placeholder="e.g. Returned ₹50 change for invoice INV-108"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          )}

          {/* Step 3: Final Verification & Close */}
          {step === 3 && (
            <div className="space-y-4 text-center py-2">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-foreground">Ready to Finalize End-of-Day Close</h4>
                <p className="text-xs text-muted-foreground">
                  Today&apos;s total sales of ₹ {todaySales.toLocaleString("en-IN")} will be posted to the daily ledger and synced with your reports.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Total Sales Revenue:</span>
                  <span className="font-bold">₹ {todaySales.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>UPI / Bank Collections:</span>
                  <span className="font-bold">₹ {upiCollected.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Physical Cash Reconciled:</span>
                  <span className="font-bold">₹ {(Number(physicalCash) || cashExpected).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="p-4 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as any)} className="text-xs">
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="text-xs font-bold bg-brand text-white"
              >
                <span>Continue</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleFinishRegisterClose}
                className="text-xs font-bold bg-emerald-600 text-white shadow-xs"
              >
                <CheckCircle2 className="size-3.5 mr-1" />
                <span>Close Register &amp; Save</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
