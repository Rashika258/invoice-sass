import { db } from "@/lib/db";
import { createHash } from "crypto";

export interface Gstr1B2bRecord {
  gstin: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  placeOfSupply: string;
}

export interface Gstr3bSummary {
  month: string;
  taxableOutwardSupplies: number;
  igstOutput: number;
  cgstOutput: number;
  sgstOutput: number;
  itcAvailableIgst: number;
  itcAvailableCgst: number;
  itcAvailableSgst: number;
  netTaxPayable: number;
}

/**
 * Generate GSTR-1 B2B Outward Sales Register for a specific month
 */
export async function buildGstr1Register(
  organizationId: string,
  month: string, // "yyyy-MM"
): Promise<Gstr1B2bRecord[]> {
  const startDate = new Date(`${month}-01T00:00:00.000Z`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);

  const invoices = await db.invoice.findMany({
    where: {
      organizationId,
      documentType: "SALE",
      status: { in: ["SENT", "PAID"] },
      issueDate: { gte: startDate, lte: endDate },
    },
    include: { customer: true },
  });

  return invoices.map((inv) => ({
    gstin: inv.customer.taxId || "URP", // Unregistered Person
    customerName: inv.customer.name,
    invoiceNumber: inv.invoiceNumber,
    invoiceDate: inv.issueDate.toISOString().split("T")[0],
    invoiceValue: inv.total,
    taxableValue: inv.subtotal,
    cgst: inv.cgstAmount,
    sgst: inv.sgstAmount,
    igst: inv.igstAmount,
    placeOfSupply: inv.placeOfSupply || inv.customer.state || "29-Karnataka",
  }));
}

/**
 * Build GSTR-3B Summary Table
 */
export async function buildGstr3bSummary(
  organizationId: string,
  month: string,
): Promise<Gstr3bSummary> {
  const records = await buildGstr1Register(organizationId, month);

  const taxableOutwardSupplies = records.reduce((s, r) => s + r.taxableValue, 0);
  const cgstOutput = records.reduce((s, r) => s + r.cgst, 0);
  const sgstOutput = records.reduce((s, r) => s + r.sgst, 0);
  const igstOutput = records.reduce((s, r) => s + r.igst, 0);

  const netTaxPayable = cgstOutput + sgstOutput + igstOutput;

  return {
    month,
    taxableOutwardSupplies: Math.round(taxableOutwardSupplies * 100) / 100,
    igstOutput: Math.round(igstOutput * 100) / 100,
    cgstOutput: Math.round(cgstOutput * 100) / 100,
    sgstOutput: Math.round(sgstOutput * 100) / 100,
    itcAvailableIgst: 0,
    itcAvailableCgst: 0,
    itcAvailableSgst: 0,
    netTaxPayable: Math.round(netTaxPayable * 100) / 100,
  };
}

/**
 * Build 64-digit IRN and Government NIC E-Invoice JSON Payload
 */
export function generateNicEInvoicePayload(invoice: {
  invoiceNumber: string;
  companyTaxId?: string | null;
  companyName: string;
  issueDate: Date | string;
  total: number;
}) {
  const rawString = `${invoice.companyTaxId || "GSTIN_DEFAULT"}_${invoice.invoiceNumber}_${new Date(invoice.issueDate).getFullYear()}`;
  const irn = createHash("sha256").update(rawString).digest("hex");

  return {
    Version: "1.1",
    TranDtls: { TaxSch: "GST", SupTyp: "B2B" },
    DocDtls: {
      Typ: "INV",
      No: invoice.invoiceNumber,
      Dt: new Date(invoice.issueDate).toISOString().split("T")[0],
    },
    SellerDtls: { Gstin: invoice.companyTaxId || "29AAAAA0000A1Z5", LglNm: invoice.companyName },
    ValDtls: { TotVal: invoice.total },
    Irn: irn,
  };
}

/**
 * Calculate Tax Deducted at Source (TDS) under Section 194C / 194Q
 */
export function calculateTdsDeduction(amount: number, section: "194C" | "194Q" | "194J" = "194C"): {
  tdsRate: number;
  tdsAmount: number;
  netPayable: number;
} {
  const rateMap = { "194C": 1, "194Q": 0.1, "194J": 10 };
  const tdsRate = rateMap[section] || 1;
  const tdsAmount = Math.round(((amount * tdsRate) / 100) * 100) / 100;
  return {
    tdsRate,
    tdsAmount,
    netPayable: Math.round((amount - tdsAmount) * 100) / 100,
  };
}
