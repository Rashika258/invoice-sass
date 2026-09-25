import type { InvoiceStatus } from "@/generated/prisma/client";

export const VALID_INVOICE_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
  PAID: [], // Paid invoices cannot undergo status transitions without formal reversal / credit notes
  CANCELLED: [], // Cancelled invoices cannot be reactivated
};

export function validateInvoiceStatusTransition(
  currentStatus: InvoiceStatus,
  nextStatus: InvoiceStatus
): { valid: boolean; reason?: string } {
  if (currentStatus === nextStatus) {
    return { valid: true };
  }

  const allowedNext = VALID_INVOICE_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      reason: `Cannot transition invoice status from ${currentStatus} to ${nextStatus}. Allowed transitions from ${currentStatus}: [${allowedNext.join(", ")}]`,
    };
  }

  return { valid: true };
}

export function canEditInvoice(invoice: { status: InvoiceStatus; paidAmount?: number }): {
  allowed: boolean;
  reason?: string;
} {
  if (invoice.status === "PAID") {
    return {
      allowed: false,
      reason: "Paid invoices cannot be modified directly. Use credit notes or payment reversals.",
    };
  }

  if (invoice.status === "CANCELLED") {
    return {
      allowed: false,
      reason: "Cancelled invoices cannot be modified.",
    };
  }

  if ((invoice.paidAmount ?? 0) > 0) {
    return {
      allowed: false,
      reason: "Invoices with recorded payments cannot be modified directly.",
    };
  }

  return { allowed: true };
}

export function canDeleteInvoice(invoice: { status: InvoiceStatus; paidAmount?: number }): {
  allowed: boolean;
  reason?: string;
} {
  if (invoice.status === "PAID" || (invoice.paidAmount ?? 0) > 0) {
    return {
      allowed: false,
      reason: "Cannot delete an invoice with recorded payments. Reverse payments or issue a credit note.",
    };
  }

  return { allowed: true };
}
