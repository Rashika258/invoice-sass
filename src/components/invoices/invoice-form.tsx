"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Customer, DocumentType, Item } from "@/generated/prisma/client";
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
import { DOCUMENT_META, GST_RATES } from "@/lib/documents";
import {
  calculateDocumentTotals,
  calculateLineAmount,
  formatCurrency,
  statesMatch,
} from "@/lib/invoice-utils";

type LineItem = {
  itemId: string;
  description: string;
  hsn: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
};

type InvoiceFormProps = {
  customers: Customer[];
  catalogItems: Item[];
  documentType?: DocumentType;
  companyState?: string | null;
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
    placeOfSupply?: string | null;
    isInterState?: boolean;
    vehicleNumber?: string | null;
    ewayBill?: string | null;
    orderNumber?: string | null;
    items: LineItem[];
  };
};

const emptyLineItem = (gstRate: number): LineItem => ({
  itemId: "",
  description: "",
  hsn: "",
  unit: "",
  quantity: 1,
  unitPrice: 0,
  gstRate,
});

export function InvoiceForm({
  customers,
  catalogItems,
  documentType = "SALE",
  companyState,
  defaultTaxRate = 18,
  defaultTerms,
  currency = "INR",
  invoiceId,
  initialData,
}: InvoiceFormProps) {
  const router = useRouter();
  const meta = DOCUMENT_META[documentType];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId, setCustomerId] = useState(initialData?.customerId ?? "");
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [dueDate, setDueDate] = useState(
    () =>
      initialData?.dueDate ??
      format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  );
  const [status, setStatus] = useState<
    "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  >(initialData?.status ?? "SENT");
  const [discount, setDiscount] = useState(initialData?.discount ?? 0);
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [terms, setTerms] = useState(initialData?.terms ?? defaultTerms ?? "");
  const [placeOfSupply, setPlaceOfSupply] = useState(
    initialData?.placeOfSupply ?? "",
  );
  const [vehicleNumber, setVehicleNumber] = useState(initialData?.vehicleNumber ?? "");
  const [ewayBill, setEwayBill] = useState(initialData?.ewayBill ?? "");
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber ?? "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length ? initialData.items : [emptyLineItem(defaultTaxRate)],
  );

  const selectedParty = customers.find((party) => party.id === customerId);
  const supplyState = placeOfSupply || selectedParty?.state || "";
  const isInterState = !statesMatch(companyState, supplyState);

  const totals = useMemo(
    () => calculateDocumentTotals(items, discount, isInterState),
    [items, discount, isInterState],
  );

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        if (
          field === "description" ||
          field === "hsn" ||
          field === "unit" ||
          field === "itemId"
        ) {
          return { ...item, [field]: value };
        }
        return { ...item, [field]: value === "" ? 0 : Number(value) };
      }),
    );
  };

  const addFromCatalog = (itemId: string) => {
    const catalogItem = catalogItems.find((item) => item.id === itemId);
    if (!catalogItem) return;
    const lineItem: LineItem = {
      itemId: catalogItem.id,
      description: catalogItem.description
        ? `${catalogItem.name} - ${catalogItem.description}`
        : catalogItem.name,
      hsn: catalogItem.hsn ?? "",
      unit: catalogItem.unit ?? "",
      quantity: 1,
      unitPrice: meta.isPurchase ? catalogItem.purchasePrice || catalogItem.unitPrice : catalogItem.unitPrice,
      gstRate: catalogItem.gstRate,
    };
    setItems((current) => {
      const next = [...current];
      const emptyIndex = next.findIndex((item) => !item.description && item.unitPrice === 0);
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
      toast.error(`Please select a ${meta.partyLabel.toLowerCase()}`);
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
        documentType,
        issueDate,
        dueDate,
        status,
        taxRate: defaultTaxRate,
        discount,
        notes,
        terms,
        placeOfSupply: supplyState,
        isInterState,
        vehicleNumber,
        ewayBill,
        orderNumber,
        items,
      };
      if (invoiceId) {
        await updateInvoice(invoiceId, payload);
        toast.success(`${meta.label} updated`);
        router.push(`/invoices/${invoiceId}`);
      } else {
        const invoice = await createInvoice(payload);
        toast.success(`${meta.label} created`);
        router.push(`/invoices/${invoice.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parties = customers.filter((party) =>
    meta.isPurchase
      ? party.partyType === "SUPPLIER" || party.partyType === "BOTH"
      : party.partyType === "CUSTOMER" || party.partyType === "BOTH",
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{meta.label} details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{meta.partyLabel}</Label>
              <Select value={customerId} onValueChange={(value) => value && setCustomerId(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${meta.partyLabel.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {parties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Date</Label>
                <Input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeOfSupply">Place of supply</Label>
                <Input
                  id="placeOfSupply"
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  placeholder={selectedParty?.state || companyState || "State"}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    if (value === "DRAFT" || value === "SENT" || value === "PAID" || value === "OVERDUE" || value === "CANCELLED") {
                      setStatus(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Open</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order no.</Label>
                <Input id="orderNumber" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle no.</Label>
                <Input id="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ewayBill">E-way bill</Label>
                <Input id="ewayBill" value={ewayBill} onChange={(e) => setEwayBill(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Tax split: {isInterState ? "IGST (inter-state)" : "CGST + SGST (intra-state)"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="rounded-lg bg-muted p-4 text-sm">
              <div className="flex justify-between py-1"><span>Subtotal</span><span>{formatCurrency(totals.subtotal, currency)}</span></div>
              {isInterState ? (
                <div className="flex justify-between py-1"><span>IGST</span><span>{formatCurrency(totals.igstAmount, currency)}</span></div>
              ) : (
                <>
                  <div className="flex justify-between py-1"><span>CGST</span><span>{formatCurrency(totals.cgstAmount, currency)}</span></div>
                  <div className="flex justify-between py-1"><span>SGST</span><span>{formatCurrency(totals.sgstAmount, currency)}</span></div>
                </>
              )}
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
          <CardTitle>Items</CardTitle>
          <div className="flex gap-2">
            {catalogItems.length > 0 && (
              <Select onValueChange={(value) => { if (typeof value === "string") addFromCatalog(value); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add from items" />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button type="button" variant="outline" onClick={() => setItems((current) => [...current, emptyLineItem(defaultTaxRate)])}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Item</Label>
                <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>HSN</Label>
                <Input value={item.hsn} onChange={(e) => updateItem(index, "hsn", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Qty</Label>
                <Input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, "quantity", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Rate</Label>
                <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, "unitPrice", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>GST %</Label>
                <Select value={String(item.gstRate)} onValueChange={(value) => value && updateItem(index, "gstRate", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input value={formatCurrency(calculateLineAmount(item.quantity, item.unitPrice), currency)} readOnly />
              </div>
              <div className="flex items-end">
                <Button type="button" variant="ghost" size="icon" onClick={() => setItems((current) => current.length === 1 ? current : current.filter((_, i) => i !== index))} disabled={items.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Terms</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={4} />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : invoiceId ? `Update ${meta.label}` : `Save ${meta.label}`}
        </Button>
      </div>
    </form>
  );
}
