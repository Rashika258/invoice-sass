"use client";

import { useState, useTransition } from "react";
import { getAnalyticsData, type AnalyticsSummary, type TimeRangeFilter } from "@/actions/analytics";
import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { AnalyticsKpiGrid } from "@/components/analytics/analytics-kpi-grid";
import { RevenueTrendChart } from "@/components/analytics/revenue-trend-chart";
import { CategoryDistributionChart } from "@/components/analytics/category-distribution-chart";
import { PaymentModeChart } from "@/components/analytics/payment-mode-chart";
import { PartyConcentrationChart } from "@/components/analytics/party-concentration-chart";
import { InventoryVelocityChart } from "@/components/analytics/inventory-velocity-chart";
import { AiInsightsPanel } from "@/components/analytics/ai-insights-panel";

export function AnalyticsDashboardView({
  initialData,
  currency = "INR",
}: {
  initialData: AnalyticsSummary;
  currency?: string;
}) {
  const [data, setData] = useState<AnalyticsSummary>(initialData);
  const [activeRange, setActiveRange] = useState<TimeRangeFilter>("30d");
  const [isPending, startTransition] = useTransition();

  const handleRangeChange = (newRange: TimeRangeFilter) => {
    setActiveRange(newRange);
    startTransition(async () => {
      try {
        const updated = await getAnalyticsData(newRange);
        setData(updated);
      } catch (err) {
        console.error("Failed to fetch analytics data", err);
      }
    });
  };

  const handleRefresh = () => {
    handleRangeChange(activeRange);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <AnalyticsHeader
        activeRange={activeRange}
        onRangeChange={handleRangeChange}
        currency={currency}
        isRefreshing={isPending}
        onRefresh={handleRefresh}
      />

      {/* AI Business Intelligence Alerts */}
      <AiInsightsPanel insights={data.aiInsights} />

      {/* Top KPI Grid */}
      <AnalyticsKpiGrid kpis={data.kpis} currency={currency} />

      {/* Main Revenue & Purchases Trend SVG Spline Graph */}
      <RevenueTrendChart timeSeries={data.timeSeries} currency={currency} />

      {/* 2-Column Grid: Product Category Breakdown & Payment Method Split */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistributionChart categories={data.categoryBreakdown} currency={currency} />
        <PaymentModeChart payments={data.paymentModeBreakdown} currency={currency} />
      </div>

      {/* 2-Column Grid: Party Concentration Risk & Stock Velocity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PartyConcentrationChart parties={data.partyConcentration} currency={currency} />
        <InventoryVelocityChart inventory={data.inventoryVelocity} currency={currency} />
      </div>
    </div>
  );
}
