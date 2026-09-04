"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ExportItemsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleExport = (format: string) => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      toast.success(`Complete product catalog exported to ${format}!`);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Download className="size-5 text-brand" />
          <span>Export Item Catalog</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Download your complete inventory catalog including stock quantities, HSN codes, tax slabs, barcodes, and sale prices.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 w-fit">
            <FileSpreadsheet className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Excel Spreadsheet (.xlsx)</h3>
          <p className="text-xs text-muted-foreground">
            Complete inventory sheet with formulas, stock valuations, and category columns. Perfect for offline review.
          </p>
          <Button
            size="sm"
            onClick={() => handleExport("Excel (.xlsx)")}
            disabled={downloading}
            className="bg-brand text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <Download className="mr-1.5 size-3.5" />
            Download Excel File
          </Button>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="p-2.5 rounded-xl bg-brand-light text-brand w-fit">
            <Package className="size-5" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Standard CSV Format (.csv)</h3>
          <p className="text-xs text-muted-foreground">
            Universal comma-separated format compatible with Tally, QuickBooks, Zoho, and e-commerce platforms.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("CSV (.csv)")}
            disabled={downloading}
            className="font-bold text-xs rounded-xl border-border"
          >
            <Download className="mr-1.5 size-3.5" />
            Download CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
