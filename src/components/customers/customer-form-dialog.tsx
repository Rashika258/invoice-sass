"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Customer } from "@/generated/prisma/client";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/actions/customers";
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
import { Textarea } from "@/components/ui/textarea";

type CustomerFormDialogProps = {
  customer?: Customer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

export function CustomerFormDialog({
  customer,
  trigger,
  onSuccess,
}: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      zipCode: String(formData.get("zipCode") ?? ""),
      country: String(formData.get("country") ?? ""),
      taxId: String(formData.get("taxId") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      partyType: String(formData.get("partyType") ?? "CUSTOMER") as
        | "CUSTOMER"
        | "SUPPLIER"
        | "BOTH",
      openingBalance: Number(formData.get("openingBalance") ?? 0),
    };

    try {
      if (customer) {
        await updateCustomer(customer.id, data);
        toast.success("Party updated");
      } else {
        await createCustomer(data);
        toast.success("Party created");
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger ?? (
            <Button>{customer ? "Edit Party" : "Add Party"}</Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Edit Party" : "Add Party"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={customer?.name}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partyType">Party type</Label>
              <select
                id="partyType"
                name="partyType"
                defaultValue={customer?.partyType ?? "CUSTOMER"}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SUPPLIER">Supplier</option>
                <option value="BOTH">Customer & Supplier</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingBalance">Opening balance</Label>
              <Input
                id="openingBalance"
                name="openingBalance"
                type="number"
                step="0.01"
                defaultValue={customer?.openingBalance ?? 0}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer?.email ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={customer?.phone ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={customer?.address ?? ""}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={customer?.city ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                defaultValue={customer?.state ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                defaultValue={customer?.zipCode ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={customer?.country ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">GSTIN</Label>
            <Input id="taxId" name="taxId" defaultValue={customer?.taxId ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={customer?.notes ?? ""}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Party"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCustomerButton({
  customerId,
  onSuccess,
}: {
  customerId: string;
  onSuccess?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this party?")) return;

    setIsDeleting(true);
    try {
      await deleteCustomer(customerId);
      toast.success("Party deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      Delete
    </Button>
  );
}
