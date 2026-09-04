import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BarChart3,
  CheckCircle2,
  FileText,
  Package,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export const dynamic = "force-dynamic";

const highlights = [
  { icon: FileText, title: "GST billing", text: "Professional tax invoices in seconds." },
  { icon: Package, title: "Live inventory", text: "Keep stock, prices, and HSN in one place." },
  { icon: Wallet, title: "Payments", text: "Track every receivable and payable." },
  { icon: BarChart3, title: "Business reports", text: "See sales, cash, and profit at a glance." },
];

export default async function LandingPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <FileText className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">InvoiceFlow</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/products" />}>Products</Button>
            <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/login" />}>Sign in</Button>
            <Button className="rounded-xl px-4 shadow-lg shadow-primary/20" render={<Link href="/register" />}>Start free</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="absolute left-1/2 top-8 -z-10 size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                <BadgeIndianRupee className="size-4" /> Built for Indian businesses
              </div>
              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Run your entire business from one smart billing desk.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Create GST bills, manage inventory, collect payments, and understand your cash flow without juggling spreadsheets.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-xl px-6 shadow-xl shadow-primary/25" render={<Link href="/register" />}>
                  Create your first invoice <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl" render={<Link href="/products" />}>View product catalog</Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {["GST-ready invoices", "Stock tracking", "Cash & bank"].map((label) => <span key={label} className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" />{label}</span>)}
              </div>
            </div>

            <div className="app-surface relative overflow-hidden rounded-3xl p-5 sm:p-6">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary via-emerald-300 to-sky-400" />
              <div className="flex items-center justify-between border-b pb-5">
                <div><p className="text-sm text-muted-foreground">Business snapshot</p><h2 className="mt-1 text-lg font-bold">Today&apos;s overview</h2></div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">LIVE</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[['Sales', '₹ 24,860'], ['To collect', '₹ 8,420'], ['Stock value', '₹ 1.24L'], ['Cash in hand', '₹ 12,540']].map(([label, value], index) => <div key={label} className={`rounded-2xl p-4 ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted/70'}`}><p className={`text-xs ${index === 0 ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{label}</p><p className="mt-2 text-lg font-bold">{value}</p><p className={`mt-1 text-xs ${index === 0 ? 'text-primary-foreground/70' : 'text-primary'}`}>↑ Updated today</p></div>)}
              </div>
              <div className="mt-5 rounded-2xl border bg-background/60 p-4">
                <div className="mb-4 flex items-center justify-between"><p className="font-semibold">Recent activity</p><span className="text-xs text-muted-foreground">Last 7 days</span></div>
                <div className="flex h-20 items-end gap-2">{[42, 67, 48, 84, 58, 92, 76].map((height, index) => <span key={index} className="flex-1 rounded-t-md bg-primary/20" style={{ height: `${height}%` }}><span className="block h-2/3 rounded-t-md bg-primary" /></span>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-card/60 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-xl"><p className="text-sm font-bold uppercase tracking-widest text-primary">Everything connected</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Built for the daily rhythm of business.</h2></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{highlights.map((feature) => <Card key={feature.title} className="border-border/70 bg-background/60 transition-transform hover:-translate-y-1"><CardContent className="p-5"><span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><feature.icon className="size-5" /></span><h3 className="mt-5 font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.text}</p></CardContent></Card>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Catalog</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Featured products</h2></div><Button variant="outline" className="rounded-xl" render={<Link href="/products" />}>View all products</Button></div>
          {products.length === 0 ? <div className="app-surface rounded-2xl py-12 text-center text-muted-foreground">Products published by businesses will appear here.</div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.slice(0, 6).map((product) => <Card key={product.id} className="overflow-hidden border-border/70"><CardContent className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">{product.organization.profile?.companyName ?? 'Business'}</p><h3 className="mt-2 font-bold">{product.name}</h3></div><p className="font-bold text-primary">{formatCurrency(product.unitPrice, product.organization.profile?.currency ?? 'INR')}</p></div>{product.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>}</CardContent></Card>)}</div>}
        </section>
      </main>

      <footer className="border-t border-border/70 py-8"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} InvoiceFlow. Built for growing businesses.</p><div className="flex gap-4"><Link href="/products" className="hover:text-primary">Products</Link><Link href="/login" className="hover:text-primary">Sign in</Link></div></div></footer>
    </div>
  );
}
