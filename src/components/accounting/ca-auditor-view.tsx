"use client";

import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck,
  FileJson,
  FileSpreadsheet,
  FileText,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/invoice-utils";

type CaPortalData = {
  profile: {
    companyName: string;
    gstin: string;
    address: string;
    state: string;
    email: string;
  };
  gstr1: {
    b2bCount: number;
    b2bTaxable: number;
    b2cCount: number;
    b2cTaxable: number;
    totalTaxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
    hsnSummary: Array<{
      hsn: string;
      description: string;
      uqc: string;
      totalQty: number;
      totalVal: number;
      taxableVal: number;
      igst: number;
      cgst: number;
      sgst: number;
    }>;
    b2bInvoices: Array<{
      id: string;
      invoiceNumber: string;
      customerName: string;
      gstin?: string | null;
      date: Date | string;
      taxable: number;
      tax: number;
      total: number;
      placeOfSupply: string;
    }>;
  };
  gstr3b: {
    outwardTaxableSupplies: number;
    outwardTax: number;
    eligibleItc: number;
    itcCgst: number;
    itcSgst: number;
    itcIgst: number;
    netTaxPayable: number;
  };
  financialStatements: {
    totalRevenue: number;
    costOfPurchases: number;
    grossProfit: number;
    expenses: number;
    netProfit: number;
    balanceSheet: {
      currentAssets: {
        cashAndBank: number;
        debtorsReceivables: number;
        closingStockValue: number;
        totalAssets: number;
      };
      currentLiabilities: {
        creditorsPayables: number;
        gstPayable: number;
        totalLiabilities: number;
      };
    };
  };
};

