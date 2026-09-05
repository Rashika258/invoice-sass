"use server";

import { db } from "@/lib/db";
import { recordAuditLog } from "@/lib/audit";
import { requireOrganization } from "@/lib/organization";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── System Ledger Seeding ────────────────────────────────────────────────────

const SYSTEM_LEDGERS: Omit<LedgerInput, "openingBalance">[] = [
  { name: "Cash",                group: "CASH_IN_HAND",      openingType: "DR" },
  { name: "Bank Account",        group: "BANK_ACCOUNTS",     openingType: "DR" },
  { name: "Sales Account",       group: "SALES_ACCOUNTS",    openingType: "CR" },
  { name: "Purchase Account",    group: "PURCHASE_ACCOUNTS", openingType: "DR" },
  { name: "Sundry Debtors",      group: "SUNDRY_DEBTORS",    openingType: "DR" },
  { name: "Sundry Creditors",    group: "SUNDRY_CREDITORS",  openingType: "CR" },
  { name: "Capital Account",     group: "CAPITAL_ACCOUNT",   openingType: "CR" },
  { name: "Salary Expenses",     group: "INDIRECT_EXPENSES", openingType: "DR" },
  { name: "CGST Payable",        group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "SGST Payable",        group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "IGST Payable",        group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "TDS Payable",         group: "DUTIES_TAXES",      openingType: "CR" },
  { name: "Discount Allowed",    group: "INDIRECT_EXPENSES", openingType: "DR" },
  { name: "Discount Received",   group: "INDIRECT_INCOME",   openingType: "CR" },
  { name: "Freight & Forwarding",group: "DIRECT_EXPENSES",   openingType: "DR" },
];

