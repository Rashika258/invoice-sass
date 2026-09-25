export type HealthStatus = "HEALTHY" | "NEEDS_REVIEW" | "CRITICAL";

export interface RecordHealthResult {
  status: HealthStatus;
  score: number; // 0 - 100
  issues: {
    field: string;
    message: string;
    severity: "CRITICAL" | "WARNING" | "INFO";
    fixHref?: string;
    fixLabel?: string;
  }[];
}

export function evaluateInvoiceHealth(invoice: {
  customerName?: string;
  customerPhone?: string;
  customerGstin?: string;
  items?: { name: string; price: number; taxRate: number }[];
  totalAmount?: number;
  status?: string;
  dueDate?: string;
}): RecordHealthResult {
  const issues: RecordHealthResult["issues"] = [];

  if (!invoice.customerName || invoice.customerName.trim() === "" || invoice.customerName === "Walk-in Customer") {
    issues.push({
      field: "customerName",
      message: "Customer name is missing or set to generic default.",
      severity: "WARNING",
      fixLabel: "Add Customer Name",
    });
  }

  if (!invoice.customerPhone || invoice.customerPhone.trim().length < 10) {
    issues.push({
      field: "customerPhone",
      message: "Missing contact mobile number for automated WhatsApp receipts.",
      severity: "WARNING",
      fixLabel: "Add Mobile Number",
    });
  }

  if (!invoice.items || invoice.items.length === 0) {
    issues.push({
      field: "items",
      message: "Invoice contains zero billed line items.",
      severity: "CRITICAL",
      fixLabel: "Add Line Items",
    });
  }

  if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== "PAID") {
    issues.push({
      field: "dueDate",
      message: "Invoice is past due date with pending balance.",
      severity: "CRITICAL",
      fixLabel: "Send Payment Reminder",
    });
  }

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;

  let status: HealthStatus = "HEALTHY";
  if (criticalCount > 0) status = "CRITICAL";
  else if (warningCount > 0) status = "NEEDS_REVIEW";

  const score = Math.max(0, 100 - criticalCount * 40 - warningCount * 20);

  return { status, score, issues };
}

export function evaluateCustomerHealth(customer: {
  name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  outstandingBalance?: number;
}): RecordHealthResult {
  const issues: RecordHealthResult["issues"] = [];

  if (!customer.phone || customer.phone.trim().length < 10) {
    issues.push({
      field: "phone",
      message: "Missing 10-digit mobile number.",
      severity: "CRITICAL",
      fixLabel: "Add Phone",
    });
  }

  if (!customer.address || customer.address.trim() === "") {
    issues.push({
      field: "address",
      message: "Missing billing/shipping street address.",
      severity: "WARNING",
      fixLabel: "Add Address",
    });
  }

  if (customer.gstin && customer.gstin.length !== 15) {
    issues.push({
      field: "gstin",
      message: "GSTIN format is invalid (must be 15 alphanumeric chars).",
      severity: "CRITICAL",
      fixLabel: "Fix GSTIN",
    });
  }

  if ((customer.outstandingBalance || 0) > 50000) {
    issues.push({
      field: "outstandingBalance",
      message: "High outstanding balance (> ₹50,000) requires credit review.",
      severity: "WARNING",
      fixLabel: "Review Credit Limit",
    });
  }

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;

  let status: HealthStatus = "HEALTHY";
  if (criticalCount > 0) status = "CRITICAL";
  else if (warningCount > 0) status = "NEEDS_REVIEW";

  const score = Math.max(0, 100 - criticalCount * 40 - warningCount * 20);

  return { status, score, issues };
}

export function evaluateItemHealth(item: {
  name?: string;
  sellingPrice?: number;
  costPrice?: number;
  stock?: number;
  minStockThreshold?: number;
  hsnCode?: string;
  gstRate?: number;
}): RecordHealthResult {
  const issues: RecordHealthResult["issues"] = [];

  if (!item.hsnCode || item.hsnCode.trim() === "") {
    issues.push({
      field: "hsnCode",
      message: "Missing HSN/SAC code required for GST compliance.",
      severity: "CRITICAL",
      fixLabel: "Set HSN Code",
    });
  }

  if ((item.stock || 0) < 0) {
    issues.push({
      field: "stock",
      message: "Negative stock quantity detected.",
      severity: "CRITICAL",
      fixLabel: "Adjust Inventory",
    });
  } else if ((item.stock || 0) <= (item.minStockThreshold || 5)) {
    issues.push({
      field: "stock",
      message: "Item stock is at or below minimum reorder threshold.",
      severity: "WARNING",
      fixLabel: "Reorder Stock",
    });
  }

  if ((item.sellingPrice || 0) <= 0) {
    issues.push({
      field: "sellingPrice",
      message: "Selling price is set to ₹0.",
      severity: "CRITICAL",
      fixLabel: "Set Price",
    });
  }

  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;

  let status: HealthStatus = "HEALTHY";
  if (criticalCount > 0) status = "CRITICAL";
  else if (warningCount > 0) status = "NEEDS_REVIEW";

  const score = Math.max(0, 100 - criticalCount * 40 - warningCount * 20);

  return { status, score, issues };
}