export function CaAuditorView({ data }: { data: CaPortalData }) {
  const [activeTab, setActiveTab] = useState<"GSTR1" | "GSTR3B" | "PNL" | "BALANCE_SHEET">("GSTR1");
  const currency = "INR";

  // 1-Click JSON Export for GST Offline Utility
  const handleExportGstr1Json = () => {
    const payload = {
      gstin: data.profile.gstin,
      fp: "082026",
      gt: data.gstr1.totalTaxable,
      cur_gt: data.gstr1.totalTaxable,
      b2b: data.gstr1.b2bInvoices.map((inv) => ({
        ctin: inv.gstin || "29AABCU9603R1ZM",
        inv: [
          {
            inum: inv.invoiceNumber,
            idt: new Date(inv.date).toISOString().split("T")[0],
            val: inv.total,
            pos: inv.placeOfSupply.split("-")[0] || "29",
            rchrg: "N",
            inv_typ: "R",
            itms: [
              {
                num: 1,
                itm_det: {
                  txval: inv.taxable,
                  rt: 18,
                  iamt: 0,
                  camt: inv.tax / 2,
                  samt: inv.tax / 2,
                  csamt: 0,
                },
              },
            ],
          },
        ],
      })),
      hsn: {
        data: data.gstr1.hsnSummary,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_${data.profile.gstin}_AUG2026.json`;
    a.click();
    toast.success("GSTR-1 JSON downloaded successfully for GST Portal upload!");
  };

  // 1-Click CSV / Excel Export
  const handleExportCsv = () => {
    let csv = "Invoice Number,Customer Name,Customer GSTIN,Date,Taxable Value,Tax Amount,Total Invoice Value,Place of Supply\n";
    data.gstr1.b2bInvoices.forEach((inv) => {
      csv += `"${inv.invoiceNumber}","${inv.customerName}","${inv.gstin || ""}","${new Date(inv.date).toLocaleDateString()}","${inv.taxable}","${inv.tax}","${inv.total}","${inv.placeOfSupply}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GSTR1_B2B_Audit_${data.profile.gstin}.csv`;
    a.click();
    toast.success("CA Audit CSV Exported!");
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner: Auditor Remote Access Header */}
      <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  CA &amp; Tax Auditor Remote Portal
                </h1>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                  <Lock className="size-3" />
                  Read-Only Auditor Mode
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.profile.companyName} • GSTIN: <strong className="font-mono text-foreground">{data.profile.gstin}</strong> • Period: FY 2025-26
              </p>
            </div>
          </div>

          {/* Quick Action Exports */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              className="h-8 text-xs font-semibold rounded-xl border-border bg-card hover:bg-muted"
            >
              <FileSpreadsheet className="size-3.5 mr-1.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExportGstr1Json}
              className="h-8 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
            >
              <FileJson className="size-3.5 mr-1.5" />
              <span>GSTR-1 JSON (Govt Portal)</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="h-8 text-xs font-semibold rounded-xl border-border bg-card"
            >
              <Printer className="size-3.5 mr-1.5" />
              <span>Print Pack</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("GSTR1")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "GSTR1"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileText className="size-3.5" />
          <span>GSTR-1 Outward Supplies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("GSTR3B")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "GSTR3B"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <FileCheck className="size-3.5" />
          <span>GSTR-3B Tax &amp; ITC Computation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PNL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "PNL"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ArrowUpRight className="size-3.5" />
          <span>Profit &amp; Loss Statement</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("BALANCE_SHEET")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "BALANCE_SHEET"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>Balance Sheet</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: GSTR-1 VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "GSTR1" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="p-4 pb-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Taxable Turnover
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xl font-bold font-mono text-foreground">
                  {formatCurrency(data.gstr1.totalTaxable, currency)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  B2B ({data.gstr1.b2bCount}) + B2C ({data.gstr1.b2cCount})
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="p-4 pb-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  CGST Outward
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xl font-bold font-mono text-foreground">
                  {formatCurrency(data.gstr1.cgst, currency)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Central Tax</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="p-4 pb-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  SGST Outward
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xl font-bold font-mono text-foreground">
                  {formatCurrency(data.gstr1.sgst, currency)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">State Tax</p>
              </CardContent>
            </Card>

            <Card className="rounded-xl border shadow-xs">
              <CardHeader className="p-4 pb-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Total GST Output
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.gstr1.totalTax, currency)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">IGST + CGST + SGST</p>
              </CardContent>
            </Card>
          </div>

          {/* Section 4A: B2B Invoices Table */}
          <Card className="rounded-xl border shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-card flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  Table 4A: Taxable Outward Supplies to Registered Persons (B2B)
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Verified invoices with valid customer GSTIN numbers.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                {data.gstr1.b2bInvoices.length} Invoices
              </Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-3">GSTIN of Recipient</th>
                    <th className="p-3">Receiver Name</th>
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">Total Tax</th>
                    <th className="p-3 text-right">Invoice Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.gstr1.b2bInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="p-3 font-mono font-bold text-foreground">{inv.gstin}</td>
                      <td className="p-3 font-medium">{inv.customerName}</td>
                      <td className="p-3 font-mono text-primary font-semibold">{inv.invoiceNumber}</td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(inv.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right font-mono">{formatCurrency(inv.taxable, currency)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(inv.tax, currency)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(inv.total, currency)}</td>
                    </tr>
                  ))}
                  {data.gstr1.b2bInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No B2B invoices recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Section 12: HSN Summary */}
          <Card className="rounded-xl border shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-card">
              <CardTitle className="text-sm font-bold">
                Table 12: HSN-wise Summary of Outward Supplies
              </CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b">
                  <tr>
                    <th className="p-3">HSN Code</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">UQC</th>
                    <th className="p-3 text-right">Total Qty</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">CGST</th>
                    <th className="p-3 text-right">SGST</th>
                    <th className="p-3 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.gstr1.hsnSummary.map((hsn) => (
                    <tr key={hsn.hsn} className="hover:bg-muted/30">
                      <td className="p-3 font-mono font-bold text-foreground">{hsn.hsn}</td>
                      <td className="p-3">{hsn.description}</td>
                      <td className="p-3 font-mono">{hsn.uqc}</td>
                      <td className="p-3 text-right font-mono">{hsn.totalQty}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(hsn.taxableVal, currency)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(hsn.cgst, currency)}</td>
                      <td className="p-3 text-right font-mono">{formatCurrency(hsn.sgst, currency)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(hsn.totalVal, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: GSTR-3B VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "GSTR3B" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-xl border p-4 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">3.1 Total Tax on Outward Supplies</span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(data.gstr3b.outwardTax, currency)}
              </div>
              <p className="text-[10px] text-muted-foreground">Liability from customer billings</p>
            </Card>

            <Card className="rounded-xl border p-4 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">4.0 Eligible Input Tax Credit (ITC)</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.gstr3b.eligibleItc, currency)}
              </div>
              <p className="text-[10px] text-muted-foreground">ITC available from registered supplier purchases</p>
            </Card>

            <Card className="rounded-xl border p-4 space-y-1 bg-primary/5 border-primary/20">
              <span className="text-xs font-semibold text-primary">6.1 Net Tax Payable in Cash</span>
              <div className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(data.gstr3b.netTaxPayable, currency)}
              </div>
              <p className="text-[10px] text-muted-foreground">Total Output Tax minus Eligible ITC</p>
            </Card>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PROFIT & LOSS STATEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "PNL" && (
        <Card className="rounded-xl border shadow-xs max-w-3xl mx-auto overflow-hidden">
          <CardHeader className="p-5 border-b bg-card text-center">
            <h3 className="font-bold text-base text-foreground">Profit &amp; Loss Statement</h3>
            <p className="text-xs text-muted-foreground">
              For Sri Manjunatha Engineering Works • Period ending August 2026
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="font-sans font-bold text-foreground">A. Revenue from Operations (Net Sales)</span>
              <span className="font-bold text-foreground">{formatCurrency(data.financialStatements.totalRevenue, currency)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border text-muted-foreground">
              <span className="font-sans">B. Less: Cost of Goods Purchased (Net Purchases)</span>
              <span>({formatCurrency(data.financialStatements.costOfPurchases, currency)})</span>
            </div>

            <div className="flex justify-between py-2.5 bg-muted/40 px-3 rounded-lg font-bold text-foreground">
              <span className="font-sans">Gross Profit (A - B)</span>
              <span>{formatCurrency(data.financialStatements.grossProfit, currency)}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-border text-muted-foreground">
              <span className="font-sans">C. Less: Operating &amp; Administrative Expenses</span>
              <span>({formatCurrency(data.financialStatements.expenses, currency)})</span>
            </div>

            <div className="flex justify-between py-3 bg-emerald-500/10 px-3 rounded-lg font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <span className="font-sans">Net Profit / Operating Income</span>
              <span>{formatCurrency(data.financialStatements.netProfit, currency)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: BALANCE SHEET */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "BALANCE_SHEET" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Assets */}
          <Card className="rounded-xl border shadow-xs">
            <CardHeader className="p-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-bold text-foreground">Current Assets</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-muted-foreground">Cash &amp; Bank Balances</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentAssets.cashAndBank, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-muted-foreground">Sundry Debtors (Receivables)</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentAssets.debtorsReceivables, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-muted-foreground">Closing Stock / Inventory Value</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentAssets.closingStockValue, currency)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold text-foreground font-mono">
                <span className="font-sans">Total Assets</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentAssets.totalAssets, currency)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Liabilities */}
          <Card className="rounded-xl border shadow-xs">
            <CardHeader className="p-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-bold text-foreground">Current Liabilities &amp; Equities</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="font-sans text-muted-foreground">Sundry Creditors (Payables)</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentLiabilities.creditorsPayables, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-sans text-muted-foreground">GST Output Tax Payable</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentLiabilities.gstPayable, currency)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold text-foreground font-mono">
                <span className="font-sans">Total Current Liabilities</span>
                <span>{formatCurrency(data.financialStatements.balanceSheet.currentLiabilities.totalLiabilities, currency)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
