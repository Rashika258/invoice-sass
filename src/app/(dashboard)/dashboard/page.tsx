import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  DollarSign,
  Package,
  Plus,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { RecentTransactionsTabs } from "@/components/dashboard/recent-transactions-tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, profile] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency || "INR";

  // Calculate total stock valuation
  const totalStockValue = summary.items.reduce(
    (sum, item) => sum + item.stockQty * (item.purchasePrice || item.unitPrice),
    0,
  );

  const netGst = summary.gstOutward.totalTax - summary.gstInward.totalTax;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-card border border-border/60 p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Business Overview</h1>
            <Badge variant="outline" className="border-border/70 bg-muted/40 text-foreground font-medium text-[11px] px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
              Live Workspace
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time billing, inventory valuation, receivables, and GST summary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/invoices/new"
            className="inline-flex items-center justify-center bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-medium shadow-xs h-8 px-3.5 gap-1.5 rounded-lg text-xs transition-all active:scale-[0.98] select-none"
          >
            <Plus className="size-3.5" />
            <span>Add Sale</span>
            <span className="hidden sm:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F8
            </span>
          </Link>

          <Link
            href="/purchases/new"
            className="inline-flex items-center justify-center bg-[#1976D2] hover:bg-[#1565c0] text-white font-medium shadow-xs h-8 px-3.5 gap-1.5 rounded-lg text-xs transition-all active:scale-[0.98] select-none"
          >
            <ShoppingBag className="size-3.5" />
            <span>Add Purchase</span>
            <span className="hidden sm:inline-block ml-0.5 rounded bg-black/25 px-1 py-0.2 text-[9px] font-mono">
              F9
            </span>
          </Link>

          <Link
            href="/expenses"
            className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted h-8 px-3 gap-1.5 text-xs font-medium text-foreground transition-all select-none"
          >
            <Banknote className="size-3.5 text-orange-600" />
            <span>Add Expense</span>
          </Link>

          <Link
            href="/payments"
            className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted h-8 px-3 gap-1.5 text-xs font-medium text-foreground transition-all select-none"
          >
            <Wallet className="size-3.5 text-emerald-600" />
            <span>Payment In/Out</span>
          </Link>
        </div>
      </div>

      {/* Vyapar 8 Core KPI Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sale */}
        <Link href="/invoices" className="group">
          <Card className="h-full border-border/60 border-l-4 border-l-[#D32F2F] transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Sales
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#D32F2F]/10 text-[#D32F2F]">
                  <TrendingUp className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground group-hover:text-[#D32F2F] transition-colors">
                {formatCurrency(summary.saleTotal, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {summary.sales.length} Sale invoices
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Total Purchase */}
        <Link href="/purchases" className="group">
          <Card className="h-full border-border/60 border-l-4 border-l-[#1976D2] transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total Purchases
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#1976D2]/10 text-[#1976D2]">
                  <ShoppingBag className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground group-hover:text-[#1976D2] transition-colors">
                {formatCurrency(summary.purchaseTotal, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {summary.purchases.length} Purchase bills
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* You'll Get (To Collect) - Green Accent */}
        <Link href="/customers" className="group">
          <Card className="h-full border-border/60 border-l-4 border-l-emerald-600 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06] transition-all hover:border-emerald-500/40 hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  You&apos;ll Get (To Collect)
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-400">
                  <ArrowDownLeft className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(summary.toCollect, currency)}
              </p>
              <p className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Pending customer receivables
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* You'll Pay (To Pay) - Red Accent */}
        <Link href="/purchases" className="group">
          <Card className="h-full border-border/60 border-l-4 border-l-rose-600 bg-rose-500/[0.03] dark:bg-rose-500/[0.06] transition-all hover:border-rose-500/40 hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  You&apos;ll Pay (To Pay)
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose-600/15 text-rose-700 dark:text-rose-400">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-rose-700 dark:text-rose-400">
                {formatCurrency(summary.toPay, currency)}
              </p>
              <p className="mt-1 text-[11px] text-rose-700/80 dark:text-rose-400/80">
                Pending supplier payables
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Cash in Hand */}
        <Link href="/cash-bank" className="group">
          <Card className="h-full border-border/60 transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Cash in Hand
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Banknote className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(summary.cashInHand, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Cash drawer balance</p>
            </CardContent>
          </Card>
        </Link>

        {/* Bank Balance */}
        <Link href="/cash-bank" className="group">
          <Card className="h-full border-border/60 transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Bank Accounts
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Wallet className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(summary.bankBalance, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {summary.cashBank.filter((a) => a.accountType === "BANK").length} Linked accounts
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Total Stock Valuation */}
        <Link href="/items" className="group">
          <Card className="h-full border-border/60 transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Stock Value
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Package className="size-3.5" />
                </span>
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums text-foreground">
                {formatCurrency(totalStockValue, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {summary.items.length} Total items in catalog
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Net Profit */}
        <Link href="/reports" className="group">
          <Card className="h-full border-border/60 border-l-4 border-l-emerald-600 transition-all hover:border-border hover:shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Net Profit / Loss
                </span>
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="size-3.5" />
                </span>
              </div>
              <p className={`mt-2 text-xl font-semibold tracking-tight tabular-nums ${summary.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatCurrency(summary.profit, currency)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Sales - Purchases - Expenses
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Low Stock Warning Banner (Vyapar standard) */}
      {summary.lowStock.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                {summary.lowStock.length} Items Running Low on Stock
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                {summary.lowStock
                  .slice(0, 3)
                  .map((i) => `${i.name} (${i.stockQty} ${i.unit || "units"})`)
                  .join(", ")}
                {summary.lowStock.length > 3 ? ` and ${summary.lowStock.length - 3} more...` : ""}
              </p>
            </div>
          </div>
          <Link
            href="/items"
            className="inline-flex self-start sm:self-auto items-center justify-center rounded-md border border-amber-500/30 bg-background text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 h-7 px-2.5 text-xs font-medium shadow-xs"
          >
            Manage Inventory
          </Link>
        </div>
      )}

      {/* GST & Cash Flow Summary Strip */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ArrowDownLeft className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Payment In (Receipts)</p>
            <p className="text-lg font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(summary.paymentIn, currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <ArrowUpRight className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Payment Out (Disbursed)</p>
            <p className="text-lg font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(summary.paymentOut, currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Receipt className="size-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Net GST Payable (Out - In)</p>
            <p className="text-lg font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(netGst, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions Card with Tabs */}
      <Card className="rounded-xl border border-border/60 shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">Recent Transactions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sale bills, purchase bills, and recorded business expenses.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2">
          <RecentTransactionsTabs
            sales={summary.sales as any}
            purchases={summary.purchases as any}
            expenses={summary.expenses}
            currency={currency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
