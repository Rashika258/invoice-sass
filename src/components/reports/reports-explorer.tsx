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
}: {
  summary: any;
  parties: any[];
  billWise: any[];
  dayBook: any;
  currency?: string;
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

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[750px]">
      {/* Left Submenu matching media_1788511617186.png */}
      <div className="w-full lg:w-64 shrink-0 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs space-y-4">
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
      <div className="flex-1 rounded-2xl border border-border/80 bg-card p-5 shadow-xs space-y-5">
        {/* Report Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/70 pb-4">
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
              <Button size="sm" className="h-8 text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
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
              className="h-8 text-xs font-semibold rounded-xl border-border"
            >
              <Printer className="mr-1.5 size-3.5" />
              Print Report
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
            >
              <Download className="mr-1.5 size-3.5" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* 1. SALE REPORT */}
        {activeReport === "sale" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Total Invoices</span>
                <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                  {summary.sales.length}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Net Sales Total</span>
                <p className="text-xl font-bold font-mono text-primary mt-0.5">
                  {formatCurrency(summary.saleTotal, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Total GST Collected</span>
                <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                  {formatCurrency(summary.gstOutward.totalTax, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Pending Collection</span>
                <p className="text-xl font-bold font-mono text-rose-500 mt-0.5">
                  {formatCurrency(summary.toCollect, currency)}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Taxable</TableHead>
                  <TableHead className="text-right">GST</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.sales.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-xs font-semibold">
                      <Link href={`/invoices/${sale.id}`} className="hover:underline text-primary">
                        {sale.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {sale.customer?.name || "Cash Customer"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(sale.issueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(sale.subtotal - sale.discount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(sale.cgstAmount + sale.sgstAmount + sale.igstAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Day Sales</span>
                <p className="text-lg font-bold font-mono text-emerald-500 mt-0.5">
                  {formatCurrency(dayBook.totalSale, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Day Purchases</span>
                <p className="text-lg font-bold font-mono text-sky-500 mt-0.5">
                  {formatCurrency(dayBook.totalPurchase, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Money Received (In)</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(dayBook.totalIn, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Money Paid (Out)</span>
                <p className="text-lg font-bold font-mono text-rose-500 mt-0.5">
                  {formatCurrency(dayBook.totalOut, currency)}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time / Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Party / Details</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayBook.invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(inv.issueDate), "hh:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[10px]">{inv.documentType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs">{inv.customer?.name || "Cash"}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-500">
                      {inv.documentType === "PURCHASE" ? formatCurrency(inv.total, currency) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-500 font-bold">
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
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Total Net Sales (Revenue)</span>
                <span className="font-mono text-emerald-500">{formatCurrency(summary.saleTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Less: Cost of Goods (Purchases)</span>
                <span className="font-mono text-rose-500">-{formatCurrency(summary.purchaseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Less: Operating Expenses</span>
                <span className="font-mono text-rose-500">-{formatCurrency(summary.expenseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2">
                <span>Net Operating Profit / (Loss)</span>
                <span className={`font-mono text-lg ${summary.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {formatCurrency(summary.profit, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. BILL WISE PROFIT */}
        {activeReport === "bill_profit" && (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Sale Amount</TableHead>
                  <TableHead className="text-right">Estimated Cost</TableHead>
                  <TableHead className="text-right">Gross Profit</TableHead>
                  <TableHead className="text-right">Margin %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billWise.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs font-semibold text-primary">
                      {row.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs">{row.partyName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(row.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(row.saleAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      {formatCurrency(row.costAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-500">
                      {formatCurrency(row.profit, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      <Badge variant="outline" className="text-[10px] text-emerald-500">
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">{activeParty.name}</span>
                  <span className="text-muted-foreground">{activeParty.phone || "No phone"}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GSTIN: {activeParty.taxId || "Unregistered"}</span>
                  <span>{activeParty.address || "India"}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. GSTR-1 & GST RETURNS */}
        {(activeReport === "gstr1" || activeReport === "gstr2" || activeReport === "gstr3b") && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Taxable Turnover</span>
                <p className="text-xl font-bold font-mono mt-0.5">
                  {formatCurrency(summary.gstOutward.taxable, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">CGST + SGST</span>
                <p className="text-xl font-bold font-mono mt-0.5">
                  {formatCurrency(summary.gstOutward.cgst + summary.gstOutward.sgst, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Total GST Liability</span>
                <p className="text-xl font-bold font-mono text-primary mt-0.5">
                  {formatCurrency(summary.gstOutward.totalTax, currency)}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GST Slab Rate</TableHead>
                  <TableHead className="text-right">Invoices Count</TableHead>
                  <TableHead className="text-right">Taxable Value</TableHead>
                  <TableHead className="text-right">Total Tax Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.gstr1.map((row: any) => (
                  <TableRow key={row.rate}>
                    <TableCell className="font-semibold text-xs">{row.rate}% GST</TableCell>
                    <TableCell className="text-right font-mono text-xs">{row.invoices}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(row.taxable, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-primary">
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
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Total Purchase Bills</span>
                <p className="text-xl font-bold font-mono mt-0.5">{summary.purchases.length}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Net Purchases Total</span>
                <p className="text-xl font-bold font-mono text-sky-500 mt-0.5">
                  {formatCurrency(summary.purchaseTotal, currency)}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                <span className="text-[11px] text-muted-foreground">Pending Supplier Dues</span>
                <p className="text-xl font-bold font-mono text-rose-500 mt-0.5">
                  {formatCurrency(summary.toPay, currency)}
                </p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Taxable</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.purchases.map((pur: any) => (
                  <TableRow key={pur.id}>
                    <TableCell className="font-mono text-xs font-semibold">{pur.invoiceNumber}</TableCell>
                    <TableCell className="text-xs font-medium">{pur.customer?.name || "Vendor"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(pur.issueDate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{pur.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(pur.subtotal - pur.discount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {formatCurrency(pur.cgstAmount + pur.sgstAmount + pur.igstAmount, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-xs">
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
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Ref No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...summary.sales.map((s: any) => ({ ...s, doc: "SALE" })),
                  ...summary.purchases.map((p: any) => ({ ...p, doc: "PURCHASE" })),
                ]
                  .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                  .map((row: any) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Badge
                          className={`text-[10px] font-bold ${
                            row.doc === "SALE"
                              ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                              : "bg-sky-500/15 text-sky-500 border-sky-500/30"
                          }`}
                        >
                          {row.doc}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{row.invoiceNumber}</TableCell>
                      <TableCell className="text-xs font-medium">{row.customer?.name || "Cash"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(row.issueDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold">
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
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>GSTIN</TableHead>
                  <TableHead className="text-right">Receivable</TableHead>
                  <TableHead className="text-right">Payable</TableHead>
                  <TableHead className="text-right">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-xs">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{p.partyType}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.phone || "-"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.taxId || "-"}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-500">
                      {formatCurrency(p.receivable, currency)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-500">
                      {formatCurrency(p.payable, currency)}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold text-xs ${p.balance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
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
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Total Cash Inflow (Customer Payments)</span>
                <span className="font-mono text-emerald-500">+{formatCurrency(summary.paymentIn, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Total Cash Outflow (Vendor Payments)</span>
                <span className="font-mono text-rose-500">-{formatCurrency(summary.paymentOut, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold border-b border-border/60 pb-2">
                <span>Direct Expenses Settled</span>
                <span className="font-mono text-rose-500">-{formatCurrency(summary.expenseTotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-2">
                <span>Net Cash In Bank &amp; Drawer</span>
                <span className="font-mono text-lg text-primary">
                  {formatCurrency(summary.cashInHand + summary.bankBalance, currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 11. TRIAL BALANCE & BALANCE SHEET */}
        {(activeReport === "trial_balance" || activeReport === "balance_sheet") && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assets &amp; Liabilities Ledger</h3>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2">
                <span className="font-semibold">Current Assets (Cash In Hand + Bank Accounts)</span>
                <span className="font-mono text-emerald-500">{formatCurrency(summary.cashInHand + summary.bankBalance, currency)}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2">
                <span className="font-semibold">Trade Receivables (Debtors / You&apos;ll Get)</span>
                <span className="font-mono text-emerald-500">{formatCurrency(summary.toCollect, currency)}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-border/60 pb-2">
                <span className="font-semibold">Trade Payables (Creditors / You&apos;ll Give)</span>
                <span className="font-mono text-rose-500">-{formatCurrency(summary.toPay, currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2">
                <span>Net Business Equity</span>
                <span className="font-mono text-primary text-base">
                  {formatCurrency(summary.cashInHand + summary.bankBalance + summary.toCollect - summary.toPay, currency)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
