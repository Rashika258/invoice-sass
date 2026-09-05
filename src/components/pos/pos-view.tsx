"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Barcode,
  Check,
  CreditCard,
  Minus,
  Plus,
  Printer,
  QrCode,
  Search,
  ShoppingCart,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { Customer, Item } from "@/generated/prisma/client";
import { createInvoice } from "@/actions/invoices";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/invoice-utils";

type POSCartItem = {
  itemId: string;
  name: string;
  hsn: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  gstRate: number;
};

export function PosView({
  items,
  customers,
  currency = "INR",
  companyState,
}: {
  items: Item[];
  customers: Customer[];
  currency?: string;
  companyState?: string | null;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || "",
  );
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId],
  );
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [amountTendered, setAmountTendered] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter items by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.hsn && item.hsn.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)),
    );
  }, [items, search]);

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          hsn: item.hsn || "",
          unit: item.unit || "PCS",
          unitPrice: item.unitPrice,
          quantity: 1,
          gstRate: item.gstRate,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.itemId === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[],
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const clearCart = () => setCart([]);

  // Calculate totals
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  );

  const taxAmount = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + (item.unitPrice * item.quantity * item.gstRate) / 100,
        0,
      ),
    [cart],
  );

  const total = subtotal + taxAmount;
  const tenderedNum = Number(amountTendered) || total;
  const changeDue = Math.max(tenderedNum - total, 0);

  // Complete checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    setIsProcessing(true);
    try {
      const invoiceData = {
        customerId: selectedCustomerId,
        documentType: "SALE" as const,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date().toISOString().split("T")[0],
        status: "PAID" as const,
        taxRate: 18,
        discount: 0,
        isInterState: false,
        notes: `POS Quick Sale (${paymentMode})`,
        items: cart.map((i) => ({
          itemId: i.itemId,
          description: i.name,
          hsn: i.hsn,
          unit: i.unit,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstRate: i.gstRate,
        })),
      };

      const created = await createInvoice(invoiceData);
      toast.success("POS Sale completed!");
      clearCart();
      router.push(`/invoices/${created.id}?print=true`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Billora POS Billing</span>
            <Badge className="bg-rose-600 text-white font-semibold text-[10px]">
              Fast Counter
            </Badge>
          </h1>
        </div>
        <div className="text-xs text-muted-foreground">
          Press items to add · Instant GST bill generation
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Products Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or HSN code..."
              className="pl-9 h-10 text-sm rounded-xl bg-background"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const inCart = cart.find((i) => i.itemId === item.id);
              return (
                <Card
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:border-primary hover:shadow-sm active:scale-[0.98] select-none ${
                    inCart ? "border-primary/60 bg-primary/5" : "bg-card"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-foreground line-clamp-2">
                      {item.name}
                    </span>
                    {inCart && (
                      <span className="size-5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
                        {inCart.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-xs">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.unit || "PCS"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(item.unitPrice, currency)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right: Cart & Tender Panel (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="rounded-xl border border-border/80 shadow-md flex flex-col h-full bg-card">
            <CardHeader className="p-3.5 border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShoppingCart className="size-4 text-primary" />
                  <span>Current Bill ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="mt-2.5">
                <Select value={selectedCustomerId} onValueChange={(val) => val && setSelectedCustomerId(val)}>
                  <SelectTrigger className="w-full h-8 text-xs rounded-lg border border-border/70 bg-background px-2.5 font-medium">
                    <SelectValue placeholder="Select Customer">
                      {selectedCustomer
                        ? `${selectedCustomer.name}${selectedCustomer.phone ? ` (${selectedCustomer.phone})` : ""}`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            {/* Cart Items List */}
            <CardContent className="p-3 flex-1 overflow-y-auto max-h-64 space-y-2">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Your cart is empty. Click items on the left to add.
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-foreground truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {formatCurrency(item.unitPrice, currency)} × {item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, -1)}
                        className="size-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="font-mono font-bold w-6 text-center text-xs">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemId, 1)}
                        className="size-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground"
                      >
                        <Plus className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.itemId)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-rose-600 ml-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            {/* Bottom Checkout Controls */}
            <div className="p-3.5 border-t bg-muted/20 space-y-3">
              {/* Payment Mode */}
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  type="button"
                  variant={paymentMode === "CASH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMode("CASH")}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <Wallet className="size-3.5" />
                  <span>Cash</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMode === "UPI" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMode("UPI")}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <QrCode className="size-3.5" />
                  <span>UPI</span>
                </Button>
                <Button
                  type="button"
                  variant={paymentMode === "CARD" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMode("CARD")}
                  className="h-8 text-xs font-semibold gap-1"
                >
                  <CreditCard className="size-3.5" />
                  <span>Card</span>
                </Button>
              </div>

              {/* Amount Calculations */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST Tax:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(taxAmount, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground pt-1.5 border-t">
                  <span>Total Due:</span>
                  <span className="font-mono text-primary">
                    {formatCurrency(total, currency)}
                  </span>
                </div>
              </div>

              {/* Tendered & Change (for Cash) */}
              {paymentMode === "CASH" && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Cash Received (₹)
                    </label>
                    <Input
                      type="number"
                      value={amountTendered}
                      onChange={(e) => setAmountTendered(e.target.value)}
                      placeholder={String(Math.round(total))}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">
                      Change Due (₹)
                    </label>
                    <div className="h-8 rounded-lg bg-muted px-2 flex items-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(changeDue, currency)}
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Sale Button */}
              <Button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-sm gap-2 shadow-sm active:scale-[0.98]"
              >
                <Printer className="size-4" />
                <span>
                  {isProcessing ? "Processing..." : `Charge ${formatCurrency(total, currency)} & Print`}
                </span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
