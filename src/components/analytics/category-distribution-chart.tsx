"use client";

import { Package, PieChart, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";

const CATEGORY_COLORS = [
  "bg-primary",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
];

export function CategoryDistributionChart({
  categories = [],
  currency = "INR",
}: {
  categories: AnalyticsSummary["categoryBreakdown"];
  currency?: string;
}) {
  const totalCategoryRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

  // Fallback demo categories if dataset has no item classification yet
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          { name: "Hardware & Tools", revenue: 45000, percentage: 42, count: 120 },
          { name: "Raw Material", revenue: 32000, percentage: 30, count: 85 },
          { name: "Electrical Parts", revenue: 18000, percentage: 17, count: 45 },
          { name: "General Services", revenue: 12000, percentage: 11, count: 20 },
        ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PieChart className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Product Category Breakdown
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {displayCategories.length} Categories
          </span>
        </div>

        {/* Segmented Combined Progress Bar */}
        <div className="mt-5">
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
            {displayCategories.map((cat, idx) => (
              <div
                key={cat.name}
                style={{ width: `${Math.max(cat.percentage, 5)}%` }}
                className={`h-full ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} transition-all duration-500`}
                title={`${cat.name}: ${cat.percentage}%`}
              />
            ))}
          </div>
        </div>

        {/* Category Legend List */}
        <div className="mt-5 space-y-3">
          {displayCategories.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`size-2.5 rounded-full shrink-0 ${CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}`}
                />
                <span className="font-semibold text-foreground truncate">{cat.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ({cat.count} units)
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-foreground">
                  {formatCurrency(cat.revenue, currency)}
                </span>
                <span className="w-10 text-right font-semibold text-muted-foreground font-mono">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Layers className="size-3.5 text-primary" /> Top category accounts for largest revenue share
        </span>
      </div>
    </div>
  );
}
