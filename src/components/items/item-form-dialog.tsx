"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Camera,
  Check,
  ChevronDown,
  ImageIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Item } from "@/generated/prisma/client";
import { createItem, deleteItem, updateItem } from "@/actions/items";
import { processImageFile } from "@/lib/brand-theme";
import { useActiveOrganization } from "@/hooks/useActiveOrganization";
import { getVerticalConfig } from "@/lib/verticals";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { ConfirmActionButton } from "@/components/ui/action-button";
import { InfoTooltip } from "@/components/ui/tooltip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { businessVertical } = useActiveOrganization();
  const verticalConfig = useMemo(() => getVerticalConfig(businessVertical), [businessVertical]);

  const unitsList = useMemo(() => {
    return Array.from(new Set([...verticalConfig.units, ...COMMON_UNITS]));
  }, [verticalConfig]);

  const categoriesList = useMemo(() => {
    return Array.from(new Set([...verticalConfig.categories, ...COMMON_CATEGORIES]));
  }, [verticalConfig]);

  // Form Field States
  const [itemType, setItemType] = useState<"PRODUCT" | "SERVICE">(
    item?.itemType ? item.itemType : verticalConfig.defaultItemType
  );
  const [itemName, setItemName] = useState(item?.name ?? "");
  const [hsn, setHsn] = useState(item?.hsn ?? "");
  const [unit, setUnit] = useState(item?.unit ?? verticalConfig.defaultUnit);
  const [category, setCategory] = useState(verticalConfig.categories[0] || "General");
  const [itemCode, setItemCode] = useState("");

  useEffect(() => {
    if (!item && open) {
      setItemType(verticalConfig.defaultItemType);
      setUnit(verticalConfig.defaultUnit);
      setCategory(verticalConfig.categories[0] || "General");
    }
  }, [open, item, verticalConfig]);

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
  const [imageUrl, setImageUrl] = useState((item as any)?.imageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const dataUrl = await processImageFile(file, 640);
      setImageUrl(dataUrl);
      toast.success("Product image attached");
    } catch (err: any) {
      toast.error(err.message || "Failed to process image");
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

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
        imageUrl: imageUrl.trim() || undefined,
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
        setImageUrl("");
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
            <Button className="bg-brand hover:opacity-90 text-white font-bold text-xs h-8 px-3 rounded-lg shadow-xs">
              <Plus className="mr-1.5 size-3.5" />
              {item ? "Edit Item" : "Add Item"}
            </Button>
          )) as React.ReactElement
        }
      />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0 border border-border shadow-2xl rounded-2xl bg-card">
        {/* Top Header matching media_1788527376142.png */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 shrink-0 bg-card z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-foreground">
              {item ? "Edit Item" : "Add Item"}
            </h2>

            {/* Product / Service Switch Pill */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/70 text-xs">
              <button
                type="button"
                onClick={() => setItemType("PRODUCT")}
                className={`px-3 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer ${
                  itemType === "PRODUCT"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => setItemType("SERVICE")}
                className={`px-3 py-1 rounded-full font-semibold text-xs transition-all cursor-pointer ${
                  itemType === "SERVICE"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Service
              </button>
            </div>

            <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono border-primary/30 text-primary">
              {verticalConfig.label}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 mr-8">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                router.push("/settings");
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer transition-colors"
              title="Item Settings"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-medium text-muted-foreground block leading-none">
                    Item HSN
                  </label>
                  <InfoTooltip text="Harmonized System of Nomenclature code for GST tax compliance." />
                </div>
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
            <div className="sm:col-span-2 space-y-1">
              <Select value={unit || verticalConfig.defaultUnit} onValueChange={(val) => val && setUnit(val)}>
                <SelectTrigger className="w-full h-[42px] rounded-lg border border-primary/40 bg-primary/10 text-primary font-semibold text-xs hover:bg-primary/20">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {verticalConfig.label} Units
                  </div>
                  {unitsList.map((u) => (
                    <SelectItem key={u} value={u} className="text-xs">
                      {u} {verticalConfig.units.includes(u) && <span className="text-[10px] text-primary font-mono ml-1">(Preset)</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add Item Image */}
            <div className="sm:col-span-2">
              {imageUrl ? (
                <div className="relative group h-[42px] rounded-lg border border-border overflow-hidden bg-muted/40 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={imageUrl}
                      alt="Item preview"
                      className="size-7 rounded object-cover border border-border/80 shrink-0 bg-background"
                    />
                    <span className="text-[11px] font-medium text-foreground truncate">
                      Photo set
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <label
                      title="Replace image"
                      className="cursor-pointer p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Camera className="size-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                      />
                    </label>
                    <button
                      type="button"
                      title="Remove image"
                      onClick={() => setImageUrl("")}
                      className="cursor-pointer p-1 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <label
                    className={`flex-1 flex items-center justify-center gap-1.5 h-[42px] rounded-lg border border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors text-xs font-semibold cursor-pointer px-2 text-center bg-muted/20 ${
                      isUploadingImage ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    {isUploadingImage ? (
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <Camera className="size-3.5 shrink-0" />
                    )}
                    <span className="truncate text-[11px]">
                      {isUploadingImage ? "Uploading..." : "+ Image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    title="Paste Image URL"
                    className="h-[42px] px-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs flex items-center justify-center cursor-pointer"
                  >
                    <LinkIcon className="size-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {showUrlInput && !imageUrl && (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/30 bg-primary/5">
              <LinkIcon className="size-3.5 text-primary shrink-0" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste product image URL (e.g. https://.../photo.jpg)"
                className="w-full bg-transparent border-none outline-hidden text-xs text-foreground placeholder:text-muted-foreground"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-[10px] font-semibold text-primary hover:underline shrink-0"
                >
                  Done
                </button>
              )}
            </div>
          )}

          {/* Row 2: Category & Item Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(val) => val && setCategory(val)}>
                <SelectTrigger className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {verticalConfig.label} Categories
                  </div>
                  {categoriesList.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Code */}
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="text-[11px] font-medium text-muted-foreground">Item Code / SKU</label>
                <InfoTooltip text="Unique barcode or inventory code used for quick scanner lookup in billing and POS." />
              </div>
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
                    ? "border-b-2 border-primary text-primary font-bold"
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
                    ? "border-b-2 border-primary text-primary font-bold"
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
                    <Select value={saleTaxType} onValueChange={(val) => setSaleTaxType(val as any)}>
                      <SelectTrigger className="h-9 border-l border-input border-t-0 border-r-0 border-b-0 bg-background text-foreground px-2 text-[11px] font-medium rounded-none shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WITHOUT_TAX" className="text-xs">Without Tax</SelectItem>
                        <SelectItem value="WITH_TAX" className="text-xs">With Tax</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Select value={discountType} onValueChange={(val) => setDiscountType(val as any)}>
                      <SelectTrigger className="h-9 border-l border-input border-t-0 border-r-0 border-b-0 bg-background text-foreground px-2 text-[11px] font-medium rounded-none shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENT" className="text-xs">Percentage</SelectItem>
                        <SelectItem value="AMOUNT" className="text-xs">Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Estimate Price for Quotations (Dual Pricing Feature) */}
                <div className="pt-1">
                  <div className="flex items-center gap-2 max-w-sm rounded-lg border border-border bg-muted/20 p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-foreground whitespace-nowrap">
                        Estimate Price:
                      </span>
                      <InfoTooltip text="Alternative pricing used automatically on Quotations & Estimates instead of standard sale price." />
                    </div>
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
                    <Select value={purchaseTaxType} onValueChange={(val) => setPurchaseTaxType(val as any)}>
                      <SelectTrigger className="h-9 border-l border-input border-t-0 border-r-0 border-b-0 bg-background text-foreground px-2 text-[11px] font-medium rounded-none shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WITHOUT_TAX" className="text-xs">Without Tax</SelectItem>
                        <SelectItem value="WITH_TAX" className="text-xs">With Tax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Taxes Section */}
                <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground">Taxes</span>
                  <div className="space-y-1">
                    <Select value={String(gstRate)} onValueChange={(val) => setGstRate(Number(val))}>
                      <SelectTrigger className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground">
                        <SelectValue placeholder="Select Tax Rate" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="text-xs">None (0%)</SelectItem>
                        <SelectItem value="5" className="text-xs">GST @ 5%</SelectItem>
                        <SelectItem value="12" className="text-xs">GST @ 12%</SelectItem>
                        <SelectItem value="18" className="text-xs">GST @ 18%</SelectItem>
                        <SelectItem value="28" className="text-xs">GST @ 28%</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <DatePicker
                      value={asOfDate}
                      onChange={setAsOfDate}
                      dateFormat="dd-MM-yyyy"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Min Stock Alert Level</label>
                      <InfoTooltip text="Triggers low-inventory warnings when current stock falls at or below this threshold." />
                    </div>
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
              <label htmlFor="isPublicToggle" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                <span>Publish this product in My Online Store</span>
                <InfoTooltip text="Make this item visible to customers browsing your public digital store catalog." />
              </label>
            </div>
            {isPublic && (
              <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                Active in Catalog
              </Badge>
            )}
          </div>
        </div>

        {/* Footer Actions */}
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
            className="h-9 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-xs transition-all active:scale-[0.98]"
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
  const handleDelete = async () => {
    try {
      await deleteItem(itemId);
      toast.success("Item deleted");
      onSuccess?.();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  return (
    <ConfirmActionButton
      confirmMessage="Delete this item?"
      onConfirm={handleDelete}
      variant="ghost"
      size="sm"
      className="size-7 p-0 flex items-center justify-center text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-lg"
      title="Delete Item"
    >
      <Trash2 className="size-3.5" />
    </ConfirmActionButton>
  );
}
