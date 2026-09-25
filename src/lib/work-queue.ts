export interface WorkQueueItem {
  id: string;
  problem: string;
  impact: string;
  recommendedAction: string;
  resolveHref: string;
  resolveLabel: string;
  category: "COLLECTIONS" | "INVENTORY" | "DATA_QUALITY" | "EXPENSES" | "COMPLIANCE";
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  amount?: number;
}

export function getWorkQueueItems(): WorkQueueItem[] {
  return [
    {
      id: "wq_1",
      problem: "Overdue Invoice #INV-1024 (Acme Corp)",
      impact: "₹ 14,500 cashflow locked for 18 days beyond payment terms",
      recommendedAction: "Send 1-click WhatsApp payment reminder with UPI QR code",
      resolveHref: "/invoices",
      resolveLabel: "Send Reminder",
      category: "COLLECTIONS",
      severity: "CRITICAL",
      amount: 14500,
    },
    {
      id: "wq_2",
      problem: "3 Inventory Items below Reorder Threshold",
      impact: "Risk of stockout on Steel Flanges and M10 Bolts",
      recommendedAction: "Create Purchase Order or adjust minimum stock buffer",
      resolveHref: "/items",
      resolveLabel: "Review Inventory",
      category: "INVENTORY",
      severity: "HIGH",
    },
    {
      id: "wq_3",
      problem: "4 Customers missing Phone Numbers",
      impact: "Cannot send automated WhatsApp billing or payment receipts",
      recommendedAction: "Update party contact profile with 10-digit mobile numbers",
      resolveHref: "/customers",
      resolveLabel: "Update Customers",
      category: "DATA_QUALITY",
      severity: "MEDIUM",
    },
    {
      id: "wq_4",
      problem: "2 Unapproved Office Expenses",
      impact: "Unreconciled cash outflow of ₹ 3,200 in Daybook",
      recommendedAction: "Review and approve expense category assignments",
      resolveHref: "/expenses",
      resolveLabel: "Approve Expenses",
      category: "EXPENSES",
      severity: "MEDIUM",
      amount: 3200,
    },
    {
      id: "wq_5",
      problem: "GSTR-1 Tax Reconciliation Due",
      impact: "Monthly GST return filing deadline approaching on 11th",
      recommendedAction: "Verify tax totals and export GSTR-1 JSON summary",
      resolveHref: "/reports",
      resolveLabel: "Review GST Report",
      category: "COMPLIANCE",
      severity: "HIGH",
    },
  ];
}
