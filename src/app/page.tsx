import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  FileText,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { getPublicProducts } from "@/actions/items";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

export default async function LandingPage() {
  const products = await getPublicProducts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">InvoiceFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" render={<Link href="/products" />}>
              Products
            </Button>
            <Button variant="outline" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button render={<Link href="/register" />}>Get started</Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
              All-in-one business management SaaS
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Invoices, payroll, and products in one place
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Create dynamic invoices, manage customers, track employee attendance,
              calculate salaries with overtime, and publish a public product catalog.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/register" />}>
                Start free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/products" />}
              >
                Browse products
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: FileText,
                title: "Smart Invoicing",
                desc: "Dynamic customers, items, taxes, and PDF-ready invoices.",
              },
              {
                icon: CalendarClock,
                title: "Attendance & Payroll",
                desc: "8-hour days with automatic overtime salary calculation.",
              },
              {
                icon: Package,
                title: "Public Catalog",
                desc: "Showcase products to customers without requiring login.",
              },
              {
                icon: Shield,
                title: "Secure Accounts",
                desc: "Each business gets its own protected workspace.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Featured products</h2>
              <p className="text-muted-foreground">
                Public catalog preview — no account required.
              </p>
            </div>
            <Button variant="outline" render={<Link href="/products" />}>
              View all products
            </Button>
          </div>

          {products.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No public products yet. Businesses can publish items from their dashboard.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.organization.profile?.companyName ?? "Business"}
                        </p>
                      </div>
                      <p className="font-bold text-primary">
                        {formatCurrency(
                          product.unitPrice,
                          product.organization.profile?.currency ?? "USD",
                        )}
                      </p>
                    </div>
                    {product.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} InvoiceFlow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-foreground">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
