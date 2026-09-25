"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function ChartSkeleton() {
  return (
    <div className="w-full h-72 rounded-xl border p-4 bg-card shadow-xs space-y-3 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex justify-around pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export const LazyRevenueTrendChart = dynamic(
  () => import("./revenue-trend-chart").then((m) => m.RevenueTrendChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyPaymentModeChart = dynamic(
  () => import("./payment-mode-chart").then((m) => m.PaymentModeChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyInventoryVelocityChart = dynamic(
  () => import("./inventory-velocity-chart").then((m) => m.InventoryVelocityChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyCategoryDistributionChart = dynamic(
  () => import("./category-distribution-chart").then((m) => m.CategoryDistributionChart),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
