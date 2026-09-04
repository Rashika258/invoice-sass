"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Receipt,
  ShoppingBag,
  Trash2,
  Truck,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { Customer, DocumentType, Item } from "@/generated/prisma/client";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  unit: "PCS",
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
  const isPurchase = meta.isPurchase;

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
  const [terms, setTerms] = useState(initialData?.terms ?? defaultTerms ?? "Payment is due within credit period. Goods once sold will not be returned.");
  const [placeOfSupply, setPlaceOfSupply] = useState(
    initialData?.placeOfSupply ?? "",
  );
  const [vehicleNumber, setVehicleNumber] = useState(initialData?.vehicleNumber ?? "");
  const [ewayBill, setEwayBill] = useState(initialData?.ewayBill ?? "");
  const [orderNumber, setOrderNumber] = useState(initialData?.orderNumber ?? "");
  const [showTransport, setShowTransport] = useState(
    Boolean(initialData?.vehicleNumber || initialData?.ewayBill || initialData?.orderNumber),
  );

  const [items, setItems] = useState<LineItem[]>(
    initialData?.items?.length ? initialData.items : [emptyLineItem(defaultTaxRate)],
  );

  const selectedParty = customers.find((party) => party.id === customerId);
  const supplyState = placeOfSupply || selectedParty?.state || companyState || "";
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
      description: catalogItem.name + (catalogItem.description ? ` - ${catalogItem.description}` : ""),
      hsn: catalogItem.hsn ?? "",
      unit: catalogItem.unit ?? "PCS",
      quantity: 1,
      unitPrice: isPurchase ? catalogItem.purchasePrice || catalogItem.unitPrice : catalogItem.unitPrice,
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
        toast.success(`${meta.label} updated successfully`);
        router.push(`/invoices/${invoiceId}`);
      } else {
        const invoice = await createInvoice(payload);
        toast.success(`${meta.label} created successfully`);
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
    isPurchase
      ? party.partyType === "SUPPLIER" || party.partyType === "BOTH"
      : party.partyType === "CUSTOMER" || party.partyType === "BOTH",
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Banner / Document Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="icon" type="button" onClick={() => router.back()} className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {invoiceId ? `Edit ${meta.label}` : `New ${meta.label}`}
              </h1>
              <Badge
                className={
                  isPurchase
                    ? "bg-[#1976D2] hover:bg-[#1976D2] text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-xs"
                    : "bg-[#D32F2F] hover:bg-[#D32F2F] text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-xs"
                }
              >
                {meta.label.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vyapar GST Billing Desk · Auto tax calculation &amp; inventory update
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => router.back()} className="h-8 text-xs font-medium rounded-lg">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={
              isPurchase
                ? "bg-[#1976D2] hover:bg-[#1565C0] text-white font-medium shadow-xs px-4 h-8 text-xs rounded-lg active:scale-[0.98] transition-all"
                : "bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-medium shadow-xs px-4 h-8 text-xs rounded-lg active:scale-[0.98] transition-all"
            }
          >
            {isSubmitting ? "Saving..." : invoiceId ? `Update ${meta.label}` : `Save & Preview Bill`}
          </Button>
        </div>
      </div>

      {/* Bill Header Grid: Party, Dates, Tax state */}
      <Card className="rounded-xl shadow-xs">
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Party Selector with Balance Preview */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {meta.partyLabel} *
                </Label>
                {selectedParty && (
                  <span className="text-xs font-semibold">
                    Balance:{" "}
                    <span className="text-emerald-600 font-bold">
                      {formatCurrency(selectedParty.openingBalance, currency)}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Select
                  value={customerId}
                  onValueChange={(val) => {
                    if (val) setCustomerId(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 font-medium text-sm">
                    <SelectValue placeholder={`Select ${meta.partyLabel}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {parties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.phone ? `(${p.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CustomerFormDialog
                  trigger={
                    <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" title="Add New Party">
                      <UserPlus className="size-4" />
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Bill Date */}
            <div className="space-y-1.5">
              <Label htmlFor="issueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bill Date *
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t text-xs">
            {/* Place of Supply */}
            <div className="space-y-1.5">
              <Label htmlFor="placeOfSupply" className="text-xs text-muted-foreground">
                Place of Supply (State)
              </Label>
              <Input
                id="placeOfSupply"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                placeholder={selectedParty?.state || companyState || "E.g. Maharashtra"}
                className="h-8 text-xs"
              />
            </div>

            {/* Status (Credit vs Paid) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Payment Status</Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value === "DRAFT" || value === "SENT" || value === "PAID" || value === "OVERDUE" || value === "CANCELLED") {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SENT">Credit / Open (Unpaid)</SelectItem>
                  <SelectItem value="PAID">Cash / Fully Paid</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax Regime Indicator */}
            <div className="space-y-1.5 flex flex-col justify-center">
              <span className="text-[11px] text-muted-foreground font-medium">GST Tax Type</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className={isInterState ? "text-blue-700 bg-blue-500/10" : "text-emerald-700 bg-emerald-500/10"}>
                  {isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table styled like Vyapar Desktop Bill Table */}
      <Card className="rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-wider">Item Details</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              Add products or services from catalog or type custom line items
            </p>
          </div>

          <div className="flex items-center gap-2">
            {catalogItems.length > 0 && (
              <Select onValueChange={(value) => { if (typeof value === "string") addFromCatalog(value); }}>
                <SelectTrigger className="h-8 text-xs w-44 bg-card">
                  <SelectValue placeholder="+ Pick from Catalog" />
                </SelectTrigger>
                <SelectContent>
                  {catalogItems.map((item) => (
                    <SelectItem key={item.id} value={item.id} className="text-xs">
                      {item.name} ({formatCurrency(item.unitPrice, currency)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems((current) => [...current, emptyLineItem(defaultTaxRate)])}
              className="h-8 text-xs font-semibold gap-1"
            >
              <Plus className="size-3.5" />
              <span>Add Row</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="min-w-64">Item Description *</TableHead>
                <TableHead className="w-24">HSN/SAC</TableHead>
                <TableHead className="w-20">Qty *</TableHead>
                <TableHead className="w-20">Unit</TableHead>
                <TableHead className="w-28">Rate (₹) *</TableHead>
                <TableHead className="w-24">GST %</TableHead>
                <TableHead className="w-32 text-right">Amount (₹)</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => {
                const lineAmount = calculateLineAmount(item.quantity, item.unitPrice);

                return (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Item name / description"
                        required
                        className="h-8 text-xs"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.hsn}
                        onChange={(e) => updateItem(index, "hsn", e.target.value)}
                        placeholder="HSN"
                        className="h-8 text-xs font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        required
                        className="h-8 text-xs text-right font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        placeholder="PCS"
                        className="h-8 text-xs font-mono"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                        required
                        className="h-8 text-xs text-right font-mono font-bold"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={String(item.gstRate)}
                        onValueChange={(val) => val && updateItem(index, "gstRate", val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GST_RATES.map((rate) => (
                            <SelectItem key={rate} value={String(rate)} className="text-xs">
                              {rate}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-black">
                      {formatCurrency(lineAmount, currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setItems((curr) =>
                            curr.length === 1 ? curr : curr.filter((_, i) => i !== index),
                          )
                        }
                        disabled={items.length === 1}
                        className="size-7 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bottom Section: Notes & Transport (Left) vs Vyapar Totals (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Terms, Notes, Transport */}
        <div className="space-y-4 lg:col-span-7">
          <Card className="rounded-xl shadow-xs">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Terms & Conditions
                </Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  rows={2}
                  className="text-xs resize-none"
                  placeholder="Payment terms, warranty, interest clause..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notes & Remarks (Private or for Customer)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="text-xs resize-none"
                  placeholder="Bank details reminder, delivery instructions..."
                />
              </div>

              {/* Collapsible Transport details */}
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowTransport((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <Truck className="size-3.5" />
                  <span>{showTransport ? "Hide E-Way Bill & Transport Details" : "+ Add E-Way Bill & Transport Details"}</span>
                  <ChevronDown className={`size-3 transition-transform ${showTransport ? "rotate-180" : ""}`} />
                </button>

                {showTransport && (
                  <div className="grid gap-3 sm:grid-cols-3 pt-3">
                    <div className="space-y-1">
                      <Label htmlFor="vehicleNumber" className="text-[11px] text-muted-foreground">
                        Vehicle No.
                      </Label>
                      <Input
                        id="vehicleNumber"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="MH 12 AB 1234"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ewayBill" className="text-[11px] text-muted-foreground">
                        E-Way Bill No.
                      </Label>
                      <Input
                        id="ewayBill"
                        value={ewayBill}
                        onChange={(e) => setEwayBill(e.target.value)}
                        placeholder="12-digit number"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="orderNumber" className="text-[11px] text-muted-foreground">
                        Purchase Order No.
                      </Label>
                      <Input
                        id="orderNumber"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        placeholder="PO-001"
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Totals Calculation Summary */}
        <div className="lg:col-span-5">
          <Card className="rounded-xl shadow-xs border-t-4 border-t-[#D32F2F]">
            <CardHeader className="p-4 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm font-black uppercase tracking-wider">
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between text-xs py-1">
                <span className="text-muted-foreground">Subtotal (Taxable Base)</span>
                <span className="font-mono font-semibold">{formatCurrency(totals.subtotal, currency)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-muted-foreground">Discount (₹)</span>
                <div className="w-28">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="h-7 text-xs text-right font-mono"
                  />
                </div>
              </div>

              {/* GST Tax Breakdown */}
              <div className="border-t pt-2 space-y-1.5 text-xs">
                {isInterState ? (
                  <div className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">Integrated GST (IGST)</span>
                    <span className="font-mono font-medium text-blue-600">
                      {formatCurrency(totals.igstAmount, currency)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">Central GST (CGST)</span>
                      <span className="font-mono font-medium text-emerald-600">
                        {formatCurrency(totals.cgstAmount, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">State GST (SGST)</span>
                      <span className="font-mono font-medium text-emerald-600">
                        {formatCurrency(totals.sgstAmount, currency)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-0.5 font-medium">
                  <span className="text-muted-foreground">Total Tax Amount</span>
                  <span className="font-mono">{formatCurrency(totals.taxAmount, currency)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="border-t-2 border-foreground/20 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-black tracking-tight">Grand Total</span>
                    <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
                  </div>
                  <span className="text-2xl font-black font-mono text-[#D32F2F]">
                    {formatCurrency(totals.total, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="h-10">
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={
                    isPurchase
                      ? "bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold h-10 px-6 shadow-sm"
                      : "bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold h-10 px-6 shadow-sm"
                  }
                >
                  {isSubmitting ? "Saving..." : invoiceId ? `Update ${meta.label}` : `Save & Preview Bill`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
