"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, HardDrive, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createCompanyBackup } from "@/actions/backup";
import { Button } from "@/components/ui/button";

export default function BackupToComputerPage() {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
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
      setDownloaded(true);
      toast.success("Company backup downloaded successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to download backup");
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
        <h1 className="text-xl font-bold tracking-tight text-foreground">Backup To Computer</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-5 shadow-2xs">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 mx-auto">
          <HardDrive className="size-8" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-lg font-bold text-foreground">Download Complete Business Backup</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Create an encrypted, standalone JSON backup containing all your sales bills, purchase records, parties, inventory catalog, stock adjustments, and settings.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 text-xs shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1.5 size-4 animate-spin" />
                Generating Backup...
              </>
            ) : (
              <>
                <Download className="mr-1.5 size-4" />
                Download Backup File Now
              </>
            )}
          </Button>
        </div>

        {downloaded && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-500 pt-2">
            <CheckCircle2 className="size-4" />
            <span>File saved to your Downloads folder!</span>
          </div>
        )}
      </div>
    </div>
  );
}
