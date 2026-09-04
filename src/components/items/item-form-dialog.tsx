"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Camera,
  Check,
  ChevronDown,
  Info,
  Package,
  Plus,
  Search,
  Settings,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Item } from "@/generated/prisma/client";
import { createItem, deleteItem, updateItem } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ItemFormDialogProps = {
  item?: Item;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
};

const COMMON_UNITS = [
  "PCS",
  "BOX",
  "KGS",
  "NOS",
  "SET",
  "MTR",
  "PAC",
  "LTR",
  "BAG",
  "ROLL",
  "DOZ",
  "BDL",
];

const COMMON_CATEGORIES = [
  "General",
  "Hardware & Fasteners",
  "Raw Material",
  "Machinery Parts",
  "Electrical & Electronics",
  "Pipes & Fittings",
  "Welding & Fabrication",
  "Paints & Chemicals",
  "Tools & Equipment",
];

export function ItemFormDialog({ item, trigger, onSuccess }: ItemFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Field States
  const [itemType, setItemType] = useState<"PRODUCT" | "SERVICE">(
    item?.itemType === "SERVICE" ? "SERVICE" : "PRODUCT"
  );
  const [itemName, setItemName] = useState(item?.name ?? "");
  const [hsn, setHsn] = useState(item?.hsn ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "PCS");
  const [category, setCategory] = useState("General");
  const [itemCode, setItemCode] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"pricing" | "stock">("pricing");

  // Pricing States
  const [salePrice, setSalePrice] = useState<number | string>(item?.unitPrice ?? "");
  const [saleTaxType, setSaleTaxType] = useState<"WITHOUT_TAX" | "WITH_TAX">("WITHOUT_TAX");
  const [discountVal, setDiscountVal] = useState<number | string>("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "AMOUNT">("PERCENT");
  const [estimatePrice, setEstimatePrice] = useState<number | string>(item?.estimatePrice ?? "");
  const [showWholesale, setShowWholesale] = useState(false);
  const [wholesalePrice, setWholesalePrice] = useState<number | string>("");
  const [minWholesaleQty, setMinWholesaleQty] = useState<number | string>("");
  const [purchasePrice, setPurchasePrice] = useState<number | string>(item?.purchasePrice ?? "");
  const [purchaseTaxType, setPurchaseTaxType] = useState<"WITHOUT_TAX" | "WITH_TAX">("WITHOUT_TAX");
  const [gstRate, setGstRate] = useState<number>(item?.gstRate ?? 18);

  // Stock States
  const [stockQty, setStockQty] = useState<number | string>(item?.stockQty ?? 0);
  const [atPrice, setAtPrice] = useState<number | string>(item?.purchasePrice ?? "");
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [minStock, setMinStock] = useState<number | string>(item?.minStock ?? 0);
  const [locationRack, setLocationRack] = useState("");
  const [isPublic, setIsPublic] = useState(item?.isPublic ?? true);

  // Auto assign item code
  const handleAssignCode = () => {
    const randomCode = `ITM-${Math.floor(1000 + Math.random() * 9000)}`;
    setItemCode(randomCode);
    toast.success(`Assigned Code: ${randomCode}`);
  };

  const handleSave = async (andNew: boolean = false) => {
    if (!itemName.trim()) {
      toast.error("Please enter Item Name");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate effective prices
      const numericSalePrice = Number(salePrice) || 0;
      const effectiveSalePrice =
        saleTaxType === "WITH_TAX" && gstRate > 0
          ? Math.round((numericSalePrice / (1 + gstRate / 100)) * 100) / 100
          : numericSalePrice;

      const numericPurchasePrice = Number(purchasePrice) || 0;
      const effectivePurchasePrice =
        purchaseTaxType === "WITH_TAX" && gstRate > 0
          ? Math.round((numericPurchasePrice / (1 + gstRate / 100)) * 100) / 100
          : numericPurchasePrice;

      const data = {
        name: itemName.trim(),
        description: [
          category !== "General" ? `Category: ${category}` : null,
          itemCode ? `Code: ${itemCode}` : null,
          locationRack ? `Rack: ${locationRack}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
        hsn: hsn.trim(),
        unitPrice: effectiveSalePrice,
        estimatePrice: Number(estimatePrice) || effectiveSalePrice,
        purchasePrice: effectivePurchasePrice,
        unit: unit.trim(),
        gstRate: Number(gstRate),
        itemType,
        stockQty: Number(stockQty) || 0,
        minStock: Number(minStock) || 0,
        isPublic,
      };

      if (item) {
        await updateItem(item.id, data);
        toast.success("Item updated successfully");
      } else {
        await createItem(data);
        toast.success("Item created successfully");
      }

      onSuccess?.();

      if (andNew) {
        // Reset fields for new entry
        setItemName("");
        setHsn("");
        setSalePrice("");
        setEstimatePrice("");
        setPurchasePrice("");
        setStockQty(0);
        setItemCode("");
      } else {
        setOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          (trigger ?? (
            <Button className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold text-xs h-8 px-3 rounded-lg shadow-xs">
              <Plus className="mr-1.5 size-3.5" />
              {item ? "Edit Item" : "Add Item"}
            </Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 border border-border shadow-2xl rounded-2xl bg-card">
        {/* Top Header matching media_1788527376142.png */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-foreground">
              {item ? "Edit Item" : "Add Item"}
            </h2>

            {/* Product / Service Switch Pill */}
            <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-full border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => setItemType("PRODUCT")}
                className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  itemType === "PRODUCT"
                    ? "bg-[#1976D2] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => setItemType("SERVICE")}
                className={`px-3 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  itemType === "SERVICE"
                    ? "bg-[#1976D2] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Service
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer"
              title="Item Settings"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Row 1: Item Name, HSN, Select Unit, Add Item Image */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Item Name */}
            <div className="sm:col-span-5 space-y-1">
              <div className="relative rounded-lg border-2 border-primary/70 focus-within:border-primary px-3 pt-2 pb-1 bg-background">
                <label className="text-[10px] font-bold text-primary block leading-none">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. M10 SS Hex Bolt 50mm"
                  className="w-full bg-transparent border-none outline-hidden text-xs font-semibold text-foreground pt-0.5"
                  required
                />
              </div>
            </div>

            {/* Item HSN */}
            <div className="sm:col-span-3 space-y-1">
              <div className="relative rounded-lg border border-input focus-within:border-foreground px-3 pt-2 pb-1 bg-background">
                <label className="text-[10px] font-medium text-muted-foreground block leading-none">
                  Item HSN
                </label>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    placeholder="e.g. 7318"
                    className="w-full bg-transparent border-none outline-hidden text-xs font-mono text-foreground pt-0.5"
                  />
                  <Search className="size-3 text-muted-foreground shrink-0 ml-1 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Select Unit Button */}
            <div className="sm:col-span-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-[42px] rounded-lg border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold text-xs hover:bg-sky-500/20"
                    >
                      <span>{unit || "Select Unit"}</span>
                      <ChevronDown className="size-3 ml-1" />
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-32 max-h-48 overflow-y-auto">
                  {COMMON_UNITS.map((u) => (
                    <DropdownMenuItem
                      key={u}
                      onClick={() => setUnit(u)}
                      className={`text-xs cursor-pointer ${unit === u ? "font-bold bg-accent" : ""}`}
                    >
                      {u}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Add Item Image */}
            <div className="sm:col-span-2">
              <label className="flex items-center justify-center gap-1.5 h-[42px] rounded-lg border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors text-xs font-semibold cursor-pointer px-2 text-center bg-muted/20">
                <Camera className="size-3.5 shrink-0" />
                <span className="truncate text-[11px]">+ Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={() => toast.success("Image attached")}
                />
              </label>
            </div>
          </div>

          {/* Row 2: Category & Item Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus:outline-hidden focus:border-foreground"
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Item Code */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Item Code</label>
              <div className="flex items-center gap-2">
                <Input
                  value={itemCode}
                  onChange={(e) => setItemCode(e.target.value)}
                  placeholder="Item SKU / Barcode"
                  className="h-9 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAssignCode}
                  className="h-9 rounded-lg text-xs font-semibold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 shrink-0"
                >
                  Assign Code
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs: Pricing & Stock */}
          <div className="border-b border-border/80">
            <div className="flex items-center gap-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("pricing")}
                className={`pb-2 transition-all cursor-pointer ${
                  activeTab === "pricing"
                    ? "border-b-2 border-[#ef4444] text-[#ef4444]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stock")}
                className={`pb-2 transition-all cursor-pointer ${
                  activeTab === "stock"
                    ? "border-b-2 border-[#ef4444] text-[#ef4444]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Stock
              </button>
            </div>
          </div>

          {/* TAB 1: PRICING (media_1788527376142.png) */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              {/* Sale Price Card */}
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
                <span className="text-xs font-bold text-foreground">Sale Price</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sale Price + Without/With Tax */}
                  <div className="flex rounded-lg border border-input overflow-hidden bg-background">
                    <Input
                      type="number"
                      placeholder="Sale Price"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="border-none rounded-none text-xs font-mono h-9"
                    />
                    <select
                      value={saleTaxType}
                      onChange={(e) => setSaleTaxType(e.target.value as any)}
                      className="border-l border-input bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground outline-hidden cursor-pointer"
                    >
                      <option value="WITHOUT_TAX">Without Tax</option>
                      <option value="WITH_TAX">With Tax</option>
                    </select>
                  </div>

                  {/* Discount on Sale Price */}
                  <div className="flex rounded-lg border border-input overflow-hidden bg-background">
                    <Input
                      type="number"
                      placeholder="Disc. On Sale Price"
                      value={discountVal}
                      onChange={(e) => setDiscountVal(e.target.value)}
                      className="border-none rounded-none text-xs font-mono h-9"
                    />
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="border-l border-input bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground outline-hidden cursor-pointer"
                    >
                      <option value="PERCENT">Percentage</option>
                      <option value="AMOUNT">Amount</option>
                    </select>
                  </div>
                </div>

                {/* Estimate Price for Quotations (Dual Pricing Feature) */}
                <div className="pt-1">
                  <div className="flex items-center gap-2 max-w-sm rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-2 text-xs">
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      Estimate Price:
                    </span>
                    <Input
                      type="number"
                      placeholder="Rate for Estimates"
                      value={estimatePrice}
                      onChange={(e) => setEstimatePrice(e.target.value)}
                      className="h-7 text-xs font-mono bg-background"
                    />
                  </div>
                </div>

                {/* Wholesale Price Link & Inputs */}
                <div>
                  {!showWholesale ? (
                    <button
                      type="button"
                      onClick={() => setShowWholesale(true)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-3" />
                      <span>Add Wholesale Price</span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Wholesale Rate (₹)</label>
                        <Input
                          type="number"
                          value={wholesalePrice}
                          onChange={(e) => setWholesalePrice(e.target.value)}
                          placeholder="Wholesale Rate"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Min Wholesale Qty</label>
                        <Input
                          type="number"
                          value={minWholesaleQty}
                          onChange={(e) => setMinWholesaleQty(e.target.value)}
                          placeholder="e.g. 50"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Row: Purchase Price and Taxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Purchase Price */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground">Purchase Price</span>
                  <div className="flex rounded-lg border border-input overflow-hidden bg-background">
                    <Input
                      type="number"
                      placeholder="Purchase Price"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="border-none rounded-none text-xs font-mono h-9"
                    />
                    <select
                      value={purchaseTaxType}
                      onChange={(e) => setPurchaseTaxType(e.target.value as any)}
                      className="border-l border-input bg-muted/30 px-2 text-[11px] font-medium text-muted-foreground outline-hidden cursor-pointer"
                    >
                      <option value="WITHOUT_TAX">Without Tax</option>
                      <option value="WITH_TAX">With Tax</option>
                    </select>
                  </div>
                </div>

                {/* Taxes Section */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground">Taxes</span>
                  <div className="relative rounded-lg border border-input bg-background px-3 pt-1 pb-1">
                    <label className="text-[9px] text-muted-foreground block">Tax Rate</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full bg-transparent border-none outline-hidden text-xs font-semibold text-foreground cursor-pointer"
                    >
                      <option value={0}>None (0%)</option>
                      <option value={5}>GST @ 5%</option>
                      <option value={12}>GST @ 12%</option>
                      <option value={18}>GST @ 18%</option>
                      <option value={28}>GST @ 28%</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOCK */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
                <span className="text-xs font-bold text-foreground">Stock Details</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Opening Quantity</label>
                    <Input
                      type="number"
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      placeholder="0"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">At Price (₹/unit)</label>
                    <Input
                      type="number"
                      value={atPrice}
                      onChange={(e) => setAtPrice(e.target.value)}
                      placeholder="Cost Rate"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">As of Date</label>
                    <Input
                      type="date"
                      value={asOfDate}
                      onChange={(e) => setAsOfDate(e.target.value)}
                      className="h-9 text-xs font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Min Stock Alert Level</label>
                    <Input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      placeholder="Alert when stock falls below"
                      className="h-9 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Item Location / Rack</label>
                    <Input
                      type="text"
                      value={locationRack}
                      onChange={(e) => setLocationRack(e.target.value)}
                      placeholder="e.g. Rack B-3, Godown 1"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Online Store Toggle Strip */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublicToggle"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="size-4 rounded accent-primary cursor-pointer"
              />
              <label htmlFor="isPublicToggle" className="text-xs font-semibold text-foreground cursor-pointer">
                Publish this product in My Online Store
              </label>
            </div>
            {isPublic && (
              <Badge className="bg-emerald-500/15 text-emerald-500 border-none text-[10px]">
                Active in Catalog
              </Badge>
            )}
          </div>
        </div>

        {/* Footer Actions matching media_1788527376142.png */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border/80 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="h-9 rounded-xl text-xs font-semibold border-border hover:bg-muted"
          >
            Save &amp; New
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="h-9 rounded-xl text-xs font-bold bg-[#6366f1] hover:bg-[#4f46e5] text-white px-6 shadow-xs transition-all active:scale-[0.98]"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteItemButton({
  itemId,
  onSuccess,
}: {
  itemId: string;
  onSuccess?: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this item?")) return;

    setIsDeleting(true);
    try {
      await deleteItem(itemId);
      toast.success("Item deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete item");
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
      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
    >
      Delete
    </Button>
  );
}
