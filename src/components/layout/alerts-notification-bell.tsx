"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  ChevronRight,
  Clock,
  DollarSign,
  Package,
  Receipt,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getLiveAlertsDataAction,
  dismissAlertAction,
} from "@/actions/alerts";
import type { LiveAlertItem } from "@/lib/alerts-engine";
import {
  ALERTS_CHANGE_EVENT,
  emitAlertsChange,
  type AlertsChangeEventDetail,
} from "@/lib/alerts-events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AlertsNotificationBell() {
  const [alerts, setAlerts] = useState<LiveAlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const data = await getLiveAlertsDataAction();
      setAlerts(data.alerts);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAlerts();

    const handleAlertsChange = (e: Event) => {
      const customEvent = e as CustomEvent<AlertsChangeEventDetail>;
      const detail = customEvent.detail;

      if (detail?.alertId && (detail.action === "dismiss" || detail.action === "delete")) {
        // Optimistically remove immediately from bell state without reload
        setAlerts((prev) => prev.filter((a) => a.id !== detail.alertId));
      }

      // Re-fetch in background to keep server state aligned
      fetchAlerts();
    };

    window.addEventListener(ALERTS_CHANGE_EVENT, handleAlertsChange);
    // Refresh alerts periodically every 30s
    const interval = setInterval(fetchAlerts, 30000);
    return () => {
      window.removeEventListener(ALERTS_CHANGE_EVENT, handleAlertsChange);
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = async (e: React.MouseEvent, id: string, isSystem: boolean) => {
    e.stopPropagation();
    // 1. Immediately remove from local bell state
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    // 2. Broadcast immediately so other views update instantly without reload
    emitAlertsChange({ action: "dismiss", alertId: id, isSystem });
    toast.success("Alert dismissed");

    try {
      await dismissAlertAction(id, isSystem);
    } catch {
      toast.error("Failed to dismiss alert");
      fetchAlerts();
    }
  };

  const unreadCount = alerts.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 relative text-muted-foreground hover:text-foreground cursor-pointer"
            title="Business Alerts & Reminders"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[9px] font-black text-white shadow-xs animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-84 sm:w-96 p-2 select-none">
        <DropdownMenuLabel className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <Bell className="size-3.5 text-brand" />
            <span className="text-xs font-bold text-foreground">Alerts &amp; Reminders</span>
          </div>
          {unreadCount > 0 ? (
            <Badge className="bg-brand-light text-brand text-[9px] font-bold border-none px-1.5">
              {unreadCount} Active
            </Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium">All caught up</span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <div className="max-h-80 overflow-y-auto space-y-1.5 p-1">
          {alerts.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <Check className="mx-auto size-7 text-emerald-500/60" />
              <p className="text-xs font-bold text-foreground">No Pending Alerts</p>
              <p className="text-[10px] text-muted-foreground">
                Pay day, inventory stock, and collections are up to date.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              return (
                <div
                  key={alert.id}
                  className={`p-2.5 rounded-xl border text-xs transition-all space-y-2 ${
                    alert.priority === "CRITICAL"
                      ? "border-rose-500/30 bg-rose-500/5"
                      : alert.priority === "HIGH"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-foreground text-xs leading-tight">
                        {alert.title}
                      </span>
                    </div>
                    {alert.dueInfo && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-mono px-1 py-0 shrink-0 font-bold"
                      >
                        {alert.dueInfo}
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    {alert.actionHref ? (
                      <Link
                        href={alert.actionHref}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand hover:underline"
                      >
                        <span>{alert.actionLabel || "View Action"}</span>
                        <ChevronRight className="size-3" />
                      </Link>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDismiss(e, alert.id, alert.isSystem)}
                      className="text-[10px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <X className="size-3" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="my-1" />

        <div className="p-1">
          <Link
            href="/alerts"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-bold transition-colors cursor-pointer"
          >
            <span>Open Alerts &amp; Reminders Center</span>
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
