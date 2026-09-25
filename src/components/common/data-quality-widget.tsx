"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, Wrench, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface DataQualitySummary {
  healthyCount: number;
  needsReviewCount: number;
  criticalCount: number;
  totalRecords: number;
  overallScore: number;
}

interface DataQualityWidgetProps {
  summary?: DataQualitySummary;
}

export function DataQualityWidget({
  summary = {
    healthyCount: 142,
    needsReviewCount: 12,
    criticalCount: 3,
    totalRecords: 157,
    overallScore: 92,
  },
}: DataQualityWidgetProps) {
  return (
    <Card className="border border-border shadow-2xs select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand" />
          <span>System Data Health Audit</span>
        </CardTitle>
        <Badge className="bg-brand/10 text-brand font-mono font-bold text-[10px]">
          SCORE: {summary.overallScore}/100
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-400">
              {summary.healthyCount}
            </span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Healthy</p>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="font-mono font-black text-base text-amber-700 dark:text-amber-400">
              {summary.needsReviewCount}
            </span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Review</p>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="font-mono font-black text-base text-rose-700 dark:text-rose-400">
              {summary.criticalCount}
            </span>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Critical</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
          <span className="text-muted-foreground text-[11px]">
            {summary.criticalCount + summary.needsReviewCount} records require action
          </span>
          <Link
            href="/work-queue"
            className="inline-flex items-center gap-1 font-bold text-brand hover:underline text-[11px]"
          >
            <span>Resolve in Work Queue</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
