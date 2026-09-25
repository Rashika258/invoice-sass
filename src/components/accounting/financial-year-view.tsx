"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Circle, 
  Lock, 
  ShieldCheck, 
  Unlock 
} from "lucide-react";
import { 
  listFinancialYears, 
  getYearEndChecklist, 
  type FinancialYear 
} from "@/lib/financial-year";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { SafeActionModal } from "@/components/common/safe-action-modal";
import { calculateActionImpact } from "@/lib/safe-action-impact";

export function FinancialYearView() {
  const [years, setYears] = useState<FinancialYear[]>(listFinancialYears());
  const [selected, setSelected] = useState<FinancialYear | null>(null);
  const [closingModalOpen, setClosingModalOpen] = useState(false);
  const [closingTarget, setClosingTarget] = useState<FinancialYear | null>(null);
  const [processing, setProcessing] = useState(false);

  const checklist = selected ? getYearEndChecklist(selected) : [];
  const blockingItems = checklist.filter((i) => i.blocksClosing && !i.completed);
  const canClose = blockingItems.length === 0 && selected?.status === "ACTIVE";

  const handleOpenClosingModal = (fy: FinancialYear) => {
    setClosingTarget(fy);
    setClosingModalOpen(true);
  };

  const handleConfirmClose = () => {
    if (!closingTarget) return;
    setProcessing(true);
    setTimeout(() => {
      setYears((prev) =>
        prev.map((y) =>
          y.id === closingTarget.id
            ? { ...y, status: "CLOSED", isLocked: true, closingEntryPosted: true, openingBalanceCarriedForward: true }
            : y
        )
      );
      if (selected?.id === closingTarget.id) {
        setSelected((prev) => prev ? { ...prev, status: "CLOSED", isLocked: true } : prev);
      }
      toast.success(`${closingTarget.label} has been closed and locked. Opening balances carried forward.`);
      setClosingModalOpen(false);
      setProcessing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <Calendar className="size-6 text-primary" />
          <span>Financial Year Management</span>
          <Badge className="bg-primary/10 text-primary text-[10px] font-bold">India GAAP</Badge>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          April 1 → March 31 per Companies Act 2013 &amp; Income Tax Act. Only ACTIVE FYs permit new transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Year List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Available Financial Years</span>
          {years.map((fy) => (
            <button
              key={fy.id}
              onClick={() => setSelected(fy)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selected?.id === fy.id
                  ? "border-primary bg-primary/5"
                  : "border-border/80 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {fy.isLocked ? (
                    <Lock className="size-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Unlock className="size-4 text-emerald-500 shrink-0" />
                  )}
                  <span className="font-bold text-sm text-foreground">{fy.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    className={`text-[9px] font-mono font-bold ${
                      fy.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                        : fy.status === "CLOSED"
                        ? "bg-muted text-muted-foreground"
                        : "bg-blue-500/15 text-blue-600"
                    }`}
                  >
                    {fy.status}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 ml-6">
                {new Date(fy.startDate).toLocaleDateString("en-IN")} — {new Date(fy.endDate).toLocaleDateString("en-IN")}
              </p>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <Card className="border border-border/80 overflow-hidden">
              <CardHeader className="p-4 bg-muted/30 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>{selected.label} — Year-End Checklist</span>
                  {selected.isLocked && (
                    <Badge className="text-[9px] bg-muted text-muted-foreground font-mono">LOCKED</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    {item.completed ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className={`size-4 shrink-0 mt-0.5 ${item.blocksClosing ? "text-rose-400" : "text-muted-foreground"}`} />
                    )}
                    <span className={item.completed ? "text-muted-foreground line-through" : "text-foreground"}>
                      {item.label}
                      {item.blocksClosing && !item.completed && (
                        <span className="ml-1 text-[10px] font-bold text-rose-600">[REQUIRED]</span>
                      )}
                    </span>
                  </div>
                ))}

                {selected.status === "ACTIVE" && (
                  <div className="pt-3 border-t">
                    {blockingItems.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 mb-3 flex items-start gap-1.5">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                        <span>Complete {blockingItems.length} required checklist item(s) before closing this financial year.</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      disabled={!canClose}
                      onClick={() => handleOpenClosingModal(selected)}
                      className="w-full text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40"
                    >
                      <Lock className="size-3.5" />
                      <span>Close & Lock {selected.label}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-muted-foreground border border-dashed rounded-xl">
              Select a financial year to view its checklist
            </div>
          )}
        </div>
      </div>

      {/* Safe Closing Modal */}
      {closingTarget && (
        <SafeActionModal
          open={closingModalOpen}
          onOpenChange={setClosingModalOpen}
          impact={calculateActionImpact("FINANCIAL_YEAR_CLOSING", {
            recordId: closingTarget.id,
            identifier: closingTarget.label,
            dateOrPeriod: closingTarget.label,
          })}
          onConfirm={handleConfirmClose}
          loading={processing}
        />
      )}
    </div>
  );
}
