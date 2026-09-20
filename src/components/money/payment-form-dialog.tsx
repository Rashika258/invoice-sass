"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { BankAccount, Customer, Invoice } from "@/generated/prisma/client";
import { createPayment, deletePayment } from "@/actions/money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";

export function PaymentFormDialog({
  direction,
  parties,
  accounts,
  invoices,
  trigger,
}: {
  direction: "IN" | "OUT";
  parties: Customer[];
  accounts: BankAccount[];
  invoices: Pick<Invoice, "id" | "invoiceNumber" | "total" | "paidAmount" | "customerId">[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partyId, setPartyId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? "");
  const [mode, setMode] = useState<"CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD">("CASH");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const linkedInvoices = invoices.filter((invoice) => !partyId || invoice.customerId === partyId);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await createPayment({
        direction,
        partyId,
        invoiceId,
        bankAccountId,
        amount: Number(formData.get("amount") ?? 0),
        date: date || String(formData.get("date") ?? ""),
        mode,
        reference: String(formData.get("reference") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });
      toast.success(direction === "IN" ? "Payment in recorded" : "Payment out recorded");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader>
          <DialogTitle>{direction === "IN" ? "Record Payment In" : "Record Payment Out"}</DialogTitle>
          <DialogDescription>
            {direction === "IN"
              ? "Record a payment received from a customer into cash or bank account."
              : "Record a payment made to a supplier or vendor from cash or bank."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody>
            <div className="space-y-2">
              <Label>Party</Label>
              <Select value={partyId} onValueChange={(value) => { if (value) { setPartyId(value); setInvoiceId(""); } }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select party">
                    {parties.find((p) => p.id === partyId)?.name || "Select party"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>{party.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Link to bill</Label>
              <Select value={invoiceId} onValueChange={(value) => value && setInvoiceId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional bill link">
                    {linkedInvoices.find((i) => i.id === invoiceId)?.invoiceNumber || "Optional bill link"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {linkedInvoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} · due {Math.max(invoice.total - invoice.paidAmount, 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Mode</Label>
                <Select value={mode} onValueChange={(value) => {
                  if (value === "CASH" || value === "UPI" || value === "BANK" || value === "CHEQUE" || value === "CARD") setMode(value);
                }}>
                  <SelectTrigger><SelectValue placeholder="Mode">{mode}</SelectValue></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Received in / Paid from</Label>
                <Select value={bankAccountId} onValueChange={(value) => value && setBankAccountId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account">
                      {accounts.find((a) => a.id === bankAccountId)?.name || "Select account"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference / UTR</Label>
              <Input id="reference" name="reference" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Payment"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeletePaymentButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this payment?")) return;
        setBusy(true);
        try {
          await deletePayment(id);
          toast.success("Payment deleted");
        } catch {
          toast.error("Could not delete payment");
        } finally {
          setBusy(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
