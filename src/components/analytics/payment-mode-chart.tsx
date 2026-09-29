"use client";

import { CreditCard, Landmark, QrCode, Wallet, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";

const MODE_ICONS = {
  CASH: Wallet,
  UPI: QrCode,
  BANK: Landmark,
  CHEQUE: FileText,
  CARD: CreditCard,
};

const MODE_LABELS = {
  CASH: "Cash in Hand",
  UPI: "UPI / QR Code",
  BANK: "Bank Transfer (NEFT/RTGS)",
  CHEQUE: "Cheque Deposit",
  CARD: "Credit / Debit Card",
};

export function PaymentModeChart({
  payments = [],
  currency = "INR",
}: {
  payments: AnalyticsSummary["paymentModeBreakdown"];
  currency?: string;
}) {
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);
  const hasData = payments.length > 0 && totalAmount > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <QrCode className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Payment Method Breakdown
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              0 Collections
            </span>
          </div>

          <div className="my-4">
            <ChartEmptyState
              icon="payment"
              title="No Payment Collections Recorded"
              description="Record payments on your invoices via Cash, UPI, Card, or Bank transfer to visualize channel distribution."
              actionText="View Invoices"
              actionHref="/invoices"
              minHeight="min-h-[200px]"
            />
          </div>
        </div>
      </div>
    );
  }

  const displayPayments = payments;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <QrCode className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Payment Method Breakdown
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Collection Split
          </span>
        </div>

        <div className="mt-5 space-y-4">
          {displayPayments.map((item) => {
            const IconComponent = MODE_ICONS[item.mode] || Wallet;
            const label = MODE_LABELS[item.mode] || item.mode;

            return (
              <div key={item.mode} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <IconComponent className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">{label}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({item.count} txns)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(item.amount, currency)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground font-mono w-8 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    style={{ width: `${Math.max(item.percentage, 3)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.mode === "CASH"
                        ? "bg-amber-500"
                        : item.mode === "UPI"
                          ? "bg-emerald-500"
                          : item.mode === "BANK"
                            ? "bg-blue-500"
                            : "bg-violet-500"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span>Instant UPI &amp; Cash remain primary liquidity channels</span>
      </div>
    </div>
  );
}
