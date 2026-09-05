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
import { BillOcrScanner } from "@/components/purchases/bill-ocr-scanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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

export type PurchaseDocumentItem = {
  id: string;
  invoiceNumber: string;
  documentType: DocumentType | "PAYMENT_OUT" | "EXPENSE";
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

type PurchaseTransactionsViewProps = {
  currentTab: "PURCHASE" | "PAYMENT_OUT" | "EXPENSE" | "PURCHASE_ORDER" | "DEBIT_NOTE";
  documents: PurchaseDocumentItem[];
  customers: Customer[];
  currency?: string;
  companyName?: string;
};

type DatePreset =
  | "THIS_MONTH"
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "ALL_TIME"
  | "CUSTOM";

const PRESET_LABELS: Record<DatePreset, string> = {
  THIS_MONTH: "This Month",
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  THIS_WEEK: "This Week",
  LAST_WEEK: "Last Week",
  LAST_MONTH: "Last Month",
  THIS_QUARTER: "This Quarter",
  THIS_YEAR: "This Year",
  ALL_TIME: "All Time",
  CUSTOM: "Custom",
};

export function PurchaseTransactionsView({
  currentTab,
  documents,
  customers,
  currency = "INR",
  companyName = "Sri Manjunatha Engineering Works",
}: PurchaseTransactionsViewProps) {
  const router = useRouter();

  // Filters State
  const [datePreset, setDatePreset] = useState<DatePreset>("THIS_MONTH");
  const now = new Date();
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(now), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(now), "yyyy-MM-dd"));
  const [selectedParty, setSelectedParty] = useState<string>("ALL");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [showChartModal, setShowChartModal] = useState<boolean>(false);

  // WhatsApp Share Dialog State
  const [shareDoc, setShareDoc] = useState<PurchaseDocumentItem | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  // Preset Date Filter Handler
  const handleSelectPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();

    switch (preset) {
      case "TODAY":
        setStartDate(format(startOfDay(today), "yyyy-MM-dd"));
        setEndDate(format(endOfDay(today), "yyyy-MM-dd"));
        break;
      case "YESTERDAY": {
        const y = subDays(today, 1);
        setStartDate(format(startOfDay(y), "yyyy-MM-dd"));
        setEndDate(format(endOfDay(y), "yyyy-MM-dd"));
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
        const lm = subMonths(today, 1);
        setStartDate(format(startOfMonth(lm), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(lm), "yyyy-MM-dd"));
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
        setStartDate("2000-01-01");
        setEndDate("2099-12-31");
        break;
      case "CUSTOM":
        break;
    }
  };

  // Switch between tabs
  const handleTabChange = (tab: "PURCHASE" | "PAYMENT_OUT" | "EXPENSE" | "PURCHASE_ORDER" | "DEBIT_NOTE") => {
    switch (tab) {
      case "PURCHASE":
        router.push("/purchases");
        break;
      case "PAYMENT_OUT":
        router.push("/payment-out");
        break;
      case "EXPENSE":
        router.push("/expenses");
        break;
      case "PURCHASE_ORDER":
        router.push("/purchase-orders");
        break;
      case "DEBIT_NOTE":
        router.push("/debit-notes");
        break;
    }
  };

  // Add Button Route
  const getAddRoute = () => {
    switch (currentTab) {
      case "PURCHASE":
        return "/purchases/new";
      case "PAYMENT_OUT":
        return "/payment-out";
      case "EXPENSE":
        return "/expenses";
      case "PURCHASE_ORDER":
        return "/purchase-orders/new";
      case "DEBIT_NOTE":
        return "/debit-notes/new";
    }
  };

  const getTabTitle = () => {
    switch (currentTab) {
      case "PURCHASE":
        return "Purchase Bills";
      case "PAYMENT_OUT":
        return "Payment-Out";
      case "EXPENSE":
        return "Expenses";
      case "PURCHASE_ORDER":
        return "Purchase Orders";
      case "DEBIT_NOTE":
        return "Purchase Return / Dr. Note";
    }
  };

  const getAddBtnLabel = () => {
    switch (currentTab) {
      case "PURCHASE":
        return "+ Add Purchase";
      case "PAYMENT_OUT":
        return "+ Add Payment-Out";
      case "EXPENSE":
        return "+ Add Expense";
      case "PURCHASE_ORDER":
        return "+ Add Purchase Order";
      case "DEBIT_NOTE":
        return "+ Add Dr. Note";
    }
  };

  // Filtered Documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Date Filter
      if (startDate && endDate) {
        const docDate = typeof doc.issueDate === "string" ? parseISO(doc.issueDate) : doc.issueDate;
        const s = startOfDay(parseISO(startDate));
        const e = endOfDay(parseISO(endDate));
        if (!isWithinInterval(docDate, { start: s, end: e })) {
          return false;
        }
      }

      // Party Filter
      if (selectedParty !== "ALL") {
        if (doc.customer?.id !== selectedParty && doc.customer?.name !== selectedParty) {
          return false;
        }
      }

      // Payment Type Filter
      if (selectedPaymentType !== "ALL") {
        const mode = (doc.paymentMode || (doc.paidAmount >= doc.total ? "Cash" : "Credit")).toUpperCase();
        if (selectedPaymentType === "CASH" && !mode.includes("CASH")) return false;
        if (selectedPaymentType === "CREDIT" && !mode.includes("CREDIT") && doc.paidAmount >= doc.total) return false;
        if (selectedPaymentType === "ONLINE" && !mode.includes("UPI") && !mode.includes("BANK") && !mode.includes("ONLINE")) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numMatch = doc.invoiceNumber.toLowerCase().includes(q);
        const partyMatch = doc.customer?.name.toLowerCase().includes(q) ?? false;
        if (!numMatch && !partyMatch) return false;
      }

      return true;
    });
  }, [documents, startDate, endDate, selectedParty, selectedPaymentType, searchQuery]);

  // KPI Calculations
  const totalAmount = useMemo(() => {
    return filteredDocs.reduce((acc, doc) => acc + doc.total, 0);
  }, [filteredDocs]);

  const totalPaid = useMemo(() => {
    return filteredDocs.reduce((acc, doc) => acc + (doc.paidAmount || 0), 0);
  }, [filteredDocs]);

  const totalBalance = useMemo(() => {
    return Math.max(totalAmount - totalPaid, 0);
  }, [totalAmount, totalPaid]);

  // Handle WhatsApp Share Click
  const handleOpenWhatsApp = (doc: PurchaseDocumentItem) => {
    setShareDoc(doc);
    setWhatsappPhone(doc.customer?.phone || "");
  };

  const handleSendWhatsApp = () => {
    if (!shareDoc) return;
    const phone = whatsappPhone.replace(/[^0-9]/g, "");
    const viewUrl = typeof window !== "undefined" ? `${window.location.origin}/invoices/${shareDoc.id}` : "";
    const msg = `Dear ${shareDoc.customer?.name || "Supplier"},\nHere is your purchase voucher ${shareDoc.invoiceNumber} for ${formatCurrency(shareDoc.total, currency)} from ${companyName}.\nView voucher: ${viewUrl}\nThank you!`;
    const waUrl = phone
      ? `https://wa.me/${phone.startsWith("91") ? phone : `91${phone}`}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    setShareDoc(null);
  };

  // Excel / CSV Export
  const handleExportCsv = () => {
    const headers = ["Date", "Bill No", "Supplier / Party Name", "Transaction", "Payment Type", "Amount", "Balance"];
    const rows = filteredDocs.map((doc) => [
      format(typeof doc.issueDate === "string" ? parseISO(doc.issueDate) : doc.issueDate, "dd/MM/yyyy"),
      doc.invoiceNumber,
      doc.customer?.name || "Cash / Direct",
      "Purchase",
      doc.paymentMode || (doc.paidAmount >= doc.total ? "Cash" : "Credit"),
      doc.total,
      Math.max(doc.total - doc.paidAmount, 0),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${getTabTitle().replace(/[\s/]/g, "_")}_${format(new Date(), "ddMMyyyy")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Row matching media_1788527281339.png */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          {/* Title Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity select-none cursor-pointer"
                >
                  <span>{getTabTitle()}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </button>
              }
            />
            <DropdownMenuContent align="start" className="w-64 rounded-xl border border-border shadow-lg">
              <DropdownMenuItem
                onClick={() => handleTabChange("PURCHASE")}
                className={`text-xs font-semibold py-2 cursor-pointer ${currentTab === "PURCHASE" ? "bg-accent font-bold" : ""}`}
              >
                Purchase Bills
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange("PAYMENT_OUT")}
                className={`text-xs font-semibold py-2 cursor-pointer ${currentTab === "PAYMENT_OUT" ? "bg-accent font-bold" : ""}`}
              >
                Payment-Out
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange("EXPENSE")}
                className={`text-xs font-semibold py-2 cursor-pointer ${currentTab === "EXPENSE" ? "bg-accent font-bold" : ""}`}
              >
                Expenses
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange("PURCHASE_ORDER")}
                className={`text-xs font-semibold py-2 cursor-pointer ${currentTab === "PURCHASE_ORDER" ? "bg-accent font-bold" : ""}`}
              >
                Purchase Order
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleTabChange("DEBIT_NOTE")}
                className={`text-xs font-semibold py-2 cursor-pointer ${currentTab === "DEBIT_NOTE" ? "bg-accent font-bold" : ""}`}
              >
                Purchase Return / Dr. Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action Buttons: 1-Click AI Scan + Add Purchase + Settings */}
        <div className="flex items-center gap-2.5">
          {currentTab === "PURCHASE" && <BillOcrScanner />}
          <Link
            href={getAddRoute()}
            className="inline-flex items-center justify-center gap-1.5 h-8 px-4 rounded-lg bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] select-none cursor-pointer"
          >
            <span>{getAddBtnLabel()}</span>
          </Link>
          <Link
            href="/settings"
            className="flex size-8 items-center justify-center rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex flex-wrap items-center gap-2.5 py-1 text-xs select-none">
        <span className="font-semibold text-muted-foreground text-xs">Filter by :</span>

        {/* Date Preset Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-card text-foreground font-medium hover:bg-muted/60 transition-colors cursor-pointer text-xs"
              >
                <span>{PRESET_LABELS[datePreset]}</span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-40 rounded-xl border border-border shadow-md">
            {(Object.keys(PRESET_LABELS) as DatePreset[]).map((preset) => (
              <DropdownMenuItem
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs py-1.5 cursor-pointer ${datePreset === preset ? "font-bold bg-accent" : ""}`}
              >
                {PRESET_LABELS[preset]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Picker Display */}
        <div className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-card text-foreground font-mono text-xs">
          <Calendar className="size-3 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setDatePreset("CUSTOM");
            }}
            className="bg-transparent border-none outline-hidden text-xs font-sans cursor-pointer"
          />
          <span className="text-muted-foreground font-sans text-[11px]">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setDatePreset("CUSTOM");
            }}
            className="bg-transparent border-none outline-hidden text-xs font-sans cursor-pointer"
          />
        </div>

        {/* Party / Supplier Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-card text-foreground font-medium hover:bg-muted/60 transition-colors cursor-pointer text-xs max-w-[160px] truncate"
              >
                <span className="truncate">
                  {selectedParty === "ALL" ? "All Suppliers" : selectedParty}
                </span>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto rounded-xl border border-border shadow-md">
            <DropdownMenuItem
              onClick={() => setSelectedParty("ALL")}
              className={`text-xs py-1.5 cursor-pointer ${selectedParty === "ALL" ? "font-bold bg-accent" : ""}`}
            >
              All Suppliers
            </DropdownMenuItem>
            {customers.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onClick={() => setSelectedParty(c.name)}
                className={`text-xs py-1.5 cursor-pointer truncate ${selectedParty === c.name ? "font-bold bg-accent" : ""}`}
              >
                {c.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Payment Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1.5 h-7 px-3 rounded-full border border-border bg-card text-foreground font-medium hover:bg-muted/60 transition-colors cursor-pointer text-xs"
              >
                <span>
                  {selectedPaymentType === "ALL"
                    ? "All Payment Types"
                    : selectedPaymentType === "CASH"
                    ? "Cash Only"
                    : selectedPaymentType === "CREDIT"
                    ? "Credit / Unpaid"
                    : "Online / Bank"}
                </span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            }
          />
          <DropdownMenuContent align="start" className="w-44 rounded-xl border border-border shadow-md">
            <DropdownMenuItem
              onClick={() => setSelectedPaymentType("ALL")}
              className={`text-xs py-1.5 cursor-pointer ${selectedPaymentType === "ALL" ? "font-bold bg-accent" : ""}`}
            >
              All Payment Types
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSelectedPaymentType("CASH")}
              className={`text-xs py-1.5 cursor-pointer ${selectedPaymentType === "CASH" ? "font-bold bg-accent" : ""}`}
            >
              Cash Only
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSelectedPaymentType("CREDIT")}
              className={`text-xs py-1.5 cursor-pointer ${selectedPaymentType === "CREDIT" ? "font-bold bg-accent" : ""}`}
            >
              Credit / Unpaid
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSelectedPaymentType("ONLINE")}
              className={`text-xs py-1.5 cursor-pointer ${selectedPaymentType === "ONLINE" ? "font-bold bg-accent" : ""}`}
            >
              Online / Bank / UPI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* KPI Card */}
      <div className="w-full max-w-sm rounded-xl border border-sky-500/20 bg-gradient-to-br from-sky-500/[0.04] to-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">
            Total Purchases Amount
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <span>100%</span>
            <ArrowUpRight className="size-3" />
          </span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-foreground font-mono">
            {formatCurrency(totalAmount, currency)}
          </span>
          <span className="text-[10px] text-muted-foreground">vs last month</span>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-border/60 pt-2 text-xs font-medium text-muted-foreground">
          <div>
            Paid: <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(totalPaid, currency)}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <div>
            Balance: <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(totalBalance, currency)}</span>
          </div>
        </div>
      </div>

      {/* Transactions Section Header & Action Icons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-bold text-foreground">Transactions</h3>

          {/* Action Icons Strip */}
          <div className="flex items-center gap-3 text-muted-foreground">
            {/* Search Input toggle */}
            {showSearchInput ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  placeholder="Search bill no or party..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-7 w-48 text-xs bg-background"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchQuery("");
                  }}
                  className="p-1 hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSearchInput(true)}
                className="hover:text-foreground transition-colors cursor-pointer"
                title="Search Transactions"
              >
                <Search className="size-4" />
              </button>
            )}

            {/* Chart Graph icon */}
            <button
              type="button"
              onClick={() => setShowChartModal(true)}
              className="hover:text-foreground transition-colors cursor-pointer"
              title="Analytics"
            >
              <BarChart3 className="size-4 text-primary" />
            </button>

            {/* Excel icon */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="hover:text-emerald-500 transition-colors cursor-pointer"
              title="Export to Excel / CSV"
            >
              <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Print icon */}
            <button
              type="button"
              onClick={() => window.print()}
              className="hover:text-foreground transition-colors cursor-pointer"
              title="Print Register"
            >
              <Printer className="size-4" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs text-muted-foreground border-b border-border hover:bg-transparent">
                <TableHead className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-1">
                    <span>Bill no</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-1">
                    <span>Party Name</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-1">
                    <span>Transaction</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-2.5">
                  <div className="flex items-center gap-1">
                    <span>Payment Type</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-right py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <span>Balance</span>
                    <Filter className="size-2.5 opacity-50" />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground text-center w-24 py-2.5">
                  <span>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                    No transactions found for the selected period and filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc) => {
                  const docDate = typeof doc.issueDate === "string" ? parseISO(doc.issueDate) : doc.issueDate;
                  const balance = Math.max(doc.total - doc.paidAmount, 0);
                  const isPaid = balance === 0;

                  return (
                    <TableRow key={doc.id} className="text-xs hover:bg-muted/30 border-b border-border/70 transition-colors">
                      <TableCell className="py-2.5 text-muted-foreground font-mono">
                        {format(docDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="py-2.5 font-mono font-bold text-foreground">
                        <Link href={`/invoices/${doc.id}`} className="hover:text-primary hover:underline">
                          {doc.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="py-2.5 font-medium text-foreground">
                        {doc.customer?.name || "Supplier / Direct"}
                      </TableCell>
                      <TableCell className="py-2.5 text-muted-foreground">
                        Purchase
                      </TableCell>
                      <TableCell className="py-2.5 text-foreground">
                        {doc.paymentMode || (isPaid ? "Cash" : "Credit")}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-mono font-bold text-foreground">
                        {formatCurrency(doc.total, currency)}
                      </TableCell>
                      <TableCell className="py-2.5 text-right font-mono">
                        {balance > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(balance, currency)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹ 0</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          {/* Print Icon */}
                          <button
                            type="button"
                            onClick={() => {
                              window.open(`/invoices/${doc.id}?print=true`, "_blank");
                            }}
                            className="p-1 hover:text-foreground cursor-pointer"
                            title="Print Voucher"
                          >
                            <Printer className="size-3.5" />
                          </button>

                          {/* Share / WhatsApp Icon */}
                          <button
                            type="button"
                            onClick={() => handleOpenWhatsApp(doc)}
                            className="p-1 hover:text-emerald-500 cursor-pointer"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="size-3.5" />
                          </button>

                          {/* Action Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <button type="button" className="p-1 hover:text-foreground cursor-pointer">
                                  <MoreVertical className="size-3.5" />
                                </button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-36 text-xs">
                              <DropdownMenuItem
                                onClick={() => router.push(`/invoices/${doc.id}`)}
                                className="cursor-pointer gap-2"
                              >
                                <Eye className="size-3.5" />
                                <span>View</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/invoices/${doc.id}/edit`)}
                                className="cursor-pointer gap-2"
                              >
                                <Pencil className="size-3.5" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  if (confirm("Delete this purchase transaction?")) {
                                    try {
                                      await deleteInvoice(doc.id);
                                      toast.success("Transaction deleted");
                                      router.refresh();
                                    } catch {
                                      toast.error("Failed to delete transaction");
                                    }
                                  }
                                }}
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
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
        </div>
      </div>

      {/* WhatsApp Share Dialog */}
      <Dialog open={!!shareDoc} onOpenChange={(open) => !open && setShareDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Share2 className="size-4 text-emerald-500" />
              Share Purchase Voucher via WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-xs">
            <div>
              <p className="font-semibold text-foreground">
                Voucher: <span className="font-mono">{shareDoc?.invoiceNumber}</span>
              </p>
              <p className="text-muted-foreground">
                Supplier: {shareDoc?.customer?.name || "Direct Party"}
              </p>
              <p className="text-muted-foreground">
                Amount: {shareDoc ? formatCurrency(shareDoc.total, currency) : 0}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground">Supplier WhatsApp Number:</label>
              <Input
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShareDoc(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSendWhatsApp} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
                Open WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={showChartModal} onOpenChange={setShowChartModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BarChart3 className="size-4 text-sky-500" />
              Purchase Analytics Distribution
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border p-2.5">
                <span className="text-[10px] text-muted-foreground uppercase">Total Volume</span>
                <p className="font-mono text-base font-bold mt-0.5">{formatCurrency(totalAmount, currency)}</p>
              </div>
              <div className="rounded-lg border border-border p-2.5">
                <span className="text-[10px] text-emerald-500 uppercase">Paid Out</span>
                <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(totalPaid, currency)}
                </p>
              </div>
              <div className="rounded-lg border border-border p-2.5">
                <span className="text-[10px] text-rose-500 uppercase">Due Balance</span>
                <p className="font-mono text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {formatCurrency(totalBalance, currency)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 p-3 space-y-2">
              <span className="text-xs font-semibold">Payment Status Ratio</span>
              <div className="h-4 w-full rounded-full bg-muted overflow-hidden flex">
                <div
                  style={{ width: `${totalAmount ? (totalPaid / totalAmount) * 100 : 0}%` }}
                  className="h-full bg-emerald-500"
                  title="Settled"
                />
                <div
                  style={{ width: `${totalAmount ? (totalBalance / totalAmount) * 100 : 0}%` }}
                  className="h-full bg-rose-500"
                  title="Outstanding"
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="text-emerald-500 font-semibold">Paid: {totalAmount ? Math.round((totalPaid / totalAmount) * 100) : 0}%</span>
                <span className="text-rose-500 font-semibold">Due: {totalAmount ? Math.round((totalBalance / totalAmount) * 100) : 0}%</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
