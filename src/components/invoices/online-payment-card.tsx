"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInvoicePaymentLinkAction } from "@/actions/payment-gateway";

interface OnlinePaymentCardProps {
  invoiceId: string;
  amount: number;
  customerName: string;
  status: string;
  paidAmount?: number;
  totalAmount?: number;
}

export function OnlinePaymentCard({
  invoiceId,
  amount,
  customerName,
  status,
  paidAmount,
  totalAmount,
}: OnlinePaymentCardProps) {
  const [paymentData, setPaymentData] = useState<{
    upiUrl: string;
    qrCodeUrl: string;
    payLink: string;
  } | null>(null);

  useEffect(() => {
    getInvoicePaymentLinkAction(invoiceId, amount, customerName).then((res) => {
      if (res.success && res.upiUrl && res.qrCodeUrl && res.payLink) {
        setPaymentData({
          upiUrl: res.upiUrl,
          qrCodeUrl: res.qrCodeUrl,
          payLink: res.payLink,
        });
      }
    });
  }, [invoiceId, amount, customerName]);

  const upperStatus = status.toUpperCase().replace("_", " ");
  const isPaid = upperStatus === "PAID";
  
  const computedTotal = totalAmount ?? amount;
  const computedPaid = paidAmount ?? (isPaid ? computedTotal : 0);
  const computedRemaining = Math.max(0, computedTotal - computedPaid);

  // Status timeline steps
  const steps = ["DRAFT", "SENT", "PARTIALLY PAID", "PAID"];
  const getCurrentStepIndex = () => {
    if (upperStatus === "PAID") return 3;
    if (upperStatus === "PARTIALLY PAID") return 2;
    if (upperStatus === "SENT" || upperStatus === "UNPAID" || upperStatus === "ISSUED") return 1;
    return 0; // DRAFT
  };
  const activeIndex = getCurrentStepIndex();

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-2xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
          <QrCode className="size-4 text-emerald-600" />
          <span>Online Customer Payment Portal</span>
        </h4>
        <Badge
          className={
            isPaid
              ? "bg-emerald-600 text-white font-mono text-[10px]"
              : "bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono text-[10px]"
          }
        >
          {isPaid ? "PAYMENT RECEIVED" : "READY FOR PAYMENT"}
        </Badge>
      </div>

      {/* Invoice Status Timeline */}
      <div className="py-1">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-muted-foreground mb-1.5">
          {steps.map((step, idx) => (
            <span
              key={step}
              className={
                idx <= activeIndex
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "text-muted-foreground/60"
              }
            >
              {step}
            </span>
          ))}
        </div>
        <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Remaining Balance Breakdown */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-center font-mono text-xs">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-sans font-medium">Total</div>
          <div className="font-bold text-foreground">₹ {computedTotal.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-sans font-medium">Paid</div>
          <div className="font-bold text-emerald-600">₹ {computedPaid.toLocaleString("en-IN")}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase font-sans font-medium">Remaining</div>
          <div className="font-bold text-amber-600">₹ {computedRemaining.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {!isPaid && paymentData ? (
        <div className="grid sm:grid-cols-2 gap-4 items-center pt-1">
          {/* QR Code */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-white border shadow-xs">
            <img
              src={paymentData.qrCodeUrl}
              alt="Invoice UPI Payment QR"
              className="size-32 object-contain"
            />
            <span className="text-[10px] font-bold text-slate-800 mt-1">
              Scan to Pay ₹ {computedRemaining > 0 ? computedRemaining.toLocaleString("en-IN") : amount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Details & Actions */}
          <div className="space-y-2.5 text-xs">
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Share the instant payment portal link with <strong>{customerName}</strong> for automated reconciliation via UPI or Razorpay.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const fullUrl = `${window.location.origin}${paymentData.payLink}?amount=${computedRemaining > 0 ? computedRemaining : amount}&name=${encodeURIComponent(
                    customerName
                  )}`;
                  navigator.clipboard.writeText(fullUrl);
                  toast.success("Payment portal link copied to clipboard!");
                }}
                className="h-8 text-xs font-semibold gap-1.5 justify-start"
              >
                <Copy className="size-3.5 text-emerald-600" />
                <span>Copy Payment Link</span>
              </Button>

              <a
                href={`${paymentData.payLink}?amount=${computedRemaining > 0 ? computedRemaining : amount}&name=${encodeURIComponent(customerName)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
              >
                <span>Open Payment Portal</span>
                <ExternalLink className="size-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1">
              <ShieldCheck className="size-3 text-emerald-600" />
              <span>Instant Bank Confirmation & Auto-Receipt</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold flex items-center justify-between">
          <span>Payment of ₹ {computedPaid.toLocaleString("en-IN")} was received and verified!</span>
          <span className="font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
            SETTLED
          </span>
        </div>
      )}
    </div>
  );
}
