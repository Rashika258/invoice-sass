"use client";

import React, { useState } from "react";
import { getAuditLogsAction } from "@/actions/audit-logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { History, Search, Filter, ShieldCheck, ChevronRight, User, Calendar, FileText, ArrowRight } from "lucide-react";

export interface AuditLogDisplayItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "CANCEL" | "RECONCILE";
  entityType: "INVOICE" | "CUSTOMER" | "ITEM" | "PAYMENT" | "VOUCHER" | "SETTINGS";
  entityId: string;
  reasonCode?: string;
  reasonText?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLogDisplayItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");
  const [selectedAction, setSelectedAction] = useState<string>("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  React.useEffect(() => {
    getAuditLogsAction()
      .then((dbLogs) => {
        setLogs(dbLogs || []);
      })
      .catch(() => {});
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reasonText && log.reasonText.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = selectedEntity === "ALL" || log.entityType === selectedEntity;
    const matchesAction = selectedAction === "ALL" || log.action === selectedAction;

    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <History className="size-6 text-brand" />
            <span>Organization Audit Log Trail</span>
            <Badge className="bg-brand text-white font-mono text-[10px] font-bold">LIVE AUDIT</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable system audit trail recording every entity creation, modification, reason code, and state change
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-muted/40 border border-border rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by entity ID, user, or reason notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-card border-border rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-border bg-card text-foreground font-semibold"
          >
            <option value="ALL">All Entities</option>
            <option value="INVOICE">Invoices</option>
            <option value="CUSTOMER">Customers</option>
            <option value="ITEM">Items</option>
            <option value="PAYMENT">Payments</option>
            <option value="VOUCHER">Vouchers</option>
            <option value="SETTINGS">Settings</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="text-xs h-9 px-3 rounded-xl border border-border bg-card text-foreground font-semibold"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="CANCEL">CANCEL</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <ShieldCheck className="mx-auto size-12 text-muted-foreground opacity-50" />
            <h3 className="text-sm font-bold text-foreground">No Audit Logs Found</h3>
            <p className="text-xs text-muted-foreground">Adjust filters or search criteria to view recorded audit entries.</p>
          </Card>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="p-4 rounded-2xl border border-border bg-card hover:bg-muted/10 transition-all space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`font-mono text-[10px] font-bold ${
                        log.action === "CANCEL" || log.action === "DELETE"
                          ? "bg-rose-600 text-white"
                          : log.action === "CREATE"
                          ? "bg-emerald-600 text-white"
                          : "bg-brand text-white"
                      }`}
                    >
                      {log.action}
                    </Badge>

                    <span className="font-mono text-xs font-bold text-foreground">{log.entityType}</span>
                    <span className="font-mono text-xs text-muted-foreground">#{log.entityId}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <User className="size-3.5 text-brand" /> {log.userName} ({log.userRole})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-brand" /> {new Date(log.timestamp).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Reason Notes */}
                {log.reasonText && (
                  <div className="text-xs p-2.5 rounded-xl bg-muted/40 border border-border/60 text-foreground font-medium flex items-center gap-2">
                    <FileText className="size-3.5 text-brand shrink-0" />
                    <span>
                      <strong>Reason:</strong> {log.reasonText} {log.reasonCode && `(${log.reasonCode})`}
                    </span>
                  </div>
                )}

                {/* Diff Viewer Trigger */}
                {log.changes && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="h-7 text-xs font-bold text-brand hover:underline p-0"
                    >
                      <span>{isExpanded ? "Hide Change Details" : "View Before / After Changes"}</span>
                      <ChevronRight className={`size-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </Button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.03] space-y-1">
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                            Before Change
                          </span>
                          <pre className="text-[11px] font-mono text-foreground overflow-x-auto">
                            {JSON.stringify(log.changes.before || {}, null, 2)}
                          </pre>
                        </div>

                        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] space-y-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            After Change
                          </span>
                          <pre className="text-[11px] font-mono text-foreground overflow-x-auto">
                            {JSON.stringify(log.changes.after || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
