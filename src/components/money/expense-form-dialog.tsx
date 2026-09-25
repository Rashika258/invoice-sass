"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { BankAccount } from "@/generated/prisma/client";
import { createExpense, deleteExpense } from "@/actions/money";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormDialog,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  FormFieldNumber,
  ConfirmActionButton,
} from "@/components/ui";

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
  const [category, setCategory] = useState("Office");
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

  const accountOptions = accounts.length === 0
    ? [{ label: "No cash or bank accounts found", value: "_empty", disabled: true }]
    : accounts.map((acc) => ({ label: acc.name, value: acc.id }));

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Record Business Expense"
      description="Log daily operational overheads, bills, or petty cash vouchers."
      trigger={trigger}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Save Expense"
      maxWidthClass="sm:max-w-lg"
    >
      <FormFieldSelect
        label="Category"
        value={category}
        onValueChange={(val) => setCategory(val)}
        options={CATEGORIES}
      />
      <FormFieldInput
        label="Description"
        name="description"
        placeholder="e.g. Office tea, Electricity bill"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldNumber
          label="Amount"
          name="amount"
          step="0.01"
          placeholder="0.00"
          currencySymbol="₹"
          required
        />
        <FormFieldNumber
          label="GST %"
          name="gstRate"
          step="0.01"
          defaultValue={0}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground block">Date</label>
          <DatePicker value={date} onChange={setDate} />
        </div>
        <FormFieldSelect
          label="Paid from"
          value={bankAccountId}
          onValueChange={(val) => setBankAccountId(val)}
          options={accountOptions}
        />
      </div>
      <FormFieldTextarea label="Notes" name="notes" rows={2} />
    </FormDialog>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  const handleDelete = async () => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Could not delete expense");
    }
  };

  return (
    <ConfirmActionButton
      confirmMessage="Delete this expense?"
      onConfirm={handleDelete}
      variant="ghost"
      size="sm"
    >
      Delete
    </ConfirmActionButton>
  );
}
