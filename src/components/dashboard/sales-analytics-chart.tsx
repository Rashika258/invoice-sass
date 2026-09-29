"use client";

import { useId, useMemo, useRef, useState } from "react";
import { format, subDays } from "date-fns";
import { formatCurrency } from "@/lib/invoice-utils";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";

type TransactionRecord = {
  id: string;
  issueDate: Date | string;
  total: number;
};

type TimeRange = "3m" | "30d" | "7d";

// Convert points to Catmull-Rom cubic bezier spline for natural smooth curves
function getCatmullRomSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}

export function SalesAnalyticsChart({
  sales = [],
  purchases = [],
  currency = "INR",
}: {
  sales: TransactionRecord[];
  purchases?: TransactionRecord[];
  currency?: string;
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3m");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(1);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartId = useId().replace(/:/g, "_");

  // Generate data points for selected timeframe
  const chartData = useMemo(() => {
    const today = new Date();

    if (timeRange === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const targetDate = subDays(today, 6 - i);
        const dayStr = format(targetDate, "yyyy-MM-dd");
        const displayLabel = format(targetDate, "MMM d");

        const daySales = sales
          .filter((s) => format(new Date(s.issueDate), "yyyy-MM-dd") === dayStr)
          .reduce((sum, s) => sum + s.total, 0);

        const dayPurchases = purchases
          .filter((p) => format(new Date(p.issueDate), "yyyy-MM-dd") === dayStr)
          .reduce((sum, p) => sum + p.total, 0);

        return {
          date: targetDate,
          label: displayLabel,
          sales: daySales,
          purchases: dayPurchases,
        };
      });
    }

    if (timeRange === "30d") {
      return Array.from({ length: 10 }, (_, i) => {
        const daysAgo = Math.round(30 - (i * 30) / 9);
        const targetDate = subDays(today, daysAgo);
        const displayLabel = format(targetDate, "MMM d");

        const startWindow = subDays(targetDate, 1);
        const endWindow = subDays(targetDate, -1);

        const periodSales = sales
          .filter((s) => {
            const d = new Date(s.issueDate);
            return d >= startWindow && d <= endWindow;
          })
          .reduce((sum, s) => sum + s.total, 0);

        const periodPurchases = purchases
          .filter((p) => {
            const d = new Date(p.issueDate);
            return d >= startWindow && d <= endWindow;
          })
          .reduce((sum, p) => sum + p.total, 0);

        return {
          date: targetDate,
          label: displayLabel,
          sales: periodSales,
          purchases: periodPurchases,
        };
      });
    }

    // Default "3m" (Last 3 months: 7 evenly spaced tick dates)
    return Array.from({ length: 7 }, (_, i) => {
      const daysAgo = Math.round(90 - (i * 90) / 6);
      const targetDate = subDays(today, daysAgo);
      const displayLabel = format(targetDate, "MMM d");

      const startWindow = subDays(targetDate, 6);
      const endWindow = subDays(targetDate, -6);

      const periodSales = sales
        .filter((s) => {
          const d = new Date(s.issueDate);
          return d >= startWindow && d <= endWindow;
        })
        .reduce((sum, s) => sum + s.total, 0);

      const periodPurchases = purchases
        .filter((p) => {
          const d = new Date(p.issueDate);
          return d >= startWindow && d <= endWindow;
        })
        .reduce((sum, p) => sum + p.total, 0);

      return {
        date: targetDate,
        label: displayLabel,
        sales: periodSales,
        purchases: periodPurchases,
      };
    });
  }, [sales, purchases, timeRange]);

  const hasData = useMemo(() => {
    return chartData.some((d) => d.sales > 0 || d.purchases > 0);
  }, [chartData]);

  const enrichedData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      displaySales: item.sales,
      displayPurchases: item.purchases,
      isRealSales: item.sales > 0,
      isRealPurchases: item.purchases > 0,
    }));
  }, [chartData]);

  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...enrichedData.map((d) => Math.max(d.displaySales, d.displayPurchases)),
      50,
    );
    return highest * 1.25;
  }, [enrichedData]);

  const width = 800;
  const height = 240;
  const paddingX = 30;
  const paddingY = 25;
  const chartHeight = height - 2 * paddingY;
  const chartWidth = width - 2 * paddingX;

  const salesPoints = enrichedData.map((item, index) => {
    const x = paddingX + (index / (enrichedData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (item.displaySales / maxVal) * chartHeight;
    return { x, y, ...item };
  });

  const purchasePoints = enrichedData.map((item, index) => {
    const x = paddingX + (index / (enrichedData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (item.displayPurchases / maxVal) * chartHeight;
    return { x, y, ...item };
  });

  const salesSplinePath = getCatmullRomSplinePath(salesPoints);
  const salesAreaPath = salesPoints.length
    ? `${salesSplinePath} L ${salesPoints[salesPoints.length - 1].x.toFixed(1)} ${height - paddingY} L ${salesPoints[0].x.toFixed(1)} ${height - paddingY} Z`
    : "";

  const purchaseSplinePath = getCatmullRomSplinePath(purchasePoints);
  const purchaseAreaPath = purchasePoints.length
    ? `${purchaseSplinePath} L ${purchasePoints[purchasePoints.length - 1].x.toFixed(1)} ${height - paddingY} L ${purchasePoints[0].x.toFixed(1)} ${height - paddingY} Z`
    : "";

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normalizedX = (clientX / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;
    salesPoints.forEach((pt, i) => {
      const dist = Math.abs(pt.x - normalizedX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });

    setHoveredIndex(closestIdx);
  };

  const activeSalePoint = hoveredIndex !== null ? salesPoints[hoveredIndex] : null;
  const activePurchasePoint = hoveredIndex !== null ? purchasePoints[hoveredIndex] : null;

  const periodSubtitle =
    timeRange === "3m"
      ? "Billing trends over the last 3 months"
      : timeRange === "30d"
        ? "Daily turnover for the last 30 days"
        : "Turnover for the last 7 days";

  return (
    <div className="w-full rounded-xl border border-border bg-card p-5 shadow-xs transition-all">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Revenue &amp; Purchase Overview
            </h2>
            <div className="hidden sm:flex items-center gap-3 ml-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />
                Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-400" />
                Purchases
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{periodSubtitle}</p>
        </div>

        {/* Time Filter Tabs */}
        <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTimeRange("3m")}
            className={`rounded-md px-3 py-1 text-xs transition-all cursor-pointer font-medium ${
              timeRange === "3m"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 3 months
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("30d")}
            className={`rounded-md px-3 py-1 text-xs transition-all cursor-pointer font-medium ${
              timeRange === "30d"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange("7d")}
            className={`rounded-md px-3 py-1 text-xs transition-all cursor-pointer font-medium ${
              timeRange === "7d"
                ? "bg-background text-foreground shadow-2xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Last 7 days
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="mt-5">
          <ChartEmptyState
            icon="trend"
            title="No Transactions in Selected Timeframe"
            description={`No sales invoices or purchase bills were recorded for the ${
              timeRange === "7d" ? "last 7 days" : timeRange === "30d" ? "last 30 days" : "last 3 months"
            }.`}
            actionText="Create Invoice"
            actionHref="/invoices/new"
            minHeight="min-h-[230px]"
          />
        </div>
      ) : (
        <>
          {/* SVG Chart Area */}
          <div className="relative mt-5 h-[230px] w-full select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible cursor-crosshair touch-none"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
        >
          <defs>
            {/* Emerald Gradient for Sales */}
            <linearGradient id={`${chartId}_salesGlow`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Slate Gradient for Purchases */}
            <linearGradient id={`${chartId}_purchaseGlow`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#64748b" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="currentColor" className="text-border/40" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-border/60" />

          {/* Area fills */}
          <path d={purchaseAreaPath} fill={`url(#${chartId}_purchaseGlow)`} />
          <path d={salesAreaPath} fill={`url(#${chartId}_salesGlow)`} />

          {/* Lines */}
          <path
            d={purchaseSplinePath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d={salesSplinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Crosshair & Tooltip */}
          {activeSalePoint && activePurchasePoint && (
            <g className="transition-all duration-150">
              <line
                x1={activeSalePoint.x}
                y1={paddingY}
                x2={activeSalePoint.x}
                y2={height - paddingY}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              <circle
                cx={activePurchasePoint.x}
                cy={activePurchasePoint.y}
                r="4"
                className="fill-background stroke-slate-500 stroke-2"
              />

              <circle
                cx={activeSalePoint.x}
                cy={activeSalePoint.y}
                r="4.5"
                className="fill-background stroke-emerald-500 stroke-2"
              />

              <foreignObject
                x={Math.min(
                  Math.max(activeSalePoint.x - 65, 10),
                  width - 150,
                )}
                y={Math.max(
                  Math.min(activeSalePoint.y, activePurchasePoint.y) - 85,
                  6,
                )}
                width="145"
                height="80"
                className="overflow-visible pointer-events-none"
              >
                <div className="rounded-lg border border-border bg-popover/95 p-2.5 text-[11px] text-popover-foreground shadow-lg backdrop-blur-xs">
                  <div className="font-medium text-muted-foreground">
                    {activeSalePoint.label}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Sales</span>
                    </div>
                    <span className="font-semibold text-foreground font-mono">
                      {formatCurrency(activeSalePoint.sales, currency)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2 rounded-full bg-slate-400" />
                      <span>Purchases</span>
                    </div>
                    <span className="font-medium text-muted-foreground font-mono">
                      {formatCurrency(activePurchasePoint.purchases, currency)}
                    </span>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>

          {/* X Axis Labels */}
          <div className="flex justify-between px-3 pt-2 text-[11px] font-medium text-muted-foreground">
            {enrichedData.map((item, idx) => (
              <span key={`lbl-${item.label}-${idx}`} className="text-center">
                {item.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
