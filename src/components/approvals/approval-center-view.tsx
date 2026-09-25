"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  CheckCircle2, 
  Clock, 
  Filter, 
  Inbox, 
  ShieldCheck, 
  UserCheck, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { 
  fetchApprovalsAction, 
  reviewApprovalAction, 
} from "@/actions/approvals";
import type { ApprovalRequest } from "@/lib/approvals";
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

export function ApprovalCenterView() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [isPending, startTransition] = useTransition();

  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [decisionType, setDecisionType] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [comment, setComment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadRequests = async () => {
    try {
      const data = await fetchApprovalsAction();
      setRequests(data);
    } catch {
      toast.error("Failed to load approval requests");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const openDecisionModal = (req: ApprovalRequest, decision: "APPROVED" | "REJECTED") => {
    setSelectedReq(req);
    setDecisionType(decision);
    setComment("");
    setModalOpen(true);
  };

  const handleConfirmDecision = () => {
    if (!selectedReq) return;
    startTransition(async () => {
      try {
        const res = await reviewApprovalAction(
          selectedReq.id,
          decisionType,
          "Admin Reviewer",
          comment || undefined
        );
        if (res.success) {
          toast.success(`Request ${decisionType.toLowerCase()} successfully`);
          loadRequests();
        } else {
          toast.error("Failed to process decision");
        }
      } catch {
        toast.error("Error submitting review");
      } finally {
        setModalOpen(false);
      }
    });
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const approved = requests.filter((r) => r.status === "APPROVED");
  const rejected = requests.filter((r) => r.status === "REJECTED");

  const displayed = 
    activeTab === "PENDING" ? pending : activeTab === "APPROVED" ? approved : rejected;

  return (
    <div className="space-y-6 select-none max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="size-6 text-primary" />
            <span>Multi-Role Approval Queues</span>
            <Badge className="bg-primary text-white font-mono text-[10px] font-bold">
              {pending.length} PENDING
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Maker-checker governance for high-value discounts, credit notes, stock adjustments &amp; cancellations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="PENDING" className="text-xs font-semibold gap-1.5">
            <Clock className="size-3.5 text-amber-500" />
            <span>Pending Review ({pending.length})</span>
          </TabsTrigger>
          <TabsTrigger value="APPROVED" className="text-xs font-semibold gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>Approved ({approved.length})</span>
          </TabsTrigger>
          <TabsTrigger value="REJECTED" className="text-xs font-semibold gap-1.5">
            <XCircle className="size-3.5 text-rose-500" />
            <span>Rejected ({rejected.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3">
          {displayed.length === 0 ? (
            <Card className="p-8 text-center space-y-2 border-dashed">
              <CheckCircle2 className="size-12 text-muted-foreground/40 mx-auto" />
              <h3 className="text-sm font-bold text-foreground">Queue is Clear</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No approval requests currently in the {activeTab.toLowerCase()} state.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayed.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-border/80 bg-card shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground">{req.title}</span>
                        <Badge variant="outline" className="text-[9px] font-mono font-bold">
                          {req.type.replace(/_/g, " ")}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary text-[9px] font-bold">
                          Required Role: {req.requiredRole}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{req.reason}</p>
                    </div>

                    {req.status === "PENDING" && (
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => openDecisionModal(req, "APPROVED")}
                          className="h-8 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() => openDecisionModal(req, "REJECTED")}
                          className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        >
                          <XCircle className="size-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs border border-border/50">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Initiated By:</span>
                      <span className="font-semibold text-foreground">{req.requesterName} ({req.requesterRole})</span>
                    </div>
                    {req.amount && (
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Transaction Amount:</span>
                        <span className="font-mono font-bold text-foreground">₹{req.amount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Target Entity:</span>
                      <span className="font-mono text-muted-foreground">{req.entityIdentifier}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Submitted:</span>
                      <span className="text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {req.reviewComment && (
                    <div className="text-xs p-2 rounded bg-muted/30 border text-muted-foreground">
                      <strong>Review Note ({req.reviewedBy}):</strong> {req.reviewComment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Decision Remarks Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {decisionType === "APPROVED" ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span>Confirm Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-rose-600" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedReq?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-foreground">Reviewer Remarks (Optional)</label>
            <Textarea
              placeholder={decisionType === "APPROVED" ? "Approved per commercial guidelines..." : "Reason for rejection..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-xs"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleConfirmDecision}
              className={`text-xs font-bold text-white ${
                decisionType === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {decisionType === "APPROVED" ? "Confirm Approval" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
