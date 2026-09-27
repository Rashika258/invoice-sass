/**
 * Pure-JS CSV/Excel exporter — no external dependencies.
 * Downloads a .csv file that Excel opens natively.
 */

export interface ExportColumn {
  header: string;
  key: string;
  format?: (val: unknown) => string;
}

export function exportToCsv(
  filename: string,
  columns: ExportColumn[],
  rows: Record<string, unknown>[]
): void {
  // BOM for Excel to recognise UTF-8
  const bom = "\uFEFF";
  const headers = columns.map((c) => `"${c.header}"`).join(",");
  const dataRows = rows.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key];
        const str = c.format
          ? c.format(val)
          : val === null || val === undefined
          ? ""
          : String(val);
        // Escape double-quotes by doubling them (RFC 4180)
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  const csvContent = bom + [headers, ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Convenience helpers for common Billora report types
// ---------------------------------------------------------------------------

export function exportSaleReport(sales: Record<string, unknown>[], currency = "INR") {
  void currency; // reserved for future locale formatting
  exportToCsv(
    "billora_sale_report",
    [
      { header: "Invoice No.", key: "invoiceNumber" },
      {
        header: "Date",
        key: "issueDate",
        format: (v) =>
          v ? new Date(v as string).toLocaleDateString("en-IN") : "",
      },
      { header: "Party Name", key: "customerName" },
      { header: "GST No.", key: "customerGst" },
      {
        header: "Taxable Amount",
        key: "subtotal",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "CGST",
        key: "cgstAmount",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "SGST",
        key: "sgstAmount",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "IGST",
        key: "igstAmount",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "Total",
        key: "total",
        format: (v) => Number(v).toFixed(2),
      },
      { header: "Status", key: "status" },
    ],
    sales.map((s) => ({
      invoiceNumber: (s.invoiceNumber as string) || (s.id as string),
      issueDate: (s.issueDate as string) || (s.createdAt as string),
      customerName: (s.customer as { name?: string } | undefined)?.name ?? "",
      customerGst: (s.customer as { taxId?: string } | undefined)?.taxId ?? "",
      subtotal: (s.subtotal as number) || 0,
      cgstAmount: (s.cgstAmount as number) || 0,
      sgstAmount: (s.sgstAmount as number) || 0,
      igstAmount: (s.igstAmount as number) || 0,
      total: (s.total as number) || 0,
      status: (s.status as string) || "",
    }))
  );
}

export function exportPurchaseReport(purchases: Record<string, unknown>[]) {
  exportToCsv(
    "billora_purchase_report",
    [
      { header: "Bill No.", key: "invoiceNumber" },
      {
        header: "Date",
        key: "issueDate",
        format: (v) =>
          v ? new Date(v as string).toLocaleDateString("en-IN") : "",
      },
      { header: "Supplier", key: "customerName" },
      {
        header: "Total",
        key: "total",
        format: (v) => Number(v).toFixed(2),
      },
      { header: "Status", key: "status" },
    ],
    purchases.map((p) => ({
      invoiceNumber: (p.invoiceNumber as string) || (p.id as string),
      issueDate: (p.issueDate as string) || (p.createdAt as string),
      customerName: (p.customer as { name?: string } | undefined)?.name ?? "",
      total: (p.total as number) || 0,
      status: (p.status as string) || "",
    }))
  );
}

export function exportPartyStatement(parties: Record<string, unknown>[]) {
  exportToCsv(
    "billora_party_statement",
    [
      { header: "Party Name", key: "name" },
      { header: "GST No.", key: "taxId" },
      { header: "Phone", key: "phone" },
      {
        header: "Receivable",
        key: "receivable",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "Payable",
        key: "payable",
        format: (v) => Number(v).toFixed(2),
      },
      {
        header: "Net Balance",
        key: "net",
        format: (v) => Number(v).toFixed(2),
      },
    ],
    parties.map((p) => ({
      name: (p.name as string) || "",
      taxId: (p.taxId as string) || "",
      phone: (p.phone as string) || "",
      receivable: (p.receivable as number) || 0,
      payable: (p.payable as number) || 0,
      net: ((p.receivable as number) || 0) - ((p.payable as number) || 0),
    }))
  );
}

export function exportDaybookReport(dayBookEntries: Record<string, unknown>[]) {
  exportToCsv(
    "billora_daybook_report",
    [
      {
        header: "Date/Time",
        key: "issueDate",
        format: (v) => (v ? new Date(v as string).toLocaleString("en-IN") : ""),
      },
      { header: "Type", key: "documentType" },
      { header: "Ref No.", key: "invoiceNumber" },
      { header: "Party", key: "customerName" },
      {
        header: "Debit (Purchase)",
        key: "debit",
        format: (v) => (Number(v) > 0 ? Number(v).toFixed(2) : "-"),
      },
      {
        header: "Credit (Sale)",
        key: "credit",
        format: (v) => (Number(v) > 0 ? Number(v).toFixed(2) : "-"),
      },
    ],
    dayBookEntries.map((e) => ({
      issueDate: (e.issueDate as string) || (e.createdAt as string),
      documentType: e.documentType,
      invoiceNumber: e.invoiceNumber,
      customerName: (e.customer as { name?: string })?.name || "Cash",
      debit: e.documentType === "PURCHASE" ? e.total : 0,
      credit: e.documentType === "SALE" ? e.total : 0,
    }))
  );
}

export function exportPnlReport(summary: {
  saleTotal: number;
  purchaseTotal: number;
  expenseTotal: number;
  profit: number;
}) {
  exportToCsv(
    "billora_pnl_report",
    [
      { header: "Account / Particulars", key: "name" },
      { header: "Amount (INR)", key: "amount", format: (v) => Number(v).toFixed(2) },
    ],
    [
      { name: "Total Net Sales (Revenue)", amount: summary.saleTotal },
      { name: "Less: Cost of Goods Sold (Purchases)", amount: -summary.purchaseTotal },
      { name: "Less: Operating Expenses", amount: -summary.expenseTotal },
      { name: "Net Operating Profit / (Loss)", amount: summary.profit },
    ]
  );
}

export function exportGstr1Report(sales: Record<string, unknown>[]) {
  exportToCsv(
    "billora_gstr1_report",
    [
      { header: "GSTIN of Recipient", key: "customerGst" },
      { header: "Receiver Name", key: "customerName" },
      { header: "Invoice Number", key: "invoiceNumber" },
      {
        header: "Invoice date",
        key: "issueDate",
        format: (v) => (v ? new Date(v as string).toLocaleDateString("en-IN") : ""),
      },
      { header: "Invoice Value", key: "total", format: (v) => Number(v).toFixed(2) },
      { header: "Place of Supply", key: "placeOfSupply" },
      { header: "Reverse Charge", key: "reverseCharge" },
      { header: "Applicable % of Tax Rate", key: "taxRate" },
      { header: "Invoice Type", key: "invType" },
      { header: "Taxable Value", key: "subtotal", format: (v) => Number(v).toFixed(2) },
      { header: "Integrated Tax (IGST)", key: "igstAmount", format: (v) => Number(v).toFixed(2) },
      { header: "Central Tax (CGST)", key: "cgstAmount", format: (v) => Number(v).toFixed(2) },
      { header: "State/UT Tax (SGST)", key: "sgstAmount", format: (v) => Number(v).toFixed(2) },
    ],
    sales.map((s) => ({
      customerGst: (s.customer as { taxId?: string })?.taxId || "URP",
      customerName: (s.customer as { name?: string })?.name || "Consumer",
      invoiceNumber: s.invoiceNumber || s.id,
      issueDate: s.issueDate || s.createdAt,
      total: s.total || 0,
      placeOfSupply: s.placeOfSupply || "29-Karnataka",
      reverseCharge: "N",
      taxRate: s.taxRate || 18,
      invType: (s.customer as { taxId?: string })?.taxId ? "B2B" : "B2CS",
      subtotal: s.subtotal || 0,
      igstAmount: s.igstAmount || 0,
      cgstAmount: s.cgstAmount || 0,
      sgstAmount: s.sgstAmount || 0,
    }))
  );
}
