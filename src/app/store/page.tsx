"use client";

import Link from "next/link";
import { Store, ArrowRight, ShoppingBag, ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useAppName } from "@/hooks/use-app-name";

export default function StoreLandingPage() {
  const { appName } = useAppName();
  const [searchQuery, setSearchQuery] = useState("");

  const stores = [
    {
      name: "Zenith E-Store",
      slug: "zenith",
      category: "Engineering & Hardware Supplies",
      location: "Bengaluru, Karnataka",
      verified: true,
      itemCount: 42,
    },
    {
      name: "Example Digital Store",
      slug: "example",
      category: "General Mercantile & Tools",
      location: "Mumbai, Maharashtra",
      verified: true,
      itemCount: 18,
    },
  ];

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pb-12">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Store className="size-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {appName} Online Stores
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Digital storefront directory
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <div className="mx-auto max-w-5xl px-4 pt-8">
        <div className="rounded-2xl border border-border/80 bg-card p-6 md:p-8 shadow-xs space-y-4">
          <div className="space-y-2">
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
              VERIFIED STORE DIRECTORY
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Browse Registered Merchant Stores
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
              Order directly from verified businesses with instant UPI payment, live inventory tracking, and automatic tax invoices.
            </p>
          </div>

          <div className="relative max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores by name or industry..."
              className="h-10 rounded-xl bg-muted/40 border-border pl-9 text-xs"
            />
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Store List */}
      <main className="mx-auto max-w-5xl px-4 pt-6 space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Available Digital Storefronts ({filteredStores.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStores.map((store) => (
            <div
              key={store.slug}
              className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-emerald-500/40 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-base border border-emerald-500/20">
                      {store.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {store.name}
                        {store.verified && (
                          <ShieldCheck className="size-4 text-emerald-500" />
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {store.category}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground flex items-center gap-2 pt-1">
                  <span>📍 {store.location}</span>
                  <span>•</span>
                  <span>📦 {store.itemCount} Items listed</span>
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShoppingBag className="size-3.5" /> Direct WhatsApp &amp; UPI
                </span>
                <Link href={`/store/${store.slug}`}>
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1 px-3 shadow-xs"
                  >
                    <span>Visit Store</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
