"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ArrowRightLeft, Building2, CheckCircle2, Clock, Plus, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createStockTransferAction,
  getStockTransfersAction,
  getWarehousesAction,
  type StockTransferRecord,
  type WarehouseItem,
} from "@/actions/warehouses";

export default function StockTransferPage() {
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [transfers, setTransfers] = useState<StockTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [sourceWh, setSourceWh] = useState("");
  const [destWh, setDestWh] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [whList, trList] = await Promise.all([
        getWarehousesAction(),
        getStockTransfersAction(),
      ]);
      setWarehouses(whList);
      setTransfers(trList);
      if (whList.length >= 2) {
        setSourceWh(whList[0].name);
        setDestWh(whList[1].name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWh || !destWh || !itemName || !quantity) {
      toast.error("Please fill in all stock transfer fields");
      return;
    }
    if (sourceWh === destWh) {
      toast.error("Source and destination warehouse cannot be the same");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createStockTransferAction({
        sourceWarehouse: sourceWh,
        destWarehouse: destWh,
        itemName,
        quantity: parseFloat(quantity) || 1,
      });

      if (res.success) {
        toast.success(`Stock Transfer Voucher ${res.transfer.transferNo} generated!`);
        setModalOpen(false);
        setItemName("");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create stock transfer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Warehouse className="size-6 text-primary" />
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">
              Multi-Warehouse &amp; Inter-Branch Stock Transfers
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transfer inventory between central warehouses, regional hubs, and retail outlet stores.
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="h-9 px-4 text-xs font-bold bg-primary text-primary-foreground flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="size-4" />
          <span>New Stock Transfer Voucher</span>
        </Button>
      </div>

      {/* Warehouse Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="rounded-2xl border shadow-2xs relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>{wh.name}</span>
                </CardTitle>
                {wh.isDefault && (
                  <Badge variant="default" className="text-[10px] uppercase font-bold">
                    Primary Hub
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] font-mono">{wh.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground line-clamp-1">{wh.address}</p>
              <div className="pt-2 border-t flex justify-between items-center font-bold">
                <span className="text-muted-foreground">Active Stock Items:</span>
                <span className="font-mono text-foreground">{wh.totalItems} SKUs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Transfers Table */}
      <Card className="rounded-2xl border shadow-2xs">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-emerald-600" />
            <span>Inter-Branch Stock Movement Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y overflow-x-auto text-xs">
            <div className="grid grid-cols-12 gap-2 p-3 font-bold text-muted-foreground bg-muted/40 uppercase tracking-wider text-[10px]">
              <div className="col-span-2">Voucher No</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Source Warehouse</div>
              <div className="col-span-3">Destination Branch</div>
              <div className="col-span-2 text-right">Qty &amp; Status</div>
            </div>

            {transfers.map((tr) => (
              <div key={tr.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-muted/20 transition-colors">
                <div className="col-span-2 font-mono font-extrabold text-foreground">{tr.transferNo}</div>
                <div className="col-span-2 text-muted-foreground">{tr.date}</div>
                <div className="col-span-3 font-semibold text-foreground truncate">{tr.sourceWarehouse}</div>
                <div className="col-span-3 font-semibold text-foreground flex items-center gap-1.5 truncate">
                  <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                  <span>{tr.destWarehouse}</span>
                </div>
                <div className="col-span-2 text-right space-y-0.5">
                  <p className="font-mono font-bold text-foreground">{tr.quantity} Units ({tr.itemName})</p>
                  <Badge
                    variant={tr.status === "COMPLETED" ? "default" : "outline"}
                    className="text-[10px] font-bold"
                  >
                    {tr.status === "COMPLETED" ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="size-3" /> Received</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="size-3" /> In Transit</span>
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Stock Transfer Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ArrowRightLeft className="size-4 text-primary" />
              <span>Create Inter-Branch Stock Transfer</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTransfer}>
            <DialogBody className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label>Source Warehouse (Dispatch From)</Label>
                <Select value={sourceWh} onValueChange={(val) => setSourceWh(val || "")}>
                  <SelectTrigger className="h-9 text-xs" suppressHydrationWarning>
                    <SelectValue placeholder="Select Source Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.name} className="text-xs">
                        {wh.name} ({wh.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Destination Branch (Receive At)</Label>
                <Select value={destWh} onValueChange={(val) => setDestWh(val || "")}>
                  <SelectTrigger className="h-9 text-xs" suppressHydrationWarning>
                    <SelectValue placeholder="Select Destination Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.name} className="text-xs">
                        {wh.name} ({wh.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="item-name">Item / Material Description</Label>
                <Input
                  id="item-name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg (Strip of 10)"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="transfer-qty">Transfer Quantity</Label>
                <Input
                  id="transfer-qty"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  className="h-9 font-mono text-xs"
                />
              </div>
            </DialogBody>

            <DialogFooter className="p-4 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="h-9 px-5 text-xs font-bold bg-primary text-primary-foreground">
                {submitting ? "Dispatching..." : "Issue Transfer Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
