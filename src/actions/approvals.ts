"use server";

import { 
  getApprovalRequests, 
  processApprovalDecision, 
  submitApprovalRequest, 
  type ApprovalRequest, 
  type ApprovalType 
} from "@/lib/approvals";
import { revalidatePath } from "next/cache";

export async function fetchApprovalsAction(organizationId?: string): Promise<ApprovalRequest[]> {
  return getApprovalRequests(organizationId);
}

export async function submitApprovalAction(data: {
  type: ApprovalType;
  title: string;
  entityId: string;
  entityIdentifier: string;
  amount?: number;
  requesterName: string;
  requesterRole: string;
  reason: string;
  requiredRole: "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK";
  organizationId?: string;
}) {
  const req = submitApprovalRequest({
    ...data,
    organizationId: data.organizationId || "default-org-1",
  });
  revalidatePath("/approvals");
  revalidatePath("/work-queue");
  return { success: true, request: req };
}

export async function reviewApprovalAction(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  reviewerName: string,
  comment?: string
) {
  const res = processApprovalDecision(requestId, decision, reviewerName, comment);
  revalidatePath("/approvals");
  revalidatePath("/work-queue");
  return res;
}
