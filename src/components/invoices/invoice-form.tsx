"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, Item } from "@/generated/prisma/client";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  calculateInvoiceTotals,
  calculateLineAmount,
  formatCurrency,
} from "@/lib/invoice-utils";

type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceFormProps = {
  customers: Customer[];
  catalogItems: Item[];
  defaultTaxRate?: number;
  defaultTerms?: string | null;
  currency?: string;
  invoiceId?: string;
  initialData?: {
    customerId: string;
    issueDate: string;
    dueDate: string;
    status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
    taxRate: number;
    discount: number;
    notes?: string | null;
    terms?: string | null;
    items: LineItem[];
  };
};

const emptyLineItem = (): LineItem => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export function InvoiceForm({
  customers,
  catalogItems,
  defaultTaxRate = 0,
  defaultTerms,
  currency = "USD",
  invoiceId,
  initialData,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "");
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ??
      format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  );
  const [status, setStatus] = useState<
    "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  >(initialData?.status ?? "DRAFT");
  const [taxRate, setTaxRate] = useState(initialData?.taxRate ?? defaultTaxRate);
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [terms, setTerms] = useState(initialData?.terms ?? defaultTerms ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length ? initialData.items : [emptyLineItem()],
  );

  const totals = useMemo(
    () => calculateInvoiceTotals(items, taxRate, discount),
    [items, taxRate, discount],
  );

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        if (field === "description") return { ...item, description: value };
        return {
          ...item,
          [field]: value === "" ? 0 : Number(value),
        };
      }),
    );
  };

  const addLineItem = () => {
    setItems((current) => [...current, emptyLineItem()]);
  };

  const removeLineItem = (index: number) => {
    setItems((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  const addFromCatalog = (itemId: string) => {
    const catalogItem = catalogItems.find((item) => item.id === itemId);
    if (!catalogItem) return;

    setItems((current) => {
      const next = [...current];
      const emptyIndex = next.findIndex(
        (item) => !item.description && item.unitPrice === 0,
      );

      const lineItem = {
        description: catalogItem.description
          ? `${catalogItem.name} - ${catalogItem.description}`
          : catalogItem.name,
        quantity: 1,
        unitPrice: catalogItem.unitPrice,
      };

      if (emptyIndex >= 0) {
        next[emptyIndex] = lineItem;
        return next;
      }

      return [...next, lineItem];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      toast.error("Each line item needs a description");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerId,
        issueDate,
        dueDate,
        status: status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED",
        taxRate,
        discount,
        notes,
        terms,
        items,
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, payload);
        toast.success("Invoice updated");
        router.push(`/invoices/${invoiceId}`);
      } else {
        const invoice = await createInvoice(payload);
        toast.success("Invoice created");
        router.push(`/invoices/${invoice.id}`);
      }

      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={customerId}
                onValueChange={(value) => value && setCustomerId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add a customer first from the Customers page.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (
                    value === "DRAFT" ||
                    value === "SENT" ||
                    value === "PAID" ||
                    value === "OVERDUE" ||
                    value === "CANCELLED"
                  ) {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between py-1">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal, currency)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Tax</span>
                <span>{formatCurrency(totals.taxAmount, currency)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totals.total, currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <div className="flex gap-2">
            {catalogItems.length > 0 && (
              <Select
                onValueChange={(value) => {
                  if (typeof value === "string") addFromCatalog(value);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="button" variant="outline" onClick={addLineItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Service or product description"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  value={formatCurrency(
                    calculateLineAmount(item.quantity, item.unitPrice),
                    currency,
                  )}
                  readOnly
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for the customer"
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms and conditions"
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : invoiceId
              ? "Update Invoice"
              : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
