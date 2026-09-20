"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, FileText, CheckCircle2, Loader2, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { parseSupplierBillOcr, type OcrExtractedBill } from "@/actions/ocr-bill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function BillOcrScanner() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<OcrExtractedBill | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setOpen(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      try {
        const result = await parseSupplierBillOcr(base64);
        setExtractedData(result);
        toast.success("AI OCR extraction complete");
      } catch (err: any) {
        toast.error("OCR Extraction failed. Please fill manually.");
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyToBill = () => {
    if (!extractedData) return;
    setOpen(false);
    const params = new URLSearchParams({
      ocrVendorName: extractedData.vendorName || "",
      ocrVendorGstin: extractedData.vendorGstin || "",
      ocrBillNumber: extractedData.billNumber || "",
      ocrBillDate: extractedData.billDate || "",
      ocrTotalAmount: String(extractedData.totalAmount || 0),
      ocrItems: JSON.stringify(extractedData.lineItems || []),
    });
    router.push(`/purchases/new?${params.toString()}`);
  };

  return (
    <>
      {/* Trigger Button */}
      <label className="inline-flex items-center gap-1.5 cursor-pointer bg-brand/10 hover:bg-brand/20 text-brand border border-brand/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs">
        <Sparkles className="size-3.5" />
        <span>Scan Supplier Bill (OCR AI)</span>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Extraction Preview Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl p-0">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-brand" />
                <span>AI Purchase Bill OCR Extraction</span>
              </div>
              <Badge className="bg-brand-light text-brand border-brand/20 font-bold text-[10px]">
                VISION AI
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center p-6">
              <Loader2 className="size-8 text-brand animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">Reading Supplier Invoice Image...</p>
                <p className="text-xs text-muted-foreground">Extracting Vendor GSTIN, Bill Number &amp; Line Items</p>
              </div>
            </div>
          ) : extractedData ? (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <DialogBody>
                <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Extracted Vendor</span>
                      <h4 className="text-sm font-black text-foreground">{extractedData.vendorName}</h4>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      GSTIN: {extractedData.vendorGstin || "N/A"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Bill Number</span>
                      <strong className="text-foreground">{extractedData.billNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Bill Date</span>
                      <strong className="text-foreground">{extractedData.billDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Total Amount</span>
                      <strong className="text-brand text-sm">₹{extractedData.totalAmount?.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Extracted Line Items */}
                {extractedData.lineItems && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Extracted Line Items</span>
                    <div className="rounded-xl border border-border overflow-hidden divide-y divide-border/60">
                      {extractedData.lineItems.map((item, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between bg-card">
                          <div>
                            <span className="font-bold text-foreground">{item.description}</span>
                            <span className="text-[10px] text-muted-foreground block">
                              Qty: {item.quantity} × ₹{item.unitPrice}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-foreground">₹{item.amount.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </DialogBody>

              <DialogFooter>
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApplyToBill}
                  className="bg-brand text-white hover:opacity-90 font-bold text-xs h-9 rounded-xl shadow-xs"
                >
                  <span>Auto-Fill Purchase Bill</span>
                  <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
