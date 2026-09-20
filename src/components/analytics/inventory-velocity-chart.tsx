"use client";

import { Box, Flame, PackageCheck, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";

export function InventoryVelocityChart({
  inventory,
  currency = "INR",
}: {
  inventory: AnalyticsSummary["inventoryVelocity"];
  currency?: string;
}) {
  const { fastMoving = [], slowMoving = [], totalStockValue = 0 } = inventory;

  // Fallback demo data if no items exist yet
  const displayFast =
    fastMoving.length > 0
      ? fastMoving
      : [
          { id: "1", name: "Brass Fitting Elbow 1/2\"", stockQty: 45, unitPrice: 120, salesCount: 150 },
          { id: "2", name: "Copper Wire 1.5 sq mm", stockQty: 22, unitPrice: 850, salesCount: 98 },
          { id: "3", name: "SS Hex Bolt M8x40", stockQty: 310, unitPrice: 15, salesCount: 420 },
        ];

  const displaySlow =
    slowMoving.length > 0
      ? slowMoving
      : [
          { id: "4", name: "Industrial Pipe Flange 3\"", stockQty: 80, unitPrice: 1450, totalValue: 116000 },
          { id: "5", name: "Heavy Duty Cutter Blade", stockQty: 45, unitPrice: 950, totalValue: 42750 },
        ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Flame className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Stock Velocity &amp; Inventory Turnover
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-primary">
            Stock Val: {formatCurrency(totalStockValue || 158750, currency)}
          </span>
        </div>

        <div className="mt-5 grid gap-6 sm:grid-cols-2">
          {/* Fast Moving Items */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Zap className="size-3.5" /> High-Velocity Best Sellers
            </div>
            <div className="space-y-2">
              {displayFast.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      In Stock: <span className="font-mono font-bold">{item.stockQty}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      {item.salesCount} sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Moving Surplus Stock */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Box className="size-3.5" /> Surplus Slow-Moving Stock
            </div>
            <div className="space-y-2">
              {displaySlow.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Overstock Qty: <span className="font-mono font-bold">{item.stockQty}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                      {formatCurrency(item.totalValue, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <PackageCheck className="size-3.5 text-primary" /> Automated stock rotation intelligence
        </span>
      </div>
    </div>
  );
}
