"use client";

import { useState } from "react";
import { Bot, Check, FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ParsedBillResult } from "@/lib/ai-ocr";

interface BillOcrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyBill: (billData: ParsedBillResult) => void;
}

export function BillOcrModal({ open, onOpenChange, onApplyBill }: BillOcrModalProps) {
  const [scanning, setScanning] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedBillResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setScanning(true);
    setParsedData(null);

    try {
      const res = await fetch("/api/v1/ai/scan-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setParsedData(json.data);
        toast.success(`Parsed supplier bill with ${(json.data.confidenceScore * 100).toFixed(0)}% confidence!`);
      } else {
        toast.error(json.error || "Failed to scan bill");
      }
    } catch (err) {
      toast.error("Error communicating with AI OCR engine");
    } finally {
      setScanning(false);
    }
  };

  const handleApply = () => {
    if (!parsedData) return;
    onApplyBill(parsedData);
    onOpenChange(false);
    toast.success("Imported scanned bill into purchase form!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-600" />
            <span>AI Purchase Bill Scanner &amp; OCR</span>
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="p-6 space-y-4 text-xs">
          {!parsedData && !scanning && (
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 text-center space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors">
              <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="size-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Upload Paper Supplier Bill / Invoice</p>
                <p className="text-xs text-muted-foreground">Supports JPG, PNG, or PDF up to 10MB</p>
              </div>
              <label className="inline-block">
                <Button variant="default" className="h-9 px-4 text-xs font-bold cursor-pointer" asChild>
                  <span>
                    Select File to Scan
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                  </span>
                </Button>
              </label>
            </div>
          )}

          {scanning && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="size-8 text-primary animate-spin mx-auto" />
              <p className="font-bold text-sm">AI Engine Scanning Supplier Bill...</p>
              <p className="text-xs text-muted-foreground">Extracting line items, HSN codes, GST amounts &amp; supplier GSTIN</p>
            </div>
          )}

          {parsedData && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-700" />
                  <span className="font-bold text-emerald-900">Scan Complete ({selectedFile?.name})</span>
                </div>
                <span className="font-mono text-xs text-emerald-700 font-extrabold">
                  {(parsedData.confidenceScore * 100).toFixed(0)}% Accuracy
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border bg-muted/20">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Supplier</span>
                  <p className="font-extrabold text-foreground">{parsedData.supplierName}</p>
                  <p className="font-mono text-muted-foreground text-[11px]">GSTIN: {parsedData.gstin || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Bill Meta</span>
                  <p className="font-mono font-bold text-foreground">Ref: #{parsedData.invoiceNumber}</p>
                  <p className="text-muted-foreground text-[11px]">Date: {parsedData.invoiceDate}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-foreground text-xs">Extracted Line Items ({parsedData.items.length})</span>
                <div className="rounded-xl border divide-y overflow-hidden max-h-48 overflow-y-auto">
                  {parsedData.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs bg-card">
                      <div>
                        <p className="font-bold text-foreground">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground">HSN: {item.hsn} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono font-bold text-foreground">₹{item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-xs">
            Cancel
          </Button>
          {parsedData && (
            <Button onClick={handleApply} className="h-9 px-5 text-xs font-bold bg-primary text-primary-foreground">
              Import Items to Bill
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
