"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Landmark,
  Building2,
  Coins,
  Users,
  Receipt,
  Briefcase,
  TrendingUp,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Printer,
  Download,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  BarChart3,
  Calendar,
  Columns2,
  Rows3,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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

const GROUP_META: Record<string, { label: string; icon: any; color: string; desc: string }> = {
  CASH_IN_HAND: {
    label: "Cash in Hand",
    icon: Coins,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    desc: "Physical vault, register & counter cash",
  },
  BANK_ACCOUNTS: {
    label: "Bank Accounts",
    icon: Building2,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    desc: "Current, savings & overdraft bank accounts",
  },
  SUNDRY_DEBTORS: {
    label: "Sundry Debtors",
    icon: Users,
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    desc: "Accounts receivable from customer billings",
  },
  FIXED_ASSETS: {
    label: "Fixed Assets",
    icon: Landmark,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    desc: "Machinery, computers, equipment & office property",
  },
  CURRENT_ASSETS: {
    label: "Current Assets",
    icon: Layers,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    desc: "Inventory stock & short-term liquid assets",
  },
  LOANS_ADVANCES_ASSET: {
    label: "Loans & Advances (Asset)",
    icon: FileSpreadsheet,
    color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
    desc: "Security deposits & staff salary advances",
  },
  SUNDRY_CREDITORS: {
    label: "Sundry Creditors",
    icon: Users,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    desc: "Accounts payable to vendors and raw material suppliers",
  },
  CURRENT_LIABILITIES: {
    label: "Current Liabilities",
    icon: Clock,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    desc: "Short-term dues payable within 12 months",
  },
  LOANS_LIABILITY: {
    label: "Loans (Liability)",
    icon: AlertTriangle,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    desc: "Secured bank loans & NBFC borrowings",
  },
  CAPITAL_ACCOUNT: {
    label: "Capital Account",
    icon: Briefcase,
    color: "text-primary bg-primary/10 border-primary/20",
    desc: "Promoter share capital and initial equity",
  },
  RESERVES_SURPLUS: {
    label: "Reserves & Surplus",
    icon: TrendingUp,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    desc: "Retained business profits and general reserves",
  },
  DUTIES_TAXES: {
    label: "Duties & Taxes",
    icon: Receipt,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    desc: "GST Input Tax Credit & Output liability balances",
  },
};

