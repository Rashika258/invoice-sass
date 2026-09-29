"use client";

import { AlertTriangle, ShieldAlert, User, Users } from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";
import type { AnalyticsSummary } from "@/actions/analytics";
import { ChartEmptyState } from "@/components/ui/chart-empty-state";

export function PartyConcentrationChart({
  parties = [],
  currency = "INR",
}: {
  parties: AnalyticsSummary["partyConcentration"];
  currency?: string;
}) {
  const totalPartyRevenue = parties.reduce((sum, p) => sum + p.revenue, 0);
  const hasData = parties.length > 0 && totalPartyRevenue > 0;

  if (!hasData) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Users className="size-4" />
              </div>
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Party Revenue Concentration
              </h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              0 Parties
            </span>
          </div>

          <div className="my-4">
            <ChartEmptyState
              icon="party"
              title="No Customer Concentration Data"
              description="Bill your clients and customers to analyze revenue concentration and counterparty risk."
              actionText="Add New Customer"
              actionHref="/customers"
              minHeight="min-h-[200px]"
            />
          </div>
        </div>
      </div>
    );
  }

  const displayParties = parties;
  const highestRiskParty = displayParties[0];
  const isHighConcentration = highestRiskParty && highestRiskParty.percentage > 35;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Users className="size-4" />
            </div>
            <h2 className="text-base font-bold text-foreground tracking-tight">
              Party Revenue Concentration
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            Top 5 Parties
          </span>
        </div>

        {/* High Concentration Warning Banner */}
        {isHighConcentration && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-bold">Customer Concentration Risk Detected</p>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                <span className="font-semibold">{highestRiskParty.name}</span> contributes{" "}
                <span className="font-bold">{highestRiskParty.percentage}%</span> of overall billing.
                Diversify customer base to mitigate revenue drop risks.
              </p>
            </div>
          </div>
        )}

        {/* Horizontal Bar Ranking List */}
        <div className="mt-5 space-y-3.5">
          {displayParties.map((party, idx) => (
            <div key={party.id || party.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-5 rounded-md bg-muted text-foreground flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-foreground truncate">{party.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono font-bold text-foreground">
                    {formatCurrency(party.revenue, currency)}
                  </span>
                  <span className="w-10 text-right font-semibold text-muted-foreground font-mono">
                    {party.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  style={{ width: `${Math.max(party.percentage, 4)}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 && party.percentage > 35
                      ? "bg-amber-500"
                      : "bg-primary"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="size-3.5 text-primary" /> Top revenue contributors by invoice volume
        </span>
      </div>
    </div>
  );
}
