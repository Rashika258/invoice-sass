"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  Eye, 
  FileText, 
  HelpCircle, 
  RefreshCw, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  Wrench 
} from "lucide-react";
import { 
  runComprehensiveReconciliation, 
  updateReconciliationStatus, 
  autoRepairReconciliationIssue,
  type ReconciliationSummary,
  type ReconciliationAuditItem,
  type ReconciliationIssueStatus 
} from "@/actions/reconciliation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function ReconciliationCenterView() {
  const [data, setData] = useState<ReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [selectedIssue, setSelectedIssue] = useState<ReconciliationAuditItem | null>(null);
  const [ignoreReason, setIgnoreReason] = useState("");
  const [ignoreModalOpen, setIgnoreModalOpen] = useState(false);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await runComprehensiveReconciliation();
      setData(res);
    } catch {
      toast.error("Failed to run reconciliation audit");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const handleStatusChange = (issueId: string, status: ReconciliationIssueStatus, reason?: string) => {
    startTransition(async () => {
      try {
        await updateReconciliationStatus(issueId, status, reason);
        toast.success(`Updated issue status to ${status.replace("_", " ")}`);
        fetchReconciliation();
      } catch {
        toast.error("Failed to update status");
      }
    });
  };

  const handleAutoRepair = (issueId: string) => {
    startTransition(async () => {
      try {
        const res = await autoRepairReconciliationIssue(issueId);
        if (res.success) {
          toast.success(res.message || "Issue resolved and reconciled!");
          fetchReconciliation();
        } else {
          toast.error(res.error || "Auto-repair failed");
        }
      } catch {
        toast.error("Error executing auto-repair");
      }
    });
  };

  const handleOpenIgnoreModal = (issue: ReconciliationAuditItem) => {
    setSelectedIssue(issue);
    setIgnoreReason("");
    setIgnoreModalOpen(true);
  };

  const handleConfirmIgnore = () => {
    if (!selectedIssue) return;
    handleStatusChange(selectedIssue.id, "IGNORED_WITH_REASON", ignoreReason || "Auditor approved variance");
    setIgnoreModalOpen(false);
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center space-y-3">
        <RefreshCw className="size-8 animate-spin mx-auto text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Running financial invariants audit across 7 subsystems...</p>
      </div>
    );
  }

  const audits = data?.audits || [];
  const filtered = activeTab === "ALL" 
    ? audits 
    : audits.filter((a) => {
        if (activeTab === "OPEN") return a.status === "OPEN";
        if (activeTab === "UNDER_REVIEW") return a.status === "UNDER_REVIEW";
        if (activeTab === "RESOLVED") return a.status === "RESOLVED";
        if (activeTab === "INVOICE") return a.category.includes("INVOICE");
        if (activeTab === "ACCOUNTING") return a.category === "TALLY_DOUBLE_ENTRY";
        return true;
      });

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Scale className="size-6 text-primary" />
            <span>Financial Reconciliation Center</span>
            <Badge className="bg-primary text-white font-mono text-[10px] font-bold">
              {data?.overallHealthScore}% RECONCILED
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single pane of glass unifying Invoices, Payments, Stock ledgers, Tally double-entry &amp; Gateway balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isPending || loading} 
            onClick={fetchReconciliation}
            className="text-xs gap-1.5 h-8 font-semibold"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Re-Audit Ledger Invariants</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border border-border/80 p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Open Discrepancies</span>
            <AlertTriangle className="size-4 text-rose-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-rose-600 font-mono">
            {data?.openIssuesCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Require immediate review</p>
        </Card>

        <Card className="border border-border/80 p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Under Review</span>
            <ShieldAlert className="size-4 text-amber-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-amber-600 font-mono">
            {data?.underReviewCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to accountant</p>
        </Card>

        <Card className="border border-border/80 p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Auto-Reconciled</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-600 font-mono">
            {data?.resolvedCount ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Invariants restored</p>
        </Card>

        <Card className="border border-border/80 p-3.5 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Invariant Checks</span>
            <Database className="size-4 text-blue-500" />
          </div>
          <div className="mt-1 text-2xl font-black text-foreground font-mono">
            {data?.totalChecksRun ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Executed across 7 subsystems</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="ALL" className="text-xs font-semibold">
            All Invariants ({audits.length})
          </TabsTrigger>
          <TabsTrigger value="OPEN" className="text-xs font-semibold">
            Open ({data?.openIssuesCount ?? 0})
          </TabsTrigger>
          <TabsTrigger value="UNDER_REVIEW" className="text-xs font-semibold">
            Under Review ({data?.underReviewCount ?? 0})
          </TabsTrigger>
          <TabsTrigger value="INVOICE" className="text-xs font-semibold">
            Invoices &amp; Payments
          </TabsTrigger>
          <TabsTrigger value="ACCOUNTING" className="text-xs font-semibold">
            Tally Ledgers (DR/CR)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border-dashed">
              <CheckCircle2 className="size-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-foreground">All Invariants Fully Reconciled</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                No mathematical variances or ledger imbalances detected. Invoices, payments, stock logs and Tally double-entries are 100% synchronized.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((issue) => (
                <div 
                  key={issue.id}
                  className={`p-4 rounded-xl border bg-card shadow-2xs space-y-3 transition-all ${
                    issue.status === "RESOLVED" 
                      ? "opacity-60 border-border" 
                      : issue.severity === "CRITICAL"
                      ? "border-rose-500/30 bg-rose-500/[0.02]"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{issue.title}</span>
                        <Badge
                          className={`text-[9px] font-mono font-bold ${
                            issue.severity === "CRITICAL"
                              ? "bg-rose-600 text-white"
                              : issue.severity === "HIGH"
                              ? "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          }`}
                        >
                          {issue.severity}
                        </Badge>
                        <Badge
                          className={`text-[9px] font-mono font-bold ${
                            issue.status === "OPEN"
                              ? "bg-rose-500/15 text-rose-600"
                              : issue.status === "UNDER_REVIEW"
                              ? "bg-amber-500/15 text-amber-600"
                              : issue.status === "RESOLVED"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {issue.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      {issue.canAutoRepair && issue.status !== "RESOLVED" && (
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleAutoRepair(issue.id)}
                          className="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Wrench className="size-3" />
                          <span>Auto-Reconcile</span>
                        </Button>
                      )}

                      {issue.status === "OPEN" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleStatusChange(issue.id, "UNDER_REVIEW")}
                          className="h-7 text-xs font-semibold"
                        >
                          Mark Under Review
                        </Button>
                      )}

                      {issue.status !== "RESOLVED" && issue.status !== "IGNORED_WITH_REASON" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleOpenIgnoreModal(issue)}
                          className="h-7 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Ignore with Reason
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs border border-border/60">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Expected Value:</span>
                      <span className="font-mono font-bold text-foreground">{issue.expectedValue}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Actual Recorded:</span>
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{issue.actualValue}</span>
                    </div>
                    {issue.difference && (
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Discrepancy:</span>
                        <span className="font-mono font-bold text-amber-600">{issue.difference}</span>
                      </div>
                    )}
                  </div>

                  {issue.statusReason && (
                    <div className="text-[11px] text-muted-foreground italic px-1">
                      <strong>Audit Note:</strong> {issue.statusReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Ignore Reason Modal */}
      <Dialog open={ignoreModalOpen} onOpenChange={setIgnoreModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Ignore Discrepancy with Audit Reason</DialogTitle>
            <DialogDescription className="text-xs">
              Explain why this variance is acceptable or accounted for elsewhere. This will be preserved in the audit log.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground">Reason / Justification</label>
            <Textarea
              placeholder="e.g. Known rounding difference approved by auditor for FY26 closing..."
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              className="text-xs"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIgnoreModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmIgnore} className="text-xs font-bold">
              Save Audit Justification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
