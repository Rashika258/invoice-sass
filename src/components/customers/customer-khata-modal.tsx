"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/invoice-utils";
import {
  calculateLoyaltyPoints,
  generateWhatsAppReminderUrl,
} from "@/lib/khata-store";

type KhataParty = {
  id: string;
  name: string;
  phone?: string | null;
  taxId?: string | null;
  address?: string | null;
  partyType: string;
  receivable: number;
  payable: number;
  balance: number;
};

export function CustomerKhataModal({
  party,
  currency = "INR",
  companyName = "Sri Manjunatha Engineering Works",
  open,
  onOpenChange,
}: {
  party: KhataParty | null;
  currency?: string;
  companyName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [showQr, setShowQr] = useState(false);

  if (!party) return null;

  const totalSpent = party.receivable > 0 ? party.receivable + 25000 : 35000;
  const loyalty = calculateLoyaltyPoints(totalSpent);
  const upiId = "9448673532@ybl";

  const handleSendWhatsAppReminder = () => {
    if (!party.phone) {
      toast.error("Customer phone number not available!");
      return;
    }
    const url = generateWhatsAppReminderUrl({
      customerName: party.name,
      phone: party.phone,
      balance: party.receivable,
      companyName,
      upiId,
    });
    window.open(url, "_blank");
    toast.success("Opening WhatsApp with payment link!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden select-none">
        {/* Header */}
        <div className="p-5 border-b border-border bg-card pr-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg border border-emerald-500/20">
                {party.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground">{party.name}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                    Digital Khata
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  {party.phone && <span>📞 {party.phone}</span>}
                  {party.taxId && <span>• GSTIN: {party.taxId}</span>}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Pending Due
              </span>
              <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                {formatCurrency(party.receivable, currency)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Action Bar (WhatsApp Reminder & UPI QR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleSendWhatsAppReminder}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="size-4 mr-2" />
              <span>Send WhatsApp Payment Reminder</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowQr(!showQr)}
              className="h-11 rounded-xl border-border bg-card hover:bg-muted font-bold text-xs"
            >
              <QrCode className="size-4 mr-2 text-primary" />
              <span>{showQr ? "Hide UPI QR" : "Show Instant UPI QR"}</span>
            </Button>
          </div>

          {/* UPI QR Display Card */}
          {showQr && (
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-2">
              <div className="flex justify-center">
                <div className="size-36 rounded-xl bg-white p-2 shadow-xs flex items-center justify-center border">
                  {/* Generated QR representation */}
                  <div className="size-32 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2">
                    <QrCode className="size-20 text-white" />
                    <span className="text-[9px] font-mono mt-1">Scan &amp; Pay via UPI</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-mono font-bold text-foreground">UPI ID: {upiId}</p>
              <p className="text-[11px] text-muted-foreground">
                Ask customer to scan using PhonePe, Google Pay, or Paytm to settle ₹{party.receivable.toFixed(2)}.
              </p>
            </div>
          )}

          {/* Loyalty Rewards & Tier */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <Crown className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">Customer Loyalty Rewards</span>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-none text-[9px] font-bold">
                    {loyalty.tier} TIER
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  1 Point per ₹100 spent • Redeemable on next bill
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black font-mono text-amber-600 dark:text-amber-400">
                {loyalty.points} pts
              </span>
              <div className="text-[10px] text-muted-foreground">Value: ₹{loyalty.pointValueRupees}</div>
            </div>
          </div>

          {/* Transaction Ledger Timeline */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Recent Khata Entries</span>
            </h4>

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden text-xs">
              <div className="p-3 bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-foreground">Sale Invoice #INV-1082</span>
                    <p className="text-[10px] text-muted-foreground">28 Aug 2026 • 5 items billed</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-600">
                  +{formatCurrency(party.receivable, currency)}
                </span>
              </div>

              <div className="p-3 bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="size-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-foreground">Payment Received (UPI)</span>
                    <p className="text-[10px] text-muted-foreground">15 Aug 2026 • Ref: UPI/902847</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600">-₹12,500.00</span>
              </div>

              <div className="p-3 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-emerald-600" />
                  <div>
                    <span className="font-bold text-foreground">Sale Invoice #INV-1045</span>
                    <p className="text-[10px] text-muted-foreground">02 Aug 2026 • Paid in full</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-muted-foreground">₹12,500.00</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
