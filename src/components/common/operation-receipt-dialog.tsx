"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  FileText, 
  Hash, 
  Package, 
  Receipt, 
  User, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type OperationReceiptType =
  | "INVOICE_CREATED"
  | "INVOICE_SENT"
  | "INVOICE_CANCELLED"
  | "PAYMENT_RECORDED"
  | "PAYMENT_REVERSED"
  | "STOCK_ADJUSTED"
  | "VOUCHER_POSTED"
  | "PAYROLL_FINALISED"
  | "BACKUP_CREATED"
  | "IMPORT_COMPLETED";

export interface OperationReceipt {
  operationType: OperationReceiptType;
  reference: string;           // e.g. "INV-2026-001"
  operationId: string;         // e.g. "op_8f31"
  performedBy: string;         // user name
  timestamp: string;           // ISO
  amount?: number;
  additionalDetails?: { label: string; value: string }[];
}

interface OperationReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: OperationReceipt | null;
}

const TYPE_CONFIG: Record<
  OperationReceiptType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  INVOICE_CREATED:   { label: "Invoice Created",        icon: <FileText className="size-5" />, color: "text-blue-600 bg-blue-500/10" },
  INVOICE_SENT:      { label: "Invoice Sent",           icon: <FileText className="size-5" />, color: "text-violet-600 bg-violet-500/10" },
  INVOICE_CANCELLED: { label: "Invoice Cancelled",      icon: <FileText className="size-5" />, color: "text-rose-600 bg-rose-500/10" },
  PAYMENT_RECORDED:  { label: "Payment Recorded",       icon: <Receipt className="size-5" />,  color: "text-emerald-600 bg-emerald-500/10" },
  PAYMENT_REVERSED:  { label: "Payment Reversed",       icon: <Receipt className="size-5" />,  color: "text-amber-600 bg-amber-500/10" },
  STOCK_ADJUSTED:    { label: "Stock Adjusted",         icon: <Package className="size-5" />,  color: "text-amber-600 bg-amber-500/10" },
  VOUCHER_POSTED:    { label: "Voucher Posted",         icon: <Hash className="size-5" />,     color: "text-purple-600 bg-purple-500/10" },
  PAYROLL_FINALISED: { label: "Payroll Finalised",      icon: <User className="size-5" />,     color: "text-blue-600 bg-blue-500/10" },
  BACKUP_CREATED:    { label: "Backup Created",         icon: <Download className="size-5" />, color: "text-teal-600 bg-teal-500/10" },
  IMPORT_COMPLETED:  { label: "Data Import Completed",  icon: <FileText className="size-5" />, color: "text-indigo-600 bg-indigo-500/10" },
};

export function OperationReceiptDialog({
  open,
  onOpenChange,
  receipt,
}: OperationReceiptDialogProps) {
  if (!receipt) return null;

  const config = TYPE_CONFIG[receipt.operationType];
  const dt = new Date(receipt.timestamp);
  const timeString = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateString = dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const handleCopy = () => {
    const text = [
      `Operation: ${config.label}`,
      `Reference: ${receipt.reference}`,
      `Operation ID: ${receipt.operationId}`,
      `Performed By: ${receipt.performedBy}`,
      `Date & Time: ${dateString} at ${timeString}`,
      receipt.amount ? `Amount: ₹${receipt.amount.toLocaleString("en-IN")}` : "",
      ...(receipt.additionalDetails || []).map((d) => `${d.label}: ${d.value}`),
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      toast.success("Receipt details copied to clipboard");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden border-border/80">
        {/* Success Header */}
        <div className="flex flex-col items-center gap-3 p-6 bg-emerald-500/5 border-b">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-emerald-500/15">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="font-extrabold text-lg text-foreground tracking-tight">{config.label}</h2>
            <p className="text-xs text-muted-foreground">Operation completed and permanently recorded</p>
          </div>
        </div>

        {/* Receipt Details */}
        <DialogBody className="p-4 space-y-3">
          <div className="rounded-xl border border-border/60 bg-muted/30 divide-y divide-border/40 overflow-hidden">
            <ReceiptRow label="Reference" value={receipt.reference} mono />
            <ReceiptRow label="Operation ID" value={receipt.operationId} mono />
            <ReceiptRow label="Performed By" value={receipt.performedBy} />
            <ReceiptRow label="Date" value={dateString} />
            <ReceiptRow label="Time" value={timeString} />
            {receipt.amount !== undefined && (
              <ReceiptRow label="Amount" value={`₹${receipt.amount.toLocaleString("en-IN")}`} mono />
            )}
            {(receipt.additionalDetails || []).map((d, i) => (
              <ReceiptRow key={i} label={d.label} value={d.value} />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 text-xs gap-1.5 font-semibold"
            >
              <Copy className="size-3.5" />
              <span>Copy Details</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-semibold text-right ${mono ? "font-mono text-foreground" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

/**
 * Hook to show an operation receipt after any major action
 */
export function useOperationReceipt() {
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<OperationReceipt | null>(null);

  const show = (data: OperationReceipt) => {
    setReceipt(data);
    setOpen(true);
  };

  const generateId = () => `op_${Math.random().toString(36).slice(2, 7)}`;

  return { open, setOpen, receipt, show, generateId };
}
