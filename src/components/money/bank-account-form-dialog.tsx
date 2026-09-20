"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BankAccount } from "@/generated/prisma/client";
import { createBankAccount, deleteBankAccount, updateBankAccount } from "@/actions/money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
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

export function BankAccountFormDialog({
  account,
  trigger,
}: {
  account?: BankAccount;
  trigger: React.ReactNode;
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
      } else {
        await createBankAccount(data);
        toast.success("Account added");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save account");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader>
          <DialogTitle>{account ? "Edit account" : "Add cash / bank account"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={account?.name} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={accountType} onValueChange={(value) => { if (value === "CASH" || value === "BANK") setAccountType(value); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK">Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account no.</Label>
                <Input id="accountNumber" name="accountNumber" defaultValue={account?.accountNumber ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc">IFSC</Label>
                <Input id="ifsc" name="ifsc" defaultValue={account?.ifsc ?? ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening balance</Label>
              <Input id="openingBalance" name="openingBalance" type="number" step="0.01" defaultValue={account?.openingBalance ?? 0} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteBankAccountButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        if (!confirm("Delete this account?")) return;
        setBusy(true);
        try {
          await deleteBankAccount(id);
          toast.success("Account deleted");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not delete account");
        } finally {
          setBusy(false);
        }
      }}
    >
      Delete
    </Button>
  );
}
