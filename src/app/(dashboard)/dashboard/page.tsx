import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Globe,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { getBusinessSummary } from "@/actions/reports";
import { getCompanyProfile } from "@/actions/settings";
import { QuickCreateDropdown } from "@/components/dashboard/quick-create-dropdown";
import { RecentTransactionsTabs } from "@/components/dashboard/recent-transactions-tabs";
import { VyaparSalesChart } from "@/components/dashboard/vyapar-sales-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      {/* Top Header Bar matching reference screenshot: Title on left, Quick Create on right */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time business performance, billing flow &amp; staff operations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <QuickCreateDropdown />
        </div>
      </div>

      {/* 4 Metric / KPI Cards matching reference screenshot:
          [ Total Revenue ] [ New Customers / Receivable ] [ Active Accounts / Payable ] [ Growth Rate ]
      */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Total Revenue
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              <TrendingUp className="size-3 text-emerald-400" />
              <span>+12.5%</span>
            </span>
          </div>

          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {formatCurrency(summary.saleTotal, currency)}
          </div>

          <div className="mt-4 space-y-0.5">
            <p className="flex items-center gap-1 text-xs font-medium text-zinc-200">
              <span>Trending up this month</span>
              <ArrowUpRight className="size-3 text-emerald-400" />
            </p>
            <p className="text-[11px] text-zinc-400">
              Net invoices issued for active billing period
            </p>
          </div>
        </div>

        {/* Card 2: Total Receivable (You'll Get) */}
        <Link href="/customers" className="block group">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs transition-all hover:border-zinc-700/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">
                Total Receivable
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                <TrendingDown className="size-3 text-rose-400" />
                <span>-20%</span>
              </span>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              {formatCurrency(summary.toCollect, currency)}
            </div>

            <div className="mt-4 space-y-0.5">
              <p className="flex items-center gap-1 text-xs font-medium text-zinc-200">
                <span>Pending collections</span>
                <ArrowDownRight className="size-3 text-rose-400" />
              </p>
              <p className="text-[11px] text-zinc-400">
                From customer accounts and open balances
              </p>
            </div>
          </div>
        </Link>

        {/* Card 3: Total Payable (You'll Give) */}
        <Link href="/purchases" className="block group">
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs transition-all hover:border-zinc-700/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">
                Total Payable
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                <TrendingUp className="size-3 text-amber-400" />
                <span>+12.5%</span>
              </span>
            </div>

            <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
              {formatCurrency(summary.toPay, currency)}
            </div>

            <div className="mt-4 space-y-0.5">
              <p className="flex items-center gap-1 text-xs font-medium text-zinc-200">
                <span>Vendor dues scheduled</span>
                <ArrowUpRight className="size-3 text-amber-400" />
              </p>
              <p className="text-[11px] text-zinc-400">
                Supplier bills pending settlement
              </p>
            </div>
          </div>
        </Link>

        {/* Card 4: Growth Rate / Net Profit */}
        <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs transition-all hover:border-zinc-700/80">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">
              Growth Rate
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700/60 bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300">
              <TrendingUp className="size-3 text-emerald-400" />
              <span>+4.5%</span>
            </span>
          </div>

          <div className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            4.5%
          </div>

          <div className="mt-4 space-y-0.5">
            <p className="flex items-center gap-1 text-xs font-medium text-zinc-200">
              <span>Steady performance increase</span>
              <ArrowUpRight className="size-3 text-emerald-400" />
            </p>
            <p className="text-[11px] text-zinc-400 truncate">
              Net margin: {formatCurrency(summary.profit, currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual-Wave Spline Chart Card matching reference screenshot */}
      <VyaparSalesChart
        sales={summary.sales as any}
        purchases={summary.purchases as any}
        currency={currency}
      />

      {/* Bottom Grid: Reports, Transactions, and Operations */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Left Column: Most Used Reports + Recent Transactions */}
        <div className="space-y-5">
          {/* Most Used Reports */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Most Used Reports
              </h2>
              <Link
                href="/reports"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/reports"
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/60 hover:bg-zinc-800/60 p-3.5 text-xs font-semibold text-zinc-200 transition-all group hover:border-zinc-700"
              >
                <span>Sale Report</span>
                <ChevronRight className="size-4 text-purple-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/invoices"
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/60 hover:bg-zinc-800/60 p-3.5 text-xs font-semibold text-zinc-200 transition-all group hover:border-zinc-700"
              >
                <span>All Invoices</span>
                <ChevronRight className="size-4 text-purple-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/reports"
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/60 hover:bg-zinc-800/60 p-3.5 text-xs font-semibold text-zinc-200 transition-all group hover:border-zinc-700"
              >
                <span>Daybook Report</span>
                <ChevronRight className="size-4 text-purple-400 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/customers"
                className="flex items-center justify-between rounded-xl border border-zinc-800/70 bg-zinc-950/60 hover:bg-zinc-800/60 p-3.5 text-xs font-semibold text-zinc-200 transition-all group hover:border-zinc-700"
              >
                <span>Party Statement</span>
                <ChevronRight className="size-4 text-purple-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                Recent Transactions
              </h2>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
              >
                View All Bills
              </Link>
            </div>
            <RecentTransactionsTabs
              sales={summary.sales as any}
              purchases={summary.purchases as any}
              expenses={summary.expenses}
              currency={currency}
            />
          </div>
        </div>

        {/* Right Column: Staff & Overtime, Cash & Bank, WhatsApp */}
        <div className="space-y-5">
          {/* Staff Attendance & 8h Shift Widget */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                  <CalendarClock className="size-4" />
                </span>
                <span className="text-xs font-bold text-white">
                  Staff &amp; Overtime
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-purple-400 rounded-md bg-purple-500/10 px-2 py-0.5 border border-purple-500/20">
                8h Shift Base
              </span>
            </div>
            <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
              Standard shift is 8 hours. Any work beyond 8 hours is calculated as OT for each 1 hour worked.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/attendance"
                className="inline-flex w-full items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 text-xs shadow-xs transition-all active:scale-[0.98]"
              >
                Log Today&apos;s Attendance
              </Link>
              <Link
                href="/attendance"
                className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300 font-semibold py-2 text-xs transition-colors"
              >
                Generate Monthly Payslips
              </Link>
            </div>
          </div>

          {/* Cash & Bank Balances */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Wallet className="size-4" />
                </span>
                <span className="text-xs font-bold text-white">Cash &amp; Bank</span>
              </div>
              <Link
                href="/cash-bank"
                className="text-[11px] font-semibold text-purple-400 hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="mt-3.5 space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3">
                <span className="text-xs text-zinc-400">Cash In Hand</span>
                <span className="font-mono text-xs font-bold text-white">
                  {formatCurrency(summary.cashInHand, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3">
                <span className="text-xs text-zinc-400">Bank Balance</span>
                <span className="font-mono text-xs font-bold text-white">
                  {formatCurrency(summary.bankBalance, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Connect Widget */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <MessageCircle className="size-4" />
                </span>
                <span className="text-xs font-bold text-white">WhatsApp Connect</span>
              </div>
              <Badge variant="outline" className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                ACTIVE
              </Badge>
            </div>
            <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
              Send PDF invoices and payment reminders to clients directly on WhatsApp in one click.
            </p>
            <Link
              href="/invoices"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold py-2 text-xs transition-colors border border-sky-500/20"
            >
              Share Invoices on WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
