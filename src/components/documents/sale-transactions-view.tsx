"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from "date-fns";
import {
  ArrowUpRight,
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreVertical,
  Pencil,
  Plus,
  Printer,
  Search,
  Settings,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Customer, DocumentType } from "@/generated/prisma/client";
import { deleteInvoice } from "@/actions/invoices";
import { deletePayment } from "@/actions/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DOCUMENT_META } from "@/lib/documents";
import { formatCurrency } from "@/lib/invoice-utils";
import { DateRangePicker, type DatePresetKey } from "@/components/ui/date-range-picker";

export type SaleDocumentItem = {
  id: string;
  invoiceNumber: string;
  documentType: DocumentType | "PAYMENT_IN";
  issueDate: Date | string;
  total: number;
  paidAmount: number;
  status: string;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
  } | null;
  paymentMode?: string;
  notes?: string | null;
};

type SaleTransactionsViewProps = {
  currentTab:
    | "SALE"
    | "ESTIMATE"
    | "PROFORMA"
    | "PAYMENT_IN"
    | "SALE_ORDER"
    | "DELIVERY_CHALLAN"
    | "CREDIT_NOTE";
  documents: SaleDocumentItem[];
  customers: Customer[];
  currency?: string;
  companyName?: string;
};

const SALE_TABS = [
  { key: "SALE", label: "Sale Invoices", href: "/invoices", addHref: "/invoices/new", btnLabel: "Add Sale" },
  { key: "ESTIMATE", label: "Estimate/ Quotation", href: "/estimates", addHref: "/estimates/new", btnLabel: "Add Estimate" },
  { key: "PROFORMA", label: "Proforma Invoice", href: "/proforma", addHref: "/proforma/new", btnLabel: "Add Proforma" },
  { key: "PAYMENT_IN", label: "Payment-In", href: "/payment-in", addHref: "/payments/new?direction=IN", btnLabel: "Add Payment-In" },
  { key: "SALE_ORDER", label: "Sale Order", href: "/sale-orders", addHref: "/sale-orders/new", btnLabel: "Add Sale Order" },
  { key: "DELIVERY_CHALLAN", label: "Delivery Challan", href: "/challans", addHref: "/challans/new", btnLabel: "Add Challan" },
  { key: "CREDIT_NOTE", label: "Sale Return/ Credit Note", href: "/credit-notes", addHref: "/credit-notes/new", btnLabel: "Add Sale Return" },
] as const;

type DatePreset =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "ALL_TIME"
  | "CUSTOM";

