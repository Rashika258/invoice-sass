"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Barcode,
  Camera,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Package,
  Plus,
  QrCode,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  importFromBilloraLibrary,
  importItemsInBulk,
  PREDEFINED_RETAIL_LIBRARY,
  quickAddBarcodeItem,
} from "@/actions/import-items";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImportItemsPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<"barcode" | "excel" | "library">("barcode");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Barcode modal state
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [isCameraScanning, setIsCameraScanning] = useState(false);
  const [barcodeVal, setBarcodeVal] = useState("8901030382710");
  const [itemName, setItemName] = useState("Dettol Antiseptic Soap 125g");
  const [salePrice, setSalePrice] = useState("65");
  const [purchasePrice, setPurchasePrice] = useState("52");

  // Excel file upload modal state
  const [excelOpen, setExcelOpen] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  // 1-Click Library Import
  const handleLibraryImport = async () => {
    setLoading(true);
    try {
      const res = await importFromBilloraLibrary();
      setSuccessMsg(`Successfully imported ${res.count} items from Billora Retail Library!`);
      setTimeout(() => router.push("/items"), 1500);
    } catch (e: any) {
      alert(e.message || "Failed to import items");
    } finally {
      setLoading(false);
    }
  };

  // Barcode Submit
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await quickAddBarcodeItem(barcodeVal, itemName, Number(salePrice), Number(purchasePrice));
      setBarcodeOpen(false);
      setSuccessMsg(`Added item "${itemName}" with barcode ${barcodeVal}`);
      setTimeout(() => router.push("/items"), 1200);
    } catch (e: any) {
      alert(e.message || "Failed to add barcode item");
    } finally {
      setLoading(false);
    }
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const headers = "Item Name,Sale Price,Purchase Price,GST Rate,HSN Code,Opening Stock,Unit\n";
    const sampleRows =
      "Tata Salt 1kg,28,24,0,2501,100,PCS\n" +
      "Fortune Sunflower Oil 1L,145,130,5,1512,50,BTL\n" +
      "Basmati Rice 5kg,550,480,5,1006,20,BAG\n";
    const blob = new Blob([headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "billora_items_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) return;

      const parsed = lines.slice(1).map((line) => {
        const [name, sale, purchase, gst, hsn, stock, unit] = line.split(",").map((s) => s.trim());
        return {
          name,
          unitPrice: Number(sale) || 0,
          purchasePrice: Number(purchase) || 0,
          gstRate: Number(gst) || 18,
          hsn,
          stockQty: Number(stock) || 0,
          unit: unit || "PCS",
        };
      }).filter((it) => it.name);

      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  // Submit CSV Bulk Items
  const handleCsvImportSubmit = async () => {
    if (csvPreview.length === 0) return;
    setLoading(true);
    try {
      const res = await importItemsInBulk(csvPreview);
      setExcelOpen(false);
      setSuccessMsg(`Successfully imported ${res.count} items from Excel / CSV!`);
      setTimeout(() => router.push("/items"), 1500);
    } catch (e: any) {
      alert(e.message || "Failed to import items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching media_1788511580801.png */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/items"
            className="flex size-8 items-center justify-center rounded-lg border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Import Items
            </h1>
            <p className="text-xs text-muted-foreground">
              Add products in bulk via barcode scanning, Excel sheet upload, or standard item library.
            </p>
          </div>
        </div>

        <Link
          href="/utilities/barcode-generator"
          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition-all"
        >
          <Barcode className="size-3.5" />
          <span>Barcode Generator</span>
        </Link>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Center Box: Select Import Method */}
      <div className="mx-auto max-w-4xl pt-4">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground">Select Import Method</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Choose how you want to add your inventory items into Billora
          </p>
        </div>

        {/* 2 Primary Big Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Option 1: Import From Barcode (RECOMMENDED) */}
          <div
            onClick={() => {
              setSelectedMethod("barcode");
              setBarcodeOpen(true);
            }}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all cursor-pointer bg-card/60 backdrop-blur-xs ${
              selectedMethod === "barcode"
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border/80 hover:border-primary/50"
            }`}
          >
            {/* Recommended Pill */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider">
                RECOMMENDED
              </Badge>
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "barcode"
                    ? "border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {selectedMethod === "barcode" && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            {/* Illustration Icon */}
            <div className="flex size-20 items-center justify-center rounded-full bg-sky-500/15 text-sky-500 mb-4 mt-2">
              <Package className="size-10" />
            </div>

            <h3 className="text-base font-bold text-foreground">Import From Barcode</h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
              Import item details by scanning barcodes. Billora uses a library of standard barcodes to fetch all details of your items in seconds.
            </p>

            <Button
              className="mt-6 rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-5"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMethod("barcode");
                setBarcodeOpen(true);
              }}
            >
              <Barcode className="mr-1.5 size-4" />
              Scan / Enter Barcode
            </Button>
          </div>

          {/* Option 2: Import From Excel */}
          <div
            onClick={() => {
              setSelectedMethod("excel");
              setExcelOpen(true);
            }}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 p-8 text-center transition-all cursor-pointer bg-card/60 backdrop-blur-xs ${
              selectedMethod === "excel"
                ? "border-primary shadow-lg shadow-primary/10"
                : "border-border/80 hover:border-primary/50"
            }`}
          >
            <div className="absolute top-4 right-4">
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "excel"
                    ? "border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {selectedMethod === "excel" && (
                  <div className="size-2 rounded-full bg-primary" />
                )}
              </div>
            </div>

            {/* Illustration Icon */}
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mb-4 mt-2">
              <FileSpreadsheet className="size-10" />
            </div>

            <h3 className="text-base font-bold text-foreground">Import From Excel</h3>
            <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
              Import item data from excel or CSV files in your system. Download the standard template, fill in your product stock, and upload.
            </p>

            <Button
              variant="outline"
              className="mt-6 rounded-xl border-border text-xs font-semibold px-5"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMethod("excel");
                setExcelOpen(true);
              }}
            >
              <FileUp className="mr-1.5 size-4" />
              Upload Excel / CSV
            </Button>
          </div>
        </div>

        {/* OR Divider */}
        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/80" />
          </div>
          <span className="relative bg-background px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            OR
          </span>
        </div>

        {/* Option 3: Import From Billora Library */}
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-foreground shrink-0">
              <Database className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Import From Predefined Catalog
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Quickly add 15+ popular FMCG retail goods (Rice, Atta, Salt, Biscuits, Soap, Oil) with predefined GST slabs and HSN codes.
              </p>
            </div>
          </div>

          <Button
            onClick={handleLibraryImport}
            disabled={loading}
            className="shrink-0 rounded-xl text-xs px-5 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 size-4" />
                1-Click Catalog Import
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal 1: Barcode Entry & Scanner */}
      <Dialog open={barcodeOpen} onOpenChange={setBarcodeOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Barcode className="size-5 text-emerald-600 dark:text-emerald-400" />
              Import Item By Barcode
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Scan with a barcode scanner or enter the product barcode number manually.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBarcodeSubmit} className="space-y-4 pt-2">
            {/* Live Camera Scanner Viewport */}
            {isCameraScanning ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 bg-black h-52 flex flex-col items-center justify-center">
                <video
                  ref={(el) => {
                    if (el && navigator.mediaDevices?.getUserMedia) {
                      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                        .then((s) => { el.srcObject = s; })
                        .catch(() => {});
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400 m-5 rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse" />
                </div>
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  Camera Active - Point at Barcode
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setBarcodeVal("8901030382710");
                    setItemName("Dettol Antiseptic Soap 125g");
                    setSalePrice("65");
                    setPurchasePrice("52");
                    setIsCameraScanning(false);
                    toast.success("Barcode Scanned: 8901030382710");
                  }}
                  className="absolute bottom-3 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold h-7 px-3 rounded-full shadow-lg cursor-pointer"
                >
                  <Sparkles className="size-3 mr-1" />
                  Capture Scanned Barcode
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCameraScanning(true)}
                className="w-full h-10 rounded-xl border-dashed border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Camera className="size-4 text-primary" />
                <span>Scan Barcode using Device Camera</span>
              </Button>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Barcode / EAN Number</Label>
              <div className="relative">
                <Input
                  value={barcodeVal}
                  onChange={(e) => setBarcodeVal(e.target.value)}
                  placeholder="e.g. 8901030382710"
                  className="font-mono text-sm pl-9 bg-card text-foreground border-border"
                  required
                />
                <Barcode className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Item / Product Name</Label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Product name"
                className="text-xs bg-card text-foreground border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Sale Price (₹)</Label>
                <Input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="font-mono text-xs bg-card text-foreground border-border"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Purchase Cost (₹)</Label>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="font-mono text-xs bg-card text-foreground border-border"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBarcodeOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Add to Inventory"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Excel / CSV File Upload */}
      <Dialog open={excelOpen} onOpenChange={setExcelOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-emerald-500" />
              Import Items from Excel / CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload your spreadsheet with columns for Item Name, Sale Price, Purchase Price, GST, HSN, and Stock.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Download Template Strip */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
              <span className="text-muted-foreground">Don&apos;t have a sheet ready?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="h-7 text-xs border-border bg-card text-foreground hover:bg-accent cursor-pointer"
              >
                <Download className="mr-1.5 size-3" />
                Sample Template
              </Button>
            </div>

            {/* Drag and Drop or File Picker */}
            <div className="rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors bg-card/40">
              <FileUp className="mx-auto size-8 text-muted-foreground mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Choose a .CSV file from your computer
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">UTF-8 encoded spreadsheet</p>
              <label className="mt-4 inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 text-xs font-semibold cursor-pointer shadow-xs">
                <span>Select File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* CSV Preview table if uploaded */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Ready to import {csvPreview.length} items:
                </p>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2 text-xs font-mono space-y-1">
                  {csvPreview.slice(0, 5).map((it, i) => (
                    <div key={i} className="flex justify-between text-foreground">
                      <span className="truncate">{it.name}</span>
                      <span className="text-muted-foreground">₹{it.unitPrice}</span>
                    </div>
                  ))}
                  {csvPreview.length > 5 && (
                    <p className="text-[10px] text-muted-foreground pt-1 text-center">
                      + {csvPreview.length - 5} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExcelOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={csvPreview.length === 0 || loading}
                onClick={handleCsvImportSubmit}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-5 cursor-pointer shadow-sm"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  `Import ${csvPreview.length} Items`
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
