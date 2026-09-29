"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import type { Customer } from "@/generated/prisma/client";
import { createCustomer, deleteCustomer, updateCustomer } from "@/actions/customers";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormDialog,
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  FormFieldNumber,
  ConfirmActionButton,
} from "@/components/ui";
import {
  COUNTRIES,
  getStatesForCountry,
  getStateFromGstin,
} from "@/lib/geo-data";

type CustomerFormDialogProps = {
  customer?: Customer;
  trigger?: React.ReactNode;
  defaultPartyType?: "CUSTOMER" | "SUPPLIER" | "BOTH";
  onSuccess?: (customer?: Customer) => void;
};

export function CustomerFormDialog({
  customer,
  trigger,
  defaultPartyType,
  onSuccess,
}: CustomerFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partyType, setPartyType] = useState<string>(
    customer?.partyType ?? defaultPartyType ?? "CUSTOMER"
  );
  const [country, setCountry] = useState<string>(
    customer?.country || "India"
  );
  const [state, setState] = useState<string>(
    customer?.state || ""
  );
  const [taxId, setTaxId] = useState<string>(
    customer?.taxId || ""
  );

  useEffect(() => {
    if (open) {
      setPartyType(customer?.partyType ?? defaultPartyType ?? "CUSTOMER");
      setCountry(customer?.country || "India");
      setState(customer?.state || "");
      setTaxId(customer?.taxId || "");
    }
  }, [open, customer, defaultPartyType]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setPartyType(customer?.partyType ?? defaultPartyType ?? "CUSTOMER");
      setCountry(customer?.country || "India");
      setState(customer?.state || "");
      setTaxId(customer?.taxId || "");
    }
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const newStates = getStatesForCountry(newCountry);
    if (!newStates.includes(state)) {
      setState("");
    }
  };

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setTaxId(val);

    // Auto-detect State & Country from GSTIN if 2+ characters match a GST state code
    if (val.length >= 2) {
      const detectedState = getStateFromGstin(val);
      if (detectedState) {
        setCountry("India");
        setState(detectedState);
      }
    }
  };

  const availableStates = useMemo(() => {
    return getStatesForCountry(country);
  }, [country]);

  // Ensure current state is included in options so default value is always in the dropdown options
  const stateOptions = useMemo(() => {
    if (state && !availableStates.includes(state)) {
      return [state, ...availableStates];
    }
    return availableStates;
  }, [state, availableStates]);

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
      state: String(formData.get("state") || state),
      zipCode: String(formData.get("zipCode") ?? ""),
      country: String(formData.get("country") || country),
      taxId: String(formData.get("taxId") || taxId),
      notes: String(formData.get("notes") ?? ""),
      partyType: String(formData.get("partyType") ?? (defaultPartyType ?? "CUSTOMER")) as
        | "CUSTOMER"
        | "SUPPLIER"
        | "BOTH",
      openingBalance: Number(formData.get("openingBalance") ?? 0),
    };

    try {
      if (customer) {
        await updateCustomer(customer.id, data);
        toast.success("Party updated");
        setOpen(false);
        onSuccess?.({ ...customer, ...data });
      } else {
        const created = await createCustomer(data);
        toast.success(data.partyType === "SUPPLIER" ? "Supplier created" : "Party created");
        setOpen(false);
        onSuccess?.(created);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const partyOptions = [
    { label: "Customer", value: "CUSTOMER" },
    { label: "Supplier", value: "SUPPLIER" },
    { label: "Customer & Supplier", value: "BOTH" },
  ];

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={customer ? "Edit Party" : "Add Party"}
      description={
        customer
          ? "Update customer or supplier contact details and billing info."
          : "Register a new customer or supplier in your business registry."
      }
      trigger={trigger ?? <Button>{customer ? "Edit Party" : "Add Party"}</Button>}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText={customer ? "Save changes" : "Create Party"}
    >
      <FormFieldInput
        label="Name"
        name="name"
        defaultValue={customer?.name}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldSelect
          label="Party type"
          name="partyType"
          value={partyType}
          onValueChange={(val) => setPartyType(val)}
          options={partyOptions}
          tooltip="Customer: Buyer of goods/services. Supplier: Vendor you purchase from. Both: Dual billing relationship."
        />
        <FormFieldNumber
          label="Opening balance"
          name="openingBalance"
          defaultValue={customer?.openingBalance ?? 0}
          step="0.01"
          tooltip="Starting ledger balance. Enter positive (+) if the party owes you, or negative (-) if you owe them."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldInput
          label="Email"
          name="email"
          type="email"
          defaultValue={customer?.email ?? ""}
        />
        <FormFieldInput
          label="Phone"
          name="phone"
          defaultValue={customer?.phone ?? ""}
        />
      </div>

      <FormFieldInput
        label="Address"
        name="address"
        defaultValue={customer?.address ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldSelect
          label="Country"
          name="country"
          value={country}
          onValueChange={handleCountryChange}
          options={COUNTRIES}
        />
        {stateOptions.length > 0 ? (
          <FormFieldSelect
            label="State"
            name="state"
            value={state || undefined}
            onValueChange={(val) => setState(val)}
            options={stateOptions}
            placeholder="Select state..."
            tooltip="Determines Place of Supply for intra-state (CGST+SGST) vs inter-state (IGST) tax calculation."
          />
        ) : (
          <FormFieldInput
            label="State"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Enter state / province"
            tooltip="Determines Place of Supply for intra-state (CGST+SGST) vs inter-state (IGST) tax calculation."
          />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldInput label="City" name="city" defaultValue={customer?.city ?? ""} />
        <FormFieldInput label="Zip Code" name="zipCode" defaultValue={customer?.zipCode ?? ""} />
      </div>

      <FormFieldInput
        label="GSTIN"
        name="taxId"
        value={taxId}
        onChange={handleTaxIdChange}
        placeholder="e.g. 27AAAAA0000A1Z5"
        tooltip="15-digit GST Identification Number for B2B tax invoice compliance. Country & State are automatically populated from GSTIN."
      />
      <FormFieldTextarea label="Notes" name="notes" defaultValue={customer?.notes ?? ""} rows={3} />
    </FormDialog>
  );
}

export function DeleteCustomerButton({
  customerId,
  onSuccess,
}: {
  customerId: string;
  onSuccess?: () => void;
}) {
  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId);
      toast.success("Party deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  return (
    <ConfirmActionButton
      confirmMessage="Delete this party?"
      onConfirm={handleDelete}
      variant="ghost"
      size="sm"
      className="size-7 p-0 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-lg"
      title="Delete Party"
    >
      <Trash2 className="size-3.5" />
    </ConfirmActionButton>
  );
}
