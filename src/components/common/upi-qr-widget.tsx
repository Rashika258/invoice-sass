"use client";

import React from "react";
import { buildUpiPayUrl, generateQrCodeImageUrl } from "@/lib/dynamic-upi-qr";
import { Badge } from "@/components/ui/badge";
import { QrCode, Smartphone } from "lucide-react";

interface UpiQrWidgetProps {
  vpa?: string;
  payeeName?: string;
  amount: number;
  transactionRef: string;
  note?: string;
  className?: string;
}

export function UpiQrWidget({
  vpa = "billora@okaxis",
  payeeName = "Billora Business Store",
  amount,
  transactionRef,
  note,
  className = "",
}: UpiQrWidgetProps) {
  const upiUrl = buildUpiPayUrl({ vpa, payeeName, amount, transactionRef, note });
  const qrImageUrl = generateQrCodeImageUrl(upiUrl);

  return (
    <div className={`p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col items-center text-center space-y-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        <QrCode className="size-4 text-primary" />
        <span>Scan to Pay via UPI</span>
        <Badge variant="outline" className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
          INSTANT
        </Badge>
      </div>

      <div className="bg-white p-2 rounded-lg border border-border shadow-2xs">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt={`UPI QR Code for ${transactionRef}`}
          width={180}
          height={180}
          className="rounded object-contain"
        />
      </div>

      <div className="space-y-1">
        <p className="font-mono font-extrabold text-lg text-foreground">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
        <p className="text-[10px] text-muted-foreground font-mono">VPA: {vpa} | Ref: {transactionRef}</p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Badge variant="secondary" className="text-[9px] font-semibold flex items-center gap-1">
          <Smartphone className="size-3" />
          <span>GPay / PhonePe / Paytm / BHIM</span>
        </Badge>
      </div>
    </div>
  );
}
