"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Database, Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { getItems, updateItem } from "@/actions/items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function BulkUpdatePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editedItems, setEditedItems] = useState<Record<string, any>>({});

  useEffect(() => {
    getItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleFieldChange = (id: string, field: string, value: any) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    const ids = Object.keys(editedItems);
    if (ids.length === 0) {
      toast.info("No edits made yet");
      return;
    }

    setSaving(true);
    try {
      for (const id of ids) {
        const item = items.find((it) => it.id === id);
        if (!item) continue;
        const updates = editedItems[id];
        await updateItem(id, {
          name: updates.name ?? item.name,
          unitPrice: updates.unitPrice !== undefined ? Number(updates.unitPrice) : item.unitPrice,
          estimatePrice: updates.estimatePrice !== undefined ? Number(updates.estimatePrice) : (item.estimatePrice || item.unitPrice),
          purchasePrice: updates.purchasePrice !== undefined ? Number(updates.purchasePrice) : item.purchasePrice,
          stockQty: updates.stockQty !== undefined ? Number(updates.stockQty) : item.stockQty,
          minStock: item.minStock ?? 0,
          isPublic: item.isPublic ?? true,
          gstRate: updates.gstRate !== undefined ? Number(updates.gstRate) : item.gstRate,
          unit: item.unit || "PCS",
          itemType: item.itemType || "PRODUCT",
        });
      }
      toast.success(`Updated ${ids.length} items successfully!`);
      setEditedItems({});
      const refreshed = await getItems();
      setItems(refreshed);
    } catch (e: any) {
      toast.error(e.message || "Failed to update items");
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((it) =>
    it.name.toLowerCase().includes(search.toLowerCase()) ||
    (it.hsn && it.hsn.includes(search))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <Link href="/items" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Database className="size-5 text-primary" />
              <span>Update Items In Bulk</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Spreadsheet view to quickly update selling rates, estimate rates, purchase costs, and stock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          <Button
            onClick={handleSaveAll}
            disabled={saving || Object.keys(editedItems).length === 0}
            className="h-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs"
          >
            {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Save className="mr-1.5 size-3.5" />}
            <span>Save All ({Object.keys(editedItems).length})</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
          Loading items...
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="text-xs">
                <TableHead className="font-semibold w-8">#</TableHead>
                <TableHead className="font-semibold">Item Name</TableHead>
                <TableHead className="font-semibold w-24">HSN</TableHead>
                <TableHead className="font-semibold w-28 text-right">Sale Price (₹)</TableHead>
                <TableHead className="font-semibold w-28 text-right">Estimate Rate (₹)</TableHead>
                <TableHead className="font-semibold w-28 text-right">Purchase Price (₹)</TableHead>
                <TableHead className="font-semibold w-24 text-right">GST %</TableHead>
                <TableHead className="font-semibold w-24 text-right">Stock Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((it, idx) => {
                const isEdited = !!editedItems[it.id];
                const cur = editedItems[it.id] || {};

                return (
                  <TableRow key={it.id} className={`text-xs ${isEdited ? "bg-amber-500/[0.04]" : ""}`}>
                    <TableCell className="font-mono text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-foreground">{it.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{it.hsn || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        defaultValue={it.unitPrice}
                        onChange={(e) => handleFieldChange(it.id, "unitPrice", e.target.value)}
                        className="h-7 w-24 ml-auto text-right font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        defaultValue={it.estimatePrice || it.unitPrice}
                        onChange={(e) => handleFieldChange(it.id, "estimatePrice", e.target.value)}
                        className="h-7 w-24 ml-auto text-right font-mono text-xs border-amber-500/30"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        defaultValue={it.purchasePrice || 0}
                        onChange={(e) => handleFieldChange(it.id, "purchasePrice", e.target.value)}
                        className="h-7 w-24 ml-auto text-right font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        defaultValue={it.gstRate}
                        onChange={(e) => handleFieldChange(it.id, "gstRate", e.target.value)}
                        className="h-7 w-20 ml-auto text-right font-mono text-xs"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        defaultValue={it.stockQty}
                        onChange={(e) => handleFieldChange(it.id, "stockQty", e.target.value)}
                        className="h-7 w-20 ml-auto text-right font-mono text-xs font-bold"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
