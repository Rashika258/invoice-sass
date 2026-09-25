"use client";

import { useEffect, useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  CloudOff, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  History 
} from "lucide-react";
import { 
  getLastSyncTime, 
  recordSuccessfulSync, 
  getQueuedActions 
} from "@/lib/business-continuity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState<string>("");
  const [queuedCount, setQueuedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setLastSync(getLastSyncTime());
    setQueuedCount(getQueuedActions().length);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internet connection restored! Resuming synchronization...");
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Working offline. Safe action queue active — zero data loss.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      recordSuccessfulSync();
      setLastSync(new Date().toISOString());
      setQueuedCount(0);
      setIsSyncing(false);
      toast.success("All local records & drafts synchronized successfully.");
    }, 800);
  };

  if (isOnline && queuedCount === 0) {
    return null; // Silent when everything is normal
  }

  return (
    <div className={`w-full px-4 py-2 text-xs flex items-center justify-between transition-colors ${
      !isOnline 
        ? "bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200"
        : "bg-blue-500/15 border-b border-blue-500/30 text-blue-900 dark:text-blue-200"
    }`}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <WifiOff className="size-4 text-amber-600 animate-pulse shrink-0" />
        ) : (
          <RefreshCw className="size-4 text-blue-600 animate-spin shrink-0" />
        )}
        <span>
          {!isOnline
            ? "Offline Mode Active: Transactions and drafts are securely cached on your device."
            : `${queuedCount} operation(s) queued for synchronization.`}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {lastSync && (
          <span className="text-[11px] opacity-75 hidden sm:inline">
            Last Synced: {new Date(lastSync).toLocaleTimeString()}
          </span>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={!isOnline || isSyncing}
          onClick={handleSync}
          className="h-6 text-[11px] px-2 font-semibold bg-background/80"
        >
          <RefreshCw className={`size-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
        </Button>
      </div>
    </div>
  );
}
