"use client";

import { useRef, useState } from "react";
import { Upload, Download, CheckCircle2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkImportItems, type CsvItemRow } from "@/actions/items-import";

const SAMPLE_CSV = `name,unitPrice,purchasePrice,hsn,gstRate,unit,stockQty,minStock,itemType,description
Red Pen,10,6,9608,12,PCS,500,50,PRODUCT,Ballpoint pen red ink
Blue Pen,10,6,9608,12,PCS,500,50,PRODUCT,Ballpoint pen blue ink
A4 Paper Ream,120,90,4802,12,REAM,100,20,PRODUCT,500 sheets A4 paper
Printing Service,500,0,,18,HR,0,0,SERVICE,Per hour printing service
`;

function parseCsv(text: string): CsvItemRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines
    .slice(1)
    .map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? "";
      });
      return {
        name: row.name || "",
        description: row.description || "",
        hsn: row.hsn || "",
        unitPrice: parseFloat(row.unitprice || row["unit price"] || "0") || 0,
        purchasePrice:
          parseFloat(row.purchaseprice || row["purchase price"] || "0") || 0,
        unit: row.unit || "PCS",
        gstRate: parseFloat(row.gstrate || row["gst%"] || "18") || 18,
        itemType: (
          row.itemtype === "SERVICE" ? "SERVICE" : "PRODUCT"
        ) as "PRODUCT" | "SERVICE",
        stockQty: parseInt(row.stockqty || "0", 10) || 0,
        minStock: parseInt(row.minstock || "0", 10) || 0,
      };
    })
    .filter((r) => r.name !== "");
}

export function ItemCsvImport({ onSuccess }: { onSuccess?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<CsvItemRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCsv(text);
      setRows(parsed);
      if (parsed.length === 0)
        toast.error("No valid rows found in CSV. Check the format.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    try {
      const result = await bulkImportItems(rows);
      toast.success(
        `Imported ${result.imported} items successfully${result.skipped > 0 ? ` (${result.skipped} skipped)` : ""}.`,
      );
      if (result.errors.length > 0) {
        console.warn("Import errors:", result.errors);
        result.errors.forEach((e) => toast.error(e));
      }
      setRows([]);
      setFileName("");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "billora_items_sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Bulk Import Items from CSV
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload a CSV file with columns: name, unitPrice, hsn, gstRate,
            unit, stockQty, itemType
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadSample}
          className="text-xs gap-1.5"
        >
          <Download className="size-3.5" />
          Download Sample CSV
        </Button>
      </div>

      {/* Drop zone — only shown before file is loaded */}
      {rows.length === 0 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-border/60 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
        >
          <Upload className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            Drop your CSV here or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports .csv files · Max 5000 rows
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {fileName}
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                {rows.length} rows ready
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRows([]);
                setFileName("");
              }}
              className="text-xs"
            >
              <X className="size-3.5 mr-1" /> Clear
            </Button>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Unit Price</TableHead>
                  <TableHead className="text-xs">HSN</TableHead>
                  <TableHead className="text-xs">GST%</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs">Stock</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 10).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium">
                      {row.name}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      ₹{row.unitPrice}
                    </TableCell>
                    <TableCell className="text-xs">
                      {row.hsn || "—"}
                    </TableCell>
                    <TableCell className="text-xs">{row.gstRate}%</TableCell>
                    <TableCell className="text-xs">{row.unit}</TableCell>
                    <TableCell className="text-xs">{row.stockQty}</TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {row.itemType}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {rows.length > 10 && (
            <p className="text-xs text-muted-foreground">
              ...and {rows.length - 10} more rows
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="text-xs font-bold gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              {isImporting ? "Importing..." : `Import ${rows.length} Items`}
            </Button>
            <p className="text-xs text-muted-foreground">
              Duplicates will be added as separate items.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
