"use server";

import { 
  getApprovalRequests, 
  processApprovalDecision, 
  submitApprovalRequest, 
  type ApprovalRequest, 
  type ApprovalType 
} from "@/lib/approvals";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function fetchApprovalsAction(overrideOrgId?: string): Promise<ApprovalRequest[]> {
  const session = await requireUser();
  const orgId = session.organizationId;
  return getApprovalRequests(orgId);
}

export async function submitApprovalAction(data: {
  type: ApprovalType;
  title: string;
  entityId: string;
  entityIdentifier: string;
  amount?: number;
  reason: string;
  requiredRole: "ADMIN" | "CA_AUDITOR" | "WAREHOUSE_CLERK";
}) {
  const session = await requireUser();
  const req = await submitApprovalRequest({
    ...data,
    requesterName: session.name || session.email,
    requesterRole: session.role,
    organizationId: session.organizationId,
  });
  revalidatePath("/approvals");
  revalidatePath("/work-queue");
  return { success: true, request: req };
}

export async function reviewApprovalAction(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  comment?: string
) {
  const session = await requireUser();
  const reviewerName = session.name || session.email;
  const res = await processApprovalDecision(requestId, decision, reviewerName, session.organizationId, comment);
  revalidatePath("/approvals");
  revalidatePath("/work-queue");
  return res;
}
