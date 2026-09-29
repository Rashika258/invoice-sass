"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  Plus,
  Printer,
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
import { InfoTooltip, SimpleTooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { INDIAN_STATES } from "@/lib/geo-data";
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

function ItemCombobox({
  value,
  catalogItems,
  currency = "INR",
  isPurchase = false,
  isEstimate = false,
  onChange,
  onSelectItem,
}: {
  value: string;
  catalogItems: Item[];
  currency?: string;
  isPurchase?: boolean;
  isEstimate?: boolean;
  onChange: (val: string) => void;
  onSelectItem: (item: Item) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return catalogItems;
    return catalogItems.filter(
      (it) =>
        it.name.toLowerCase().includes(query) ||
        (it.hsn && it.hsn.toLowerCase().includes(query))
    );
  }, [catalogItems, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <div className="relative flex items-center w-full">
            <Input
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setSearch(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => {
                setSearch("");
                setOpen(true);
              }}
              placeholder="Select item from dropdown..."
              required
              className="h-9 text-xs pr-7 bg-background w-full"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                setSearch("");
                setOpen((prev) => !prev);
              }}
              className="absolute right-1 flex size-7 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
              title="Open products dropdown"
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        }
      />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-80 sm:w-96 p-0 z-[100] shadow-2xl border border-border bg-popover rounded-xl overflow-hidden flex flex-col"
      >
        <div className="p-2.5 px-3 border-b border-border bg-muted/40 shrink-0 flex items-center justify-between text-[11px] text-muted-foreground select-none">
          <span className="font-bold uppercase tracking-wider text-[10px] text-foreground flex items-center gap-1.5">
            <span>{filteredItems.length} Products Available</span>
            {isEstimate && (
              <span className="bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold px-1.5 py-0.5 rounded text-[9px]">
                Est. Rates Active
              </span>
            )}
          </span>
          <span className="text-[10px] text-muted-foreground">Select to auto-fill</span>
        </div>

        <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 scrollbar-none bg-popover">
          {filteredItems.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              No products match &quot;{search}&quot;.
              <div className="mt-1 text-[11px] text-foreground font-medium">
                Press enter or keep typing for custom item.
              </div>
            </div>
          ) : (
            filteredItems.map((catItem) => {
              const price = isEstimate
                ? (catItem.estimatePrice && catItem.estimatePrice > 0 ? catItem.estimatePrice : catItem.unitPrice)
                : isPurchase
                  ? (catItem.purchasePrice || catItem.unitPrice)
                  : catItem.unitPrice;

              return (
                <button
                  key={catItem.id}
                  type="button"
                  onClick={() => {
                    onSelectItem(catItem);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="font-semibold text-foreground truncate group-hover:text-accent-foreground">
                      {catItem.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      {catItem.hsn && <span>HSN: {catItem.hsn}</span>}
                      <span>Unit: {catItem.unit}</span>
                      {catItem.stockQty !== undefined && catItem.stockQty !== null && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Stock: {catItem.stockQty}
                        </span>
                      )}
                      <span>GST: {catItem.gstRate}%</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-xs text-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                      {formatCurrency(price, currency)}
                    </div>
                    {isEstimate && (
                      <div className="text-[9px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 text-right">
                        {catItem.estimatePrice && catItem.estimatePrice > 0 ? "Estimate Rate" : "Standard Rate"}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

  const [partyList, setPartyList] = useState<Customer[]>(customers);
  useEffect(() => {
    setPartyList(customers);
  }, [customers]);

  const [createdInvoice, setCreatedInvoice] = useState<{
    id: string;
    number: string;
    total: number;
  } | null>(null);

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

  // --- Draft auto-save & restore ---
  const DRAFT_KEY = `billora_draft_${documentType}`;
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<string | null>(null);

  // Check for saved draft on mount for new documents
  useEffect(() => {
    if (invoiceId || initialData) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.items?.length > 0 || parsed.customerId)) {
          setHasSavedDraft(true);
          setDraftTimestamp(
            parsed.savedAt ? new Date(parsed.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "earlier"
          );
        }
      }
    } catch {}
  }, [invoiceId, initialData, DRAFT_KEY]);

  // Debounced auto-save draft
  useEffect(() => {
    if (invoiceId) return;
    const hasData = customerId || items.some((i) => i.description?.trim() || i.unitPrice > 0);
    if (!hasData) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            customerId,
            issueDate,
            dueDate,
            discount,
            notes,
            terms,
            placeOfSupply,
            vehicleNumber,
            ewayBill,
            orderNumber,
            items,
          })
        );
      } catch {}
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    invoiceId,
    customerId,
    issueDate,
    dueDate,
    discount,
    notes,
    terms,
    placeOfSupply,
    vehicleNumber,
    ewayBill,
    orderNumber,
    items,
    DRAFT_KEY,
  ]);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.customerId) setCustomerId(parsed.customerId);
      if (parsed.items?.length) setItems(parsed.items);
      if (parsed.issueDate) setIssueDate(parsed.issueDate);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.notes !== undefined) setNotes(parsed.notes);
      if (parsed.terms !== undefined) setTerms(parsed.terms);
      if (parsed.discount !== undefined) setDiscount(parsed.discount);
      if (parsed.placeOfSupply) setPlaceOfSupply(parsed.placeOfSupply);
      if (parsed.vehicleNumber) setVehicleNumber(parsed.vehicleNumber);
      if (parsed.ewayBill) setEwayBill(parsed.ewayBill);
      if (parsed.orderNumber) setOrderNumber(parsed.orderNumber);
      setHasSavedDraft(false);
      toast.success("Draft restored successfully!");
    } catch {
      toast.error("Failed to restore draft");
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasSavedDraft(false);
      toast.info("Draft discarded");
    } catch {}
  };

  const selectedParty = partyList.find((party) => party.id === customerId);
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
    const isEstimate = documentType === "ESTIMATE";
    const defaultPrice = isEstimate
      ? (catalogItem.estimatePrice && catalogItem.estimatePrice > 0 ? catalogItem.estimatePrice : catalogItem.unitPrice)
      : isPurchase
        ? (catalogItem.purchasePrice || catalogItem.unitPrice)
        : catalogItem.unitPrice;

    const lineItem: LineItem = {
      itemId: catalogItem.id,
      description: catalogItem.name + (catalogItem.description ? ` - ${catalogItem.description}` : ""),
      hsn: catalogItem.hsn ?? "",
      unit: catalogItem.unit ?? "PCS",
      quantity: 1,
      unitPrice: defaultPrice,
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

  const selectCatalogItemForRow = (index: number, catalogItem: Item) => {
    const isEstimate = documentType === "ESTIMATE";
    const price = isEstimate
      ? (catalogItem.estimatePrice && catalogItem.estimatePrice > 0 ? catalogItem.estimatePrice : catalogItem.unitPrice)
      : isPurchase
        ? (catalogItem.purchasePrice || catalogItem.unitPrice)
        : catalogItem.unitPrice;

    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          itemId: catalogItem.id,
          description: catalogItem.name,
          hsn: catalogItem.hsn ?? "",
          unit: catalogItem.unit ?? "PCS",
          unitPrice: Number(price) || 0,
          gstRate: catalogItem.gstRate ?? defaultTaxRate,
        };
      }),
    );
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
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
        toast.success(`${meta.label} created successfully`);
        setCreatedInvoice({
          id: invoice.id,
          number: invoice.invoiceNumber,
          total: invoice.total,
        });
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parties = partyList.filter((party) =>
    isPurchase
      ? party.partyType === "SUPPLIER" || party.partyType === "BOTH"
      : party.partyType === "CUSTOMER" || party.partyType === "BOTH",
  );

  if (createdInvoice) {
    return (
      <Card className="rounded-2xl border border-primary/30 bg-primary/5 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-sm">
            ✓
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {meta.label} #{createdInvoice.number} Created Successfully!
            </h2>
            <p className="text-xs text-muted-foreground">
              Document Total: {formatCurrency(createdInvoice.total, currency)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-primary/20">
          <Link href={`/invoices/${createdInvoice.id}`}>
            <Button size="sm" className="h-8 text-xs font-bold">
              View {meta.label}
            </Button>
          </Link>
          <Link href={`/invoices/${createdInvoice.id}?print=true`}>
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
              Print / Export PDF
            </Button>
          </Link>
          <Link href="/payments">
            <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
              Record Payment
            </Button>
          </Link>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setCreatedInvoice(null);
              setItems([emptyLineItem(defaultTaxRate)]);
              setNotes("");
            }}
            className="h-8 text-xs font-bold border border-border"
          >
            + Create Another {meta.label}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Unsaved Draft Alert Banner */}
      {hasSavedDraft && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold text-sm">
              📝
            </span>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                You have an unsaved draft {draftTimestamp ? `saved at ${draftTimestamp}` : ""}.
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80">
                Restore your previous line items, customer, and tax details in 1 click.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={discardDraft}
              className="h-7 text-xs font-semibold border-amber-500/30 hover:bg-amber-500/15 cursor-pointer"
            >
              Discard
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={restoreDraft}
              className="h-7 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs"
            >
              Restore Draft
            </Button>
          </div>
        </div>
      )}

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
                className="bg-brand hover:bg-brand text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-xs"
              >
                {meta.label.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Billora GST Billing Desk · Auto tax calculation &amp; inventory update
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
            className="bg-brand hover:bg-brand/90 text-white font-medium shadow-xs px-4 h-8 text-xs rounded-lg active:scale-[0.98] transition-all"
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
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {meta.partyLabel} *
                  </Label>
                  <InfoTooltip text={`Select or register a ${meta.partyLabel.toLowerCase()} to track opening balances, GSTIN, and ledger accounts.`} />
                </div>
                {selectedParty && (
                  <span className="text-xs font-semibold">
                    Balance:{" "}
                    <span className="text-foreground font-bold font-mono">
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
                    <SelectValue placeholder={`Select ${meta.partyLabel}`}>
                      {selectedParty
                        ? `${selectedParty.name}${selectedParty.phone ? ` (${selectedParty.phone})` : ""}`
                        : `Select ${meta.partyLabel}`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {parties.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        No {meta.partyLabel.toLowerCase()} records found. Click + to add
                      </SelectItem>
                    ) : (
                      parties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} {p.phone ? `(${p.phone})` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <CustomerFormDialog
                  defaultPartyType={isPurchase ? "SUPPLIER" : "CUSTOMER"}
                  onSuccess={(newParty) => {
                    if (newParty) {
                      setPartyList((prev) => {
                        const exists = prev.some((p) => p.id === newParty.id);
                        return exists
                          ? prev.map((p) => (p.id === newParty.id ? newParty : p))
                          : [newParty, ...prev];
                      });
                      setCustomerId(newParty.id);
                    }
                    router.refresh();
                  }}
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
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Bill Date *
              </Label>
              <DatePicker value={issueDate} onChange={setIssueDate} />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Payment Due Date
                </Label>
                <InfoTooltip text="Deadline for payment settlement before the invoice is flagged as overdue." />
              </div>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t text-xs">
            {/* Place of Supply */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="placeOfSupply" className="text-xs text-muted-foreground">
                  Place of Supply (State)
                </Label>
                <InfoTooltip text="Determines tax type: Intra-State (CGST + SGST) if matching your business state, or Inter-State (IGST) if different." />
              </div>
              <Input
                id="placeOfSupply"
                list="indian-states-pos-list"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                placeholder={selectedParty?.state || companyState || "E.g. Maharashtra"}
                className="h-9 text-xs"
              />
              <datalist id="indian-states-pos-list">
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st} />
                ))}
              </datalist>
            </div>

            {/* Status (Credit vs Paid) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-xs text-muted-foreground">Payment Status</Label>
                <InfoTooltip text="Credit/Open leaves an unpaid balance in receivables/payables. Cash/Paid records full settlement immediately." />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value === "DRAFT" || value === "SENT" || value === "PAID" || value === "OVERDUE" || value === "CANCELLED") {
                    setStatus(value);
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs">
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
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">GST Tax Type</span>
                <InfoTooltip text="Calculated automatically by comparing company state and customer place of supply." />
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-primary bg-primary/10 border-primary/20">
                  {isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table styled for Billora Invoice Bill Table */}
      <Card className="rounded-xl shadow-xs">
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b rounded-t-xl">
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
                      {item.name} ({formatCurrency(documentType === "ESTIMATE" && item.estimatePrice ? item.estimatePrice : item.unitPrice, currency)})
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

        <div className="overflow-x-auto min-h-[380px] pb-28">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead className="min-w-64">Item Description *</TableHead>
                <TableHead className="w-24">
                  <div className="flex items-center gap-1">
                    <span>HSN/SAC</span>
                    <InfoTooltip text="Harmonized System of Nomenclature / Services Accounting Code required for GST filing." />
                  </div>
                </TableHead>
                <TableHead className="w-20">Qty *</TableHead>
                <TableHead className="w-20">Unit</TableHead>
                <TableHead className="w-28">
                  {documentType === "ESTIMATE" ? "Est. Rate (₹) *" : "Rate (₹) *"}
                </TableHead>
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
                    <TableCell className="min-w-60">
                      <ItemCombobox
                        value={item.description}
                        catalogItems={catalogItems}
                        currency={currency}
                        isPurchase={isPurchase}
                        isEstimate={documentType === "ESTIMATE"}
                        onChange={(val) => updateItem(index, "description", val)}
                        onSelectItem={(catItem) => selectCatalogItemForRow(index, catItem)}
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

      {/* Bottom Section: Notes & Transport (Left) vs Summary Totals (Right) */}
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
                  <span>{showTransport ? "Hide E-Way Bill & Transport Details" : "Add E-Way Bill & Transport Details"}</span>
                  <ChevronDown className={`size-3 transition-transform ${showTransport ? "rotate-180" : ""}`} />
                </button>

                {showTransport && (
                  <div className="grid gap-3 sm:grid-cols-3 pt-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="vehicleNumber" className="text-[11px] text-muted-foreground">
                          Vehicle No.
                        </Label>
                        <InfoTooltip text="Vehicle registration number (Part-B of E-Way Bill) transporting the consignment." />
                      </div>
                      <Input
                        id="vehicleNumber"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="MH 12 AB 1234"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="ewayBill" className="text-[11px] text-muted-foreground">
                          E-Way Bill No.
                        </Label>
                        <InfoTooltip text="12-digit Government e-Way Bill number. Mandatory for movement of goods valued over ₹50,000." />
                      </div>
                      <Input
                        id="ewayBill"
                        value={ewayBill}
                        onChange={(e) => setEwayBill(e.target.value)}
                        placeholder="12-digit number"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="orderNumber" className="text-[11px] text-muted-foreground">
                          Purchase Order No.
                        </Label>
                        <InfoTooltip text="Customer PO reference number for cross-referencing payments and delivery orders." />
                      </div>
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
          <Card className={`rounded-xl shadow-xs border-t-4 ${isPurchase ? "border-t-[#1976D2]" : "border-t-primary"}`}>
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
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>Discount (₹)</span>
                  <InfoTooltip text="Lump-sum discount deducted from taxable subtotal prior to GST calculation." />
                </div>
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
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(totals.igstAmount, currency)}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">Central GST (CGST)</span>
                      <span className="font-mono font-medium text-foreground">
                        {formatCurrency(totals.cgstAmount, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-muted-foreground">State GST (SGST)</span>
                      <span className="font-mono font-medium text-foreground">
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
                  <span className="text-2xl font-black font-mono text-primary">
                    {formatCurrency(totals.total, currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="h-10 text-xs">
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 shadow-sm gap-1.5 cursor-pointer text-xs"
                >
                  <Printer className="size-4" />
                  <span>{isSubmitting ? "Saving..." : invoiceId ? `Update & Print ${meta.label}` : `Save & Print ${meta.label}`}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
