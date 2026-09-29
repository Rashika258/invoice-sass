"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  Receipt,
  Scale,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";
import { DateRangePicker, type DatePresetKey } from "@/components/ui/date-range-picker";
import {
  exportSaleReport,
  exportPurchaseReport,
  exportPartyStatement,
  exportDaybookReport,
  exportPnlReport,
  exportGstr1Report,
} from "@/lib/excel-export";

type ReportType =
  // Transaction reports
  | "sale"
  | "purchase"
  | "daybook"
  | "all_tx"
  | "pnl"
  | "bill_profit"
  | "cashflow"
  | "trial_balance"
  | "balance_sheet"
  // Party reports
  | "party_statement"
  | "all_parties"
  // GST reports
  | "gstr1"
  | "gstr2"
  | "gstr3b";

export function ReportsExplorer({
  summary,
  parties,
  billWise,
  dayBook,
  currency = "INR",
  companyName = "My Business",
  taxId,
  phone,
  address,
}: {
  summary: any;
  parties: any[];
  billWise: any[];
  dayBook: any;
  currency?: string;
  companyName?: string;
  taxId?: string | null;
  phone?: string | null;
  address?: string | null;
}) {
  const [activeReport, setActiveReport] = useState<ReportType>("sale");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || "");
  const [datePreset, setDatePreset] = useState<DatePresetKey>("THIS_MONTH");
  const [startDate, setStartDate] = useState<string>(() =>
    format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState<string>(() =>
    format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), "yyyy-MM-dd")
  );

  const activeParty = parties.find((p) => p.id === selectedPartyId) || parties[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (activeReport === "sale" || activeReport === "bill_profit") {
      exportSaleReport(summary?.sales || []);
    } else if (activeReport === "purchase") {
      exportPurchaseReport(summary?.purchases || []);
    } else if (activeReport === "daybook" && dayBook?.invoices) {
      exportDaybookReport(dayBook.invoices);
    } else if (activeReport === "pnl" || activeReport === "trial_balance" || activeReport === "balance_sheet") {
      exportPnlReport(summary);
    } else if (activeReport === "gstr1" || activeReport === "gstr2" || activeReport === "gstr3b") {
      exportGstr1Report(summary?.sales || []);
    } else if (activeReport === "all_parties" || activeReport === "party_statement") {
      exportPartyStatement(parties || []);
    } else {
      exportSaleReport(summary?.sales || []);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[750px] print:block print:min-h-0 print:gap-0">
      {/* Left Submenu matching media_1788511617186.png - Hidden during print */}
      <div className="w-full lg:w-64 shrink-0 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs space-y-4 print:hidden">
        {/* Group 1: Transaction Report */}
        <div>
          <h3 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
            Transaction report
          </h3>
          <div className="space-y-0.5">
            {[
              { id: "sale", label: "Sale", icon: FileText },
              { id: "purchase", label: "Purchase", icon: Receipt },
              { id: "daybook", label: "Day book", icon: Calendar },
              { id: "all_tx", label: "All Transactions", icon: FileSpreadsheet },
              { id: "pnl", label: "Profit And Loss", icon: BarChart3 },
              { id: "bill_profit", label: "Bill Wise Profit", icon: Scale },
              { id: "cashflow", label: "Cash flow", icon: Wallet },
              { id: "trial_balance", label: "Trial Balance Report", icon: Scale },
              { id: "balance_sheet", label: "Balance Sheet", icon: FileCheck },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveReport(item.id as ReportType)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeReport === item.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {activeReport === item.id && <ChevronRight className="size-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Group 2: Party Report */}
        <div className="pt-2 border-t border-border/60">
          <h3 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
            Party report
          </h3>
          <div className="space-y-0.5">
            {[
              { id: "party_statement", label: "Party Statement", icon: Users },
              { id: "all_parties", label: "All parties (Ledger)", icon: Users },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveReport(item.id as ReportType)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeReport === item.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {activeReport === item.id && <ChevronRight className="size-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Group 3: GST Reports */}
        <div className="pt-2 border-t border-border/60">
          <h3 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">
            GST reports
          </h3>
          <div className="space-y-0.5">
            {[
              { id: "gstr1", label: "GSTR 1 (Outward)", icon: FileText },
              { id: "gstr2", label: "GSTR 2 (Inward)", icon: Receipt },
              { id: "gstr3b", label: "GSTR 3 B (Summary)", icon: BarChart3 },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveReport(item.id as ReportType)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  activeReport === item.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>{item.label}</span>
                {activeReport === item.id && <ChevronRight className="size-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Report Content Viewer */}
      <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-5 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black print:space-y-4">
        {/* On-Screen Action Bar - Hidden in Print */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-4 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-foreground capitalize">
              {activeReport.replace(/_/g, " ")} Report
            </h2>
            <p className="text-xs text-muted-foreground">
              Official GST &amp; accounting breakdown for financial compliance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/analytics">
              <Button size="sm" className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs">
                <TrendingUp className="size-3.5" />
                Interactive Analytics &amp; Graphs
              </Button>
            </Link>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              activePreset={datePreset}
              onRangeChange={(start, end, preset) => {
                setStartDate(start);
                setEndDate(end);
                if (preset) setDatePreset(preset);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer"
            >
              <Printer className="mr-1.5 size-3.5 text-primary" />
              <span>Print PDF Report</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-8 text-xs font-semibold rounded-xl border-border hover:bg-muted cursor-pointer gap-1.5"
            >
              <Download className="size-3.5 text-primary" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Clean Statutory Print-Only Letterhead Header */}
        <div className="hidden print:block pb-4 mb-3 border-b-2 border-zinc-900">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
                {companyName}
              </h1>
              {taxId && <p className="text-xs font-semibold text-zinc-700">GSTIN: {taxId}</p>}
              {(address || phone) && (
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {[address, phone && `Phone: ${phone}`].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider bg-zinc-900 text-white rounded">
                {activeReport.replace(/_/g, " ")} Statement
              </span>
              <p className="text-xs font-bold text-zinc-800 mt-1.5">
                Period: {format(new Date(startDate), "dd MMM yyyy")} – {format(new Date(endDate), "dd MMM yyyy")}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Generated: {format(new Date(), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
          </div>
        </div>

        {/* 1. SALE REPORT */}
        {activeReport === "sale" && (
          <div className="space-y-4 print:space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2.5 print:mb-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Total Invoices</span>
                <p className="text-xl font-bold font-mono text-foreground mt-0.5 print:text-zinc-900">
                  {summary.sales.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Net Sales Total</span>
                <p className="text-xl font-bold font-mono text-primary mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.saleTotal, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Total GST Collected</span>
                <p className="text-xl font-bold font-mono text-foreground mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.gstOutward.totalTax, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Pending Collection</span>
                <p className="text-xl font-bold font-mono text-rose-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.toCollect, currency)}
                </p>
              </div>
            </div>

            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Bill No.</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Party Name</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Date</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Status</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Taxable</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">GST</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.sales.map((sale: any) => (
                  <TableRow key={sale.id} className="print:border-b print:border-zinc-200">
                    <TableCell className="font-mono text-xs font-semibold print:text-zinc-900 print:py-1.5 print:px-2">
                      <Link href={`/invoices/${sale.id}`} className="hover:underline text-primary print:text-zinc-900 print:no-underline">
                        {sale.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs font-medium print:text-zinc-900 print:py-1.5 print:px-2">
                      {sale.customer?.name || "Cash Customer"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                      {format(new Date(sale.issueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="print:py-1.5 print:px-2">
                      <Badge variant="outline" className="text-[10px] print:border-zinc-400 print:text-zinc-900 print:bg-transparent">
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(sale.subtotal - sale.discount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(sale.cgstAmount + sale.sgstAmount + sale.igstAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(sale.total, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 2. DAY BOOK REPORT */}
        {activeReport === "daybook" && (
          <div className="space-y-4 print:space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2.5 print:mb-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Day Sales</span>
                <p className="text-lg font-bold font-mono text-emerald-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(dayBook.totalSale, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Day Purchases</span>
                <p className="text-lg font-bold font-mono text-sky-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(dayBook.totalPurchase, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Money Received (In)</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5 print:text-zinc-900">
                  {formatCurrency(dayBook.totalIn, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Money Paid (Out)</span>
                <p className="text-lg font-bold font-mono text-rose-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(dayBook.totalOut, currency)}
                </p>
              </div>
            </div>

            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Time / Date</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Type</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Ref No.</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Party / Details</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Debit</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayBook.invoices.map((inv: any) => (
                  <TableRow key={inv.id} className="print:border-b print:border-zinc-200">
                    <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                      {format(new Date(inv.issueDate), "hh:mm a")}
                    </TableCell>
                    <TableCell className="print:py-1.5 print:px-2">
                      <Badge className="text-[10px] print:border-zinc-400 print:text-zinc-900 print:bg-transparent">{inv.documentType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold print:text-zinc-900 print:py-1.5 print:px-2">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs print:text-zinc-900 print:py-1.5 print:px-2">{inv.customer?.name || "Cash"}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-500 print:text-zinc-900 print:py-1.5 print:px-2">
                      {inv.documentType === "PURCHASE" ? formatCurrency(inv.total, currency) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-500 font-bold print:text-zinc-900 print:py-1.5 print:px-2">
                      {inv.documentType === "SALE" ? formatCurrency(inv.total, currency) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 3. PROFIT & LOSS */}
        {activeReport === "pnl" && (
          <div className="space-y-4 print:space-y-3">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 print:bg-zinc-50 print:border-zinc-300 print:p-4 print:text-zinc-900">
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Total Net Sales (Revenue)</span>
                <span className="font-mono text-emerald-500 print:text-zinc-900">{formatCurrency(summary.saleTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Less: Cost of Goods (Purchases)</span>
                <span className="font-mono text-rose-500 print:text-zinc-900">-{formatCurrency(summary.purchaseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Less: Operating Expenses</span>
                <span className="font-mono text-rose-500 print:text-zinc-900">-{formatCurrency(summary.expenseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2 print:border-t-2 print:border-zinc-900">
                <span className="print:text-zinc-900">Net Operating Profit / (Loss)</span>
                <span className={`font-mono text-lg ${summary.profit >= 0 ? "text-emerald-500" : "text-rose-500"} print:text-zinc-900`}>
                  {formatCurrency(summary.profit, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. BILL WISE PROFIT */}
        {activeReport === "bill_profit" && (
          <div className="space-y-4 print:space-y-3">
            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Bill No.</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Customer</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Date</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Sale Amount</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Estimated Cost</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Gross Profit</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billWise.map((row: any) => (
                  <TableRow key={row.id} className="print:border-b print:border-zinc-200">
                    <TableCell className="font-mono text-xs font-semibold text-primary print:text-zinc-900 print:py-1.5 print:px-2">
                      {row.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs print:text-zinc-900 print:py-1.5 print:px-2">{row.partyName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                      {format(new Date(row.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(row.saleAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                      {formatCurrency(row.costAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-500 print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(row.profit, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold print:text-zinc-900 print:py-1.5 print:px-2">
                      <Badge variant="outline" className="text-[10px] text-emerald-500 print:border-zinc-400 print:text-zinc-900 print:bg-transparent">
                        {row.marginPct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 5. PARTY STATEMENT */}
        {activeReport === "party_statement" && (
          <div className="space-y-4 print:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Select Party:</span>
                <select
                  value={selectedPartyId}
                  onChange={(e) => setSelectedPartyId(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground"
                >
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.balance, currency)})
                    </option>
                  ))}
                </select>
              </div>

              {activeParty && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className={`font-bold font-mono ${activeParty.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatCurrency(activeParty.balance, currency)}
                  </span>
                </div>
              )}
            </div>

            {activeParty && (
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 print:bg-zinc-50 print:border-zinc-300 print:text-zinc-900">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground print:text-zinc-900 print:text-sm">{activeParty.name}</span>
                  <span className="text-muted-foreground print:text-zinc-700">{activeParty.phone || "No phone"}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground print:text-zinc-600">
                  <span>GSTIN: {activeParty.taxId || "Unregistered"}</span>
                  <span>{activeParty.address || "India"}</span>
                </div>
                <div className="hidden print:flex justify-between text-xs font-bold pt-2 border-t border-zinc-300 text-zinc-900">
                  <span>Current Outstanding Balance</span>
                  <span className="font-mono">{formatCurrency(activeParty.balance, currency)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. GSTR-1 & GST RETURNS */}
        {(activeReport === "gstr1" || activeReport === "gstr2" || activeReport === "gstr3b") && (
          <div className="space-y-4 print:space-y-3">
            <div className="grid grid-cols-3 gap-3 print:grid-cols-3 print:gap-2.5 print:mb-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Taxable Turnover</span>
                <p className="text-xl font-bold font-mono mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.gstOutward.taxable, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">CGST + SGST</span>
                <p className="text-xl font-bold font-mono mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.gstOutward.cgst + summary.gstOutward.sgst, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Total GST Liability</span>
                <p className="text-xl font-bold font-mono text-primary mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.gstOutward.totalTax, currency)}
                </p>
              </div>
            </div>

            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">GST Slab Rate</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Invoices Count</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Taxable Value</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Total Tax Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.gstr1.map((row: any) => (
                  <TableRow key={row.rate} className="print:border-b print:border-zinc-200">
                    <TableCell className="font-semibold text-xs print:text-zinc-900 print:py-1.5 print:px-2">{row.rate}% GST</TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">{row.invoices}</TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(row.taxable, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-primary print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(row.tax, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 7. PURCHASE REPORT */}
        {activeReport === "purchase" && (
          <div className="space-y-4 print:space-y-3">
            <div className="grid grid-cols-3 gap-3 print:grid-cols-3 print:gap-2.5 print:mb-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Total Purchase Bills</span>
                <p className="text-xl font-bold font-mono mt-0.5 print:text-zinc-900">{summary.purchases.length}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Net Purchases Total</span>
                <p className="text-xl font-bold font-mono text-sky-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.purchaseTotal, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3 print:bg-zinc-50 print:border-zinc-300 print:p-2">
                <span className="text-[11px] text-muted-foreground print:text-zinc-600">Pending Supplier Dues</span>
                <p className="text-xl font-bold font-mono text-rose-500 mt-0.5 print:text-zinc-900">
                  {formatCurrency(summary.toPay, currency)}
                </p>
              </div>
            </div>

            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Bill No.</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Supplier</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Date</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Status</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Taxable</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Tax</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.purchases.map((pur: any) => (
                  <TableRow key={pur.id} className="print:border-b print:border-zinc-200">
                    <TableCell className="font-mono text-xs font-semibold print:text-zinc-900 print:py-1.5 print:px-2">{pur.invoiceNumber}</TableCell>
                    <TableCell className="text-xs font-medium print:text-zinc-900 print:py-1.5 print:px-2">{pur.customer?.name || "Vendor"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                      {format(new Date(pur.issueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="print:py-1.5 print:px-2">
                      <Badge variant="outline" className="text-[10px] print:border-zinc-400 print:text-zinc-900 print:bg-transparent">{pur.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(pur.subtotal - pur.discount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(pur.cgstAmount + pur.sgstAmount + pur.igstAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(pur.total, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 8. ALL TRANSACTIONS */}
        {activeReport === "all_tx" && (
          <div className="space-y-4 print:space-y-3">
            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Type</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Ref No.</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Party Name</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Date</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...summary.sales.map((s: any) => ({ ...s, doc: "SALE" })),
                  ...summary.purchases.map((p: any) => ({ ...p, doc: "PURCHASE" })),
                ]
                  .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                  .map((row: any) => (
                    <TableRow key={row.id} className="print:border-b print:border-zinc-200">
                      <TableCell className="print:py-1.5 print:px-2">
                        <Badge
                          className={`text-[10px] font-bold print:border-zinc-400 print:text-zinc-900 print:bg-transparent ${
                            row.doc === "SALE"
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-sky-500/15 text-sky-500 border-sky-500/30"
                          }`}
                        >
                          {row.doc}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold print:text-zinc-900 print:py-1.5 print:px-2">{row.invoiceNumber}</TableCell>
                      <TableCell className="text-xs font-medium print:text-zinc-900 print:py-1.5 print:px-2">{row.customer?.name || "Cash"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">
                        {format(new Date(row.issueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold print:text-zinc-900 print:py-1.5 print:px-2">
                        {formatCurrency(row.total, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 9. ALL PARTIES LEDGER */}
        {activeReport === "all_parties" && (
          <div className="space-y-4 print:space-y-3">
            <Table className="print:border print:border-zinc-300 print:text-[11px]">
              <TableHeader className="print:bg-zinc-100">
                <TableRow className="print:border-b print:border-zinc-300">
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Party Name</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Type</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Phone</TableHead>
                  <TableHead className="print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">GSTIN</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Receivable</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Payable</TableHead>
                  <TableHead className="text-right print:text-zinc-900 print:font-bold print:py-1.5 print:px-2">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((p) => (
                  <TableRow key={p.id} className="print:border-b print:border-zinc-200">
                    <TableCell className="font-bold text-xs print:text-zinc-900 print:py-1.5 print:px-2">{p.name}</TableCell>
                    <TableCell className="print:py-1.5 print:px-2">
                      <Badge variant="outline" className="text-[10px] print:border-zinc-400 print:text-zinc-900 print:bg-transparent">{p.partyType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">{p.phone || "-"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground print:text-zinc-700 print:py-1.5 print:px-2">{p.taxId || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-500 print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(p.receivable, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-500 print:text-zinc-900 print:py-1.5 print:px-2">
                      {formatCurrency(p.payable, currency)}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold text-xs ${p.balance >= 0 ? "text-emerald-500" : "text-rose-500"} print:text-zinc-900 print:py-1.5 print:px-2`}>
                      {formatCurrency(p.balance, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* 10. CASH FLOW */}
        {activeReport === "cashflow" && (
          <div className="space-y-4 print:space-y-3">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 print:bg-zinc-50 print:border-zinc-300 print:p-4 print:text-zinc-900">
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Total Cash Inflow (Customer Payments)</span>
                <span className="font-mono text-emerald-500 print:text-zinc-900">+{formatCurrency(summary.paymentIn, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Total Cash Outflow (Vendor Payments)</span>
                <span className="font-mono text-rose-500 print:text-zinc-900">-{formatCurrency(summary.paymentOut, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="print:text-zinc-800">Direct Expenses Settled</span>
                <span className="font-mono text-rose-500 print:text-zinc-900">-{formatCurrency(summary.expenseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2 print:border-t-2 print:border-zinc-900">
                <span className="print:text-zinc-900">Net Cash In Bank &amp; Drawer</span>
                <span className="font-mono text-lg text-primary print:text-zinc-900">
                  {formatCurrency(summary.cashInHand + summary.bankBalance, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 11. TRIAL BALANCE & BALANCE SHEET */}
        {(activeReport === "trial_balance" || activeReport === "balance_sheet") && (
          <div className="space-y-4 print:space-y-3">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3 print:bg-zinc-50 print:border-zinc-300 print:p-4 print:text-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground print:text-zinc-700">Assets &amp; Liabilities Ledger</h3>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="font-semibold print:text-zinc-800">Current Assets (Cash In Hand + Bank Accounts)</span>
                <span className="font-mono text-emerald-500 print:text-zinc-900">{formatCurrency(summary.cashInHand + summary.bankBalance, currency)}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="font-semibold print:text-zinc-800">Trade Receivables (Debtors / You&apos;ll Get)</span>
                <span className="font-mono text-emerald-500 print:text-zinc-900">{formatCurrency(summary.toCollect, currency)}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2 print:border-zinc-300">
                <span className="font-semibold print:text-zinc-800">Trade Payables (Creditors / You&apos;ll Give)</span>
                <span className="font-mono text-rose-500 print:text-zinc-900">-{formatCurrency(summary.toPay, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 print:border-t-2 print:border-zinc-900">
                <span className="print:text-zinc-900">Net Business Equity</span>
                <span className="font-mono text-primary text-base print:text-zinc-900">
                  {formatCurrency(summary.cashInHand + summary.bankBalance + summary.toCollect - summary.toPay, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Formal Statutory Print-Only Document Footer */}
        <div className="hidden print:flex print:items-center print:justify-between print:mt-8 print:pt-3 print:border-t print:border-zinc-300 print:text-[10px] print:text-zinc-500">
          <span>{companyName} • Statutory Accounting &amp; GST Compliance Record</span>
          <span>Generated by Billora Business OS • Confidential</span>
        </div>
      </div>
    </div>
  );
}
