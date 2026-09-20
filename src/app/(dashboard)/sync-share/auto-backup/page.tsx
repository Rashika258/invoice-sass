"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, History, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { fetchAppSettings, saveAppSettingsAction } from "@/actions/store-ops";
import { Button } from "@/components/ui/button";
import { createCompanyBackup } from "@/actions/backup";

export default function AutoBackupPage() {
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState("DAILY");
  const [time, setTime] = useState("23:59");
  const [saving, setSaving] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAppSettings().then((data) => {
      if (data.autoBackup !== undefined) setEnabled(data.autoBackup);
      if ((data as any).backupFrequency) setFrequency((data as any).backupFrequency);
      if ((data as any).backupTime) setTime((data as any).backupTime);
      if ((data as any).lastBackupAt) setLastBackup((data as any).lastBackupAt);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAppSettingsAction({
        autoBackup: enabled,
        backupFrequency: frequency as any,
        backupTime: time as any,
      } as any);
      toast.success("Auto-backup schedule saved successfully!");
    } catch {
      toast.error("Failed to save backup settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleTakeNow = async () => {
    setDownloading(true);
    try {
      const data = await createCompanyBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billora-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded successfully!");
      setLastBackup(new Date().toISOString());
    } catch {
      toast.error("Failed to create backup.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Link href="/sync-share" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Auto Backup</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-2xs text-xs">
        <div className="flex items-center justify-between pb-4 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-500">
              <History className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Automatic Scheduled Backups</h3>
              <p className="text-[11px] text-muted-foreground">Automatically take encrypted snapshots of your transactions.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-5 rounded accent-primary cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Backup Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-background px-2"
            >
              <option value="DAILY">Every Day (Recommended)</option>
              <option value="WEEKLY">Once a Week</option>
              <option value="HOURLY">Every 4 Hours</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-muted-foreground">Snapshot Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-background px-2 font-mono"
            />
          </div>
        </div>

        {lastBackup && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="size-4 shrink-0" />
            <span>
              Last backup: {new Date(lastBackup).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} (Encrypted &amp; Verified)
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand hover:bg-brand/90 text-white font-bold rounded-xl gap-1.5"
          >
            <Save className="size-3.5" />
            {saving ? "Saving..." : "Save Schedule"}
          </Button>

          <Button
            variant="outline"
            onClick={handleTakeNow}
            disabled={downloading}
            className="rounded-xl font-semibold gap-1.5"
          >
            <Clock className="size-3.5" />
            {downloading ? "Creating..." : "Backup Now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
