/**
 * 📋 Billora Multi-Role Approval Engine
 * Supports maker-checker review workflows for sensitive business operations.
 */

export type ApprovalType = 
  | "INVOICE_CANCELLATION"
  | "LARGE_DISCOUNT"
  | "STOCK_ADJUSTMENT"
  | "EXPENSE_APPROVAL"
  | "CREDIT_NOTE_ISSUANCE"
  | "PAYROLL_FINALIZATION"
  | "VOUCHER_POSTING";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ApprovalRequest {
  id: string;
  organizationId: string;
  type: ApprovalType;
  title: string;
  entityId: string;
  entityIdentifier: string;
  amount?: number;
  requesterName: string;
  requesterRole: string;
  reason: string;
  requiredRole: "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK";
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
}

// In-memory persistent queue with sample initial approvals
let approvalRequests: ApprovalRequest[] = [
  {
    id: "appr_101",
    organizationId: "default-org-1",
    type: "LARGE_DISCOUNT",
    title: "Commercial Discount 22% on Sale Order #SO-2026-001",
    entityId: "so-1",
    entityIdentifier: "SO-2026-001",
    amount: 41300,
    requesterName: "Priya Patel",
    requesterRole: "STAFF",
    reason: "Bulk educational institution order requested 22% special discount (threshold > 15%)",
    requiredRole: "ADMIN",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  },
  {
    id: "appr_102",
    organizationId: "default-org-1",
    type: "STOCK_ADJUSTMENT",
    title: "Inventory Write-Off for Expired Batch #AZI-2026-C2",
    entityId: "item-azi",
    entityIdentifier: "AZI-2026-C2",
    amount: 14200,
    requesterName: "Suresh Gowda",
    requesterRole: "WAREHOUSE_CLERK",
    reason: "Damaged packaging in transit; 25 units need physical scrap write-off",
    requiredRole: "ADMIN",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600 * 1000 * 8).toISOString(),
  },
  {
    id: "appr_103",
    organizationId: "default-org-1",
    type: "CREDIT_NOTE_ISSUANCE",
    title: "Credit Note Approval for Zenith Tech #CN-2026-001",
    entityId: "cn-1",
    entityIdentifier: "CN-2026-001",
    amount: 5900,
    requesterName: "Ananya Deshmukh",
    requesterRole: "SALES_OPERATOR",
    reason: "Client returned 2 defective Logitech mice with broken seals",
    requiredRole: "CA_AUDITOR",
    status: "PENDING",
    createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
  },
  {
    id: "appr_104",
    organizationId: "default-org-1",
    type: "EXPENSE_APPROVAL",
    title: "AWS Cloud Infrastructure Advance Payment",
    entityId: "exp-aws",
    entityIdentifier: "EXP-2026-004",
    amount: 18500,
    requesterName: "Rahul Sharma",
    requesterRole: "STAFF",
    reason: "Annual reserved instance billing (exceeds ₹10,000 threshold)",
    requiredRole: "ADMIN",
    status: "APPROVED",
    reviewedBy: "Admin (admin@billora.app)",
    reviewComment: "Verified against cloud infrastructure budget",
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    reviewedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  }
];

export function getApprovalRequests(organizationId: string = "default-org-1"): ApprovalRequest[] {
  return approvalRequests.filter((r) => r.organizationId === organizationId || !r.organizationId);
}

export function submitApprovalRequest(data: Omit<ApprovalRequest, "id" | "status" | "createdAt">): ApprovalRequest {
  const newReq: ApprovalRequest = {
    ...data,
    id: `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  approvalRequests.unshift(newReq);
  return newReq;
}

export function processApprovalDecision(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  reviewerName: string,
  comment?: string
): { success: boolean; request?: ApprovalRequest } {
  const req = approvalRequests.find((r) => r.id === requestId);
  if (!req) return { success: false };

  req.status = decision;
  req.reviewedBy = reviewerName;
  req.reviewComment = comment;
  req.reviewedAt = new Date().toISOString();

  return { success: true, request: req };
}