export async function ensureSystemLedgers() {
  const org = await requireOrganization();
  const existing = await db.ledger.findMany({
    where: { organizationId: org.id },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((e) => e.name));

  const missing = SYSTEM_LEDGERS.filter((l) => !existingNames.has(l.name));
  if (missing.length === 0) return;

  for (const l of missing) {
    try {
      await db.ledger.create({
        data: {
          organizationId: org.id,
          name: l.name,
          group: l.group as any,
          openingBalance: 0,
          openingType: (l.openingType || "DR") as any,
          isSystem: true,
        },
      });
    } catch {
      // ignore if exists
    }
  }
}

// ─── Ledger CRUD ─────────────────────────────────────────────────────────────

export async function getLedgers() {
  const org = await requireOrganization();
  await ensureSystemLedgers();
  return db.ledger.findMany({
    where: { organizationId: org.id },
    orderBy: [{ group: "asc" }, { name: "asc" }],
    include: {
      entries: {
        select: { type: true, amount: true },
      },
    },
  });
}

export async function createLedger(input: LedgerInput) {
  const org = await requireOrganization();
  const ledger = await db.ledger.create({
    data: {
      organizationId: org.id,
      name: input.name.trim(),
      group: input.group as any,
      openingBalance: input.openingBalance ?? 0,
      openingType: (input.openingType ?? "DR") as any,
      notes: input.notes,
      isSystem: false,
    },
  });
  revalidatePath("/accounting/ledgers");
  return ledger;
}

export async function updateLedger(id: string, input: Partial<LedgerInput>) {
  const org = await requireOrganization();
  const ledger = await db.ledger.update({
    where: { id, organizationId: org.id },
    data: {
      ...(input.name && { name: input.name.trim() }),
      ...(input.group && { group: input.group as any }),
      ...(input.openingBalance !== undefined && { openingBalance: input.openingBalance }),
      ...(input.openingType && { openingType: input.openingType as any }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
  });
  revalidatePath("/accounting/ledgers");
  return ledger;
}

// ─── Voucher CRUD ─────────────────────────────────────────────────────────────

async function getNextVoucherNumber(orgId: string, type: VoucherTypeKey) {
  const prefixMap: Record<VoucherTypeKey, string> = {
    PAYMENT: "PV", RECEIPT: "RV", JOURNAL: "JV", CONTRA: "CV",
    SALES: "SV", PURCHASE: "PU", DEBIT_NOTE: "DN", CREDIT_NOTE: "CN",
  };
  const prefix = prefixMap[type];
  const count = await db.journalVoucher.count({ where: { organizationId: orgId, voucherType: type as any } });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

export async function createVoucher(input: VoucherInput) {
  const org = await requireOrganization();

  // Validate: sum of DR must equal sum of CR
  const drTotal = input.entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0);
  const crTotal = input.entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0);
  if (Math.abs(drTotal - crTotal) > 0.01) {
    throw new Error(`Voucher out of balance: DR ₹${drTotal.toFixed(2)} ≠ CR ₹${crTotal.toFixed(2)}`);
  }

  const voucherNumber = await getNextVoucherNumber(org.id, input.voucherType);

  const voucher = await db.journalVoucher.create({
    data: {
      organizationId: org.id,
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
    organizationId: org.id,
    action: "CREATE",
    entity: "Voucher",
    entityId: voucher.id,
    changes: {
      voucherNumber: voucher.voucherNumber,
      voucherType: voucher.voucherType,
      amount: drTotal,
    },
  });

  revalidatePath("/accounting");
  revalidatePath("/accounting/vouchers");
  revalidatePath("/accounting/daybook");
  revalidatePath("/accounting/trial-balance");
  return voucher;
}

export interface GetVouchersOptions {
  voucherType?: VoucherTypeKey;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export async function getVouchers(filters?: { voucherType?: VoucherTypeKey; fromDate?: string; toDate?: string }) {
  const org = await requireOrganization();
  return db.journalVoucher.findMany({
    where: {
      organizationId: org.id,
      ...(filters?.voucherType && { voucherType: filters.voucherType as any }),
      ...(filters?.fromDate && { date: { gte: new Date(filters.fromDate) } }),
      ...(filters?.toDate && { date: { lte: new Date(filters.toDate) } }),
    },
    include: { entries: { include: { ledger: { select: { id: true, name: true, group: true } } } } },
    orderBy: { date: "desc" },
  });
}

export async function getPaginatedVouchers(filters: GetVouchersOptions) {
  const org = await requireOrganization();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (Math.max(page, 1) - 1) * limit;

  const where = {
    organizationId: org.id,
    ...(filters.voucherType && { voucherType: filters.voucherType as any }),
    ...(filters.fromDate && { date: { gte: new Date(filters.fromDate) } }),
    ...(filters.toDate && { date: { lte: new Date(filters.toDate) } }),
  };

  const [vouchers, total] = await Promise.all([
    db.journalVoucher.findMany({
      where,
      include: { entries: { include: { ledger: { select: { id: true, name: true, group: true } } } } },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    db.journalVoucher.count({ where }),
  ]);

  return {
    vouchers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function deleteVoucher(id: string) {
  const org = await requireOrganization();
  const existing = await db.journalVoucher.findFirst({
    where: { id, organizationId: org.id },
  });
  if (!existing) throw new Error("Voucher not found");

  await db.journalVoucher.delete({ where: { id, organizationId: org.id } });

  await recordAuditLog({
    organizationId: org.id,
    action: "DELETE",
    entity: "Voucher",
    entityId: id,
    changes: {
      voucherNumber: existing.voucherNumber,
      voucherType: existing.voucherType,
    },
  });

  revalidatePath("/accounting");
  revalidatePath("/accounting/vouchers");
}

// ─── Day Book ────────────────────────────────────────────────────────────────

export async function getDayBook(date: string) {
  const org = await requireOrganization();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return db.journalVoucher.findMany({
    where: { organizationId: org.id, date: { gte: start, lte: end } },
    include: { entries: { include: { ledger: { select: { id: true, name: true, group: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

// ─── Trial Balance ───────────────────────────────────────────────────────────

export async function getTrialBalance() {
  const org = await requireOrganization();
  await ensureSystemLedgers();

  const ledgers = await db.ledger.findMany({
    where: { organizationId: org.id },
    include: {
      entries: { select: { type: true, amount: true } },
    },
    orderBy: [{ group: "asc" }, { name: "asc" }],
  });

  return ledgers.map((l) => {
    const drTotal = l.entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0);
    const crTotal = l.entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0);

    // Opening balance
    const openingDr = l.openingType === "DR" ? l.openingBalance : 0;
    const openingCr = l.openingType === "CR" ? l.openingBalance : 0;

    const netDr = openingDr + drTotal;
    const netCr = openingCr + crTotal;
    const closingBalance = Math.abs(netDr - netCr);
    const closingType: "DR" | "CR" = netDr >= netCr ? "DR" : "CR";

    return {
      id: l.id,
      name: l.name,
      group: l.group,
      openingDr,
      openingCr,
      periodDr: drTotal,
      periodCr: crTotal,
      closingBalance,
      closingType,
    };
  });
}

// ─── Profit & Loss ───────────────────────────────────────────────────────────

const INCOME_GROUPS = ["SALES_ACCOUNTS", "DIRECT_INCOME", "INDIRECT_INCOME"] as const;
const EXPENSE_GROUPS = ["PURCHASE_ACCOUNTS", "DIRECT_EXPENSES", "INDIRECT_EXPENSES"] as const;

export async function getProfitLoss(fromDate?: string, toDate?: string) {
  const org = await requireOrganization();

  const dateFilter = {
    ...(fromDate && { gte: new Date(fromDate) }),
    ...(toDate && { lte: new Date(toDate) }),
  };

  const entries = await db.journalEntry.findMany({
    where: {
      voucher: {
        organizationId: org.id,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
    },
    include: {
      ledger: { select: { name: true, group: true } },
    },
  });

  const groupTotals: Record<string, number> = {};
  for (const entry of entries) {
    const g = entry.ledger.group;
    if (!groupTotals[g]) groupTotals[g] = 0;
    groupTotals[g] += entry.type === "DR" ? entry.amount : -entry.amount;
  }

  const income = INCOME_GROUPS.reduce((s, g) => s + (groupTotals[g] ?? 0) * -1, 0);
  const expenses = EXPENSE_GROUPS.reduce((s, g) => s + (groupTotals[g] ?? 0), 0);
  const netProfit = income - expenses;

  // Also pull from existing Billora invoices for context
  const billingSales = await db.invoice.aggregate({
    where: { organizationId: org.id, documentType: "SALE", status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const billingPurchases = await db.invoice.aggregate({
    where: { organizationId: org.id, documentType: "PURCHASE", status: { not: "CANCELLED" } },
    _sum: { total: true },
  });
  const billingExpenses = await db.expense.aggregate({
    where: { organizationId: org.id },
    _sum: { amount: true },
  });

  return {
    journalIncome: income,
    journalExpenses: expenses,
    journalNetProfit: netProfit,
    billingSalesTotal: billingSales._sum.total ?? 0,
    billingPurchasesTotal: billingPurchases._sum.total ?? 0,
    billingExpensesTotal: billingExpenses._sum.amount ?? 0,
    groupTotals,
  };
}

// ─── Balance Sheet ───────────────────────────────────────────────────────────

export async function getBalanceSheet() {
  const org = await requireOrganization();
  const trial = await getTrialBalance();

  const ASSET_GROUPS = ["CASH_IN_HAND", "BANK_ACCOUNTS", "SUNDRY_DEBTORS", "FIXED_ASSETS", "CURRENT_ASSETS", "LOANS_ADVANCES_ASSET"];
  const LIABILITY_GROUPS = ["SUNDRY_CREDITORS", "CURRENT_LIABILITIES", "LOANS_LIABILITY", "CAPITAL_ACCOUNT", "RESERVES_SURPLUS", "DUTIES_TAXES"];

  const assets = trial.filter((l) => ASSET_GROUPS.includes(l.group));
  const liabilities = trial.filter((l) => LIABILITY_GROUPS.includes(l.group));

  const totalAssets = assets.reduce((s, l) => s + (l.closingType === "DR" ? l.closingBalance : -l.closingBalance), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.closingType === "CR" ? l.closingBalance : -l.closingBalance), 0);

  return { assets, liabilities, totalAssets, totalLiabilities };
}

// ─── Accounting Dashboard Stats ───────────────────────────────────────────────

export async function getAccountingStats() {
  const org = await requireOrganization();
  await ensureSystemLedgers();

  const [voucherCount, ledgerCount, today] = await Promise.all([
    db.journalVoucher.count({ where: { organizationId: org.id } }),
    db.ledger.count({ where: { organizationId: org.id } }),
    getDayBook(new Date().toISOString().slice(0, 10)),
  ]);

  return { voucherCount, ledgerCount, todayVouchers: today.length };
}
