/**
 * 🏷️ Billora Feature Maturity Labels
 * Marks feature stability so users and admins know what to expect.
 */

export type FeatureMaturityLevel =
  | "STABLE"
  | "BETA"
  | "EXPERIMENTAL"
  | "REQUIRES_CONFIGURATION"
  | "UNAVAILABLE_OFFLINE";

export interface FeatureMaturityEntry {
  featureId: string;
  label: string;
  maturity: FeatureMaturityLevel;
  notes?: string;
}

export const FEATURE_MATURITY_REGISTRY: FeatureMaturityEntry[] = [
  // Core Billing
  { featureId: "sales-invoicing",     label: "Sales Invoicing",         maturity: "STABLE" },
  { featureId: "purchase-invoicing",  label: "Purchase Invoicing",      maturity: "STABLE" },
  { featureId: "estimates",           label: "Estimates & Quotations",   maturity: "STABLE" },
  { featureId: "credit-notes",        label: "Credit Notes",            maturity: "STABLE" },
  { featureId: "debit-notes",         label: "Debit Notes",             maturity: "STABLE" },
  { featureId: "proforma",            label: "Proforma Invoices",       maturity: "STABLE" },
  { featureId: "sale-orders",         label: "Sale Orders",             maturity: "STABLE" },
  { featureId: "delivery-challans",   label: "Delivery Challans",       maturity: "STABLE" },
  { featureId: "purchase-orders",     label: "Purchase Orders",         maturity: "STABLE" },

  // Inventory
  { featureId: "inventory-stock",     label: "Inventory Management",    maturity: "STABLE" },
  { featureId: "batch-tracking",      label: "Batch / Expiry Tracking", maturity: "STABLE" },
  { featureId: "serial-numbers",      label: "Serial Number Tracking",  maturity: "STABLE" },
  { featureId: "stock-movements",     label: "Stock Movement Ledger",   maturity: "STABLE" },

  // Accounting & Tally
  { featureId: "tally-ledgers",       label: "Tally Double-Entry Ledgers", maturity: "STABLE" },
  { featureId: "journal-vouchers",    label: "Journal Vouchers",        maturity: "STABLE" },
  { featureId: "financial-year",      label: "Financial Year Management", maturity: "STABLE" },
  { featureId: "reconciliation",      label: "Reconciliation Center",   maturity: "STABLE" },

  // Cash & Bank
  { featureId: "cash-bank",          label: "Cash & Bank Accounts",    maturity: "STABLE" },
  { featureId: "payment-in",         label: "Payment In / Receipts",   maturity: "STABLE" },
  { featureId: "payment-out",        label: "Payment Out / Payables",  maturity: "STABLE" },
  { featureId: "expenses",           label: "Operating Expenses",      maturity: "STABLE" },

  // Staff & HR
  { featureId: "employees",          label: "Employee Profiles",       maturity: "STABLE" },
  { featureId: "attendance",         label: "Staff Attendance",        maturity: "STABLE" },
  { featureId: "payroll",            label: "Payroll & Salary",        maturity: "STABLE" },

  // POS
  { featureId: "pos",                label: "Touch POS Checkout",      maturity: "STABLE" },

  // Approvals & Workflows
  { featureId: "approvals",          label: "Multi-Role Approval Queues", maturity: "STABLE" },
  { featureId: "work-queue",         label: "Central Work Queue",      maturity: "STABLE" },

  // Advanced / Emerging
  { featureId: "ai-ocr",            label: "AI / OCR Bill Scanner",   maturity: "EXPERIMENTAL", notes: "Requires OpenAI API key. Accuracy varies by scan quality." },
  { featureId: "whatsapp-send",     label: "WhatsApp Invoice Delivery", maturity: "REQUIRES_CONFIGURATION", notes: "Requires Meta WhatsApp Cloud API configuration." },
  { featureId: "online-store",      label: "Online Storefront",       maturity: "BETA", notes: "Item catalogue and order capture stable. Checkout payment flow in beta." },
  { featureId: "upi-payment",       label: "Online UPI Payments",     maturity: "REQUIRES_CONFIGURATION", notes: "Requires Razorpay or payment gateway credentials." },
  { featureId: "email-invoices",    label: "Email Invoice Delivery",  maturity: "REQUIRES_CONFIGURATION", notes: "Requires Resend API key for email delivery." },
  { featureId: "google-oauth",      label: "Google Sign-In",          maturity: "REQUIRES_CONFIGURATION", notes: "Requires Google OAuth client credentials." },
  { featureId: "offline-pwa",       label: "Offline / PWA Mode",      maturity: "BETA", notes: "Read operations work offline. Write operations queue for sync on reconnect." },
  { featureId: "mobile-app",        label: "Capacitor Mobile App",    maturity: "EXPERIMENTAL", notes: "iOS and Android Capacitor shell. Some native features require device testing." },
  { featureId: "gst-reports",       label: "GST GSTR-1 / 3B Reports", maturity: "BETA", notes: "Data extraction ready. Direct portal API submission not yet integrated." },
];

export function getFeatureMaturity(featureId: string): FeatureMaturityEntry | undefined {
  return FEATURE_MATURITY_REGISTRY.find((f) => f.featureId === featureId);
}

export const MATURITY_CONFIG: Record<
  FeatureMaturityLevel,
  { label: string; className: string; description: string }
> = {
  STABLE: {
    label: "Stable",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Production-ready. Used daily in live environments.",
  },
  BETA: {
    label: "Beta",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Functional but may have edge cases. Feedback welcome.",
  },
  EXPERIMENTAL: {
    label: "Experimental",
    className: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    description: "In active development. May change significantly.",
  },
  REQUIRES_CONFIGURATION: {
    label: "Needs Setup",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    description: "Requires external API credentials or admin configuration.",
  },
  UNAVAILABLE_OFFLINE: {
    label: "Online Only",
    className: "bg-muted text-muted-foreground border-border/60",
    description: "Requires an active internet connection. Not available offline.",
  },
};
