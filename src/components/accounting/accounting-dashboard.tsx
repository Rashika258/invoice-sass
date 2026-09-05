"use client";

import Link from "next/link";
import {
  BookOpen, FileText, CalendarDays, Scale, TrendingUp, BarChart3,
  Keyboard, Plus, ArrowRight, Clock, Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AccountingDashboardProps {
  stats: { voucherCount: number; ledgerCount: number; todayVouchers: number };
}

const GATEWAY_TILES = [
  {
    href: "/accounting/vouchers",
    icon: FileText,
    label: "Voucher Entry",
    desc: "Payment · Receipt · Journal · Contra · Sales · Purchase",
    keys: "F4–F9",
    color: "bg-brand-light text-brand",
    badge: "F4–F9",
  },
  {
    href: "/accounting/ledgers",
    icon: BookOpen,
    label: "Ledger Master",
    desc: "Chart of accounts — create & manage all ledger accounts",
    keys: null,
    color: "bg-amber-500/10 text-amber-500",
    badge: null,
  },
  {
    href: "/accounting/daybook",
    icon: CalendarDays,
    label: "Day Book",
    desc: "All posted entries for any selected date",
    keys: null,
    color: "bg-sky-500/10 text-sky-500",
    badge: null,
  },
  {
    href: "/accounting/trial-balance",
    icon: Scale,
    label: "Trial Balance",
    desc: "Dr / Cr closing balance for every ledger account",
    keys: null,
    color: "bg-violet-500/10 text-violet-500",
    badge: null,
  },
  {
    href: "/accounting/profit-loss",
    icon: TrendingUp,
    label: "Profit & Loss A/c",
    desc: "Income minus expenses — net profit / loss for the period",
    keys: null,
    color: "bg-emerald-500/10 text-emerald-500",
    badge: null,
  },
  {
    href: "/accounting/balance-sheet",
    icon: BarChart3,
    label: "Balance Sheet",
    desc: "Assets vs Liabilities — financial position of the business",
    keys: null,
    color: "bg-rose-500/10 text-rose-500",
    badge: null,
  },
];

const VOUCHER_SHORTCUTS = [
  { key: "F4", label: "Contra", desc: "Bank ↔ Cash transfers" },
  { key: "F5", label: "Payment", desc: "Money paid out" },
  { key: "F6", label: "Receipt", desc: "Money received" },
  { key: "F7", label: "Journal", desc: "Manual adjustments" },
  { key: "F8", label: "Sales", desc: "Sales voucher" },
  { key: "F9", label: "Purchase", desc: "Purchase voucher" },
];

export function AccountingDashboard({ stats }: AccountingDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Accounting
            </h1>
            <Badge className="bg-brand text-white border-none font-bold text-xs">
              Tally-Style
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Double-entry accounting engine of Billora Business OS: Ledger master, voucher entry, trial balance, P&amp;L, and balance sheet.
          </p>
        </div>
        <Link
          href="/accounting/vouchers"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all"
        >
          <Plus className="size-3.5" />
          New Voucher
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Vouchers", value: stats.voucherCount, icon: FileText, color: "text-brand" },
          { label: "Ledger Accounts", value: stats.ledgerCount, icon: BookOpen, color: "text-amber-500" },
          { label: "Today's Entries", value: stats.todayVouchers, icon: Clock, color: "text-sky-500" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-muted/50 ${s.color}`}>
                <Icon className="size-4" />
              </div>
              <div>
                <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gateway Tiles — like Tally's main menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GATEWAY_TILES.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group p-5 rounded-2xl border border-border bg-card hover:border-brand hover:shadow-sm transition-all flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${tile.color}`}>
                  <Icon className="size-5" />
                </div>
                {tile.badge && (
                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-brand border-brand/30 bg-brand-light">
                    {tile.badge}
                  </Badge>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                  {tile.label}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{tile.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-brand font-semibold">
                <span>Open</span>
                <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Keyboard className="size-4 text-brand" />
          Keyboard Shortcuts — Voucher Entry (like Tally)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {VOUCHER_SHORTCUTS.map((s) => (
            <div key={s.key} className="p-3 rounded-xl bg-muted/40 border border-border/60 text-center space-y-1">
              <div className="inline-flex items-center justify-center h-7 w-12 rounded-lg bg-foreground text-background text-xs font-black font-mono shadow-sm">
                {s.key}
              </div>
              <div className="text-xs font-bold text-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Press these keys <strong>inside the Voucher Entry screen</strong> to instantly switch voucher type. Works just like Tally Prime.
        </p>
      </div>
    </div>
  );
}
