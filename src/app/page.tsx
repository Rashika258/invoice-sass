import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Package,
  QrCode,
  Receipt,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

const OS_MODULES = [
  {
    icon: FileText,
    title: "1. Sales & Revenue Engine",
    text: "Tax-compliant GST invoices, estimates, proforma, sale orders, delivery challans, credit notes & instant UPI QR scan-to-pay.",
    badge: "SELL",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    icon: ShoppingBag,
    title: "2. Purchases & Procurement",
    text: "Vendor purchase bills, purchase orders, debit notes, vendor ledgers, and procurement cost analytics.",
    badge: "BUY",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  {
    icon: Package,
    title: "3. Inventory & Warehouse OS",
    text: "Real-time stock tracking, low stock alerts, batch & expiry monitoring, barcode scanning, and multi-godown valuation.",
    badge: "STOCK",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    icon: Scale,
    title: "4. Inbuilt Accounting Engine",
    text: "Tally-style double-entry bookkeeping: F4–F9 Voucher Entry, Chart of Accounts, Day Book, Trial Balance, P&L, and Balance Sheet.",
    badge: "ACCOUNTING",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "5. GST & Compliance Hub",
    text: "One-click GSTR-1 & GSTR-3B summaries, HSN/SAC breakdowns, e-Way bills, and tax reconciliation for smooth CA handoffs.",
    badge: "TAX",
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  },
  {
    icon: Sparkles,
    title: "6. AI Business Brain & Autopilot",
    text: "Ask anything about your business in plain English. Automated WhatsApp payment reminders, cash forecasting, and reorder intelligence.",
    badge: "AI & AUTO",
    badgeColor: "bg-brand-light text-brand border-brand/20",
  },
];

export default async function LandingPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-foreground text-background font-black text-lg shadow-xs">
              B
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-foreground">Billora</span>
                <span className="rounded-md bg-brand-light px-1.5 py-0.2 text-[9px] font-bold text-brand border border-brand/20">
                  BUSINESS OS
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Business Operating System for Indian SMBs
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              Item Catalog
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 bg-brand hover:opacity-90 text-white font-bold text-xs shadow-xs transition-opacity select-none"
            >
              Launch Business OS
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="absolute left-1/2 top-8 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-light px-3.5 py-1 text-xs font-bold text-brand">
                <BadgeIndianRupee className="size-3.5 text-brand" /> Billora — Business OS for Indian SMBs
              </div>
              <h1 className="text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                One OS to Run Your Entire Business.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Stop juggling separate software for billing, inventory, Tally, attendance, and GST. Billora unifies sales, purchases, stock, double-entry accounting, payroll, and AI business intelligence into a single operating system.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-3 bg-brand hover:opacity-90 text-white font-bold shadow-xs text-sm transition-all active:scale-[0.98]"
                >
                  Start Running on Billora <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-border/80 bg-background hover:bg-muted px-5 py-3 font-semibold text-sm transition-all"
                >
                  Open Business Desk
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                {[
                  "Sales, GST & E-Way Bills",
                  "Inbuilt Tally-Style Accounting",
                  "Live Inventory & Low Stock Alerts",
                  "Business AI & Autopilot",
                ].map((label) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-brand" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Business OS Snapshot Mockup */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-xl sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-sky-500 to-violet-500" />
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black tracking-tight text-foreground">Billora Business OS</span>
                    <Badge variant="outline" className="text-[10px] font-bold border-brand/30 text-brand bg-brand-light px-1.5 py-0">
                      LIVE
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sri Manjunatha Engineering Works</p>
                </div>
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center justify-center rounded-lg h-7 px-2.5 text-xs bg-brand hover:opacity-90 text-white font-bold shadow-xs"
                >
                  + Add Sale (F8)
                </Link>
              </div>

              {/* Snapshot KPI Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brand-light border border-brand/20 p-3">
                  <p className="text-[10px] font-bold text-brand uppercase tracking-wider">Today&apos;s Revenue</p>
                  <p className="mt-1 text-lg font-black tracking-tight tabular-nums text-foreground">₹ 48,250</p>
                  <p className="mt-0.5 text-[10px] text-brand font-medium">↑ 12 bills issued</p>
                </div>

                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Receivables to Collect</p>
                  <p className="mt-1 text-lg font-black tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">₹ 1,18,400</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">From 8 customers</p>
                </div>

                <div className="rounded-xl bg-muted/40 border border-border/60 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Valuation</p>
                  <p className="mt-1 text-lg font-black tracking-tight tabular-nums text-foreground">₹ 3,45,200</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">128 items in catalog</p>
                </div>

                <div className="rounded-xl bg-purple-500/5 border border-purple-500/20 p-3">
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Tally Ledger Status</p>
                  <p className="mt-1 text-lg font-black tracking-tight tabular-nums text-foreground">₹ 64,800</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">Double-entry balanced ✓</p>
                </div>
              </div>

              {/* Sample Bill Item strip */}
              <div className="mt-3.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
                <div className="flex items-center justify-between font-medium pb-1.5 border-b border-border/60 text-[11px] text-muted-foreground">
                  <span>Recent Sale Bill</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PAID (UPI QR)</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">M/s. Rajasthan Enterprises</p>
                    <p className="text-[10px] text-muted-foreground">INV-2026-0048 · Industrial Bush 40mm</p>
                  </div>
                  <span className="font-bold font-mono text-sm tabular-nums">₹ 14,350.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business OS Pillars Section */}
        <section className="border-y border-border/60 bg-muted/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-black uppercase tracking-wider text-brand">The Architecture That Wins</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                6 Integrated Pillars of the Billora Business OS.
              </h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Not a fragmented collection of disjointed apps. Every transaction connects to your inventory, ledger accounts, tax returns, and AI insights automatically.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {OS_MODULES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-border/60 bg-card transition-all hover:border-brand/40 hover:shadow-xs rounded-2xl">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-light text-brand">
                          <Icon className="size-4" />
                        </span>
                        <Badge variant="outline" className={`text-[9px] font-mono font-bold ${feature.badgeColor}`}>
                          {feature.badge}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-sm tracking-tight text-foreground">{feature.title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">{feature.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-foreground text-background font-bold text-xs">
              B
            </span>
            <p>© {new Date().getFullYear()} Billora — Business OS for Indian SMBs. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/products" className="hover:text-foreground">Catalog</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
            <Link href="/register" className="hover:text-foreground">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
