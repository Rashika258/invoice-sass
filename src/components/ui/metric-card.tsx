import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function MetricCard({ label, value, subtext, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("shadow-xs hover:shadow-sm transition-shadow", className)}>
      <CardContent className="p-5 flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
          {subtext && <p className="text-xs text-muted-foreground pt-0.5">{subtext}</p>}
          {trend && (
            <p
              className={cn(
                "text-xs font-semibold pt-1 flex items-center gap-1",
                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{trend.value}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
