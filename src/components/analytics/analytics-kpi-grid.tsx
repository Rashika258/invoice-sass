"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  DollarSign,
  FileCheck,
  Percent,
  Receipt,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";

export function AnalyticsKpiGrid({
  kpis,
  currency = "INR",
}: {
  kpis: AnalyticsSummary["kpis"];
  currency?: string;
}) {
  const isPositiveGrowth = kpis.salesGrowthPct >= 0;

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
      {/* 1. Total Sales */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Sales
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatCurrency(kpis.totalSales, currency)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold">
            {kpis.totalSales === 0 ? (
              <span className="text-muted-foreground font-normal text-[10px]">No sales recorded</span>
            ) : isPositiveGrowth ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <ArrowUpRight className="size-3 mr-0.5" />+{kpis.salesGrowthPct}%
                </span>
                <span className="text-muted-foreground text-[10px] font-normal">vs prev period</span>
              </>
            ) : (
              <>
                <span className="text-rose-600 dark:text-rose-400 flex items-center">
                  <ArrowDownRight className="size-3 mr-0.5" />{kpis.salesGrowthPct}%
                </span>
                <span className="text-muted-foreground text-[10px] font-normal">vs prev period</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Net Profit */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Net Profit
          </span>
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <DollarSign className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatCurrency(kpis.netProfit, currency)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Percent className="size-3 text-primary" />
            <span className="font-semibold text-foreground">{kpis.profitMarginPct}%</span> net margin
          </p>
        </div>
      </div>

      {/* 3. Operating Expenses */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Expenses
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Banknote className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatCurrency(kpis.totalExpenses, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Daily overheads &amp; bills</p>
        </div>
      </div>

      {/* 4. Receivables */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Receivables
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Wallet className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono text-blue-600 dark:text-blue-400">
            {formatCurrency(kpis.receivables, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Pending customer credit</p>
        </div>
      </div>

      {/* 5. Payables */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Payables
          </span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Scale className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono text-rose-600 dark:text-rose-400">
            {formatCurrency(kpis.payables, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Due to suppliers</p>
        </div>
      </div>

      {/* 6. Avg Order Value */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Avg Order Value
          </span>
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Receipt className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatCurrency(kpis.averageOrderValue, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Across {kpis.totalInvoicesCount} invoices</p>
        </div>
      </div>

      {/* 7. Net GST Payable */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Net GST Liability
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FileCheck className="size-4" />
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatCurrency(kpis.netGstPayable, currency)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Output ₹{kpis.outputGst.toLocaleString("en-IN")} &minus; Input ITC</p>
        </div>
      </div>
    </div>
  );
}
