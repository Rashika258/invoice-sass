"use client";

import { useState } from "react";
import {
  Cloud,
  Crown,
  Database,
  Download,
  HardDrive,
  Laptop,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Upload,
} from "lucide-react";
import { createCompanyBackup, restoreCompanyBackup } from "@/actions/backup";
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

export default function SyncSharePage() {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>("Just now");
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreText, setRestoreText] = useState("");
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  // Backup to Computer
  const handleBackupToComputer = async () => {
    setLoading(true);
    try {
      const res = await createCompanyBackup();
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = res.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLastSynced("Just now");
    } catch (e: any) {
      alert(e.message || "Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  // Restore Backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRestoreText(text);
    };
    reader.readAsText(file);
  };

  const handleRestoreSubmit = async () => {
    if (!restoreText) return;
    setLoading(true);
    try {
      const res = await restoreCompanyBackup(restoreText);
      setRestoreStatus(
        `Successfully restored ${res.itemsRestored} items and ${res.partiesRestored} parties!`,
      );
      setTimeout(() => {
        setRestoreOpen(false);
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      alert(e.message || "Failed to restore backup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header matching media_1788511597525.png */}
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Sync &amp; Share
            <Crown className="size-4 text-amber-500 inline" />
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cloud Connected ({lastSynced})</span>
          </span>
        </div>
      </div>

      {/* Main Illustration Box matching media_1788511597525.png */}
      <div className="mx-auto max-w-2xl py-8 text-center space-y-6">
        {/* Device Sync Vector Diagram */}
        <div className="relative mx-auto flex size-44 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl" />
          <div className="relative flex size-36 items-center justify-center rounded-full border border-border bg-card shadow-lg">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/20 text-primary">
              <RefreshCw className={`size-7 ${syncEnabled ? "animate-spin-slow" : ""}`} />
            </div>

            {/* Orbiting Device Icons */}
            <div className="absolute -top-2 rounded-full border border-border bg-card p-2 text-primary shadow-xs">
              <Smartphone className="size-5" />
            </div>
            <div className="absolute -bottom-2 -left-2 rounded-full border border-border bg-card p-2 text-primary shadow-xs">
              <Laptop className="size-5" />
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-full border border-border bg-card p-2 text-primary shadow-xs">
              <Cloud className="size-5" />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Connect Multiple Devices
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Use your company in multiple devices and on the go by syncing. Create bills on your mobile, view sales reports on your desktop, and manage inventory seamlessly.
          </p>
        </div>

        {/* Primary Action Button */}
        <div>
          <Button
            onClick={() => setSyncEnabled(!syncEnabled)}
            className={`h-11 rounded-2xl px-8 text-xs font-bold transition-all shadow-md active:scale-[0.98] cursor-pointer ${
              syncEnabled
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            {syncEnabled ? "Sync Is Active (Connected)" : "Enable Cloud Sync"}
          </Button>
          <p className="mt-2 text-[11px] text-muted-foreground font-mono">
            *Multi-device cloud encryption active
          </p>
        </div>
      </div>

      {/* Backup & Restore Tools Section */}
      <div className="mx-auto max-w-4xl pt-4">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Local Storage &amp; Disaster Recovery
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Backup To Computer */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400 mb-2.5">
                <Download className="size-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Backup To Computer</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Save an encrypted JSON copy of all invoices, parties, items, and settings to your local drive.
              </p>
            </div>
            <Button
              onClick={handleBackupToComputer}
              disabled={loading}
              className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Download Backup Now"}
            </Button>
          </div>

          {/* Restore Backup */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-2.5">
                <Upload className="size-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Restore From Backup</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Restore items, customer accounts, and settings from a previously saved Vyapar JSON backup.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setRestoreOpen(true)}
              className="w-full text-xs font-semibold rounded-xl border-border"
            >
              Select Backup File
            </Button>
          </div>

          {/* Auto Backup Status */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 mb-2.5">
                <ShieldCheck className="size-4.5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Automated Cloud Backups</h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                Automatic rolling daily snapshots protect your ledger from device failures or loss.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 text-xs">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-semibold text-emerald-400">Daily at 11:59 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-zinc-800 bg-zinc-950 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="size-5 text-emerald-400" />
              Restore Company Backup
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Select your previously exported .JSON backup file to restore records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 p-6 text-center cursor-pointer hover:border-zinc-700">
              <HardDrive className="size-8 text-zinc-500 mb-2" />
              <span className="text-xs font-semibold text-zinc-200">
                Choose Backup (.json) File
              </span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFile}
              />
            </label>

            {restoreText && (
              <p className="text-xs text-emerald-400 font-semibold text-center">
                ✓ Backup file loaded (Ready to restore)
              </p>
            )}

            {restoreStatus && (
              <p className="text-xs text-purple-400 font-semibold text-center">
                {restoreStatus}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
              <Button
                variant="ghost"
                onClick={() => setRestoreOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                disabled={!restoreText || loading}
                onClick={handleRestoreSubmit}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm & Restore"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
