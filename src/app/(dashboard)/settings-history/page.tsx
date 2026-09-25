"use client";

import { History, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SettingsHistoryPage() {
  const mockHistory = [
    {
      id: "hist-1",
      action: "Updated Tax Configuration (GST 18%)",
      user: "Admin",
      timestamp: "2026-09-25 10:15:00",
      type: "Tax",
    },
    {
      id: "hist-2",
      action: "Enabled Auto-Backup Schedule",
      user: "System",
      timestamp: "2026-09-24 18:30:00",
      type: "System",
    },
    {
      id: "hist-3",
      action: "Updated Company Profile details",
      user: "Admin",
      timestamp: "2026-09-23 14:10:00",
      type: "Profile",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <History className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Settings History & Audit Log
            </h1>
            <p className="text-xs text-muted-foreground">
              Track configuration changes, security updates, and preferences audit trail.
            </p>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="size-3.5 mr-1" /> Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Recent System Modifications
          </span>
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold">
            AUDIT ACTIVE
          </Badge>
        </div>

        <div className="space-y-3">
          {mockHistory.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">
                  {item.action}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  By <span className="font-semibold text-foreground">{item.user}</span> • {item.timestamp}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] font-mono">
                {item.type}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
