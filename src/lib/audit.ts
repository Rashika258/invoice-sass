import { db } from "@/lib/db";

export interface AuditLogOptions {
  organizationId: string;
  action: "CREATE" | "UPDATE" | "DELETE" | string;
  entity: "Invoice" | "Payment" | "Expense" | "Ledger" | "Voucher" | "Customer" | "Item" | string;
  entityId: string;
  changes?: Record<string, any> | string | null;
  userId?: string;
}

export async function recordAuditLog(options: AuditLogOptions) {
  try {
    const { organizationId, action, entity, entityId, changes, userId } = options;
    const changesString =
      typeof changes === "object" && changes !== null
        ? JSON.stringify(changes)
        : changes ?? null;

    await db.auditLog.create({
      data: {
        organizationId,
        action,
        entity,
        entityId,
        changes: changesString,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    // Non-blocking catch to ensure audit failure doesn't crash main transaction
    console.error("[AuditLog Error]: Failed to record audit log", error);
  }
}
