import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { LedgerGroup, VoucherType, BalanceType } from "@/generated/prisma/client";
import { AppError } from "@/lib/errors";

export type LedgerGroupKey = LedgerGroup;
export type VoucherTypeKey = VoucherType;

export interface LedgerInput {
  name: string;
  group: LedgerGroupKey;
  openingBalance?: number;
  openingType?: BalanceType;
  notes?: string;
}

export interface VoucherEntryLine {
  ledgerId: string;
  type: BalanceType;
  amount: number;
}

export interface VoucherInput {
  voucherType: VoucherTypeKey;
  date: string;
  narration?: string;
  reference?: string;
  entries: VoucherEntryLine[];
}

export interface GetVouchersOptions {
  voucherType?: VoucherTypeKey;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

const SYSTEM_LEDGERS: Omit<LedgerInput, "openingBalance">[] = [
  { name: "Cash", group: "CASH_IN_HAND", openingType: "DR" },
  { name: "Bank Account", group: "BANK_ACCOUNTS", openingType: "DR" },
  { name: "Sales Account", group: "SALES_ACCOUNTS", openingType: "CR" },
  { name: "Purchase Account", group: "PURCHASE_ACCOUNTS", openingType: "DR" },
  { name: "Sundry Debtors", group: "SUNDRY_DEBTORS", openingType: "DR" },
  { name: "Sundry Creditors", group: "SUNDRY_CREDITORS", openingType: "CR" },
  { name: "IGST Output", group: "DUTIES_TAXES", openingType: "CR" },
  { name: "CGST Output", group: "DUTIES_TAXES", openingType: "CR" },
  { name: "SGST Output", group: "DUTIES_TAXES", openingType: "CR" },
  { name: "IGST Input", group: "DUTIES_TAXES", openingType: "DR" },
  { name: "CGST Input", group: "DUTIES_TAXES", openingType: "DR" },
  { name: "SGST Input", group: "DUTIES_TAXES", openingType: "DR" },
  { name: "Discount Allowed", group: "INDIRECT_EXPENSES", openingType: "DR" },
  { name: "Discount Received", group: "INDIRECT_INCOME", openingType: "CR" },
  { name: "Salary & Wages", group: "DIRECT_EXPENSES", openingType: "DR" },
  { name: "Rent Expense", group: "INDIRECT_EXPENSES", openingType: "DR" },
];

export class AccountingService {
  /**
   * Validate that total Debits equal total Credits in a voucher entry array
   */
  static validateVoucherBalance(entries: VoucherEntryLine[]): { drTotal: number; crTotal: number } {
    const drTotal = Math.round(
      entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0) * 100,
    ) / 100;
    const crTotal = Math.round(
      entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0) * 100,
    ) / 100;

    if (Math.abs(drTotal - crTotal) > 0.01) {
      throw new AppError(
        "VALIDATION_ERROR",
        `Voucher out of balance: Total Debit (₹${drTotal.toFixed(2)}) must equal Total Credit (₹${crTotal.toFixed(2)})`,
        400,
        { drTotal, crTotal },
      );
    }

