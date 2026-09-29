"use client";

import { useState } from "react";
import { CheckCircle2, Printer, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/invoice-utils";

export interface PosProductItem {
  id: string;
  name: string;
  unitPrice: number;
  gstRate: number;
  category?: string;
}

export function TouchPosView({ products }: { products: PosProductItem[] }) {
  const [cart, setCart] = useState<Array<{ product: PosProductItem; qty: number }>>([]);
  const [search, setSearch] = useState("");
  const [completedOrder, setCompletedOrder] = useState<{
    itemsCount: number;
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
  } | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );

  function addToCart(product: PosProductItem) {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function updateQty(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);
  const taxTotal = cart.reduce(
    (sum, item) => sum + (item.product.unitPrice * item.qty * item.product.gstRate) / 100,
    0
  );
  const grandTotal = subtotal + taxTotal;

  function handleCompleteSale() {
    setCompletedOrder({
      itemsCount: cart.reduce((s, i) => s + i.qty, 0),
      subtotal,
      taxTotal,
      grandTotal,
    });
  }

  function handleReset() {
    setCart([]);
    setCompletedOrder(null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
      {/* Product Selection Touch Grid */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <Input
          placeholder="🔍 Touch search items or scan barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 text-base shadow-xs"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex flex-col justify-between p-4 h-28 bg-card hover:bg-accent hover:text-accent-foreground border rounded-xl shadow-xs transition-all text-left active:scale-95 touch-manipulation cursor-pointer"
            >
              <span className="font-semibold text-sm line-clamp-2">{product.name}</span>
              <span className="font-bold text-base text-primary">
                {formatCurrency(product.unitPrice)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Panel */}
      <Card className="lg:col-span-5 flex flex-col justify-between shadow-md">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Current Order</span>
            <span className="text-xs font-normal text-muted-foreground">
              {cart.reduce((s, i) => s + i.qty, 0)} Items
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Touch products on the left to add to order
            </div>
          ) : (
            cart.map(({ product, qty }) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg text-sm"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(product.unitPrice)} × {qty}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-8 text-base p-0"
                    onClick={() => updateQty(product.id, -1)}
                  >
                    -
                  </Button>
                  <span className="font-bold w-6 text-center">{qty}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="size-8 text-base p-0"
                    onClick={() => updateQty(product.id, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>

        <div className="p-4 border-t bg-muted/20 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>GST Tax</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-foreground pt-1 border-t">
              <span>Total Payable</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <Button
            disabled={cart.length === 0}
            onClick={handleCompleteSale}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md active:scale-98 transition-all cursor-pointer"
          >
            ⚡ Complete Cash / UPI Sale
          </Button>
        </div>
      </Card>

      {/* Sale Completion Modal with Print Invoice / PDF Options */}
      <Dialog open={!!completedOrder} onOpenChange={(open) => !open && handleReset()}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-xl font-bold">POS Order Completed!</DialogTitle>
          </DialogHeader>

          {completedOrder && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/70 bg-muted/40 p-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total Items</span>
                  <span className="font-semibold text-foreground">{completedOrder.itemsCount}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST Amount</span>
                  <span className="font-semibold text-foreground">{formatCurrency(completedOrder.taxTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-foreground border-t pt-2">
                  <span>Paid Amount</span>
                  <span className="text-primary font-mono">{formatCurrency(completedOrder.grandTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 gap-2 cursor-pointer"
                >
                  <Printer className="size-4" />
                  Print Thermal Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="font-bold h-11 gap-2 cursor-pointer"
                >
                  <Printer className="size-4" />
                  Print PDF Invoice
                </Button>
              </div>

              <Button
                variant="secondary"
                onClick={handleReset}
                className="w-full h-10 gap-2 cursor-pointer"
              >
                <RefreshCw className="size-4" />
                Start Next Sale
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

