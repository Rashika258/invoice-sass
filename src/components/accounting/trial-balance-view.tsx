"use client";

import { Scale, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TrialRow = {
  id: string;
  name: string;
  group: string;
  openingDr: number;
  openingCr: number;
  periodDr: number;
  periodCr: number;
  closingBalance: number;
  closingType: "DR" | "CR";
};

const GROUP_LABELS: Record<string, string> = {
  CASH_IN_HAND: "Cash in Hand", BANK_ACCOUNTS: "Bank Accounts",
  SUNDRY_DEBTORS: "Sundry Debtors", FIXED_ASSETS: "Fixed Assets",
  CURRENT_ASSETS: "Current Assets", LOANS_ADVANCES_ASSET: "Loans & Advances",
  SUNDRY_CREDITORS: "Sundry Creditors", CURRENT_LIABILITIES: "Current Liabilities",
  LOANS_LIABILITY: "Loans (Liability)", CAPITAL_ACCOUNT: "Capital Account",
  RESERVES_SURPLUS: "Reserves & Surplus", SALES_ACCOUNTS: "Sales Accounts",
  DIRECT_INCOME: "Direct Income", INDIRECT_INCOME: "Indirect Income",
  PURCHASE_ACCOUNTS: "Purchase Accounts", DIRECT_EXPENSES: "Direct Expenses",
  INDIRECT_EXPENSES: "Indirect Expenses", DUTIES_TAXES: "Duties & Taxes",
  BRANCH_DIVISIONS: "Branch/Divisions",
};

const fmt = (n: number) => n === 0 ? "—" : `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

interface TrialBalanceViewProps {
  rows: TrialRow[];
}

export function TrialBalanceView({ rows }: TrialBalanceViewProps) {
  const totalOpenDr = rows.reduce((s, r) => s + r.openingDr, 0);
  const totalOpenCr = rows.reduce((s, r) => s + r.openingCr, 0);
  const totalPeriodDr = rows.reduce((s, r) => s + r.periodDr, 0);
  const totalPeriodCr = rows.reduce((s, r) => s + r.periodCr, 0);
  const totalCloseDr = rows.filter((r) => r.closingType === "DR").reduce((s, r) => s + r.closingBalance, 0);
  const totalCloseCr = rows.filter((r) => r.closingType === "CR").reduce((s, r) => s + r.closingBalance, 0);

  const isBalanced = Math.abs(totalCloseDr - totalCloseCr) < 1;

  const downloadCsv = () => {
    const header = "Ledger,Group,Opening Dr,Opening Cr,Period Dr,Period Cr,Closing Dr,Closing Cr\n";
    const body = rows.map((r) => [
      `"${r.name}"`, `"${GROUP_LABELS[r.group] ?? r.group}"`,
      r.openingDr.toFixed(2), r.openingCr.toFixed(2),
      r.periodDr.toFixed(2), r.periodCr.toFixed(2),
      r.closingType === "DR" ? r.closingBalance.toFixed(2) : "0.00",
      r.closingType === "CR" ? r.closingBalance.toFixed(2) : "0.00",
    ].join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "trial_balance.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Scale className="size-5 text-brand" />
            Trial Balance
            {isBalanced
              ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">Balanced ✓</Badge>
              : <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold">Out of Balance !</Badge>
            }
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Dr/Cr position of every ledger account</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCsv} className="text-xs rounded-xl border-border">
          <Download className="mr-1.5 size-3.5" /> Export CSV
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="py-2.5 px-4 text-left font-bold text-muted-foreground">Ledger Account</th>
              <th className="py-2.5 px-4 text-left font-bold text-muted-foreground">Group</th>
              <th className="py-2.5 px-4 text-right font-bold text-rose-500">Opening Dr</th>
              <th className="py-2.5 px-4 text-right font-bold text-emerald-500">Opening Cr</th>
              <th className="py-2.5 px-4 text-right font-bold text-rose-500">Period Dr</th>
              <th className="py-2.5 px-4 text-right font-bold text-emerald-500">Period Cr</th>
              <th className="py-2.5 px-4 text-right font-bold text-rose-500">Closing Dr</th>
              <th className="py-2.5 px-4 text-right font-bold text-emerald-500">Closing Cr</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-2 px-4 font-semibold text-foreground">{r.name}</td>
                <td className="py-2 px-4 text-muted-foreground">{GROUP_LABELS[r.group] ?? r.group}</td>
                <td className="py-2 px-4 text-right font-mono text-rose-600">{fmt(r.openingDr)}</td>
                <td className="py-2 px-4 text-right font-mono text-emerald-600">{fmt(r.openingCr)}</td>
                <td className="py-2 px-4 text-right font-mono text-rose-600">{fmt(r.periodDr)}</td>
                <td className="py-2 px-4 text-right font-mono text-emerald-600">{fmt(r.periodCr)}</td>
                <td className="py-2 px-4 text-right font-mono font-bold text-rose-600">
                  {r.closingType === "DR" ? fmt(r.closingBalance) : "—"}
                </td>
                <td className="py-2 px-4 text-right font-mono font-bold text-emerald-600">
                  {r.closingType === "CR" ? fmt(r.closingBalance) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/40 border-t-2 border-border">
            <tr className="font-black text-foreground">
              <td className="py-3 px-4" colSpan={2}>Grand Total</td>
              <td className="py-3 px-4 text-right font-mono text-rose-600">{fmt(totalOpenDr)}</td>
              <td className="py-3 px-4 text-right font-mono text-emerald-600">{fmt(totalOpenCr)}</td>
              <td className="py-3 px-4 text-right font-mono text-rose-600">{fmt(totalPeriodDr)}</td>
              <td className="py-3 px-4 text-right font-mono text-emerald-600">{fmt(totalPeriodCr)}</td>
              <td className="py-3 px-4 text-right font-mono text-rose-600">{fmt(totalCloseDr)}</td>
              <td className="py-3 px-4 text-right font-mono text-emerald-600">{fmt(totalCloseCr)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
