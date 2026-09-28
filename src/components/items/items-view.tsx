"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  FileText,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Upload,
} from "lucide-react";
import { DeleteItemButton, ItemFormDialog } from "@/components/items/item-form-dialog";
import { ItemCsvImport } from "@/components/items/item-csv-import";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/invoice-utils";
import { ContextualAiBanner } from "@/components/ai/contextual-ai-banner";

type ItemRecord = {
  id: string;
  name: string;
  description?: string | null;
  hsn?: string | null;
  unitPrice: number;
  estimatePrice?: number;
  purchasePrice: number;
  unit?: string | null;
  gstRate: number;
  itemType: "PRODUCT" | "SERVICE";
  imageUrl?: string | null;
  stockQty: number;
  minStock: number;
  isPublic: boolean;
};

export function ItemsView({
  items,
  currency = "INR",
}: {
  items: ItemRecord[];
  currency?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PRODUCT" | "SERVICE" | "LOW_STOCK">("ALL");

  const lowStockItems = items.filter(
    (item) => item.itemType === "PRODUCT" && item.stockQty <= item.minStock,
  );

  const totalStockValue = items.reduce(
    (acc, item) => acc + item.stockQty * (item.purchasePrice || item.unitPrice),
    0,
  );

  const filteredItems = items.filter((item) => {
    const matchesTab =
      activeTab === "ALL"
        ? true
        : activeTab === "PRODUCT"
          ? item.itemType === "PRODUCT"
          : activeTab === "SERVICE"
            ? item.itemType === "SERVICE"
            : item.itemType === "PRODUCT" && item.stockQty <= item.minStock;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      (item.hsn && item.hsn.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Contextual AI Reorder Alert */}
      {lowStockItems.length > 0 && (
        <ContextualAiBanner
          type="INVENTORY"
          title={`${lowStockItems.length} items need stock replenishment`}
          description={`Based on recent workshop billing, ${lowStockItems.length} items are below minimum buffer quantities to prevent sales interruptions.`}
          metricLabel="Low Stock Count"
          metricValue={`${lowStockItems.length} Items`}
          actionLabel="Create Supplier Purchase Order"
          actionHref="/purchase-orders/new"
        />
      )}
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Items &amp; Inventory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your product catalog, stock quantities, HSN codes, and GST rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger
              render={
                <Button
                  variant="outline"
                  className="font-semibold h-8 px-3 gap-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Upload className="size-3.5 text-muted-foreground" />
                  <span>Import CSV</span>
                </Button>
              }
            />
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-bold">Bulk Import Products &amp; Services</DialogTitle>
              </DialogHeader>
              <ItemCsvImport onSuccess={() => window.location.reload()} />
            </DialogContent>
          </Dialog>

          <ItemFormDialog
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 px-3.5 gap-1.5 rounded-lg text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer">
                <Plus className="size-3.5" />
                <span>Add New Item</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <Card className="border-border/60 border-l-4 border-l-primary shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Items in Stock
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Boxes className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {items.length} Items
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {items.filter((i) => i.itemType === "PRODUCT").length} Products ·{" "}
              {items.filter((i) => i.itemType === "SERVICE").length} Services
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-[#1976D2] shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Total Stock Valuation
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#1976D2]/10 text-[#1976D2]">
                <Package className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {formatCurrency(totalStockValue, currency)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Based on purchase rate &amp; quantities
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 border-l-4 border-l-amber-500 bg-amber-500/[0.03] dark:bg-amber-500/[0.06] shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Low Stock Alerts
              </span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-3.5" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-amber-800 dark:text-amber-300">
              {lowStockItems.length} Items
            </p>
            <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-300/80">
              Stock is at or below minimum threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="rounded-xl border border-border/60 shadow-xs">
        <div className="p-3.5 border-b border-border/60 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="inline-flex h-8 items-center rounded-lg bg-muted/60 p-0.5 text-xs text-muted-foreground border border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>All Items</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {items.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PRODUCT")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "PRODUCT"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>Products</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {items.filter((i) => i.itemType === "PRODUCT").length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SERVICE")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "SERVICE"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>Services</span>
              <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
                {items.filter((i) => i.itemType === "SERVICE").length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("LOW_STOCK")}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs transition-all cursor-pointer ${
                activeTab === "LOW_STOCK"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "hover:text-foreground font-medium"
              }`}
            >
              <span>Low Stock</span>
              <span className="rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 font-mono text-[10px]">
                {lowStockItems.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, HSN..."
              className="pl-8 h-8 text-xs rounded-lg border-border/70"
            />
          </div>
        </div>

        <CardContent className="p-0">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {searchQuery ? "No items matched your search." : "No items added yet. Click 'Add New Item' to start."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Item Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>HSN / SAC</TableHead>
                  <TableHead>GST Rate</TableHead>
                  <TableHead className="text-right">Stock Quantity</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Sale Price (GST)</TableHead>
                  <TableHead className="text-right">Estimate Price</TableHead>
                  <TableHead className="text-right w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isLow = item.itemType === "PRODUCT" && item.stockQty <= item.minStock;
                  const isOutOfStock = item.itemType === "PRODUCT" && item.stockQty <= 0;

                  return (
                    <TableRow key={item.id} className="group hover:bg-muted/40 transition-colors">
                      <TableCell className="font-bold text-sm">
                        <div className="flex items-center gap-2.5">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="size-9 rounded-lg object-cover border border-border/80 shrink-0 bg-muted/20"
                            />
                          ) : (
                            <div className="size-9 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center shrink-0 text-muted-foreground">
                              <Package className="size-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate">{item.name}</span>
                              {item.unit && (
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  ({item.unit})
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.itemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {item.hsn || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {item.gstRate}%
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold tabular-nums">
                        {item.itemType === "SERVICE" ? (
                          <span className="text-muted-foreground font-normal">N/A (Service)</span>
                        ) : isOutOfStock ? (
                          <span className="rounded bg-rose-500/10 px-2 py-0.5 text-rose-700 dark:text-rose-400 font-semibold">
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-amber-800 dark:text-amber-300 font-semibold">
                            {item.stockQty} {item.unit || ""} (Low)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.stockQty} {item.unit || ""}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-muted-foreground tabular-nums">
                        {formatCurrency(item.purchasePrice, currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-foreground tabular-nums">
                        {formatCurrency(item.unitPrice, currency)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium tabular-nums">
                        {item.estimatePrice && item.estimatePrice > 0 ? (
                          <span className="text-amber-700 dark:text-amber-300 font-semibold">
                            {formatCurrency(item.estimatePrice, currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatCurrency(item.unitPrice, currency)}
                            <span className="text-[10px] ml-1 opacity-70">(Same)</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ItemFormDialog
                            item={item as any}
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="size-7 p-0 flex items-center justify-center hover:bg-muted rounded-lg cursor-pointer"
                                title="Edit Item"
                              >
                                <Pencil className="size-3.5 text-muted-foreground" />
                              </Button>
                            }
                          />
                          <DeleteItemButton itemId={item.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
