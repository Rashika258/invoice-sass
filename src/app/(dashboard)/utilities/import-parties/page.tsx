"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UploadCloud,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bulkCreateCustomers } from "@/actions/customers";

interface ParsedParty {
  name: string;
  type: "CUSTOMER" | "SUPPLIER" | "BOTH";
  phone: string;
  gstin: string;
  state: string;
  openingBalance: number;
}

export default function ImportPartiesPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parsedParties, setParsedParties] = useState<ParsedParty[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent =
      "Party Name,Type,Mobile,GSTIN,State,Opening Balance\n" +
      "Venkateshwara Agro Precision,CUSTOMER,9845012345,29AABCV9912Q1ZR,Karnataka,5000\n" +
      "Sri Sai Fasteners & Steels,SUPPLIER,9844054321,29AEZPC6364C1Z5,Karnataka,0\n" +
      "Karnataka Traders,CUSTOMER,9740011223,,Karnataka,1200\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Billora_Parties_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded sample CSV template: Billora_Parties_Import_Template.csv");
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      toast.error("CSV file is empty or missing data rows");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes("party") || h.includes("name") || h.includes("customer") || h.includes("vendor"));
    const typeIdx = headers.findIndex((h) => h.includes("type") || h.includes("role"));
    const phoneIdx = headers.findIndex((h) => h.includes("mobile") || h.includes("phone") || h.includes("contact"));
    const gstinIdx = headers.findIndex((h) => h.includes("gstin") || h.includes("tax") || h.includes("gst"));
    const stateIdx = headers.findIndex((h) => h.includes("state") || h.includes("city") || h.includes("address"));
    const balIdx = headers.findIndex((h) => h.includes("balance") || h.includes("opening") || h.includes("due"));

    const items: ParsedParty[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const rawName = nameIdx >= 0 ? cols[nameIdx] : cols[0];
      if (!rawName) continue;

      const rawType = typeIdx >= 0 ? cols[typeIdx]?.toUpperCase() : "";
      let partyType: "CUSTOMER" | "SUPPLIER" | "BOTH" = "CUSTOMER";
      if (rawType.includes("SUPPLIER") || rawType.includes("VENDOR")) partyType = "SUPPLIER";
      else if (rawType.includes("BOTH")) partyType = "BOTH";

      const phone = phoneIdx >= 0 ? cols[phoneIdx] || "" : "";
      const gstin = gstinIdx >= 0 ? cols[gstinIdx] || "" : "";
      const state = stateIdx >= 0 ? cols[stateIdx] || "" : "";
      const openingBalance = balIdx >= 0 ? Number(cols[balIdx]) || 0 : 0;

      items.push({
        name: rawName,
        type: partyType,
        phone,
        gstin,
        state,
        openingBalance,
      });
    }

    if (items.length === 0) {
      toast.error("No valid party records found in file");
      return;
    }

    setParsedParties(items);
    toast.success(`Successfully parsed ${items.length} party records!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedParties.length === 0) return;
    setImporting(true);
    try {
      const res = await bulkCreateCustomers(parsedParties);
      toast.success(`Successfully imported ${res.count} parties into Billora database!`);
      router.push("/customers");
    } catch (e: any) {
      toast.error(e.message || "Failed to import parties");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="border-b border-border/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>Import Parties in Bulk (Excel / CSV)</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bulk import customer &amp; vendor master records with GSTIN, phone, opening balances, and states.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="text-xs font-semibold rounded-xl border-border cursor-pointer hover:bg-muted"
        >
          <Download className="mr-1.5 size-3.5" />
          Download Sample Template
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Dropzone */}
      {parsedParties.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-10 rounded-2xl border-2 border-dashed border-border bg-card text-center space-y-4 hover:border-primary/60 transition-all cursor-pointer shadow-2xs"
        >
          <div className="p-3.5 rounded-full bg-primary/10 text-primary w-fit mx-auto">
            <UploadCloud className="size-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Upload Excel (.xlsx) or CSV Sheet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Required Header Columns: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">Party Name</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">Type</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">Mobile</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">GSTIN</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">State</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">Opening Balance</code>.
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Select Spreadsheet
            </Button>
          </div>
        </div>
      ) : (
        /* Parsed Preview Table */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="size-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">{fileName || "Parsed CSV File"}</h3>
                <p className="text-xs text-muted-foreground">{parsedParties.length} party records ready for import.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParsedParties([])}
                className="text-xs rounded-xl"
              >
                <Trash2 className="mr-1.5 size-3.5 text-rose-500" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={handleCommitImport}
                disabled={importing}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs"
              >
                {importing ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Check className="mr-1.5 size-3.5" />}
                {importing ? "Importing..." : `Confirm & Import (${parsedParties.length} Parties)`}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground border-b border-border font-bold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Party Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Mobile Phone</th>
                  <th className="p-3">GSTIN / Tax ID</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Opening Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {parsedParties.map((p, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground font-mono">{i + 1}</td>
                    <td className="p-3 font-bold text-foreground">{p.name}</td>
                    <td className="p-3">
                      <Badge
                        className={`text-[9px] border-none font-bold ${
                          p.type === "SUPPLIER"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {p.type}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{p.phone || "-"}</td>
                    <td className="p-3 font-mono text-muted-foreground">{p.gstin || "-"}</td>
                    <td className="p-3 text-muted-foreground">{p.state || "-"}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      ₹{p.openingBalance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
