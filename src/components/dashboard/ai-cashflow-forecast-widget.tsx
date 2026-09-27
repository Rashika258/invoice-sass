"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  DollarSign,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { predict30DayCashflow } from "@/lib/ai-forecasting";
import { formatCurrency } from "@/lib/invoice-utils";

export function AiCashflowForecastWidget({
  sales = [],
  expenses = [],
  currency = "INR",
}: {
  sales: any[];
  expenses: any[];
  currency?: string;
}) {
  const forecast = useMemo(() => {
    const pendingInvoices = sales
      .filter((s) => s.status !== "CANCELLED" && s.paidAmount < s.total)
      .map((s) => ({
        amount: s.total,
        paidAmount: s.paidAmount || 0,
        dueDate: new Date(s.dueDate || s.issueDate),
      }));

    const expenseItems = expenses.map((e) => ({
      amount: e.amount + (e.taxAmount || 0),
    }));

    return predict30DayCashflow(pendingInvoices, expenseItems, 0.88);
  }, [sales, expenses]);

  const isPositive = forecast.netProjectedCashflow >= 0;

  return (
    <Card className="rounded-2xl border border-indigo-500/25 bg-linear-to-br from-card via-card to-indigo-500/5 shadow-xs overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-border/40 bg-card/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 text-white shadow-xs">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold text-foreground">
                  30-Day AI Cashflow Forecast
                </CardTitle>
                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] font-bold">
                  HEURISTIC ML
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Predictive receivables collection realization &amp; operating cash runway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-auto">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium text-[11px]">
              {forecast.receivablesConfidence}% Realization Confidence
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Projected Inflow */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Projected Inflow
              </span>
              <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700 dark:text-emerald-400">
                Next 30 Days
              </Badge>
            </div>
            <div className="text-lg font-bold font-mono text-foreground pt-0.5">
              {formatCurrency(forecast.projectedInflow30Days, currency)}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Based on overdue and pending customer dues
            </p>
          </div>

          {/* Projected Outflow */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="size-3.5 text-amber-500" />
                Projected Outflow
              </span>
              <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700 dark:text-amber-400">
                Operating Run
              </Badge>
            </div>
            <div className="text-lg font-bold font-mono text-foreground pt-0.5">
              {formatCurrency(forecast.projectedOutflow30Days, currency)}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Recurring bills, vendor dues &amp; expenses
            </p>
          </div>

          {/* Net Projected Position */}
          <div
            className={`p-3.5 rounded-xl border space-y-1 ${
              isPositive
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-rose-500/30 bg-rose-500/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[11px] font-bold flex items-center gap-1 ${
                  isPositive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                Net Cash Outlook
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Range: {formatCurrency(forecast.forecastRange.min, currency)}
              </span>
            </div>
            <div
              className={`text-lg font-bold font-mono pt-0.5 ${
                isPositive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}
            >
              {forecast.netProjectedCashflow >= 0 ? "+" : ""}
              {formatCurrency(forecast.netProjectedCashflow, currency)}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {isPositive
                ? "Safe working capital runway projected"
                : "Cash deficit risk — expedite receivables collection"}
            </p>
          </div>
        </div>

        {/* Action Link Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
          <span className="text-[11px] text-muted-foreground">
            {forecast.projectedInflow30Days > 0
              ? "Tip: Sending payment reminders 3 days before invoice due date boosts collection rate by 24%."
              : "Generate and send more customer invoices to populate your AI cashflow model."}
          </span>
          <Link
            href="/cash-bank"
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Open Cash &amp; Bank Ledgers</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
