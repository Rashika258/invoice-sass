"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  HelpCircle,
  IndianRupee,
  Plus,
  Receipt,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import type { BankAccount, Customer } from "@/generated/prisma/client";
import { createPayment } from "@/actions/money";
import { BankAccountFormDialog } from "@/components/money/bank-account-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/invoice-utils";

export interface InvoiceBillSummary {
  id: string;
  invoiceNumber: string;
  total: number;
  paidAmount: number;
  customerId: string;
}

interface PaymentNewFormProps {
  initialDirection?: "IN" | "OUT";
  parties: Customer[];
  accounts: BankAccount[];
  saleBills: InvoiceBillSummary[];
  purchaseBills: InvoiceBillSummary[];
  currency?: string;
  initialPartyId?: string;
  initialInvoiceId?: string;
}

export function PaymentNewForm({
  initialDirection = "IN",
  parties,
  accounts,
  saleBills,
  purchaseBills,
  currency = "INR",
  initialPartyId = "",
  initialInvoiceId = "",
}: PaymentNewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [direction, setDirection] = useState<"IN" | "OUT">(
    initialDirection === "OUT" ? "OUT" : "IN"
  );
  const [accountList, setAccountList] = useState(accounts);
  const [partyId, setPartyId] = useState(initialPartyId);
  const [invoiceId, setInvoiceId] = useState(initialInvoiceId);
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? "");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mode, setMode] = useState<"CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD">("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleModeChange = (newMode: "CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD") => {
    setMode(newMode);
    if (newMode === "CASH") {
      const cashAcc = accountList.find((a) => a.accountType === "CASH");
      if (cashAcc) setBankAccountId(cashAcc.id);
    } else {
      const currentAcc = accountList.find((a) => a.id === bankAccountId);
      if (!currentAcc || currentAcc.accountType === "CASH") {
        const bankAcc = accountList.find((a) => a.accountType === "BANK");
        if (bankAcc) setBankAccountId(bankAcc.id);
      }
    }
  };

  // Determine relevant invoices based on direction
  const activeInvoices = direction === "IN" ? saleBills : purchaseBills;
  const filteredInvoices = activeInvoices.filter(
    (inv) => !partyId || inv.customerId === partyId
  );

  // When an invoice is selected, calculate balance due
  const selectedInvoice = activeInvoices.find((inv) => inv.id === invoiceId);
  const selectedParty = parties.find((p) => p.id === partyId);
  const dueAmount = selectedInvoice ? Math.max(0, selectedInvoice.total - selectedInvoice.paidAmount) : null;

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const inv = activeInvoices.find((i) => i.id === id);
    if (inv) {
      if (!partyId && inv.customerId) {
        setPartyId(inv.customerId);
      }
      const due = Math.max(0, inv.total - inv.paidAmount);
      if (due > 0 && (!amount || Number(amount) === 0)) {
        setAmount(due.toString());
      }
    }
  };

  const handleDirectionSwitch = (newDir: "IN" | "OUT") => {
    setDirection(newDir);
    setInvoiceId("");
  };

  const handleSubmit = async (e: React.FormEvent, createAnother = false) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid payment amount greater than zero");
      return;
    }
    if (!bankAccountId) {
      toast.error("Please select a bank or cash account");
      return;
    }

    startTransition(async () => {
      try {
        await createPayment({
          direction,
          partyId: partyId || undefined,
          invoiceId: invoiceId || undefined,
          bankAccountId,
          amount: numAmount,
          date: date || format(new Date(), "yyyy-MM-dd"),
          mode,
          reference: reference.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        toast.success(
          direction === "IN"
            ? `Payment In of ${formatCurrency(numAmount, currency)} recorded successfully!`
            : `Payment Out of ${formatCurrency(numAmount, currency)} recorded successfully!`
        );

        if (createAnother) {
          setAmount("");
          setReference("");
          setNotes("");
          setInvoiceId("");
        } else {
          router.push(direction === "IN" ? "/payment-in" : "/payments");
          router.refresh();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to record payment");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.back()}
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">
                {direction === "IN" ? "Record Payment-In" : "Record Payment-Out"}
              </h1>
              <Badge
                className={`font-mono text-xs ${
                  direction === "IN"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                {direction === "IN" ? "Receipt (+ IN)" : "Payout (- OUT)"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {direction === "IN"
                ? "Receive money from customer against sales invoices or on account"
                : "Record disbursement to vendors against purchase bills or expenses"}
            </p>
          </div>
        </div>

        {/* Direction Switcher Toggle */}
        <div className="inline-flex rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => handleDirectionSwitch("IN")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              direction === "IN"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownLeft className="h-3.5 w-3.5" />
            Payment In
          </button>
          <button
            type="button"
            onClick={() => handleDirectionSwitch("OUT")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              direction === "OUT"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Payment Out
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Main Details Card */}
        <Card className="shadow-xs border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary" />
              Party &amp; Invoice Linkage
            </CardTitle>
            <CardDescription>
              Select the contact and optionally match against an existing bill or invoice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Party Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {direction === "IN" ? "Customer / Party" : "Supplier / Vendor"}
                </Label>
                <Select
                  value={partyId}
                  onValueChange={(val: string | null) => {
                    setPartyId(val || "");
                    setInvoiceId("");
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select party...">
                      {selectedParty ? selectedParty.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="">-- None (Direct/General) --</SelectItem>
                    {parties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.phone ? `(${p.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedParty && (
                  <p className="text-[11px] text-muted-foreground">
                    Party Type: <span className="font-semibold">{selectedParty.partyType}</span>
                    {selectedParty.taxId && ` • GSTIN / Tax ID: ${selectedParty.taxId}`}
                  </p>
                )}
              </div>

              {/* Linked Invoice Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {direction === "IN" ? "Link to Sale Invoice" : "Link to Purchase Bill"}
                  <span className="text-[11px] font-normal text-muted-foreground">(Optional)</span>
                </Label>
                <Select
                  value={invoiceId}
                  onValueChange={(val: string | null) => handleInvoiceChange(val || "")}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Link to existing bill or invoice...">
                      {selectedInvoice
                        ? `${selectedInvoice.invoiceNumber} (Due: ${formatCurrency(Math.max(0, selectedInvoice.total - selectedInvoice.paidAmount), currency)})`
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="">-- No Bill Link (Advance / On Account) --</SelectItem>
                    {filteredInvoices.map((inv) => {
                      const due = Math.max(0, inv.total - inv.paidAmount);
                      return (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} • Total: {formatCurrency(inv.total, currency)} • Due: {formatCurrency(due, currency)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {dueAmount !== null && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Outstanding on this bill:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(dueAmount, currency)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Amount & Method Card */}
        <Card className="shadow-xs border">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Settlement &amp; Amount
            </CardTitle>
            <CardDescription>
              Specify the payment amount, date, payment mode, and bank/cash account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount" className="text-xs font-semibold">
                  Amount ({currency}) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="pay-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 text-base font-bold h-10"
                    required
                  />
                </div>
                {dueAmount !== null && dueAmount > 0 && Number(amount) !== dueAmount && (
                  <button
                    type="button"
                    onClick={() => setAmount(dueAmount.toString())}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Set to full balance ({formatCurrency(dueAmount, currency)})
                  </button>
                )}
              </div>

              {/* Payment Date */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker value={date} onChange={setDate} />
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Payment Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(val: "CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD" | null) => {
                    if (val === "CASH" || val === "UPI" || val === "BANK" || val === "CHEQUE" || val === "CARD") {
                      handleModeChange(val);
                    }
                  }}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Mode">{mode}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI / QR Code</SelectItem>
                    <SelectItem value="BANK">Bank Transfer (IMPS/NEFT/RTGS)</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CARD">Credit / Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Bank / Cash Account */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {direction === "IN" ? "Deposit into Account" : "Pay from Account"}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <BankAccountFormDialog
                    trigger={
                      <button
                        type="button"
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="size-3" />
                        <span>+ Add Bank Account</span>
                      </button>
                    }
                    onSuccess={(newAcc) => {
                      setAccountList((prev) => {
                        const exists = prev.some((a) => a.id === newAcc.id);
                        return exists ? prev : [...prev, newAcc];
                      });
                      setBankAccountId(newAcc.id);
                    }}
                  />
                </div>
                <Select
                  value={bankAccountId}
                  onValueChange={(val: string | null) => setBankAccountId(val || "")}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select account">
                      {accountList.find((a) => a.id === bankAccountId)?.name || "Select account"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accountList.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name} ({acc.accountType})
                        {acc.accountNumber ? ` • ····${acc.accountNumber.slice(-4)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reference / UTR Number */}
              <div className="space-y-1.5">
                <Label htmlFor="pay-reference" className="text-xs font-semibold">
                  Reference / UTR / Cheque No.
                </Label>
                <Input
                  id="pay-reference"
                  placeholder="e.g. UTR12345678, CHQ#4401"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes Card */}
        <Card className="shadow-xs border">
          <CardContent className="pt-5 space-y-1.5">
            <Label htmlFor="pay-notes" className="text-xs font-semibold">
              Notes &amp; Internal Remarks
            </Label>
            <Textarea
              id="pay-notes"
              rows={2}
              placeholder="Add any internal transaction notes or customer remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={(e) => handleSubmit(e, true)}
            >
              Save &amp; Record Another
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm cursor-pointer"
            >
              {isPending ? "Saving Payment..." : `Save ${direction === "IN" ? "Payment-In" : "Payment-Out"}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
