"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, History, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AutoBackupPage() {
  const [enabled, setEnabled] = useState(true);
  const [frequency, setFrequency] = useState("DAILY");
  const [time, setTime] = useState("23:59");

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
            onChange={(e) => {
              setEnabled(e.target.checked);
              toast.success(e.target.checked ? "Auto backup enabled" : "Auto backup paused");
            }}
            className="size-5 rounded accent-[#ef4444] cursor-pointer"
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
            >
            </input>
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Last automated snapshot taken today at 07:09 AM (Encrypted &amp; Verified)</span>
        </div>

        <Button
          onClick={() => toast.success("Auto-backup preferences saved!")}
          className="bg-primary text-primary-foreground font-bold rounded-xl"
        >
          Save Schedule Settings
        </Button>
      </div>
    </div>
  );
}
