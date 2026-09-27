import { db } from "@/lib/db";

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

export async function getApprovalRequests(organizationId: string): Promise<ApprovalRequest[]> {
  const records = await db.approvalRequest.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    organizationId: r.organizationId,
    type: r.type as ApprovalType,
    title: r.title,
    entityId: r.entityId,
    entityIdentifier: r.entityIdentifier,
    amount: r.amount ?? undefined,
    requesterName: r.requesterName,
    requesterRole: r.requesterRole,
    reason: r.reason,
    requiredRole: r.requiredRole as "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK",
    status: r.status as ApprovalStatus,
    reviewedBy: r.reviewerName ?? undefined,
    reviewComment: r.reviewComment ?? undefined,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.updatedAt.toISOString(),
  }));
}

export async function submitApprovalRequest(
  data: Omit<ApprovalRequest, "id" | "status" | "createdAt">
): Promise<ApprovalRequest> {
  const created = await db.approvalRequest.create({
    data: {
      organizationId: data.organizationId,
      type: data.type,
      title: data.title,
      entityId: data.entityId,
      entityIdentifier: data.entityIdentifier,
      amount: data.amount,
      requesterName: data.requesterName,
      requesterRole: data.requesterRole,
      reason: data.reason,
      requiredRole: data.requiredRole,
      status: "PENDING",
    },
  });

  return {
    id: created.id,
    organizationId: created.organizationId,
    type: created.type as ApprovalType,
    title: created.title,
    entityId: created.entityId,
    entityIdentifier: created.entityIdentifier,
    amount: created.amount ?? undefined,
    requesterName: created.requesterName,
    requesterRole: created.requesterRole,
    reason: created.reason,
    requiredRole: created.requiredRole as "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK",
    status: created.status as ApprovalStatus,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function processApprovalDecision(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  reviewerName: string,
  organizationId: string,
  comment?: string
): Promise<{ success: boolean; request?: ApprovalRequest }> {
  const req = await db.approvalRequest.findFirst({
    where: { id: requestId, organizationId },
  });
  if (!req) return { success: false };

  const updated = await db.approvalRequest.update({
    where: { id: requestId },
    data: {
      status: decision,
      reviewerName,
      reviewComment: comment,
    },
  });

  return {
    success: true,
    request: {
      id: updated.id,
      organizationId: updated.organizationId,
      type: updated.type as ApprovalType,
      title: updated.title,
      entityId: updated.entityId,
      entityIdentifier: updated.entityIdentifier,
      amount: updated.amount ?? undefined,
      requesterName: updated.requesterName,
      requesterRole: updated.requesterRole,
      reason: updated.reason,
      requiredRole: updated.requiredRole as "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK",
      status: updated.status as ApprovalStatus,
      reviewedBy: updated.reviewerName ?? undefined,
      reviewComment: updated.reviewComment ?? undefined,
      createdAt: updated.createdAt.toISOString(),
      reviewedAt: updated.updatedAt.toISOString(),
    },
  };
}
