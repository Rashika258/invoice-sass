"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Loader2,
  Receipt,
  Send,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AiBusinessAssistant } from "@/components/dashboard/ai-business-assistant";
import { BillOcrModal } from "@/components/ai/bill-ocr-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParsedBillResult } from "@/lib/ai-ocr";

export function AiHubView() {
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [dispatchingReminders, setDispatchingReminders] = useState(false);
  const [dispatchedSummary, setDispatchedSummary] = useState<string | null>(null);
  const router = useRouter();

  const handleApplyBill = (billData: ParsedBillResult) => {
    toast.success(`Extracted ${billData.items.length} line items from ${billData.supplierName}!`);
    // Redirect to purchase bill creation with OCR prefill
    const params = new URLSearchParams({
      ocrVendorName: billData.supplierName || "",
      ocrVendorGstin: billData.gstin || "",
      ocrBillNumber: billData.invoiceNumber || "",
      ocrBillDate: billData.invoiceDate || "",
      ocrTotalAmount: String(billData.total || 0),
      ocrItems: JSON.stringify(billData.items || []),
    });
    router.push(`/purchases/new?${params.toString()}`);
  };

  const handleDispatchReminders = async () => {
    setDispatchingReminders(true);
    setDispatchedSummary(null);
    try {
      const res = await fetch("/api/v1/notifications/send-reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger: "MANUAL_AI_AUTOPILOT" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Payment reminders sent successfully!");
        setDispatchedSummary(data.message);
      } else {
        toast.error(data.error || "Failed to dispatch reminders");
      }
    } catch {
      toast.error("Error contacting reminder dispatcher");
    } finally {
      setDispatchingReminders(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* AI Autopilot Toolkit Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tool 1: AI OCR Scanner */}
        <Card className="rounded-2xl border-emerald-500/20 bg-linear-to-br from-card via-card to-emerald-500/5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Sparkles className="size-4" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-bold">
                VISION OCR
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold mt-2 text-foreground">
              Supplier Bill &amp; Invoice OCR
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Upload paper vendor invoices or PDF bills. Extracts items, HSN, taxes &amp; supplier GSTIN with high accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Button
              onClick={() => setOcrModalOpen(true)}
              className="w-full h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              <Upload className="size-3.5" />
              <span>Launch AI Bill Scanner</span>
            </Button>
          </CardContent>
        </Card>

        {/* Tool 2: WhatsApp Reminder Dispatcher */}
        <Card className="rounded-2xl border-indigo-500/20 bg-linear-to-br from-card via-card to-indigo-500/5 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <BellRing className="size-4" />
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[9px] font-bold">
                AUTOPILOT
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold mt-2 text-foreground">
              WhatsApp Debt Collection
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Scan ledger dues and dispatch 1-click WhatsApp payment reminders embedded with dynamic UPI QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Button
              onClick={handleDispatchReminders}
              disabled={dispatchingReminders}
              className="w-full h-8 text-xs font-bold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {dispatchingReminders ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Trigger Reminders Now</span>
                </>
              )}
            </Button>
            {dispatchedSummary && (
              <p className="text-[10px] text-emerald-600 font-semibold text-center mt-1.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="size-3" />
                <span>{dispatchedSummary}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tool 3: Stock Transfer & Godown Optimizer */}
        <Card className="rounded-2xl border-amber-500/20 bg-linear-to-br from-card via-card to-amber-500/5 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Zap className="size-4" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] font-bold">
                GODOWNS
              </Badge>
            </div>
            <CardTitle className="text-sm font-bold mt-2 text-foreground">
              Stock Transfer &amp; Godowns
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Monitor multi-warehouse inventory levels and transfer stock between retail counters and central godowns.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push("/items/stock-transfer")}
              className="w-full h-8 text-xs font-bold gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs"
            >
              <span>Manage Godowns &amp; Transfers</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main NLP Business Brain */}
      <AiBusinessAssistant />

      {/* AI Bill Scanner Modal */}
      <BillOcrModal
        open={ocrModalOpen}
        onOpenChange={setOcrModalOpen}
        onApplyBill={handleApplyBill}
      />
    </div>
  );
}
