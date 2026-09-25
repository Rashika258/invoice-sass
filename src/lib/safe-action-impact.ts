/**
 * 🛡️ Billora Safe Action Impact Calculator
 * Analyzes the blast radius of sensitive business actions before execution.
 */

export type SafeActionType = 
  | "INVOICE_CANCELLATION"
  | "STOCK_ADJUSTMENT"
  | "PAYMENT_REVERSAL"
  | "VOUCHER_DELETION"
  | "PAYROLL_FINALIZATION"
  | "BACKUP_RESTORE"
  | "FINANCIAL_YEAR_CLOSING";

export interface ActionImpactItem {
  iconType: "FINANCIAL" | "INVENTORY" | "AUDIT" | "TAX" | "IRREVERSIBLE";
  text: string;
  isNegative?: boolean;
}

export interface SafeActionImpact {
  actionType: SafeActionType;
  title: string;
  targetIdentifier: string;
  impacts: ActionImpactItem[];
  requiresConfirmationWord?: string; // e.g. "CANCEL" or "RESTORE"
  confirmButtonLabel: string;
  confirmVariant: "danger" | "warning" | "default";
  reversible: boolean;
}

export function calculateActionImpact(
  actionType: SafeActionType,
  params: {
    recordId: string;
    identifier: string;
    amount?: number;
    itemCount?: number;
    partyName?: string;
    dateOrPeriod?: string;
  }
): SafeActionImpact {
  switch (actionType) {
    case "INVOICE_CANCELLATION":
      return {
        actionType,
        title: `Cancel Sale Invoice #${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "FINANCIAL", text: `Reverse ₹${(params.amount || 0).toLocaleString("en-IN")} from Accounts Receivable (${params.partyName || "Customer"})` },
          { iconType: "INVENTORY", text: `Restore ${params.itemCount || 1} line item units back into active inventory stock` },
          { iconType: "TAX", text: "Nullify GST liability for GSTR-1 return filing" },
          { iconType: "AUDIT", text: "Create immutable audit trail with user timestamp and cancellation reason" },
        ],
        requiresConfirmationWord: "CANCEL",
        confirmButtonLabel: "Confirm Invoice Cancellation",
        confirmVariant: "danger",
        reversible: false,
      };

    case "STOCK_ADJUSTMENT":
      return {
        actionType,
        title: `Manual Inventory Adjustment for ${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "INVENTORY", text: `Directly mutate master inventory balance for ${params.identifier}` },
          { iconType: "FINANCIAL", text: `Post inventory valuation adjustment of ₹${(params.amount || 0).toLocaleString("en-IN")} to P&L` },
          { iconType: "AUDIT", text: "Append entry to Stock Movement Log (Bin Card)" },
        ],
        confirmButtonLabel: "Apply Stock Adjustment",
        confirmVariant: "warning",
        reversible: true,
      };

    case "PAYMENT_REVERSAL":
      return {
        actionType,
        title: `Reverse Recorded Payment #${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "FINANCIAL", text: `Debit ₹${(params.amount || 0).toLocaleString("en-IN")} back to Customer Pending Balance` },
          { iconType: "FINANCIAL", text: "Deduct funds from corresponding Cash Drawer / Bank Ledger" },
          { iconType: "AUDIT", text: "Mark receipt as REVERSED and notify accounting audit" },
        ],
        requiresConfirmationWord: "REVERSE",
        confirmButtonLabel: "Reverse Payment Entry",
        confirmVariant: "danger",
        reversible: false,
      };

    case "VOUCHER_DELETION":
      return {
        actionType,
        title: `Delete Double-Entry Voucher #${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "FINANCIAL", text: `Remove DR & CR balancing entries of ₹${(params.amount || 0).toLocaleString("en-IN")}` },
          { iconType: "FINANCIAL", text: "Recalculate affected Tally Ledger closing balances" },
          { iconType: "AUDIT", text: "Log voucher removal in CA Compliance Audit Trail" },
        ],
        requiresConfirmationWord: "DELETE",
        confirmButtonLabel: "Permanently Delete Voucher",
        confirmVariant: "danger",
        reversible: false,
      };

    case "PAYROLL_FINALIZATION":
      return {
        actionType,
        title: `Finalize Payroll for ${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "FINANCIAL", text: `Lock gross salary disbursal of ₹${(params.amount || 0).toLocaleString("en-IN")}` },
          { iconType: "TAX", text: "Deduct PF (12%), ESI (0.75%), and TDS withholdings" },
          { iconType: "AUDIT", text: "Issue immutable employee payslips and lock attendance records for this month" },
        ],
        confirmButtonLabel: "Finalize & Disburse Payroll",
        confirmVariant: "warning",
        reversible: false,
      };

    case "BACKUP_RESTORE":
      return {
        actionType,
        title: `Restore Database from Backup: ${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "IRREVERSIBLE", text: "OVERWRITE all current database tables with data from the backup archive", isNegative: true },
          { iconType: "AUDIT", text: "Create automatic pre-restore safety snapshot before applying" },
          { iconType: "FINANCIAL", text: "Invalidate any live web sessions and active cart checkouts" },
        ],
        requiresConfirmationWord: "RESTORE",
        confirmButtonLabel: "Proceed with Full System Restore",
        confirmVariant: "danger",
        reversible: false,
      };

    case "FINANCIAL_YEAR_CLOSING":
      return {
        actionType,
        title: `Close Financial Year ${params.identifier}`,
        targetIdentifier: params.identifier,
        impacts: [
          { iconType: "FINANCIAL", text: `Transfer Net Profit/Loss of ₹${(params.amount || 0).toLocaleString("en-IN")} to Reserves & Retained Earnings` },
          { iconType: "FINANCIAL", text: "Carry forward Asset and Liability closing balances to new FY opening balances" },
          { iconType: "IRREVERSIBLE", text: `Lock period for ${params.identifier} — prevent further edits or vouchers`, isNegative: true },
          { iconType: "AUDIT", text: "Trigger automated full year-end backup archive" },
        ],
        requiresConfirmationWord: "CLOSE-YEAR",
        confirmButtonLabel: "Confirm Financial Year Closing",
        confirmVariant: "danger",
        reversible: false,
      };
  }
}
