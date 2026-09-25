/**
 * 📦 Billora Bulk Preview Engine
 * Computes and previews the impact of bulk operations before execution.
 */

export type BulkOperationType =
  | "BULK_GST_RATE_UPDATE"
  | "BULK_CUSTOMER_ARCHIVE"
  | "BULK_ITEM_ARCHIVE"
  | "BULK_NOTIFICATION_EXPIRE"
  | "BULK_IMPORT"
  | "BULK_STOCK_REVALUE"
  | "BULK_DOCUMENT_NUMBER_REASSIGN";

export interface BulkImpactWarning {
  field: string;
  message: string;
  severity: "WARNING" | "INFO";
}

export interface BulkImpactPreview {
  operationType: BulkOperationType;
  operationLabel: string;
  totalRecordsAffected: number;
  safeToUpdate: number;
  warnings: BulkImpactWarning[];
  fieldChanges: {
    field: string;
    currentValue: string;
    newValue: string;
  }[];
  estimatedImpact: string[];
  requiresApproval: boolean;
}

/**
 * Preview impact of changing GST rate across many items
 */
export function previewGSTRateUpdate(params: {
  currentRate: number;
  newRate: number;
  itemCount: number;
  activeInvoiceCount: number;
  draftInvoiceCount: number;
}): BulkImpactPreview {
  const warnings: BulkImpactWarning[] = [];

  if (params.activeInvoiceCount > 0) {
    warnings.push({
      field: "Active Invoices",
      message: `${params.activeInvoiceCount} active invoices use these items. Tax on existing invoices will NOT change retroactively — only future invoices will reflect the new rate.`,
      severity: "WARNING",
    });
  }

  if (params.draftInvoiceCount > 0) {
    warnings.push({
      field: "Draft Invoices",
      message: `${params.draftInvoiceCount} draft invoices will have their GST auto-recalculated when reopened.`,
      severity: "INFO",
    });
  }

  if (Math.abs(params.currentRate - params.newRate) > 6) {
    warnings.push({
      field: "Rate Change",
      message: `Large GST rate change of ${Math.abs(params.currentRate - params.newRate)}%. Verify HSN classification compliance under CGST schedules.`,
      severity: "WARNING",
    });
  }

  return {
    operationType: "BULK_GST_RATE_UPDATE",
    operationLabel: `Update GST Rate: ${params.currentRate}% → ${params.newRate}%`,
    totalRecordsAffected: params.itemCount,
    safeToUpdate: params.itemCount,
    warnings,
    fieldChanges: [
      {
        field: "GST Rate",
        currentValue: `${params.currentRate}%`,
        newValue: `${params.newRate}%`,
      },
    ],
    estimatedImpact: [
      `${params.itemCount} items will have their tax rate updated`,
      `${params.activeInvoiceCount} active invoices are unaffected retroactively`,
      `${params.draftInvoiceCount} drafts will recalculate on next open`,
    ],
    requiresApproval: params.itemCount > 100 || Math.abs(params.currentRate - params.newRate) > 6,
  };
}

/**
 * Preview archiving inactive customers
 */
export function previewCustomerArchive(params: {
  inactiveSinceDays: number;
  customerCount: number;
  withOpenInvoicesCount: number;
  withPendingPaymentsCount: number;
}): BulkImpactPreview {
  const warnings: BulkImpactWarning[] = [];

  if (params.withOpenInvoicesCount > 0) {
    warnings.push({
      field: "Open Invoices",
      message: `${params.withOpenInvoicesCount} customers still have open invoices and cannot be archived until settled.`,
      severity: "WARNING",
    });
  }

  if (params.withPendingPaymentsCount > 0) {
    warnings.push({
      field: "Pending Payments",
      message: `${params.withPendingPaymentsCount} customers have pending payment reminders scheduled.`,
      severity: "INFO",
    });
  }

  const safeToArchive = params.customerCount - params.withOpenInvoicesCount;

  return {
    operationType: "BULK_CUSTOMER_ARCHIVE",
    operationLabel: `Archive Inactive Customers (inactive > ${params.inactiveSinceDays} days)`,
    totalRecordsAffected: params.customerCount,
    safeToUpdate: safeToArchive,
    warnings,
    fieldChanges: [
      { field: "Status", currentValue: "ACTIVE", newValue: "ARCHIVED" },
    ],
    estimatedImpact: [
      `${safeToArchive} customers safely moved to archive`,
      `${params.withOpenInvoicesCount} customers excluded (open invoices)`,
      "Archived customers remain in reports and search with ARCHIVED badge",
      "All invoice history retained for statutory compliance",
    ],
    requiresApproval: false,
  };
}

/**
 * Preview bulk notification expiry
 */
export function previewNotificationExpiry(params: {
  olderThanDays: number;
  unreadCount: number;
  readCount: number;
}): BulkImpactPreview {
  return {
    operationType: "BULK_NOTIFICATION_EXPIRE",
    operationLabel: `Expire Read Notifications (older than ${params.olderThanDays} days)`,
    totalRecordsAffected: params.readCount,
    safeToUpdate: params.readCount,
    warnings: params.unreadCount > 0
      ? [{
          field: "Unread Notifications",
          message: `${params.unreadCount} unread notifications will be preserved and not expired.`,
          severity: "INFO",
        }]
      : [],
    fieldChanges: [
      { field: "Notification State", currentValue: "ACTIVE", newValue: "EXPIRED" },
    ],
    estimatedImpact: [
      `${params.readCount} read notifications older than ${params.olderThanDays} days removed`,
      `${params.unreadCount} unread notifications safely retained`,
      "Database index rebuilt for faster notification loading",
    ],
    requiresApproval: false,
  };
}
