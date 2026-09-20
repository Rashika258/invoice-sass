"use client";

import { BarChart3, Calendar, Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeRangeFilter } from "@/actions/analytics";

export function AnalyticsHeader({
  activeRange,
  onRangeChange,
  currency = "INR",
  isRefreshing,
  onRefresh,
}: {
  activeRange: TimeRangeFilter;
  onRangeChange: (range: TimeRangeFilter) => void;
  currency?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Business Intelligence &amp; Analytics
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles className="size-3" /> Live Graphs
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive financial turnover, profit flow, party risk, and stock movement graphs.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Date Filter Tabs */}
        <div className="inline-flex items-center rounded-xl border border-border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => onRangeChange("7d")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer font-medium ${
              activeRange === "7d"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            7 Days
          </button>
          <button
            type="button"
            onClick={() => onRangeChange("30d")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer font-medium ${
              activeRange === "30d"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            30 Days
          </button>
          <button
            type="button"
            onClick={() => onRangeChange("thisMonth")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer font-medium ${
              activeRange === "thisMonth"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => onRangeChange("3m")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer font-medium ${
              activeRange === "3m"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3 Months
          </button>
          <button
            type="button"
            onClick={() => onRangeChange("1y")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer font-medium ${
              activeRange === "1y"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1 Year
          </button>
        </div>

        {/* Action Buttons */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 px-3 text-xs gap-1.5 cursor-pointer rounded-xl"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        <Button
          onClick={handlePrint}
          size="sm"
          className="h-9 px-4 text-xs font-bold gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
        >
          <Download className="size-3.5" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
