"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getStoreCatalog,
  createDirectOnlineOrderAction,
} from "@/actions/online-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [submitting, setSubmitting] = useState(false);

  // Success Order State
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

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
    it.name.toLowerCase().includes(search.toLowerCase())
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

  // WhatsApp message URL
  const orderItemsText = Object.entries(cart)
    .map(([id, qty]) => {
      const item = items.find((it: any) => it.id === id);
      return item ? `• ${qty}x ${item.name} (₹${item.unitPrice * qty})` : "";
    })
    .filter(Boolean)
    .join("\n");

  const whatsappMessage = encodeURIComponent(
    `Hello ${storeData.companyName}!\n\nI would like to place an order from your Online Store:\n\n${orderItemsText}\n\n*Total Amount: ₹${totalCartAmount.toFixed(2)}*\n\nPlease confirm availability and payment details. Thank you!`
  );

  const cleanPhone = (storeData.phone || "").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${
    cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`
  }?text=${whatsappMessage}`;

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill in your name, phone number, and delivery address");
      return;
    }

    const orderItems = Object.entries(cart)
      .map(([id, qty]) => {
        const item = items.find((it: any) => it.id === id);
        return item
          ? { id, name: item.name, quantity: qty, unitPrice: item.unitPrice }
          : null;
      })
      .filter(Boolean) as any[];

    if (orderItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createDirectOnlineOrderAction({
        slug,
        customerName,
        phone,
        address,
        pincode,
        paymentMethod,
        items: orderItems,
      });

      setConfirmedOrder(res);
      setCart({});
      setCheckoutOpen(false);
      toast.success(`Order #${res.orderId} placed successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pb-24 select-none">
      {/* Storefront Header */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt={storeData.companyName}
              className="size-10 rounded-xl object-contain border border-border p-1 bg-white shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  {storeData.companyName}
                </h1>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[9px] font-bold">
                  VERIFIED STORE
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3" />
                <span>{storeData.city || storeData.address || "Bengaluru, Karnataka"}</span>
                <span>•</span>
                <Phone className="size-3" />
                <span>{storeData.phone || "9483374137"}</span>
              </p>
            </div>
          </div>

          {/* Cart Icon trigger */}
          {totalCartCount > 0 && (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="size-4" />
              <span>{totalCartCount} items</span>
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-mono">
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
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                <CheckCircle2 className="size-3" />
                Direct Online &amp; WhatsApp Ordering
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Powered by Billora</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
              Order Quality Engineering &amp; Hardware Supplies
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Browse live inventory, pay instantly via UPI or Cash on Delivery, and receive automated tax invoices.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog (bolts, flanges, tools)..."
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
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-emerald-500/40 space-y-3"
                >
                  <div className="space-y-1">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-2">
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
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground">
                        Per {item.unit}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        • In Stock
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatCurrency(item.unitPrice, "INR")}
                    </span>

                    {qty === 0 ? (
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.id)}
                        className="h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 shadow-xs"
                      >
                        <Plus className="size-3 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="size-5 flex items-center justify-center rounded hover:bg-emerald-500/20"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="font-mono min-w-4 text-center">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart(item.id)}
                          className="size-5 flex items-center justify-center rounded hover:bg-emerald-500/20"
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

      {/* Floating Bottom Bar */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-950/95 p-3.5 text-white shadow-2xl backdrop-blur-md">
            <div>
              <p className="text-xs text-emerald-400 font-medium">
                {totalCartCount} items selected
              </p>
              <p className="font-mono text-base font-black text-white">
                {formatCurrency(totalCartAmount, "INR")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCheckoutOpen(true)}
                className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                <span>Checkout &amp; Pay</span>
              </Button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 flex items-center justify-center rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                title="Order via WhatsApp"
              >
                <MessageCircle className="size-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* E-Commerce Direct Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShoppingBag className="size-4 text-emerald-600" />
              <span>Checkout • Online Order</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Place your order directly with {storeData.companyName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDirectOrder} className="space-y-3.5 py-2">
            <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-bold">{totalCartCount} pcs</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  {formatCurrency(totalCartAmount, "INR")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Your Full Name *</Label>
              <Input
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Phone Number (WhatsApp) *</Label>
              <Input
                placeholder="e.g. 98450 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Delivery Address *</Label>
                <Input
                  placeholder="Plot / Shop #, Industrial Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pincode</Label>
                <Input
                  placeholder="560058"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold">Payment Option</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === "UPI"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-600"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <QrCode className="size-3.5" />
                    <span>⚡ Instant UPI</span>
                  </div>
                  <p className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Google Pay, PhonePe, Paytm
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === "COD"
                      ? "border-emerald-600 bg-emerald-500/10 text-emerald-600"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Truck className="size-3.5" />
                    <span>📦 Cash on Delivery</span>
                  </div>
                  <p className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Pay on dispatch / arrival
                  </p>
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCheckoutOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {submitting ? "Placing Order..." : `Confirm Order (${formatCurrency(totalCartAmount, "INR")})`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Confirmed Dialog */}
      {confirmedOrder && (
        <Dialog open={Boolean(confirmedOrder)} onOpenChange={() => setConfirmedOrder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-2">
                <CheckCircle2 className="size-7" />
              </div>
              <DialogTitle className="text-center text-lg font-black text-foreground">
                Order Confirmed!
              </DialogTitle>
              <DialogDescription className="text-center text-xs">
                Your order has been recorded with {confirmedOrder.companyName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Reference:</span>
                  <span className="font-mono font-bold text-foreground">{confirmedOrder.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {formatCurrency(confirmedOrder.total, "INR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {confirmedOrder.paymentMethod}
                  </Badge>
                </div>
              </div>

              {confirmedOrder.paymentMethod === "UPI" && (
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <QrCode className="size-4" />
                    <span>Scan UPI QR Code to Pay</span>
                  </div>

                  <div className="flex justify-center py-1">
                    <div className="p-2.5 bg-white rounded-xl border shadow-xs inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          confirmedOrder.upiPayUrl
                        )}&margin=6`}
                        alt="UPI Payment QR"
                        className="size-36 object-contain"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <span>UPI ID:</span>
                      <code className="font-mono font-bold text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">
                        {confirmedOrder.upiId || "9483374137@okaxis"}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(confirmedOrder.upiId || "9483374137@okaxis");
                            toast.success("UPI ID copied to clipboard!");
                          }
                        }}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Copy UPI ID"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>

                    <div>
                      <a
                        href={confirmedOrder.upiPayUrl}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                      >
                        <span>Click to Pay with Google Pay / PhonePe / Paytm</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setConfirmedOrder(null)}
                className="w-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
