"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { BankAccount } from "@/generated/prisma/client";
import { createBankAccount, deleteBankAccount, updateBankAccount } from "@/actions/money";
import {
  FormDialog,
  FormFieldInput,
  FormFieldSelect,
  FormFieldNumber,
  ConfirmActionButton,
} from "@/components/ui";

export function BankAccountFormDialog({
  account,
  trigger,
  onSuccess,
}: {
  account?: BankAccount;
  trigger: React.ReactNode;
  onSuccess?: (account: BankAccount) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState<"CASH" | "BANK">(account?.accountType ?? "BANK");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get("name") ?? ""),
      accountType,
      accountNumber: String(formData.get("accountNumber") ?? ""),
      ifsc: String(formData.get("ifsc") ?? ""),
      openingBalance: Number(formData.get("openingBalance") ?? 0),
    };
    try {
      if (account) {
        await updateBankAccount(account.id, data);
        toast.success("Account updated");
        onSuccess?.({ ...account, ...data } as BankAccount);
      } else {
        const created = await createBankAccount(data);
        toast.success("Account added");
        onSuccess?.(created as BankAccount);
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { label: "Cash", value: "CASH" },
    { label: "Bank", value: "BANK" },
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title={account ? "Edit account" : "Add cash / bank account"}
      trigger={trigger}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Save"
      maxWidthClass="sm:max-w-md"
    >
      <FormFieldInput label="Name" name="name" defaultValue={account?.name} required />
      <FormFieldSelect
        label="Type"
        value={accountType}
        onValueChange={(val) => {
          if (val === "CASH" || val === "BANK") setAccountType(val);
        }}
        options={typeOptions}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldInput
          label="Account no."
          name="accountNumber"
          defaultValue={account?.accountNumber ?? ""}
        />
        <FormFieldInput label="IFSC" name="ifsc" defaultValue={account?.ifsc ?? ""} />
      </div>
      <FormFieldNumber
        label="Opening balance"
        name="openingBalance"
        step="0.01"
        defaultValue={account?.openingBalance ?? 0}
        currencySymbol="₹"
      />
    </FormDialog>
  );
}

export function DeleteBankAccountButton({ id }: { id: string }) {
  const handleDelete = async () => {
    try {
      await deleteBankAccount(id);
      toast.success("Account deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete account");
    }
  };

  return (
    <ConfirmActionButton
      confirmMessage="Delete this account?"
      onConfirm={handleDelete}
      variant="ghost"
      size="icon"
      className="size-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
      title="Delete Bank Account"
    >
      <Trash2 className="size-3.5 text-rose-500" />
    </ConfirmActionButton>
  );
}
