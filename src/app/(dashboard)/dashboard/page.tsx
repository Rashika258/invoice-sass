import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { QuickCreateDropdown } from "@/components/dashboard/quick-create-dropdown";
import { RecentTransactionsTabs } from "@/components/dashboard/recent-transactions-tabs";
import { SalesAnalyticsChart } from "@/components/dashboard/sales-analytics-chart";
import { AiBusinessAssistant } from "@/components/dashboard/ai-business-assistant";
import { TodaysTasksWidget } from "@/components/dashboard/todays-tasks-widget";
import { ContinueWhereWidget } from "@/components/common/continue-where-widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, profile] = await Promise.all([
    getBusinessSummary(),
    getCompanyProfile(),
  ]);
  const currency = profile?.currency || "INR";

  return (
    <div className="space-y-6">
      {/* Top Header: Title, Subtitle, and Quick Create Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground">
            Business performance, real-time turnover &amp; staff operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <QuickCreateDropdown />
        </div>
      </div>

      {/* 4 shadcn Metric / KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <DollarSign className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {formatCurrency(summary.saleTotal, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <TrendingUp className="size-3" />
                +12.5%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Receivable */}
        <Link href="/customers" className="block group">
          <Card className="shadow-xs transition-colors group-hover:border-foreground/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Receivable
              </CardTitle>
              <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                <ArrowDownRight className="size-4 text-emerald-600 dark:text-emerald-400" />
              </span>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.toCollect, currency)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-rose-500 font-semibold">
                  <TrendingDown className="size-3" />
                  -20%
                </span>
                <span>pending customer dues</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 3: Total Payable */}
        <Link href="/purchases" className="block group">
          <Card className="shadow-xs transition-colors group-hover:border-foreground/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Payable
              </CardTitle>
              <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                <ArrowUpRight className="size-4 text-amber-500" />
              </span>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {formatCurrency(summary.toPay, currency)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                  <TrendingUp className="size-3" />
                  +12.5%
                </span>
                <span>scheduled supplier bills</span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Card 4: Growth Rate / Net Margin */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Net Margin
            </CardTitle>
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
              {formatCurrency(summary.profit, currency)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                +4.5%
              </span>
              <span>steady net margin</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Where You Left Off Shortcut Widget */}
      <ContinueWhereWidget />

      {/* Today's Tasks & Quick Action Bar */}
      <TodaysTasksWidget
        overdueCount={summary.sales.filter((s: any) => s.status === "OVERDUE").length}
        overdueTotal={summary.sales
          .filter((s: any) => s.status === "OVERDUE")
          .reduce((sum: number, s: any) => sum + (s.total - s.paidAmount), 0)}
        lowStockCount={summary.items.filter((i: any) => i.itemType === "PRODUCT" && i.stockQty <= (i.minStock || 5)).length}
        pendingPaymentCount={summary.sales.filter((s: any) => s.status === "SENT" || s.paidAmount < s.total).length}
        currency={currency}
      />

      {/* AI Business Assistant: "Ask Your Business" NLP Layer */}
      <AiBusinessAssistant />

      {/* Main Revenue & Purchase Overview Chart */}
      <SalesAnalyticsChart
        sales={summary.sales as any}
        purchases={summary.purchases as any}
        currency={currency}
      />

      {/* Bottom Grid: Left = Quick Reports + Transactions, Right = Staff & Overtime, Cash & Bank */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Most Used Reports Navigation */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-semibold">Essential Reports</CardTitle>
                <CardDescription className="text-xs">Quick access to audit and tax ledgers</CardDescription>
              </div>
              <Link
                href="/reports"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-medium h-7")}
              >
                View All &rarr;
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/reports"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
                >
                  <span>Sale Report</span>
                  <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/invoices"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
                >
                  <span>All Invoices</span>
                  <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/reports"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
                >
                  <span>Daybook Report</span>
                  <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  href="/customers"
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-all group"
                >
                  <span>Party Statement</span>
                  <ChevronRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions List */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
                <CardDescription className="text-xs">Latest sale bills, purchase orders and expenses</CardDescription>
              </div>
              <Link
                href="/invoices"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-medium h-7")}
              >
                All Bills &rarr;
              </Link>
            </CardHeader>
            <CardContent>
              <RecentTransactionsTabs
                sales={summary.sales as any}
                purchases={summary.purchases as any}
                expenses={summary.expenses}
                currency={currency}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Staff Attendance & 8h Shift Overtime Card */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                    <CalendarClock className="size-4" />
                  </span>
                  <CardTitle className="text-sm font-semibold">
                    Staff &amp; Overtime
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono font-medium">
                  8h Shift Base
                </Badge>
              </div>
              <CardDescription className="text-xs pt-1 leading-relaxed">
                Standard shift is 8 hours. Any work beyond 8 hours is calculated as OT for each 1 hour worked.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/attendance"
                className={cn(buttonVariants(), "w-full text-xs h-8")}
              >
                Log Today&apos;s Attendance
              </Link>
              <Link
                href="/attendance"
                className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs h-8")}
              >
                Generate Monthly Payslips
              </Link>
            </CardContent>
          </Card>

          {/* Cash & Bank Balances */}
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                  <Wallet className="size-4 text-emerald-600 dark:text-emerald-400" />
                </span>
                <CardTitle className="text-sm font-semibold">Cash &amp; Bank</CardTitle>
              </div>
              <Link
                href="/cash-bank"
                className="text-xs font-medium text-foreground hover:underline"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                <span className="text-xs text-muted-foreground">Cash in Hand</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {formatCurrency(summary.cashInHand, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                <span className="text-xs text-muted-foreground">Bank Balance</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {formatCurrency(summary.bankBalance, currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Hardware & Stock Management */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
                  <Package className="size-4" />
                </span>
                <CardTitle className="text-sm font-semibold">Hardware &amp; Inventory</CardTitle>
              </div>
              <CardDescription className="text-xs pt-1">
                64 hardware items imported &amp; ready for instant billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link
                href="/items"
                className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs h-8 justify-between")}
              >
                <span>Browse Products &amp; Prices</span>
                <ChevronRight className="size-3 text-muted-foreground" />
              </Link>
              <Link
                href="/utilities/barcode-generator"
                className={cn(buttonVariants({ variant: "ghost" }), "w-full text-xs h-8 justify-between")}
              >
                <span>Generate Product Barcodes</span>
                <ChevronRight className="size-3 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
