import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Package,
  QrCode,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

const highlights = [
  {
    icon: FileText,
    title: "GST Invoicing & Billing",
    text: "Generate tax-compliant GST bills with CGST, SGST, IGST, HSN codes, and e-way bill numbers in seconds.",
  },
  {
    icon: Package,
    title: "Real-Time Stock & Inventory",
    text: "Track stock quantities, low stock warning alerts, item categories, and inventory valuation automatically.",
  },
  {
    icon: QrCode,
    title: "UPI QR Payments",
    text: "Print dynamic UPI Scan & Pay QR codes on invoices for instant collection via Google Pay, PhonePe & Paytm.",
  },
  {
    icon: BarChart3,
    title: "Business & GST Reports",
    text: "GSTR-1, GSTR-3B summaries, Day Book, Bill-wise profit & loss, and party statement ledgers at one click.",
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
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#D32F2F] text-white font-black text-lg shadow-sm">
              V
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-foreground">Vyapar</span>
                <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-600">
                  GST READY
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                Billing & Inventory Software
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
              className="inline-flex items-center justify-center rounded-lg px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs shadow-xs transition-colors select-none"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="absolute left-1/2 top-8 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-[#D32F2F]/10 blur-3xl" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
                <BadgeIndianRupee className="size-3.5 text-[#D32F2F]" /> India&apos;s Preferred Billing App for MSMEs
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                Smart GST Billing &amp; Inventory for Growing Businesses.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                Create GST invoices in seconds, collect payments with UPI QR codes, track customer receivables, and maintain inventory balance effortlessly.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-medium shadow-xs text-sm transition-all active:scale-[0.98]"
                >
                  Create Your First Bill <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-background hover:bg-muted px-5 py-2.5 font-medium text-sm transition-all"
                >
                  Open Billing Desk
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
                {[
                  "GST Tax Invoices & E-way bills",
                  "Live Stock & Low Stock Alerts",
                  "Instant UPI QR Scan to Pay",
                  "WhatsApp Bill Sharing",
                ].map((label) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Dashboard Snapshot Mockup */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-lg sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#D32F2F] via-[#1976D2] to-emerald-500" />
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-foreground">Vyapar Desk</span>
                    <Badge variant="outline" className="text-[10px] font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0">
                      LIVE
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Sharma Traders &amp; Distributors</p>
                </div>
                <Link
                  href="/invoices/new"
                  className="inline-flex items-center justify-center rounded-md h-7 px-2.5 text-xs bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-medium shadow-xs"
                >
                  + Add Sale
                </Link>
              </div>

              {/* Snapshot KPI Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#D32F2F]/5 border border-[#D32F2F]/20 p-3">
                  <p className="text-[10px] font-semibold text-[#D32F2F] uppercase tracking-wider">Today&apos;s Sales</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-foreground">₹ 48,250</p>
                  <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">↑ 12 bills issued</p>
                </div>

                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3">
                  <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">You&apos;ll Get (Receivable)</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400">₹ 1,18,400</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">From 8 customers</p>
                </div>

                <div className="rounded-lg bg-muted/40 border border-border/60 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Stock Valuation</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-foreground">₹ 3,45,200</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">128 items in catalog</p>
                </div>

                <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
                  <p className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Cash &amp; Bank</p>
                  <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-foreground">₹ 64,800</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">All accounts synced</p>
                </div>
              </div>

              {/* Sample Bill Item strip */}
              <div className="mt-3.5 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
                <div className="flex items-center justify-between font-medium pb-1.5 border-b border-border/60 text-[11px] text-muted-foreground">
                  <span>Recent Sale Bill</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">PAID (UPI)</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-xs">M/s. Rajasthan Enterprises</p>
                    <p className="text-[10px] text-muted-foreground">INV-2024-0482 · 3 Items</p>
                  </div>
                  <span className="font-semibold text-sm tabular-nums">₹ 14,350.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Section */}
        <section className="border-y border-border/60 bg-muted/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#D32F2F]">Built for Indian MSMEs</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Everything you need to manage your business ledger.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((feature) => (
                <Card key={feature.title} className="border-border/60 bg-card transition-all hover:border-border hover:shadow-xs">
                  <CardContent className="p-5">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-[#D32F2F]/10 text-[#D32F2F]">
                      <feature.icon className="size-4" />
                    </span>
                    <h3 className="mt-3.5 font-semibold text-sm tracking-tight">{feature.title}</h3>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{feature.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded bg-[#D32F2F] text-white font-bold text-xs">
              V
            </span>
            <p>© {new Date().getFullYear()} Vyapar Cloud Billing &amp; Inventory. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/products" className="hover:text-primary">Catalog</Link>
            <Link href="/login" className="hover:text-primary">Sign in</Link>
            <Link href="/register" className="hover:text-primary">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
