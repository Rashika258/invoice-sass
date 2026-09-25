"use client";

import React from "react";
import { getFeatureMaturity, MATURITY_CONFIG } from "@/lib/feature-maturity";
import { Badge } from "@/components/ui/badge";

interface FeatureMaturityBadgeProps {
  featureId: string;
  className?: string;
}

export function FeatureMaturityBadge({
  featureId,
  className = "",
}: FeatureMaturityBadgeProps) {
  const entry = getFeatureMaturity(featureId);
  if (!entry || entry.maturity === "STABLE") {
    return null;
  }

  const config = MATURITY_CONFIG[entry.maturity];
  const tooltipText = `${entry.label}: ${config.description}${entry.notes ? ` (${entry.notes})` : ""}`;

  return (
    <Badge
      variant="outline"
      title={tooltipText}
      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full cursor-help ${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
}
