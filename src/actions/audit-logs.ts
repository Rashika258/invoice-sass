"use server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

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

export async function getAuditLogsAction(): Promise<AuditLogDisplayItem[]> {
  const session = await requireUser();
  const logs = await db.auditLog.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return logs.map((log) => {
    let parsedChanges: any = {};
    if (log.changes) {
      try {
        parsedChanges = JSON.parse(log.changes);
      } catch {
        parsedChanges = { detail: log.changes };
      }
    }

    return {
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      userName: session.name || session.email,
      userRole: session.role,
      action: (log.action as any) || "UPDATE",
      entityType: (log.entity.toUpperCase() as any) || "INVOICE",
      entityId: log.entityId,
      reasonText: parsedChanges.reason || undefined,
      changes: {
        after: parsedChanges,
      },
    };
  });
}
