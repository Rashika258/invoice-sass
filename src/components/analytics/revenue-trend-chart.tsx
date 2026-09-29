"use client";

import { useId, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";

import { ChartEmptyState } from "@/components/ui/chart-empty-state";

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

export function RevenueTrendChart({
  timeSeries = [],
  currency = "INR",
}: {
  timeSeries: AnalyticsSummary["timeSeries"];
  currency?: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const chartId = useId().replace(/:/g, "_");

  const hasData = useMemo(() => {
    return (
      Array.isArray(timeSeries) &&
      timeSeries.length > 0 &&
      timeSeries.some((d) => d.sales > 0 || d.purchases > 0 || d.expenses > 0)
    );
  }, [timeSeries]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(
    timeSeries.length > 0 ? timeSeries.length - 1 : null
  );

  const chartData = timeSeries;

  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 100;
    const highest = Math.max(
      ...chartData.map((d) => Math.max(d.sales, d.purchases, d.netProfit)),
      100
    );
    return highest * 1.2;
  }, [chartData]);

  const width = 900;
  const height = 300;
  const paddingX = 40;
  const paddingY = 30;
  const chartHeight = height - 2 * paddingY;
  const chartWidth = width - 2 * paddingX;

  const salesPoints = chartData.map((item, index) => {
    const x = paddingX + (index / (chartData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (Math.max(item.sales, 0) / maxVal) * chartHeight;
    return { x, y, ...item };
  });

  const purchasePoints = chartData.map((item, index) => {
    const x = paddingX + (index / (chartData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (Math.max(item.purchases, 0) / maxVal) * chartHeight;
    return { x, y, ...item };
  });

  const profitPoints = chartData.map((item, index) => {
    const x = paddingX + (index / (chartData.length - 1 || 1)) * chartWidth;
    const y = height - paddingY - (Math.max(item.netProfit, 0) / maxVal) * chartHeight;
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

  const activeSale = hoveredIndex !== null && salesPoints[hoveredIndex] ? salesPoints[hoveredIndex] : null;
  const activePurchase = hoveredIndex !== null && purchasePoints[hoveredIndex] ? purchasePoints[hoveredIndex] : null;
  if (!hasData) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Revenue, Purchases &amp; Net Profit Graph
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turnover trajectory vs raw material procurement costs and net profit cashflow.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ChartEmptyState
            icon="trend"
            title="No Transaction Data Recorded"
            description="There are no sales, purchases, or expense transactions recorded for this timeframe yet."
            actionText="Create Sales Invoice"
            actionHref="/invoices/new"
            minHeight="min-h-[260px]"
          />
        </div>
      </div>
    );
  }

  const activeProfit = hoveredIndex !== null && profitPoints[hoveredIndex] ? profitPoints[hoveredIndex] : null;

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">
            Revenue, Purchases &amp; Net Profit Graph
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Turnover trajectory vs raw material procurement costs and net profit cashflow.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500 shadow-xs" />
            Sales
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-slate-400" />
            Purchases
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-indigo-500" />
            Net Profit
          </span>
        </div>
      </div>

      <div className="relative mt-5 h-[280px] w-full select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible cursor-crosshair touch-none"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
        >
          <defs>
            <linearGradient id={`${chartId}_salesGlow`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={`${chartId}_purchaseGlow`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#64748b" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="currentColor" className="text-border/40" strokeDasharray="4 4" />
          <line x1={paddingX} y1={paddingY + chartHeight / 2} x2={width - paddingX} y2={paddingY + chartHeight / 2} stroke="currentColor" className="text-border/40" strokeDasharray="4 4" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="currentColor" className="text-border/70" />

          {/* Area Fills */}
          <path d={purchaseAreaPath} fill={`url(#${chartId}_purchaseGlow)`} />
          <path d={salesAreaPath} fill={`url(#${chartId}_salesGlow)`} />

          {/* Lines */}
          <path d={purchaseSplinePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <path d={salesSplinePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <path d={getCatmullRomSplinePath(profitPoints)} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />

          {/* Crosshair & Active Tooltip */}
          {activeSale && activePurchase && activeProfit && (
            <g className="transition-all duration-150">
              <line
                x1={activeSale.x}
                y1={paddingY}
                x2={activeSale.x}
                y2={height - paddingY}
                stroke="currentColor"
                className="text-border"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              <circle cx={activePurchase.x} cy={activePurchase.y} r="4" className="fill-background stroke-slate-500 stroke-2" />
              <circle cx={activeProfit.x} cy={activeProfit.y} r="4" className="fill-background stroke-indigo-500 stroke-2" />
              <circle cx={activeSale.x} cy={activeSale.y} r="5" className="fill-background stroke-emerald-500 stroke-2" />

              <foreignObject
                x={Math.min(Math.max(activeSale.x - 80, 10), width - 180)}
                y={Math.max(Math.min(activeSale.y, activePurchase.y) - 105, 8)}
                width="170"
                height="100"
                className="overflow-visible pointer-events-none"
              >
                <div className="rounded-xl border border-border bg-popover/95 p-3 text-[11px] text-popover-foreground shadow-xl backdrop-blur-md">
                  <div className="font-bold text-foreground border-b border-border/60 pb-1 mb-1.5 flex justify-between">
                    <span>{activeSale.dateLabel}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{activeSale.rawDate}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="size-2 rounded-full bg-emerald-500" /> Sales
                    </span>
                    <span className="font-mono font-bold">{formatCurrency(activeSale.sales, currency)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <span className="size-2 rounded-full bg-slate-400" /> Purchases
                    </span>
                    <span className="font-mono font-medium text-muted-foreground">{formatCurrency(activePurchase.purchases, currency)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-1 border-t border-border/40 pt-1">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                      <span className="size-2 rounded-full bg-indigo-500" /> Net Profit
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(activeProfit.netProfit, currency)}</span>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>

      {/* X-Axis Tick Labels */}
      <div className="flex justify-between px-4 pt-2 text-[11px] font-medium text-muted-foreground">
        {chartData.map((item, idx) => (
          <span key={`lbl-${item.dateLabel}-${idx}`} className="text-center">
            {item.dateLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
