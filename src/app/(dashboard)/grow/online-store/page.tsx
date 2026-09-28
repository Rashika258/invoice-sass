"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Globe,
  Layers,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Settings2,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAppSettings,
  fetchStoreBills,
  fetchStoreProducts,
  generateStoreBillAction,
  saveAppSettingsAction,
  updateStoreProductAction,
} from "@/actions/store-ops";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDialog, FormFieldInput, FormFieldSelect } from "@/components/ui";
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
import { formatCurrency } from "@/lib/invoice-utils";
import type { StoreBill, StoreProduct } from "@/lib/store-db";

export default function OnlineStorePage() {
  const router = useRouter();
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [storeBills, setStoreBills] = useState<StoreBill[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "stock" | "bills" | "config">("stock");
  const [loading, setLoading] = useState(false);

  // New Store Bill Dialog
  const [newBillOpen, setNewBillOpen] = useState(false);
  const [custName, setCustName] = useState("Rajesh Enterprises");
  const [custPhone, setCustPhone] = useState("9845012345");
  const [custAddress, setCustAddress] = useState("Peenya 2nd Stage, Bengaluru");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedQty, setSelectedQty] = useState<number>(2);
  const [paymentMode, setPaymentMode] = useState("UPI");

  // QR Modal
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Stock Edit Dialog
  const [editProduct, setEditProduct] = useState<StoreProduct | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [editDiscVal, setEditDiscVal] = useState<number>(0);

  const loadData = async () => {
    const [prods, bills, sets] = await Promise.all([
      fetchStoreProducts(),
      fetchStoreBills(),
      fetchAppSettings(),
    ]);
    setStoreProducts(prods);
    setStoreBills(bills);
    setSettings(sets);
    if (prods.length > 0 && !selectedProductId) {
      setSelectedProductId(prods[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const storeUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/store`
      : `/store`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    toast.success("Store link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleInventoryMode = async (mode: "SEPARATE" | "SHARED") => {
    const updated = await saveAppSettingsAction({ storeInventoryMode: mode });
    setSettings(updated);
    toast.success(
      mode === "SEPARATE"
        ? "Switched to Isolated Store DB & Stock (Separate)"
        : "Switched to Unified Stock & Billing (Shared)"
    );
  };

  const handleSaveStockEdit = async () => {
    if (!editProduct) return;
    await updateStoreProductAction(editProduct.id, {
      onlineStock: editStockVal,
      onlinePrice: editPriceVal,
      discountPercent: editDiscVal,
    });
    toast.success(`Updated stock & price for ${editProduct.name}`);
    setEditProduct(null);
    await loadData();
  };

  const handleCreateStoreBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setLoading(true);
    try {
      const bill = await generateStoreBillAction({
        customerName: custName,
        customerPhone: custPhone,
        customerAddress: custAddress,
        paymentMode,
        items: [{ productId: selectedProductId, quantity: selectedQty }],
      });
      toast.success(`Generated Online Store GST Bill #${bill.billNumber}!`);
      setNewBillOpen(false);
      await loadData();
      router.push(`/grow/online-store/bill/${bill.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate store bill");
    } finally {
      setLoading(false);
    }
  };

  const isSeparate = settings?.storeInventoryMode === "SEPARATE";

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Store className="size-5 text-primary" />
            <span>My Online Store</span>
            <Badge
              className={`border-none text-[10px] font-bold ${
                isSeparate
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
              }`}
            >
              {isSeparate ? "ISOLATED STOCK & DB" : "SHARED INVENTORY"}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            E-commerce storefront with dedicated product stock, separate GST bill generation, and WhatsApp orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQrModalOpen(true)}
            className="h-8 text-xs font-semibold rounded-xl border-border"
          >
            <QrCode className="mr-1.5 size-3.5" />
            Store QR
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 text-xs font-semibold rounded-xl border-border"
          >
            {copied ? <Check className="mr-1.5 size-3.5 text-emerald-500" /> : <Copy className="mr-1.5 size-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            onClick={() => setNewBillOpen(true)}
            className="h-8 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            <Plus className="mr-1.5 size-3.5" />
            New Store GST Bill
          </Button>
        </div>
      </div>

      {/* Mode Config Banner (Configurable in Settings) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="font-bold text-foreground">
              Inventory &amp; Database Mode: {isSeparate ? "Separate Mode" : "Shared Mode"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isSeparate
                ? "Online store has dedicated product stock and issues separate Store GST Bills."
                : "Online store deducts directly from warehouse inventory and syncs with B2B invoices."}
            </p>
          </div>
        </div>

        <Link
          href="/settings?section=GENERAL"
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline shrink-0"
        >
          Change Mode in Settings &rarr;
        </Link>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-border gap-1">
        {[
          { id: "stock", label: "Product Stock & Pricing", icon: Package },
          { id: "bills", label: "Store GST Bills", icon: Receipt },
          { id: "overview", label: "Storefront & Share", icon: Store },
          { id: "config", label: "Settings & Mode", icon: Settings2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCT STOCK & PRICING */}
      {activeTab === "stock" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Online Store Product Stock</h3>
              <p className="text-xs text-muted-foreground">
                Independent stock allocation for digital store. Deductions happen only on this pool.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              Total Online Items: {storeProducts.length}
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-xs">
                  <TableHead className="font-semibold">Product Name / SKU</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">HSN</TableHead>
                  <TableHead className="font-semibold text-right">Online Price (₹)</TableHead>
                  <TableHead className="font-semibold text-right">Discount</TableHead>
                  <TableHead className="font-semibold text-right">Online Stock</TableHead>
                  <TableHead className="font-semibold text-center w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeProducts.map((p) => (
                  <TableRow key={p.id} className="text-xs hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-bold text-foreground">{p.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{p.sku}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[11px]">{p.category}</TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground">{p.hsn}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {formatCurrency(p.onlinePrice, "INR")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {p.discountPercent > 0 ? `${p.discountPercent}% OFF` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className="inline-flex items-center gap-1 font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        <span>{p.onlineStock}</span>
                        <span className="text-[10px] text-muted-foreground">{p.unit}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditProduct(p);
                          setEditStockVal(p.onlineStock);
                          setEditPriceVal(p.onlinePrice);
                          setEditDiscVal(p.discountPercent);
                        }}
                        className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit Stock & Price"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 2: STORE GST BILLS */}
      {activeTab === "bills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Online Store GST Invoices</h3>
              <p className="text-xs text-muted-foreground">
                Dedicated GST tax invoices generated from online orders, complete with CGST/SGST breakdown.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setNewBillOpen(true)}
              className="h-8 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-1.5 size-3.5" />
              Generate Store Bill
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="text-xs">
                  <TableHead className="font-semibold">Bill No.</TableHead>
                  <TableHead className="font-semibold">Customer Name</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Items Count</TableHead>
                  <TableHead className="font-semibold">Payment</TableHead>
                  <TableHead className="font-semibold text-right">Taxable</TableHead>
                  <TableHead className="font-semibold text-right">GST</TableHead>
                  <TableHead className="font-semibold text-right">Total Amount</TableHead>
                  <TableHead className="font-semibold text-center w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeBills.map((b) => {
                  const totalGst = b.cgst + b.sgst + b.igst;
                  return (
                    <TableRow key={b.id} className="text-xs hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono font-bold text-foreground">
                        <Link
                          href={`/grow/online-store/bill/${b.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {b.billNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{b.customerName}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{b.customerPhone}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {format(new Date(b.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.items.reduce((s, it) => s + it.quantity, 0)} units
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px]">
                          {b.paymentMode} ({b.paymentStatus})
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(b.subtotal, "INR")}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(totalGst, "INR")}
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-foreground">
                        {formatCurrency(b.total, "INR")}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/grow/online-store/bill/${b.id}`}
                            className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted text-primary transition-colors"
                            title="View GST Bill"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                          <Link
                            href={`/grow/online-store/bill/${b.id}`}
                            target="_blank"
                            className="inline-flex size-7 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Print GST Bill"
                          >
                            <Printer className="size-3.5" />
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & PROMOTION */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500/20 via-primary/15 to-purple-500/20 border border-sky-500/30 p-6 sm:p-8">
              <div className="relative z-10 max-w-md space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Ab India Karega
                  <span className="block text-primary">business online</span>
                </h2>
                <div className="flex items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                    <Sparkles className="size-3" />
                    Dedicated Online Store Active 🎉
                  </span>
                </div>
              </div>
              <div className="absolute right-4 bottom-2 opacity-30 sm:opacity-50 pointer-events-none">
                <Store className="size-32 text-primary" />
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Your Digital WhatsApp Store is Ready!
              </h3>
              <p className="text-xs text-muted-foreground">
                Customers can view your hardware catalog, add to cart, and place orders directly to your WhatsApp.
              </p>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-background p-2.5 text-xs font-mono text-foreground border border-border">
                <span className="truncate">{storeUrl}</span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="font-sans text-xs font-semibold text-primary hover:underline shrink-0 cursor-pointer"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Store Value Highlights
              </h4>
              <div className="space-y-2 text-xs text-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Separate stock tracking avoids overselling B2B inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>GST invoice auto-generated with HSN and CGST/SGST</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-500" />
                  <span>Direct WhatsApp order reception with full customer address</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              render={
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out our online catalog and order on WhatsApp: ${storeUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              <MessageCircle className="mr-1.5 size-4" />
              Share Store on WhatsApp
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION */}
      {activeTab === "config" && (
        <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Online Store Configuration</h3>
            <p className="text-xs text-muted-foreground">
              Configure inventory isolation mode and billing preferences.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Inventory Mode Selector */}
            <div className="rounded-xl border border-border/70 p-4 space-y-2.5 bg-muted/20">
              <span className="font-bold text-foreground block">Inventory &amp; Stock Mode</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => handleToggleInventoryMode("SEPARATE")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSeparate
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Separate Mode (Recommended)</span>
                    <div className={`size-3.5 rounded-full border-2 ${isSeparate ? "border-primary bg-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Store has its own independent database and stock. Does NOT alter main GST warehouse stock.
                  </p>
                </div>

                <div
                  onClick={() => handleToggleInventoryMode("SHARED")}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    !isSeparate
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Shared Mode</span>
                    <div className={`size-3.5 rounded-full border-2 ${!isSeparate ? "border-primary bg-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Store shares same stock with main inventory and creates standard sale invoices.
                  </p>
                </div>
              </div>
            </div>

            {/* Bill Series Prefix */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground">Store Bill Prefix</Label>
                <Input
                  defaultValue={settings?.storeInvoicePrefix || "OS"}
                  onChange={(e) => saveAppSettingsAction({ storeInvoicePrefix: e.target.value })}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Notification WhatsApp Phone</Label>
                <Input
                  defaultValue={settings?.storeNotificationPhone || "9483374137"}
                  onChange={(e) => saveAppSettingsAction({ storeNotificationPhone: e.target.value })}
                  className="h-8 text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <span className="text-xs text-muted-foreground">Auto-deduct stock on bill generation</span>
              <input
                type="checkbox"
                defaultChecked={settings?.autoDeductStoreStock ?? true}
                onChange={(e) => saveAppSettingsAction({ autoDeductStoreStock: e.target.checked })}
                className="size-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock & Price Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Edit Online Stock &amp; Price
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-foreground">{editProduct?.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono">HSN: {editProduct?.hsn} | Unit: {editProduct?.unit}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Online Stock ({editProduct?.unit})</Label>
                <Input
                  type="number"
                  value={editStockVal}
                  onChange={(e) => setEditStockVal(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">Independent online allocation</span>
              </div>

              <div className="space-y-1">
                <Label>Online Selling Price (₹)</Label>
                <Input
                  type="number"
                  value={editPriceVal}
                  onChange={(e) => setEditPriceVal(Number(e.target.value))}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Discount (% OFF)</Label>
              <Input
                type="number"
                value={editDiscVal}
                onChange={(e) => setEditDiscVal(Number(e.target.value))}
                className="h-8 text-xs font-mono"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditProduct(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveStockEdit} className="bg-primary text-primary-foreground font-bold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create New Store Bill Dialog */}
      <FormDialog
        open={newBillOpen}
        onOpenChange={setNewBillOpen}
        title={
          <span className="flex items-center gap-2">
            <Receipt className="size-4 text-primary" />
            <span>Create Online Store GST Bill</span>
          </span>
        }
        description="Generate a tax invoice for an online store order."
        onSubmit={handleCreateStoreBill}
        isSubmitting={loading}
        submitText="Generate GST Bill"
        loadingText="Generating..."
        maxWidthClass="sm:max-w-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormFieldInput
            label="Customer Name"
            value={custName}
            onChange={(e) => setCustName(e.target.value)}
            placeholder="e.g. Ramesh Hardware"
            required
          />
          <FormFieldInput
            label="Customer Phone"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
            placeholder="e.g. 9845012345"
            className="font-mono"
            required
          />
        </div>

        <FormFieldInput
          label="Delivery Address"
          value={custAddress}
          onChange={(e) => setCustAddress(e.target.value)}
          placeholder="Address for shipping"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <FormFieldSelect
              label="Select Product"
              value={selectedProductId}
              onValueChange={setSelectedProductId}
              options={storeProducts.map((p) => ({
                label: `${p.name} (₹${p.onlinePrice} | Stock: ${p.onlineStock})`,
                value: p.id,
              }))}
              placeholder="Select Product"
              required
            />
          </div>
          <div>
            <FormFieldInput
              label="Quantity"
              type="number"
              min={1}
              value={selectedQty}
              onChange={(e) => setSelectedQty(Number(e.target.value))}
              className="font-mono"
            />
          </div>
        </div>

        <FormFieldSelect
          label="Payment Mode"
          value={paymentMode}
          onValueChange={setPaymentMode}
          options={[
            { label: "UPI (Google Pay / PhonePe / Paytm)", value: "UPI" },
            { label: "Cash on Delivery (COD)", value: "COD" },
            { label: "Net Banking / NEFT", value: "NET_BANKING" },
            { label: "Credit / Debit Card", value: "CARD" },
          ]}
          placeholder="Select Payment Mode"
        />

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          ⚡ This will generate a separate Store Tax Invoice with HSN and GST calculation, and deduct stock only from the online store pool.
        </div>
      </FormDialog>

      {/* QR Code Standee Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Store QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-md border border-zinc-200">
              <div className="size-48 bg-zinc-900 flex items-center justify-center rounded-xl text-white font-mono text-center p-4">
                <div>
                  <QrCode className="size-20 mx-auto text-white mb-2" />
                  <p className="text-[10px] text-zinc-300">Scan to browse catalog</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Print this QR code on your bills or display at counter for customer walk-in orders.
            </p>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs font-semibold"
            >
              Print QR Code Standee
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
