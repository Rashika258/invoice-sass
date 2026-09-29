"use client";

import { Lightbulb, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";

export function AiInsightsPanel({
  insights = [],
}: {
  insights: string[];
}) {
  const hasInsights = insights && insights.length > 0;

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/5 via-card to-card p-6 shadow-xs relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Billora AI Business Intelligence Insights
            </h2>
            <p className="text-xs text-muted-foreground">
              Automated anomaly detection, profit optimization tips, and risk warnings.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          AI AGENT
        </span>
      </div>

      {!hasInsights ? (
        <div className="mt-4">
          <ChartEmptyState
            icon="ai"
            title="No AI Insights Available Yet"
            description="Create sales invoices and purchase bills to trigger automated margin optimization, stock velocity analysis, and revenue risk alerts."
            actionText="Create Invoice"
            actionHref="/invoices/new"
            minHeight="min-h-[160px]"
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border/70 bg-card/80 backdrop-blur-xs flex items-start gap-3 shadow-2xs"
            >
              <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Lightbulb className="size-3.5" />
              </div>
              <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
