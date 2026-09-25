"use client";

import { FEATURE_MATURITY_REGISTRY, MATURITY_CONFIG, type FeatureMaturityLevel } from "@/lib/feature-maturity";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ShieldCheck } from "lucide-react";
import { useState } from "react";

const MATURITY_ORDER: FeatureMaturityLevel[] = [
  "STABLE", "BETA", "EXPERIMENTAL", "REQUIRES_CONFIGURATION", "UNAVAILABLE_OFFLINE"
];

export function FeatureMaturityBadge({ 
  featureId, 
  className = "" 
}: { 
  featureId: string; 
  className?: string; 
}) {
  const entry = FEATURE_MATURITY_REGISTRY.find((f) => f.featureId === featureId);
  if (!entry) return null;

  const config = MATURITY_CONFIG[entry.maturity];

  return (
    <Badge
      className={`text-[9px] font-bold border ${config.className} ${className}`}
      title={entry.notes || config.description}
    >
      {config.label}
    </Badge>
  );
}

export function FeatureMaturityView() {
  const [filter, setFilter] = useState<FeatureMaturityLevel | "ALL">("ALL");

  const grouped = MATURITY_ORDER.reduce<Record<string, typeof FEATURE_MATURITY_REGISTRY>>(
    (acc, level) => {
      acc[level] = FEATURE_MATURITY_REGISTRY.filter((f) => f.maturity === level);
      return acc;
    },
    {}
  );

  const visibleEntries = filter === "ALL"
    ? FEATURE_MATURITY_REGISTRY
    : FEATURE_MATURITY_REGISTRY.filter((f) => f.maturity === filter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />
          <span>Feature Maturity Index</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Current production readiness status for all {FEATURE_MATURITY_REGISTRY.length} features in Billora.
        </p>
      </div>

      {/* Maturity Level Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {MATURITY_ORDER.map((level) => {
          const config = MATURITY_CONFIG[level];
          const count = grouped[level]?.length || 0;
          return (
            <button
              key={level}
              onClick={() => setFilter(filter === level ? "ALL" : level)}
              className={`p-3 rounded-xl border text-left transition-all hover:shadow-xs ${
                filter === level ? "ring-2 ring-primary shadow-sm" : "border-border/70 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge className={`text-[9px] font-bold border ${config.className}`}>
                  {config.label}
                </Badge>
                <span className="text-lg font-black text-foreground">{count}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">{config.description}</p>
            </button>
          );
        })}
      </div>

      {/* Feature Table */}
      <div className="rounded-xl border border-border/80 overflow-hidden bg-card">
        <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            {filter === "ALL" ? "All Features" : MATURITY_CONFIG[filter].label} ({visibleEntries.length})
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {visibleEntries.map((entry) => {
            const config = MATURITY_CONFIG[entry.maturity];
            return (
              <div key={entry.featureId} className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{entry.label}</span>
                    <code className="text-[10px] text-muted-foreground font-mono">{entry.featureId}</code>
                  </div>
                  {entry.notes && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                      <Info className="size-3 shrink-0 mt-0.5" />
                      <span>{entry.notes}</span>
                    </div>
                  )}
                </div>
                <Badge className={`text-[9px] font-bold border shrink-0 ${config.className}`}>
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
