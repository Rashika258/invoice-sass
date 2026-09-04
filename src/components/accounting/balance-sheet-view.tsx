"use client";

import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TrialRow = {
  id: string;
  name: string;
  group: string;
  closingBalance: number;
  closingType: "DR" | "CR";
};

interface BalanceSheetData {
  assets: TrialRow[];
  liabilities: TrialRow[];
  totalAssets: number;
  totalLiabilities: number;
}

interface BalanceSheetViewProps {
  data: BalanceSheetData;
  companyName: string;
  financialYear: string;
}

const GROUP_LABELS: Record<string, string> = {
  CASH_IN_HAND: "Cash in Hand", BANK_ACCOUNTS: "Bank Accounts",
  SUNDRY_DEBTORS: "Sundry Debtors", FIXED_ASSETS: "Fixed Assets",
  CURRENT_ASSETS: "Current Assets", LOANS_ADVANCES_ASSET: "Loans & Advances",
  SUNDRY_CREDITORS: "Sundry Creditors", CURRENT_LIABILITIES: "Current Liabilities",
  LOANS_LIABILITY: "Loans (Liability)", CAPITAL_ACCOUNT: "Capital Account",
  RESERVES_SURPLUS: "Reserves & Surplus", DUTIES_TAXES: "Duties & Taxes",
};

const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function BalanceSheetView({ data, companyName, financialYear }: BalanceSheetViewProps) {
  const isBalanced = Math.abs(data.totalAssets - data.totalLiabilities) < 1;

  const renderRows = (rows: TrialRow[]) => {
    const groups = [...new Set(rows.map((r) => r.group))];
    return groups.map((group) => {
      const groupRows = rows.filter((r) => r.group === group);
      const groupTotal = groupRows.reduce((s, r) => s + (r.closingType === "DR" ? r.closingBalance : r.closingBalance), 0);
      return (
        <div key={group} className="space-y-0.5">
          <div className="text-[11px] font-black text-muted-foreground uppercase tracking-wide px-1">
            {GROUP_LABELS[group] ?? group.replace(/_/g, " ")}
          </div>
          {groupRows.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs px-2">
              <span className="text-foreground">{r.name}</span>
              <span className="font-mono">{fmt(r.closingBalance)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs px-2 pt-1 border-t border-border/40">
            <span className="font-bold text-foreground">{GROUP_LABELS[group] ?? group} Total</span>
            <span className="font-mono font-bold">{fmt(groupTotal)}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="size-5 text-brand" />
          Balance Sheet
          {isBalanced
            ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Balanced ✓</Badge>
            : <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">Unbalanced !</Badge>
          }
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{companyName} · As on 31st March {financialYear.split("-")[1]}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30 text-center">
          <h3 className="text-sm font-black text-foreground">{companyName}</h3>
          <p className="text-xs text-muted-foreground font-semibold">Balance Sheet as at 31st March {financialYear.split("-")[1]}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* LEFT: Liabilities */}
          <div className="p-5 space-y-4">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border/50 pb-1.5">
              Liabilities
            </h4>
            <div className="space-y-4">
              {data.liabilities.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No liability ledgers posted yet</p>
              ) : (
                renderRows(data.liabilities)
              )}
            </div>
            <div className="pt-3 border-t-2 border-foreground flex items-center justify-between text-xs font-black">
              <span>Total Liabilities</span>
              <span className="font-mono text-emerald-600">{fmt(data.totalLiabilities)}</span>
            </div>
          </div>

          {/* RIGHT: Assets */}
          <div className="p-5 space-y-4">
            <h4 className="text-xs font-black text-foreground uppercase tracking-wider border-b border-border/50 pb-1.5">
              Assets
            </h4>
            <div className="space-y-4">
              {data.assets.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No asset ledgers posted yet. Post a Receipt or Sales voucher to see balances here.</p>
              ) : (
                renderRows(data.assets)
              )}
            </div>
            <div className="pt-3 border-t-2 border-foreground flex items-center justify-between text-xs font-black">
              <span>Total Assets</span>
              <span className="font-mono text-rose-600">{fmt(data.totalAssets)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isBalanced && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-3 text-xs text-amber-600 flex items-center gap-2">
          <span className="font-bold">Note:</span>
          Balance sheet shows an imbalance of {fmt(Math.abs(data.totalAssets - data.totalLiabilities))} — post more journal vouchers or add opening balances to ledgers to balance the accounts.
        </div>
      )}
    </div>
  );
}
