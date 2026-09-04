"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { getStoreCatalog } from "@/actions/online-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/invoice-utils";

export default function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [storeData, setStoreData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    getStoreCatalog(slug).then((data) => setStoreData(data));
  }, [slug]);

  if (!storeData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <Store className="mx-auto size-12 text-primary animate-pulse" />
          <h2 className="text-lg font-bold">Loading Digital Store...</h2>
        </div>
      </div>
    );
  }

  const items = storeData.items || [];
  const filtered = items.filter((it: any) =>
    it.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const totalCartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalCartAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((it: any) => it.id === id);
    return sum + (item ? item.unitPrice * qty : 0);
  }, 0);

  // Construct WhatsApp order message
  const orderItemsText = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((it: any) => it.id === id);
      return item ? `• ${qty}x ${item.name} (₹${item.unitPrice * qty})` : "";
    })
    .filter(Boolean)
    .join("\n");

  const whatsappMessage = encodeURIComponent(
    `Hello ${storeData.companyName}!\n\nI would like to place an order from your Online Store:\n\n${orderItemsText}\n\n*Total Amount: ₹${totalCartAmount.toFixed(2)}*\n\nPlease confirm availability and payment details. Thank you!`,
  );

  const cleanPhone = (storeData.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pb-24">
      {/* Storefront Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {storeData.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeData.logoUrl}
                alt={storeData.companyName}
                className="size-10 rounded-xl object-contain border border-border p-1 bg-white"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-xs">
                {storeData.companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">
                {storeData.companyName}
              </h1>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3" />
                <span>{storeData.city || storeData.address || "Online Store"}</span>
              </p>
            </div>
          </div>

          {/* Cart Icon trigger */}
          {totalCartCount > 0 && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="size-4" />
              <span>{totalCartCount} items</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                {formatCurrency(totalCartAmount, "INR")}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/30">
              <CheckCircle2 className="size-3" />
              Direct WhatsApp Ordering
            </span>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
              Order Fresh Products Directly from Us
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select items, add to cart, and send your order directly to our WhatsApp with 1 click.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog..."
              className="h-10 rounded-xl bg-muted/40 border-border pl-9 text-xs"
            />
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="mx-auto max-w-5xl px-4 pt-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
            <Package className="mx-auto size-12 text-muted-foreground/40" />
            <p className="font-semibold text-sm text-foreground">No products found</p>
            <p>Try searching for a different item name.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map((item: any) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-primary/40 space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
                      <Package className="size-5" />
                    </div>
                    <h3 className="text-xs font-bold text-foreground line-clamp-2" title={item.name}>
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                    <span className="inline-block text-[10px] text-muted-foreground">
                      Per {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="font-mono text-sm font-bold text-primary">
                      {formatCurrency(item.unitPrice, "INR")}
                    </span>

                    {qty === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        className="h-7 rounded-lg bg-primary text-primary-foreground text-xs font-semibold px-2.5 shadow-xs"
                      >
                        <Plus className="size-3 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="size-5 flex items-center justify-center rounded hover:bg-primary/20"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono min-w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(item.id)}
                          className="size-5 flex items-center justify-center rounded hover:bg-primary/20"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom WhatsApp Checkout Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/95 p-3.5 text-white shadow-2xl backdrop-blur-md">
            <div>
              <p className="text-xs text-emerald-200">
                {totalCartCount} items selected
              </p>
              <p className="font-mono text-base font-black text-white">
                {formatCurrency(totalCartAmount, "INR")}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-5 py-2.5 text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="size-4 fill-current" />
              <span>Order via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
