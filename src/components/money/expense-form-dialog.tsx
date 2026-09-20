"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { BankAccount } from "@/generated/prisma/client";
import { createExpense, deleteExpense } from "@/actions/money";
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

const CATEGORIES = [
  "Rent",
  "Salary",
  "Electricity",
  "Transport",
  "Office",
  "Marketing",
  "Repair",
  "Tax",
  "Other",
];

export function ExpenseFormDialog({
  accounts,
  trigger,
}: {
  accounts: BankAccount[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? "");
  const [category, setCategory] = useState("Office & Administrative");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await createExpense({
        category,
        bankAccountId,
        description: String(formData.get("description") ?? ""),
        amount: Number(formData.get("amount") ?? 0),
        gstRate: Number(formData.get("gstRate") ?? 0),
        date: date || String(formData.get("date") ?? ""),
        notes: String(formData.get("notes") ?? ""),
      });
      toast.success("Expense recorded");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader>
          <DialogTitle>Record Business Expense</DialogTitle>
          <DialogDescription>
            Log daily operational overheads, bills, or petty cash vouchers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(value) => value && setCategory(value)}>
                <SelectTrigger><SelectValue placeholder="Category">{category}</SelectValue></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="e.g. Office tea, Electricity bill" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input id="amount" name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST %</Label>
                <Input id="gstRate" name="gstRate" type="number" min="0" step="0.01" defaultValue={0} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <DatePicker value={date} onChange={setDate} />
              </div>
              <div className="space-y-2">
                <Label>Paid from</Label>
                <Select value={bankAccountId} onValueChange={(value) => value && setBankAccountId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account">
                      {accounts.find((a) => a.id === bankAccountId)?.name || "Select account"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length === 0 ? (
                      <SelectItem value="_empty" disabled>No cash or bank accounts found</SelectItem>
                    ) : (
                      accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={2} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Expense"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this expense?")) return;
        setBusy(true);
        try {
          await deleteExpense(id);
          toast.success("Expense deleted");
        } catch {
          toast.error("Could not delete expense");
        } finally {
          setBusy(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