export function SaleTransactionsView({
  currentTab,
  documents,
  customers,
  currency = "INR",
  companyName = "My Company",
}: SaleTransactionsViewProps) {
  const router = useRouter();
  const now = new Date();

  // Date range presets state
  const [datePreset, setDatePreset] = useState<DatePreset>("THIS_MONTH");
  const [startDate, setStartDate] = useState<string>(() =>
    format(startOfMonth(now), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(() =>
    format(endOfMonth(now), "yyyy-MM-dd"),
  );

  // Filters state
  const [selectedPartyId, setSelectedPartyId] = useState<string>("ALL");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showChart, setShowChart] = useState<boolean>(false);

  // Share Dialog state
  const [shareDoc, setShareDoc] = useState<SaleDocumentItem | null>(null);

  const activeTabMeta =
    SALE_TABS.find((t) => t.key === currentTab) || SALE_TABS[0];

  // Handle Preset change
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();

    switch (preset) {
      case "TODAY":
        setStartDate(format(startOfDay(today), "yyyy-MM-dd"));
        setEndDate(format(endOfDay(today), "yyyy-MM-dd"));
        break;
      case "YESTERDAY": {
        const yest = subDays(today, 1);
        setStartDate(format(startOfDay(yest), "yyyy-MM-dd"));
        setEndDate(format(endOfDay(yest), "yyyy-MM-dd"));
        break;
      }
      case "THIS_WEEK":
        setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        break;
      case "LAST_WEEK": {
        const prevWeek = subDays(today, 7);
        setStartDate(format(startOfWeek(prevWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        setEndDate(format(endOfWeek(prevWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"));
        break;
      }
      case "THIS_MONTH":
        setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        break;
      case "LAST_MONTH": {
        const prevMonth = subMonths(today, 1);
        setStartDate(format(startOfMonth(prevMonth), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(prevMonth), "yyyy-MM-dd"));
        break;
      }
      case "THIS_QUARTER":
        setStartDate(format(startOfQuarter(today), "yyyy-MM-dd"));
        setEndDate(format(endOfQuarter(today), "yyyy-MM-dd"));
        break;
      case "THIS_YEAR":
        setStartDate(format(startOfYear(today), "yyyy-MM-dd"));
        setEndDate(format(endOfYear(today), "yyyy-MM-dd"));
        break;
      case "ALL_TIME":
        setStartDate("2020-01-01");
        setEndDate("2035-12-31");
        break;
      case "CUSTOM":
        break;
    }
  };

  // Helper to determine payment type
  const getPaymentType = (doc: SaleDocumentItem): string => {
    if (doc.paymentMode) return doc.paymentMode;
    if (doc.documentType === "PAYMENT_IN") return "Cash";
    if (doc.paidAmount >= doc.total && doc.total > 0) return "Cash";
    if (doc.paidAmount > 0) return "Partial";
    return "Credit";
  };

  // Helper to get transaction label
  const getTransactionLabel = (type: DocumentType | "PAYMENT_IN"): string => {
    switch (type) {
      case "SALE":
        return "Sale";
      case "ESTIMATE":
        return "Estimate";
      case "PROFORMA":
        return "Proforma";
      case "PAYMENT_IN":
        return "Payment-In";
      case "SALE_ORDER":
        return "Sale Order";
      case "DELIVERY_CHALLAN":
        return "Delivery Challan";
      case "CREDIT_NOTE":
        return "Sale Return";
      default:
        return String(type);
    }
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    const s = startOfDay(new Date(startDate));
    const e = endOfDay(new Date(endDate));

    return documents.filter((doc) => {
      const docDate =
        typeof doc.issueDate === "string"
          ? parseISO(doc.issueDate)
          : new Date(doc.issueDate);

      // Date range filter
      if (!isWithinInterval(docDate, { start: s, end: e })) {
        return false;
      }

      // Party filter
      if (selectedPartyId !== "ALL" && doc.customer?.id !== selectedPartyId) {
        return false;
      }

      // Payment type filter
      const pType = getPaymentType(doc).toUpperCase();
      if (selectedPaymentType !== "ALL" && pType !== selectedPaymentType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const partyName = (doc.customer?.name ?? "").toLowerCase();
        const invNo = doc.invoiceNumber.toLowerCase();
        const notes = (doc.notes ?? "").toLowerCase();
        if (!partyName.includes(q) && !invNo.includes(q) && !notes.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    documents,
    startDate,
    endDate,
    selectedPartyId,
    selectedPaymentType,
    searchQuery,
  ]);

  // Aggregate stats
  const totalAmount = useMemo(
    () => filteredDocuments.reduce((acc, d) => acc + d.total, 0),
    [filteredDocuments],
  );

  const totalReceived = useMemo(
    () => filteredDocuments.reduce((acc, d) => acc + (d.paidAmount || 0), 0),
    [filteredDocuments],
  );

  const totalBalance = useMemo(
    () =>
      filteredDocuments.reduce(
        (acc, d) => acc + Math.max(d.total - (d.paidAmount || 0), 0),
        0,
      ),
    [filteredDocuments],
  );

  // Month-over-Month calculation for badge
  const momGrowth = useMemo(() => {
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));

    const prevMonthDocs = documents.filter((doc) => {
      const docDate =
        typeof doc.issueDate === "string"
          ? parseISO(doc.issueDate)
          : new Date(doc.issueDate);
      return isWithinInterval(docDate, {
        start: prevMonthStart,
        end: prevMonthEnd,
      });
    });

    const prevMonthTotal = prevMonthDocs.reduce((acc, d) => acc + d.total, 0);
    if (prevMonthTotal === 0) {
      return totalAmount > 0 ? "+100%" : "0%";
    }
    const diff = ((totalAmount - prevMonthTotal) / prevMonthTotal) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`;
  }, [documents, totalAmount, now]);

  // CSV Export
  const exportToExcel = () => {
    if (filteredDocuments.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = [
      "Date",
      "Invoice No",
      "Party Name",
      "Transaction",
      "Payment Type",
      "Amount",
      "Balance",
    ];

    const rows = filteredDocuments.map((doc) => {
      const docDate =
        typeof doc.issueDate === "string"
          ? parseISO(doc.issueDate)
          : new Date(doc.issueDate);
      const balance = Math.max(doc.total - (doc.paidAmount || 0), 0);

      return [
        format(docDate, "dd/MM/yyyy"),
        `"${doc.invoiceNumber}"`,
        `"${doc.customer?.name || "Cash Customer"}"`,
        `"${getTransactionLabel(doc.documentType)}"`,
        `"${getPaymentType(doc)}"`,
        doc.total,
        balance,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${activeTabMeta.key.toLowerCase()}_transactions_${format(new Date(), "yyyyMMdd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Transactions exported successfully");
  };

  // Print Table
  const handlePrint = () => {
    window.print();
  };

  // Delete Action
  const handleDelete = async (doc: SaleDocumentItem) => {
    if (!confirm(`Delete ${doc.invoiceNumber}?`)) return;
    try {
      if (doc.documentType === "PAYMENT_IN") {
        await deletePayment(doc.id);
      } else {
        await deleteInvoice(doc.id);
      }
      toast.success("Transaction deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row with Title Dropdown & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b">
        <div className="flex items-center gap-2">
          {/* Dropdown to switch between all Sale tabs */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer outline-none">
              <span>{activeTabMeta.label}</span>
              <ChevronDown className="size-5 text-muted-foreground mt-0.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1 shadow-xl">
              {SALE_TABS.map((tab) => (
                <DropdownMenuItem
                  key={tab.key}
                  onClick={() => router.push(tab.href)}
                  className={`flex items-center justify-between cursor-pointer text-xs py-2 px-3 ${
                    tab.key === currentTab ? "bg-accent font-bold text-primary" : ""
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.key === currentTab && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right side buttons: + Add Sale (Red button) & Settings */}
        <div className="flex items-center gap-2">
          <Link
            href={activeTabMeta.addHref}
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all active:scale-[0.98] gap-1.5 select-none"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>{activeTabMeta.btnLabel}</span>
          </Link>

          <Link
            href="/settings"
            className="flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>

      {/* Filter by : Strip */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <span className="text-muted-foreground font-medium flex items-center gap-1">
          <span>Filter by :</span>
        </span>

        {/* Shadcn Calendar Date Range Picker */}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          activePreset={datePreset as DatePresetKey}
          onRangeChange={(start, end, preset) => {
            setStartDate(start);
            setEndDate(end);
            if (preset) setDatePreset(preset as DatePreset);
          }}
        />

        {/* Firm / Party Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-2xs">
            <span>
              {selectedPartyId === "ALL"
                ? "All Firms"
                : customers.find((c) => c.id === selectedPartyId)?.name || "All Firms"}
            </span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 max-h-60 overflow-y-auto shadow-lg">
            <DropdownMenuItem onClick={() => setSelectedPartyId("ALL")}>
              All Firms / Parties
            </DropdownMenuItem>
            {customers.map((c) => (
              <DropdownMenuItem key={c.id} onClick={() => setSelectedPartyId(c.id)}>
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Type Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-2xs">
            <span>
              {selectedPaymentType === "ALL"
                ? "All Payment Types"
                : selectedPaymentType}
            </span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 shadow-lg">
            <DropdownMenuItem onClick={() => setSelectedPaymentType("ALL")}>
              All Payment Types
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPaymentType("CASH")}>
              Cash
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPaymentType("CREDIT")}>
              Credit (Unpaid)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPaymentType("UPI")}>
              UPI
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedPaymentType("BANK")}>
              Bank / Cheque
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters Button if any active */}
        {(selectedPartyId !== "ALL" ||
          selectedPaymentType !== "ALL" ||
          datePreset !== "THIS_MONTH" ||
          searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedPartyId("ALL");
              setSelectedPaymentType("ALL");
              setSearchQuery("");
              handlePresetChange("THIS_MONTH");
            }}
            className="text-[11px] text-primary hover:underline font-medium ml-1 cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Total Sales Summary KPI Card */}
      <Card className="rounded-xl border border-border/70 bg-card/60 dark:bg-zinc-900/40 shadow-xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-medium text-muted-foreground">
                Total Sales Amount
              </span>
              <div className="mt-1 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-mono">
                  {formatCurrency(totalAmount, currency)}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{momGrowth}</span>
                  <ArrowUpRight className="size-3" />
                  <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                    vs last month
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-border/60 flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <div>
              <span>Received: </span>
              <span className="font-semibold text-foreground font-mono">
                {formatCurrency(totalReceived, currency)}
              </span>
            </div>
            <span className="text-border">|</span>
            <div>
              <span>Balance: </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                {formatCurrency(totalBalance, currency)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table Section */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-tight text-foreground">
            Transactions
          </h2>

          {/* Action Icons: Search, Analytics Chart, Excel Export, Print */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {showSearch ? (
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice or party..."
                  className="h-8 pl-8 pr-7 text-xs w-48 sm:w-60 rounded-lg"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearch(true)}
                title="Search transactions"
                className="flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Search className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowChart((prev) => !prev)}
              title="Toggle analytics chart"
              className={`flex size-8 items-center justify-center rounded-lg border border-border/80 transition-colors ${
                showChart
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <BarChart3 className="size-4" />
            </button>

            <button
              type="button"
              onClick={exportToExcel}
              title="Export to Excel / CSV"
              className="flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Transactions"
              className="flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Printer className="size-4" />
            </button>
          </div>
        </div>

        {/* Optional Visual Chart Breakdown */}
        {showChart && (
          <Card className="p-4 rounded-xl border border-border/70 bg-card/40">
            <div className="flex items-center justify-between pb-2 border-b mb-3">
              <span className="text-xs font-semibold text-foreground">
                Payment Distribution
              </span>
              <span className="text-[11px] text-muted-foreground">
                {filteredDocuments.length} transactions in selected period
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-muted/40 rounded-lg">
                <span className="text-[11px] text-muted-foreground block">Total Billed</span>
                <span className="text-base font-bold font-mono text-foreground mt-1 block">
                  {formatCurrency(totalAmount, currency)}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 block">
                  Collected
                </span>
                <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 block">
                  {formatCurrency(totalReceived, currency)}
                </span>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <span className="text-[11px] text-rose-700 dark:text-rose-400 block">
                  Pending Balance
                </span>
                <span className="text-base font-bold font-mono text-rose-700 dark:text-rose-400 mt-1 block">
                  {formatCurrency(totalBalance, currency)}
                </span>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <span className="text-[11px] text-primary block">Collection Rate</span>
                <span className="text-base font-bold font-mono text-primary mt-1 block">
                  {totalAmount > 0
                    ? `${((totalReceived / totalAmount) * 100).toFixed(0)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Interactive Transactions Table */}
        <Card className="rounded-xl border border-border/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-28">
                  <span className="inline-flex items-center gap-1">
                    Date <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-28">
                  <span className="inline-flex items-center gap-1">
                    Invoice no <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    Party Name <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-32">
                  <span className="inline-flex items-center gap-1">
                    Transaction <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-32">
                  <span className="inline-flex items-center gap-1">
                    Payment Type <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-28 text-right">
                  <span className="inline-flex items-center justify-end gap-1 w-full">
                    Amount <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-28 text-right">
                  <span className="inline-flex items-center justify-end gap-1 w-full">
                    Balance <Filter className="size-2.5 opacity-50" />
                  </span>
                </TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-xs text-muted-foreground"
                  >
                    No transactions found for the selected period &amp; filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => {
                  const docDate =
                    typeof doc.issueDate === "string"
                      ? parseISO(doc.issueDate)
                      : new Date(doc.issueDate);
                  const balance = Math.max(doc.total - (doc.paidAmount || 0), 0);
                  const pType = getPaymentType(doc);
                  const isPaid = balance === 0;

                  return (
                    <TableRow
                      key={doc.id}
                      className="group hover:bg-muted/40 transition-colors cursor-pointer text-xs"
                      onClick={() => {
                        if (doc.documentType === "PAYMENT_IN") {
                          router.push("/payments");
                        } else {
                          router.push(`/invoices/${doc.id}`);
                        }
                      }}
                    >
                      <TableCell className="font-mono text-muted-foreground">
                        {format(docDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {doc.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {doc.customer?.name || "Cash Customer"}
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {getTransactionLabel(doc.documentType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            pType === "Cash"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]"
                              : pType === "Credit"
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]"
                          }
                        >
                          {pType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {formatCurrency(doc.total, currency)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {isPaid ? (
                          <span className="text-muted-foreground">
                            {formatCurrency(0, currency)}
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatCurrency(balance, currency)}
                          </span>
                        )}
                      </TableCell>

                      {/* Actions: Print, Share, Three-dots menu */}
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (doc.documentType === "PAYMENT_IN") {
                                router.push("/payments");
                              } else {
                                router.push(`/invoices/${doc.id}?print=true`);
                              }
                            }}
                            title="Print"
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            <Printer className="size-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setShareDoc(doc)}
                            title="Share on WhatsApp"
                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          >
                            <Share2 className="size-3.5" />
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                              <MoreVertical className="size-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                onClick={() => {
                                  if (doc.documentType === "PAYMENT_IN") {
                                    router.push("/payments");
                                  } else {
                                    router.push(`/invoices/${doc.id}`);
                                  }
                                }}
                              >
                                <Eye className="size-3.5 mr-2" />
                                <span>View</span>
                              </DropdownMenuItem>
                              {doc.documentType !== "PAYMENT_IN" && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/invoices/${doc.id}/edit`)}
                                >
                                  <Pencil className="size-3.5 mr-2" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(doc)}
                                className="text-rose-600 dark:text-rose-400"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* WhatsApp / Document Share Modal */}
      {shareDoc && (
        <Dialog open={Boolean(shareDoc)} onOpenChange={() => setShareDoc(null)}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Share2 className="size-4 text-emerald-600" />
                <span>Share {shareDoc.invoiceNumber}</span>
              </DialogTitle>
            </DialogHeader>

            <DialogBody className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Customer:</span>
                  <span>{shareDoc.customer?.name || "Cash Customer"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(shareDoc.total, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Balance Due:</span>
                  <span className="font-mono font-bold text-rose-600">
                    {formatCurrency(
                      Math.max(shareDoc.total - (shareDoc.paidAmount || 0), 0),
                      currency,
                    )}
                  </span>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const msg = `Invoice: ${shareDoc.invoiceNumber} | Customer: ${shareDoc.customer?.name || "Customer"} | Total: ${formatCurrency(shareDoc.total, currency)} | Balance: ${formatCurrency(Math.max(shareDoc.total - (shareDoc.paidAmount || 0), 0), currency)}`;
                  navigator.clipboard.writeText(msg);
                  toast.success("Details copied to clipboard");
                  setShareDoc(null);
                }}
              >
                Copy Invoice Details
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium"
                onClick={() => {
                  const party = shareDoc.customer?.name || "Customer";
                  const phone = (shareDoc.customer?.phone || "").replace(
                    /[^0-9]/g,
                    "",
                  );
                  const msg = `Dear ${party}, thank you for your business with ${companyName}. Your invoice ${shareDoc.invoiceNumber} for ${formatCurrency(shareDoc.total, currency)} is ready.`;
                  const waUrl = phone
                    ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`
                    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                  window.open(waUrl, "_blank");
                  setShareDoc(null);
                }}
              >
                <Share2 className="size-3.5" />
                <span>Send via WhatsApp</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
