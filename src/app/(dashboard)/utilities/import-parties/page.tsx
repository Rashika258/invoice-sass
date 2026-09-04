"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, UploadCloud, Download, CheckCircle2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ImportPartiesPage() {
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      toast.success("Party directory parsed! Customer and supplier contacts imported.");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-5 text-brand" />
            <span>Import Parties in Bulk (Excel / CSV)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quickly bulk-import customers and vendors with GSTIN, phone, opening balances, and addresses.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Sample Excel template downloaded")}
          className="text-xs font-semibold rounded-xl border-border"
        >
          <Download className="mr-1.5 size-3.5" />
          Download Sample Template
        </Button>
      </div>

      <div className="p-8 rounded-2xl border-2 border-dashed border-border bg-card text-center space-y-4">
        <div className="p-3.5 rounded-full bg-brand-light text-brand w-fit mx-auto">
          <UploadCloud className="size-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Upload Excel (.xlsx) or CSV Sheet</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Columns: Party Name, Type (Customer/Supplier), Mobile, GSTIN, State, Opening Balance.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-brand text-white font-bold text-xs rounded-xl shadow-xs"
          >
            {importing ? "Importing Contacts..." : "Select Spreadsheet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