const fmt = (n: number) => `₹${Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function BalanceSheetView({ data, companyName, financialYear }: BalanceSheetViewProps) {
  const [layoutMode, setLayoutMode] = useState<"T_FORMAT" | "SCHEDULE_III">("T_FORMAT");
  const [searchQuery, setSearchQuery] = useState("");

  const difference = Math.abs(data.totalAssets - data.totalLiabilities);
  const isBalanced = difference < 1;

  // Filter rows based on search
  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return data.assets;
    const q = searchQuery.toLowerCase();
    return data.assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (GROUP_META[a.group]?.label || a.group).toLowerCase().includes(q)
    );
  }, [data.assets, searchQuery]);

  const filteredLiabilities = useMemo(() => {
    if (!searchQuery.trim()) return data.liabilities;
    const q = searchQuery.toLowerCase();
    return data.liabilities.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (GROUP_META[l.group]?.label || l.group).toLowerCase().includes(q)
    );
  }, [data.liabilities, searchQuery]);

  // Working Capital calculation
  const currentAssetGroups = ["CASH_IN_HAND", "BANK_ACCOUNTS", "SUNDRY_DEBTORS", "CURRENT_ASSETS", "LOANS_ADVANCES_ASSET"];
  const currentLiabGroups = ["SUNDRY_CREDITORS", "CURRENT_LIABILITIES", "DUTIES_TAXES"];

  const currentAssetsTotal = data.assets
    .filter((a) => currentAssetGroups.includes(a.group))
    .reduce((s, a) => s + a.closingBalance, 0);

  const currentLiabTotal = data.liabilities
    .filter((l) => currentLiabGroups.includes(l.group))
    .reduce((s, l) => s + l.closingBalance, 0);

  const workingCapital = currentAssetsTotal - currentLiabTotal;

  // CSV Export Handler
  const handleExportCsv = () => {
    const lines = [
      `"Balance Sheet - ${companyName}"`,
      `"As on 31st March ${financialYear.split("-")[1] || "2026"}"`,
      `"Generated on ${new Date().toLocaleDateString("en-IN")}"`,
      "",
      `"SECTION","GROUP","LEDGER NAME","CLOSING BALANCE (INR)"`,
      ...data.liabilities.map(
        (l) => `"LIABILITIES","${GROUP_META[l.group]?.label || l.group}","${l.name.replace(/"/g, '""')}",${l.closingBalance.toFixed(2)}`
      ),
      `"LIABILITIES","TOTAL LIABILITIES","",${data.totalLiabilities.toFixed(2)}`,
      "",
      ...data.assets.map(
        (a) => `"ASSETS","${GROUP_META[a.group]?.label || a.group}","${a.name.replace(/"/g, '""')}",${a.closingBalance.toFixed(2)}`
      ),
      `"ASSETS","TOTAL ASSETS","",${data.totalAssets.toFixed(2)}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Balance_Sheet_${companyName.replace(/\s+/g, "_")}_FY${financialYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGroupCards = (rows: TrialRow[], sectionType: "ASSET" | "LIABILITY") => {
    const groups = [...new Set(rows.map((r) => r.group))];

    if (groups.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center bg-muted/10">
          <Scale className="size-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-xs font-semibold text-foreground">
            {searchQuery ? "No matching ledgers found" : `No ${sectionType.toLowerCase()} ledgers recorded`}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {sectionType === "ASSET"
              ? "Post sales invoices, customer receipts, or bank transfers to view assets."
              : "Post purchase bills, vendor payments, or GST vouchers to view liabilities."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3.5">
        {groups.map((group) => {
          const groupRows = rows.filter((r) => r.group === group);
          const groupTotal = groupRows.reduce((s, r) => s + r.closingBalance, 0);
          const meta = GROUP_META[group] ?? {
            label: group.replace(/_/g, " "),
            icon: Scale,
            color: "text-primary bg-primary/10 border-primary/20",
            desc: "Ledger account group",
          };
          const Icon = meta.icon;

          return (
            <div
              key={group}
              className="rounded-2xl border border-border/70 bg-card shadow-2xs hover:border-border transition-all overflow-hidden"
            >
              {/* Group Header */}
              <div className="px-4 py-2.5 bg-muted/30 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg border ${meta.color} shrink-0`}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded-md">
                        {groupRows.length} {groupRows.length === 1 ? "a/c" : "a/cs"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                    {fmt(groupTotal)}
                  </span>
                </div>
              </div>

              {/* Group Items Table */}
              <div className="divide-y divide-border/40">
                {groupRows.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-4 py-2 text-xs hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      <span className="text-foreground/90 font-medium truncate">
                        {r.name}
                      </span>
                    </div>
                    <span className="font-mono text-muted-foreground group-hover:text-foreground font-semibold shrink-0 ml-2">
                      {fmt(r.closingBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. TOP HEADER & AUDIT BADGES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Balance Sheet
                </h1>
                {isBalanced ? (
                  <Badge className="bg-primary/15 text-primary border border-primary/30 font-mono text-[10px] font-bold gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>Balanced Invariant ✓</span>
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono text-[10px] font-bold gap-1">
                    <AlertTriangle className="size-3" />
                    <span>Imbalance: {fmt(difference)}</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{companyName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  As on 31st March {financialYear.split("-")[1] || "2026"}
                </span>
                <span>•</span>
                <span className="font-mono text-[11px]">FY {financialYear}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="inline-flex rounded-xl border border-border bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setLayoutMode("T_FORMAT")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === "T_FORMAT"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns2 className="size-3.5" />
              <span>Two-Column (T-Account)</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("SCHEDULE_III")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                layoutMode === "SCHEDULE_III"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Rows3 className="size-3.5" />
              <span>Schedule III (Vertical)</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-border hover:bg-muted cursor-pointer"
          >
            <Download className="size-3.5 text-primary" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 rounded-xl text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* 2. STATS & EQUILIBRIUM KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 print:hidden">
        {/* Total Assets */}
        <Card className="rounded-2xl border border-border bg-linear-to-br from-card via-card to-blue-500/5 shadow-2xs p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Assets
            </span>
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Landmark className="size-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {fmt(data.totalAssets)}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Property &amp; Economic Resources</span>
            <span className="font-mono font-semibold">{data.assets.length} ledgers</span>
          </p>
        </Card>

        {/* Total Liabilities */}
        <Card className="rounded-2xl border border-border bg-linear-to-br from-card via-card to-purple-500/5 shadow-2xs p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Liabilities
            </span>
            <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {fmt(data.totalLiabilities)}
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Capital, Dues &amp; Obligations</span>
            <span className="font-mono font-semibold">{data.liabilities.length} ledgers</span>
          </p>
        </Card>

        {/* Net Working Capital */}
        <Card className="rounded-2xl border border-border bg-linear-to-br from-card via-card to-emerald-500/5 shadow-2xs p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Working Capital
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="size-4" />
            </div>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              workingCapital >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {workingCapital >= 0 ? "+" : ""}
            {fmt(workingCapital)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Current Assets minus Current Liabilities
          </p>
        </Card>

        {/* Audit Verification */}
        <Card className="rounded-2xl border border-border bg-linear-to-br from-card via-card to-primary/5 shadow-2xs p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Audit Equilibrium
            </span>
            <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Scale className="size-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">
            {isBalanced ? "100.0% EQUAL" : `${fmt(difference)} DIFF`}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isBalanced
              ? "Dual-entry accounting invariant verified"
              : "Imbalance detected — adjust journal opening balances"}
          </p>
        </Card>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="flex items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter ledgers or groups (e.g. CGST, Cash, Debtors)..."
            className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
          />
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Search
          </Button>
        )}
      </div>

      {/* 4. MAIN BALANCE SHEET STATEMENT CARD */}
      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Formal Statement Letterhead Header */}
        <div className="p-6 bg-linear-to-b from-muted/40 via-muted/20 to-transparent border-b border-border/80 text-center space-y-1.5 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 mb-1">
            <ShieldCheck className="size-3" />
            <span>Audited Statutory Financial Statement · Indian GAAP / Ind AS</span>
          </div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            {companyName}
          </h2>
          <p className="text-xs font-semibold text-muted-foreground">
            Balance Sheet as at 31st March {financialYear.split("-")[1] || "2026"}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground/80">
            (Amounts stated in Indian Rupees · ₹)
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT 1: TWO-COLUMN T-ACCOUNT FORMAT (Traditional Vyapar/Tally) */}
        {/* ------------------------------------------------------------- */}
        {layoutMode === "T_FORMAT" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
            {/* LEFT COLUMN: LIABILITIES & CAPITAL */}
            <div className="p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Briefcase className="size-3.5 text-primary" />
                      <span>Capital &amp; Liabilities</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Sources of Enterprise Funds &amp; Obligations
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {filteredLiabilities.length} Accounts
                  </Badge>
                </div>

                {renderGroupCards(filteredLiabilities, "LIABILITY")}
              </div>

              {/* Total Liabilities Grand Footer */}
              <div className="pt-4 border-t-2 border-border border-b-4 border-double border-primary/40 bg-muted/10 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground block">
                    Total Liabilities &amp; Capital
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Indian GAAP Schedule VI
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-primary">
                    {fmt(data.totalLiabilities)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ASSETS & PROPERTY */}
            <div className="p-6 flex flex-col justify-between space-y-6 bg-muted/[0.02]">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Landmark className="size-3.5 text-primary" />
                      <span>Property &amp; Assets</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Application of Funds &amp; Economic Resources
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {filteredAssets.length} Accounts
                  </Badge>
                </div>

                {renderGroupCards(filteredAssets, "ASSET")}
              </div>

              {/* Total Assets Grand Footer */}
              <div className="pt-4 border-t-2 border-border border-b-4 border-double border-primary/40 bg-muted/10 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-foreground block">
                    Total Property &amp; Assets
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Indian GAAP Schedule VI
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-lg font-black text-primary">
                    {fmt(data.totalAssets)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* LAYOUT 2: SCHEDULE III CORPORATE VERTICAL FORMAT (MCA India) */
          /* ------------------------------------------------------------- */
          <div className="p-6 sm:p-8 space-y-8">
            {/* PART I: EQUITY & LIABILITIES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary pb-2">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                    I
                  </span>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Equity &amp; Liabilities
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Shareholders&apos; funds, non-current &amp; current liabilities
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  Particulars &amp; Group Notes
                </span>
              </div>

              {renderGroupCards(filteredLiabilities, "LIABILITY")}

              <div className="pt-3 border-t-2 border-border flex items-center justify-between bg-muted/20 p-3 rounded-xl">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Total Equity &amp; Liabilities (I)
                </span>
                <span className="font-mono text-base font-black text-primary">
                  {fmt(data.totalLiabilities)}
                </span>
              </div>
            </div>

            {/* PART II: ASSETS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-primary pb-2">
                <div className="flex items-center gap-2">
                  <span className="size-6 rounded-md bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                    II
                  </span>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                      Assets
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Non-current assets &amp; current assets (Cash, Bank, Debtors)
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  Particulars &amp; Group Notes
                </span>
              </div>

              {renderGroupCards(filteredAssets, "ASSET")}

              <div className="pt-3 border-t-2 border-border border-b-4 border-double border-primary/40 flex items-center justify-between bg-muted/20 p-3 rounded-xl">
                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                  Total Assets (II)
                </span>
                <span className="font-mono text-base font-black text-primary">
                  {fmt(data.totalAssets)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Equilibrium Verification Bar */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <>
                <CheckCircle2 className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">
                  Accounting Invariant Verified: Both columns match with zero discrepancy.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  Note: Imbalance of {fmt(difference)} detected between Assets and Liabilities.
                </span>
              </>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground font-mono">
            Generated via Billora Double-Entry Engine · FY {financialYear}
          </div>
        </div>
      </div>
    </div>
  );
}
