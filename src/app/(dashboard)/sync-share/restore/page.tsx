"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HardDrive, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { restoreCompanyBackup } from "@/actions/backup";
import { Button } from "@/components/ui/button";

export default function RestoreBackupPage() {
  const [restoreText, setRestoreText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRestoreText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleRestore = async () => {
    if (!restoreText) return;
    setLoading(true);
    try {
      const res = await restoreCompanyBackup(restoreText);
      toast.success(`Restored ${res.itemsRestored} items and ${res.partiesRestored} parties!`);
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
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Link href="/sync-share" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Restore Backup</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 shadow-2xs">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 mx-auto">
          <Upload className="size-8" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-foreground">Restore From Backup File</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Select a .JSON backup file exported previously to recover all parties, items, and transactions.
          </p>
        </div>

        <div className="pt-2">
          <label className="inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-bold px-8 text-xs shadow-md cursor-pointer hover:bg-primary/90">
            <Upload className="size-4" />
            <span>{fileName ? `File: ${fileName}` : "Select .JSON File"}</span>
            <input type="file" accept=".json" onChange={handleFile} className="hidden" />
          </label>
        </div>

        {restoreText && (
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs font-semibold text-emerald-500">
              ✓ Valid backup file ready for restoration
            </p>
            <Button
              onClick={handleRestore}
              disabled={loading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-6"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Confirm & Restore Now"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
