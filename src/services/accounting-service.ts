import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export type LedgerGroupKey =
  | "CASH_IN_HAND" | "BANK_ACCOUNTS" | "FIXED_ASSETS" | "CURRENT_ASSETS" | "LOANS_ADVANCES_ASSET"
  | "SUNDRY_CREDITORS" | "CURRENT_LIABILITIES" | "LOANS_LIABILITY" | "CAPITAL_ACCOUNT" | "RESERVES_SURPLUS"
  | "SALES_ACCOUNTS" | "DIRECT_INCOME" | "INDIRECT_INCOME"
  | "PURCHASE_ACCOUNTS" | "DIRECT_EXPENSES" | "INDIRECT_EXPENSES"
  | "DUTIES_TAXES" | "SUNDRY_DEBTORS" | "BRANCH_DIVISIONS";

export type VoucherTypeKey =
  | "PAYMENT" | "RECEIPT" | "JOURNAL" | "CONTRA"
  | "SALES" | "PURCHASE" | "DEBIT_NOTE" | "CREDIT_NOTE";

export interface LedgerInput {
  name: string;
  group: LedgerGroupKey;
  openingBalance?: number;
  openingType?: "DR" | "CR";
  notes?: string;
}

export interface VoucherEntryLine {
  ledgerId: string;
  type: "DR" | "CR";
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
  { name: "Cash",                group: "CASH_IN_HAND",      openingType: "DR" },
  { name: "Bank Account",        group: "BANK_ACCOUNTS",     openingType: "DR" },
  { name: "Sales Account",       group: "SALES_ACCOUNTS",    openingType: "CR" },
  { name: "Purchase Account",    group: "PURCHASE_ACCOUNTS", openingType: "DR" },
  { name: "Sundry Debtors",      group: "SUNDRY_DEBTORS",    openingType: "DR" },
  { name: "Sundry Creditors",    group: "SUNDRY_CREDITORS",  openingType: "CR" },
  { name: "IGST Output",         group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "CGST Output",         group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "SGST Output",         group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "IGST Input",          group: "DUTIES_TAXES",      openingType: "DR" },
  { name: "CGST Input",          group: "DUTIES_TAXES",      openingType: "DR" },
  { name: "SGST Input",          group: "DUTIES_TAXES",      openingType: "DR" },
  { name: "Discount Allowed",    group: "INDIRECT_EXPENSES", openingType: "DR" },
  { name: "Discount Received",   group: "INDIRECT_INCOME",   openingType: "CR" },
  { name: "Salary & Wages",      group: "DIRECT_EXPENSES",   openingType: "DR" },
  { name: "Rent Expense",        group: "INDIRECT_EXPENSES", openingType: "DR" },
];

export class AccountingService {
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
            group: sys.group as any,
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
    if (existing) throw new Error(`Ledger "${input.name}" already exists`);

    const ledger = await db.ledger.create({
      data: {
        organizationId,
        name: input.name.trim(),
        group: input.group as any,
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
    const drTotal = input.entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0);
    const crTotal = input.entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0);
    if (Math.abs(drTotal - crTotal) > 0.01) {
      throw new Error(`Voucher out of balance: DR ₹${drTotal.toFixed(2)} ≠ CR ₹${crTotal.toFixed(2)}`);
    }

    const count = await db.journalVoucher.count({ where: { organizationId, voucherType: input.voucherType as any } });
    const prefixMap: Record<string, string> = {
      PAYMENT: "PAY", RECEIPT: "RCP", JOURNAL: "JRN", CONTRA: "CTR",
      SALES: "SLV", PURCHASE: "PRV", DEBIT_NOTE: "DNV", CREDIT_NOTE: "CNV",
    };
    const voucherNumber = `${prefixMap[input.voucherType] || "VCH"}-${String(count + 1).padStart(4, "0")}`;

    const voucher = await db.journalVoucher.create({
      data: {
        organizationId,
        voucherNumber,
        voucherType: input.voucherType as any,
        date: new Date(input.date),
        narration: input.narration,
        reference: input.reference,
        entries: {
          create: input.entries.map((e) => ({
            ledgerId: e.ledgerId,
            type: e.type as any,
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

  static async deleteVoucher(organizationId: string, id: string) {
    const existing = await db.journalVoucher.findFirst({
      where: { id, organizationId },
    });
    if (!existing) throw new Error("Voucher not found");

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
