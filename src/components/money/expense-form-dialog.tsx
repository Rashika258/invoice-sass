"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { BankAccount } from "@/generated/prisma/client";
import { createExpense, deleteExpense } from "@/actions/money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  const [category, setCategory] = useState("Other");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await createExpense({
        category,
        description: String(formData.get("description") ?? ""),
        amount: Number(formData.get("amount") ?? 0),
        gstRate: Number(formData.get("gstRate") ?? 0),
        date: String(formData.get("date") ?? ""),
        bankAccountId,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => value && setCategory(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstRate">GST %</Label>
              <Input id="gstRate" name="gstRate" type="number" min="0" step="0.01" defaultValue={0} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} required />
            </div>
            <div className="space-y-2">
              <Label>Paid from</Label>
              <Select value={bankAccountId} onValueChange={(value) => value && setBankAccountId(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          </div>
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
