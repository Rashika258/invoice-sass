"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, FileJson, Loader2, Upload, Database, Layers } from "lucide-react";
import { toast } from "sonner";
import { restoreCompanyBackup } from "@/actions/backup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BackupMetadata {
  version?: string;
  exportDate?: string;
  orgName?: string;
  itemCount: number;
  customerCount: number;
  bankAccountCount: number;
  employeeCount: number;
  expenseCount: number;
}

export default function RestoreBackupPage() {
  const [restoreText, setRestoreText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<BackupMetadata | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError(null);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRestoreText(text);

      try {
        const parsed = JSON.parse(text);
        if (!parsed.items && !parsed.customers && !parsed.invoices && !parsed.expenses) {
          setParseError("Invalid backup file: Missing items, customers, or financial records.");
          return;
        }

        setPreview({
          version: parsed.version ?? "1.0",
          exportDate: parsed.exportDate ? new Date(parsed.exportDate).toLocaleString("en-IN") : "Unknown",
          orgName: parsed.organization?.name ?? "Billora Export",
          itemCount: Array.isArray(parsed.items) ? parsed.items.length : 0,
          customerCount: Array.isArray(parsed.customers) ? parsed.customers.length : 0,
          bankAccountCount: Array.isArray(parsed.bankAccounts) ? parsed.bankAccounts.length : 0,
          employeeCount: Array.isArray(parsed.employees) ? parsed.employees.length : 0,
          expenseCount: Array.isArray(parsed.expenses) ? parsed.expenses.length : 0,
        });
      } catch {
        setParseError("Failed to parse file: Selected file is not a valid JSON document.");
      }
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restoreText || parseError) return;
    setLoading(true);
    try {
      const res = await restoreCompanyBackup(restoreText);
      toast.success(
        `Backup restored! Inserted ${res.itemsRestored} items, ${res.partiesRestored} parties, ${res.bankAccountsRestored} accounts, ${res.employeesRestored} employees, and ${res.expensesRestored} expenses.`
      );
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (e: any) {
      toast.error(e.message || "Failed to restore backup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6 select-none">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Link href="/sync-share" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Restore Business Backup</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center space-y-5 shadow-2xs">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 mx-auto">
          <Upload className="size-8" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-foreground">Restore From Backup File</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a <code className="font-mono text-emerald-600 font-semibold">.JSON</code> backup file exported from Billora to preview record counts and restore data safely.
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-bold px-8 text-xs shadow-md cursor-pointer hover:bg-primary/90 transition-all">
            <Upload className="size-4" />
            <span>{fileName ? `File: ${fileName}` : "Select .JSON File"}</span>
            <input type="file" accept=".json" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {parseError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2 text-left">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {preview && !parseError && (
          <div className="pt-4 border-t border-border space-y-4 text-left">
            {/* Metadata Header */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <FileJson className="size-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-xs text-foreground">{preview.orgName}</h4>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Exported: {preview.exportDate} • Version {preview.version}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-[10px] font-bold">
                VALID BACKUP
              </Badge>
            </div>

            {/* Record Counts Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-brand" />
                <span>Backup Contents Preview</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl border bg-muted/30 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Items & Inventory</div>
                  <div className="text-lg font-black font-mono text-foreground">{preview.itemCount}</div>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Customers & Parties</div>
                  <div className="text-lg font-black font-mono text-foreground">{preview.customerCount}</div>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Bank Accounts</div>
                  <div className="text-lg font-black font-mono text-foreground">{preview.bankAccountCount}</div>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Staff & Employees</div>
                  <div className="text-lg font-black font-mono text-foreground">{preview.employeeCount}</div>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30 text-center sm:col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Expenses Recorded</div>
                  <div className="text-lg font-black font-mono text-foreground">{preview.expenseCount}</div>
                </div>
              </div>
            </div>

            {/* Conflict Policy Note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed flex items-start gap-2">
              <Database className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Smart Idempotent Import:</strong> Existing records with identical names will be safely retained without creating duplicates. Only missing entries will be imported.
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-2 text-center">
              <Button
                onClick={handleRestore}
                disabled={loading}
                className="w-full sm:w-auto h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-8 shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    <span>Restoring Company Data...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 mr-2" />
                    <span>Confirm &amp; Execute Restore</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
