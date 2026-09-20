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
}

export function OnlinePaymentCard({
  invoiceId,
  amount,
  customerName,
  status,
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

  const isPaid = status.toUpperCase() === "PAID";

  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs select-none">
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
              Scan to Pay ₹ {amount.toLocaleString("en-IN")}
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
                  const fullUrl = `${window.location.origin}${paymentData.payLink}?amount=${amount}&name=${encodeURIComponent(
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
                href={`${paymentData.payLink}?amount=${amount}&name=${encodeURIComponent(customerName)}`}
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
          <span>Payment of ₹ {amount.toLocaleString("en-IN")} was received and verified!</span>
          <span className="font-mono text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">
            SETTLED
          </span>
        </div>
      )}
    </div>
  );
}