    return { drTotal, crTotal };
  }

  static async ensureSystemLedgers(organizationId: string) {
    for (const sys of SYSTEM_LEDGERS) {
      const existing = await db.ledger.findFirst({
        where: { organizationId, name: sys.name },
      });
      if (!existing) {
        await db.ledger.create({
          data: {
            organizationId,
            name: sys.name,
            group: sys.group,
            openingBalance: 0,
            openingType: sys.openingType || "DR",
            isSystem: true,
          },
        });
      }
    }
  }

  static async getLedgers(organizationId: string) {
    await this.ensureSystemLedgers(organizationId);
    return db.ledger.findMany({
      where: { organizationId },
      include: {
        entries: { select: { type: true, amount: true } },
      },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    });
  }

  static async createLedger(organizationId: string, input: LedgerInput) {
    const existing = await db.ledger.findFirst({
      where: { organizationId, name: input.name.trim() },
    });

    if (existing) throw new AppError("CONFLICT", `Ledger "${input.name}" already exists`, 409);

    const ledger = await db.ledger.create({
      data: {
        organizationId,
        name: input.name.trim(),
        group: input.group,
        openingBalance: input.openingBalance ?? 0,
        openingType: input.openingType ?? "DR",
        notes: input.notes,
        isSystem: false,
      },
    });

    await recordAuditLog({
      organizationId,
      action: "CREATE",
      entity: "Ledger",
      entityId: ledger.id,
      changes: { name: ledger.name, group: ledger.group },
    });

    revalidatePath("/accounting");
    revalidatePath("/accounting/ledgers");
    return ledger;
  }

  static async createVoucher(organizationId: string, input: VoucherInput) {
    const { drTotal } = this.validateVoucherBalance(input.entries);

    const count = await db.journalVoucher.count({
      where: { organizationId, voucherType: input.voucherType },
    });
    const prefixMap: Record<string, string> = {
      PAYMENT: "PAY",
      RECEIPT: "RCP",
      JOURNAL: "JRN",
      CONTRA: "CTR",
      SALES: "SLV",
      PURCHASE: "PRV",
      DEBIT_NOTE: "DNV",
      CREDIT_NOTE: "CNV",
    };
    const voucherNumber = `${prefixMap[input.voucherType] || "VCH"}-${String(count + 1).padStart(4, "0")}`;

    const voucher = await db.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber,
        voucherType: input.voucherType,
        date: new Date(input.date),
        narration: input.narration,
        reference: input.reference,
        entries: {
          create: input.entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
      include: { entries: { include: { ledger: true } } },
    });

    await recordAuditLog({
      organizationId,
      action: "CREATE",
      entity: "Voucher",
      entityId: voucher.id,
      changes: { voucherNumber, voucherType: input.voucherType, amount: drTotal },
    });

    revalidatePath("/accounting");
    revalidatePath("/accounting/vouchers");
    revalidatePath("/accounting/daybook");
    revalidatePath("/accounting/trial-balance");
    return voucher;
  }

  /**
   * Automatically post double-entry Journal Voucher for an Invoice within transaction context
   */
  static async postInvoiceVoucher(
    tx: any,
    organizationId: string,
    invoice: {
      id: string;
      invoiceNumber: string;
      issueDate: Date;
      total: number;
      subtotal: number;
      discount: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      customer: { name: string };
    },
  ) {
    // Fetch default system ledgers
    const debtorsLedger = await tx.ledger.findFirst({
      where: { organizationId, name: "Sundry Debtors" },
    });
    const salesLedger = await tx.ledger.findFirst({
      where: { organizationId, name: "Sales Account" },
    });

    if (!debtorsLedger || !salesLedger) return;

    const entries: VoucherEntryLine[] = [
      { ledgerId: debtorsLedger.id, type: "DR", amount: invoice.total },
      { ledgerId: salesLedger.id, type: "CR", amount: Math.max(0, invoice.subtotal - invoice.discount) },
    ];

    if (invoice.cgstAmount > 0) {
      const cgstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "CGST Output" } });
      if (cgstLedger) entries.push({ ledgerId: cgstLedger.id, type: "CR", amount: invoice.cgstAmount });
    }
    if (invoice.sgstAmount > 0) {
      const sgstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "SGST Output" } });
      if (sgstLedger) entries.push({ ledgerId: sgstLedger.id, type: "CR", amount: invoice.sgstAmount });
    }
    if (invoice.igstAmount > 0) {
      const igstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "IGST Output" } });
      if (igstLedger) entries.push({ ledgerId: igstLedger.id, type: "CR", amount: invoice.igstAmount });
    }

    this.validateVoucherBalance(entries);

    const count = await tx.journalVoucher.count({ where: { organizationId, voucherType: "SALES" } });
    const voucherNumber = `SLV-${String(count + 1).padStart(4, "0")}`;

    await tx.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber,
        voucherType: "SALES",
        date: invoice.issueDate,
        narration: `Automated Ledger Sync for Invoice #${invoice.invoiceNumber} (${invoice.customer.name})`,
        reference: invoice.invoiceNumber,
        entries: {
          create: entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
    });
  }

  /**
   * Post Reversal Voucher when an invoice is cancelled or deleted
   */
  static async postInvoiceReversalVoucher(
    tx: any,
    organizationId: string,
    invoice: {
      invoiceNumber: string;
      total: number;
      subtotal: number;
      discount: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      customer: { name: string };
    },
    reason: string
  ) {
    const debtorsLedger = await tx.ledger.findFirst({ where: { organizationId, name: "Sundry Debtors" } });
    const salesLedger = await tx.ledger.findFirst({ where: { organizationId, name: "Sales Account" } });
    if (!debtorsLedger || !salesLedger) return;

    const entries: VoucherEntryLine[] = [
      { ledgerId: salesLedger.id, type: "DR", amount: Math.max(0, invoice.subtotal - invoice.discount) },
      { ledgerId: debtorsLedger.id, type: "CR", amount: invoice.total },
    ];

    if (invoice.cgstAmount > 0) {
      const cgstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "CGST Output" } });
      if (cgstLedger) entries.push({ ledgerId: cgstLedger.id, type: "DR", amount: invoice.cgstAmount });
    }
    if (invoice.sgstAmount > 0) {
      const sgstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "SGST Output" } });
      if (sgstLedger) entries.push({ ledgerId: sgstLedger.id, type: "DR", amount: invoice.sgstAmount });
    }
    if (invoice.igstAmount > 0) {
      const igstLedger = await tx.ledger.findFirst({ where: { organizationId, name: "IGST Output" } });
      if (igstLedger) entries.push({ ledgerId: igstLedger.id, type: "DR", amount: invoice.igstAmount });
    }

    this.validateVoucherBalance(entries);

    const count = await tx.journalVoucher.count({ where: { organizationId, voucherType: "CREDIT_NOTE" } });
    const voucherNumber = `REV-${String(count + 1).padStart(4, "0")}`;

    await tx.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber,
        voucherType: "CREDIT_NOTE",
        date: new Date(),
        narration: `REVERSAL: Invoice #${invoice.invoiceNumber} (${reason})`,
        reference: `REV_${invoice.invoiceNumber}`,
        entries: {
          create: entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
    });
  }

  /**
   * Post Payment/Receipt Voucher when payment is recorded
   */
  static async postPaymentVoucher(
    tx: any,
    organizationId: string,
    payment: {
      number: string;
      direction: "IN" | "OUT";
      amount: number;
      mode: string;
      reference?: string | null;
    }
  ) {
    const bankLedger = await tx.ledger.findFirst({ where: { organizationId, name: payment.mode === "CASH" ? "Cash" : "Bank Account" } });
    const partyLedger = await tx.ledger.findFirst({ where: { organizationId, name: payment.direction === "IN" ? "Sundry Debtors" : "Sundry Creditors" } });

    if (!bankLedger || !partyLedger) return;

    const entries: VoucherEntryLine[] = payment.direction === "IN"
      ? [
          { ledgerId: bankLedger.id, type: "DR", amount: payment.amount },
          { ledgerId: partyLedger.id, type: "CR", amount: payment.amount },
        ]
      : [
          { ledgerId: partyLedger.id, type: "DR", amount: payment.amount },
          { ledgerId: bankLedger.id, type: "CR", amount: payment.amount },
        ];

    this.validateVoucherBalance(entries);

    const count = await tx.journalVoucher.count({ where: { organizationId, voucherType: payment.direction === "IN" ? "RECEIPT" : "PAYMENT" } });
    const prefix = payment.direction === "IN" ? "RCP" : "PAY";

    await tx.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber: `${prefix}-${String(count + 1).padStart(4, "0")}`,
        voucherType: payment.direction === "IN" ? "RECEIPT" : "PAYMENT",
        date: new Date(),
        narration: `Automated Ledger Sync for Payment #${payment.number}`,
        reference: payment.reference || payment.number,
        entries: {
          create: entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
    });
  }

  /**
   * Post Payroll Voucher when salary is processed
   */
  static async postPayrollVoucher(
    tx: any,
    organizationId: string,
    payroll: {
      employeeName: string;
      netSalary: number;
      month: string;
      year: number;
    }
  ) {
    const salaryLedger = await tx.ledger.findFirst({ where: { organizationId, name: "Salary & Wages" } });
    const bankLedger = await tx.ledger.findFirst({ where: { organizationId, name: "Bank Account" } });

    if (!salaryLedger || !bankLedger) return;

    const entries: VoucherEntryLine[] = [
      { ledgerId: salaryLedger.id, type: "DR", amount: payroll.netSalary },
      { ledgerId: bankLedger.id, type: "CR", amount: payroll.netSalary },
    ];

    this.validateVoucherBalance(entries);

    const count = await tx.journalVoucher.count({ where: { organizationId, voucherType: "PAYMENT" } });

    await tx.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber: `PAY-${String(count + 1).padStart(4, "0")}`,
        voucherType: "PAYMENT",
        date: new Date(),
        narration: `Payroll Disbursement: ${payroll.employeeName} (${payroll.month}/${payroll.year})`,
        reference: `PAYROLL_${payroll.month}_${payroll.year}`,
        entries: {
          create: entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type,
            amount: e.amount,
          })),
        },
      },
    });
  }

  static async deleteVoucher(organizationId: string, id: string) {
    const existing = await db.journalVoucher.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new AppError("NOT_FOUND", "Voucher not found", 404);

    await db.journalVoucher.delete({ where: { id, organizationId } });

    await recordAuditLog({
      organizationId,
      action: "DELETE",
      entity: "Voucher",
      entityId: id,
      changes: { voucherNumber: existing.voucherNumber, voucherType: existing.voucherType },
    });

    revalidatePath("/accounting");
    revalidatePath("/accounting/vouchers");
  }
}
