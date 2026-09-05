"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Cloud, HardDrive, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function BackupToDrivePage() {
  const [connected, setConnected] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        <Link href="/sync-share" className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Backup To Google Drive</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 shadow-2xs">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-500 mx-auto">
          <Cloud className="size-8" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-foreground">Link Your Google Drive Account</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatically upload a daily copy of your Billora data file to your private Google Drive storage. Never worry about hard drive crashes or lost laptops.
          </p>
        </div>

        {connected ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500">
              <CheckCircle2 className="size-4" />
              <span>Connected: business.backup@gmail.com</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConnected(false);
                toast.info("Google Drive disconnected");
              }}
              className="text-xs text-rose-500 border-border"
            >
              Disconnect Account
            </Button>
          </div>
        ) : (
          <div className="pt-2">
            <Button
              onClick={() => {
                setConnected(true);
                toast.success("Google Drive successfully connected!");
              }}
              className="h-10 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold px-8 text-xs shadow-md"
            >
              <Cloud className="mr-1.5 size-4" />
              Connect Google Drive
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
