"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfitLossData {
  journalIncome: number;
  journalExpenses: number;
  journalNetProfit: number;
  billingSalesTotal: number;
  billingPurchasesTotal: number;
  billingExpensesTotal: number;
  groupTotals: Record<string, number>;
}

interface ProfitLossViewProps {
  data: ProfitLossData;
  companyName: string;
  financialYear: string;
}

const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function ProfitLossView({ data, companyName, financialYear }: ProfitLossViewProps) {
  // Combine journal + billing data for a comprehensive view
  const totalIncome = data.billingSalesTotal + data.journalIncome;
  const totalExpenses = data.billingPurchasesTotal + data.billingExpensesTotal + data.journalExpenses;
  const grossProfit = data.billingSalesTotal - data.billingPurchasesTotal;
  const netProfit = totalIncome - totalExpenses;
  const isProfit = netProfit >= 0;

  const incomeRows = [
    { label: "Sales (Invoices)", amount: data.billingSalesTotal, note: "From billing module" },
    ...(data.journalIncome > 0 ? [{ label: "Other Income (Journal)", amount: data.journalIncome, note: "From manual vouchers" }] : []),
  ];

  const expenseRows = [
    { label: "Purchases (Bills)", amount: data.billingPurchasesTotal, note: "From billing module" },
    { label: "Direct Expenses", amount: data.billingExpensesTotal, note: "From expenses module" },
    ...(data.journalExpenses > 0 ? [{ label: "Other Expenses (Journal)", amount: data.journalExpenses, note: "From manual vouchers" }] : []),
  ];

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="size-5 text-brand" />
          Profit &amp; Loss Account
          <Badge className={`border-none font-bold ${isProfit ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
            {isProfit ? "Profit" : "Loss"}
          </Badge>
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{companyName} · FY {financialYear}</p>
      </div>

      {/* Traditional P&L layout — two columns like Tally */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Company header */}
        <div className="p-4 border-b border-border bg-muted/30 text-center space-y-0.5">
          <h3 className="text-sm font-black text-foreground">{companyName}</h3>
          <p className="text-xs text-muted-foreground font-semibold">Profit &amp; Loss Account</p>
          <p className="text-[11px] text-muted-foreground">For the period: 1st April — 31st March {financialYear.split("-")[1]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* LEFT: Expenses (Dr side) */}
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border/50 pb-1.5">
              Dr (Expenditure)
            </h4>
            <div className="space-y-2">
              {expenseRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-foreground">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground">{r.note}</div>
                  </div>
                  <span className="font-mono font-bold text-foreground">{fmt(r.amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-black text-foreground">Gross Profit c/d</div>
                  <div className="text-[10px] text-muted-foreground">{grossProfit >= 0 ? "Transferred to P&L" : "Gross Loss b/d"}</div>
                </div>
                <span className="font-mono font-black text-emerald-600">{fmt(Math.max(grossProfit, 0))}</span>
              </div>
            </div>
            <div className="pt-2 border-t-2 border-foreground flex items-center justify-between text-xs font-black">
              <span>Total</span>
              <span className="font-mono">{fmt(totalExpenses + Math.max(grossProfit, 0))}</span>
            </div>

            {/* Net result */}
            <div className={`mt-3 p-3 rounded-xl ${isProfit ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-rose-500/10 border border-rose-500/20"}`}>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-black">
                  {isProfit
                    ? <><TrendingUp className="size-3.5 text-emerald-600" /><span className="text-emerald-600">Net Profit</span></>
                    : <><TrendingDown className="size-3.5 text-rose-600" /><span className="text-rose-600">Net Loss</span></>
                  }
                </div>
                <span className={`font-mono font-black text-sm ${isProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  {fmt(netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Income (Cr side) */}
          <div className="p-5 space-y-3">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border/50 pb-1.5">
              Cr (Income)
            </h4>
            <div className="space-y-2">
              {incomeRows.map((r) => (
                <div key={r.label} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-foreground">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground">{r.note}</div>
                  </div>
                  <span className="font-mono font-bold text-foreground">{fmt(r.amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border/50">
              {grossProfit < 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-foreground">Gross Loss b/d</span>
                  <span className="font-mono font-black text-rose-600">{fmt(Math.abs(grossProfit))}</span>
                </div>
              )}
            </div>
            <div className="pt-2 border-t-2 border-foreground flex items-center justify-between text-xs font-black">
              <span>Total</span>
              <span className="font-mono">{fmt(totalIncome)}</span>
            </div>

            {/* Quick ratios */}
            <div className="mt-3 space-y-2 text-xs">
              {[
                { label: "Gross Profit Margin", value: data.billingSalesTotal > 0 ? `${((grossProfit / data.billingSalesTotal) * 100).toFixed(1)}%` : "N/A" },
                { label: "Net Profit Margin", value: totalIncome > 0 ? `${((netProfit / totalIncome) * 100).toFixed(1)}%` : "N/A" },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between text-muted-foreground">
                  <span>{r.label}</span>
                  <span className="font-mono font-bold text-foreground">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
