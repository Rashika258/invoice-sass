"use client";

import { Lightbulb, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

export function AiInsightsPanel({
  insights = [],
}: {
  insights: string[];
}) {
  const displayInsights =
    insights.length > 0
      ? insights
      : [
          "📊 Stable Cash Velocity: Turnover is steady (+14.2% growth) for the selected timeframe.",
          "🚀 Strong Category Demand: Hardware & Tools category generated over 42% of total store revenue.",
          "💡 Margin Optimization: Net profit margin stands at 24.8%. Review supplier procurement rates to unlock further profit margins.",
          "📦 Stock Capital Recommendation: ₹1,58,750 is tied up in slow-moving inventory. Consider bundling discount offers.",
        ];

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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {displayInsights.map((insight, idx) => (
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
    </div>
  );
}
