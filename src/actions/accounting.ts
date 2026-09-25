"use server";

import { requireOrganization } from "@/lib/organization";

import { requirePermission } from "@/lib/permissions";
import {
  AccountingService,
  type LedgerGroupKey,
  type VoucherTypeKey,
  type LedgerInput,
  type VoucherInput,
  type VoucherEntryLine,
  type GetVouchersOptions,
} from "@/services/accounting-service";

export type {
  LedgerGroupKey,
  VoucherTypeKey,
  LedgerInput,
  VoucherInput,
  VoucherEntryLine,
  GetVouchersOptions,
};



import { db } from "@/lib/db";

export async function getLedgers() {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
  return AccountingService.getLedgers(org.id);
}

export async function createLedger(input: LedgerInput) {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_MUTATE");
  return AccountingService.createLedger(org.id, input);
}

export async function createVoucher(input: VoucherInput) {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_MUTATE");
  return AccountingService.createVoucher(org.id, input);
}

export async function getVouchers(filters?: { voucherType?: VoucherTypeKey; fromDate?: string; toDate?: string }) {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
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
  await requirePermission("ACCOUNTING_READ");
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
  await requirePermission("ACCOUNTING_MUTATE");
  return AccountingService.deleteVoucher(org.id, id);
}

export async function getDayBook(date: string) {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
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

export async function getTrialBalance() {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
  await AccountingService.ensureSystemLedgers(org.id);

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

export async function getProfitLoss(fromDate?: string, toDate?: string) {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");

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

  const INCOME_GROUPS = ["SALES_ACCOUNTS", "DIRECT_INCOME", "INDIRECT_INCOME"] as const;
  const EXPENSE_GROUPS = ["PURCHASE_ACCOUNTS", "DIRECT_EXPENSES", "INDIRECT_EXPENSES"] as const;

  const income = INCOME_GROUPS.reduce((s, g) => s + (groupTotals[g] ?? 0) * -1, 0);
  const expenses = EXPENSE_GROUPS.reduce((s, g) => s + (groupTotals[g] ?? 0), 0);
  const netProfit = income - expenses;

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

export async function getBalanceSheet() {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
  const trial = await getTrialBalance();

  const ASSET_GROUPS = ["CASH_IN_HAND", "BANK_ACCOUNTS", "SUNDRY_DEBTORS", "FIXED_ASSETS", "CURRENT_ASSETS", "LOANS_ADVANCES_ASSET"];
  const LIABILITY_GROUPS = ["SUNDRY_CREDITORS", "CURRENT_LIABILITIES", "LOANS_LIABILITY", "CAPITAL_ACCOUNT", "RESERVES_SURPLUS", "DUTIES_TAXES"];

  const assets = trial.filter((l) => ASSET_GROUPS.includes(l.group));
  const liabilities = trial.filter((l) => LIABILITY_GROUPS.includes(l.group));

  const totalAssets = assets.reduce((s, l) => s + (l.closingType === "DR" ? l.closingBalance : -l.closingBalance), 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + (l.closingType === "CR" ? l.closingBalance : -l.closingBalance), 0);

  return { assets, liabilities, totalAssets, totalLiabilities };
}

export async function getAccountingStats() {
  const org = await requireOrganization();
  await requirePermission("ACCOUNTING_READ");
  await AccountingService.ensureSystemLedgers(org.id);

  const [voucherCount, ledgerCount, today] = await Promise.all([
    db.journalVoucher.count({ where: { organizationId: org.id } }),
    db.ledger.count({ where: { organizationId: org.id } }),
    getDayBook(new Date().toISOString().slice(0, 10)),
  ]);

  return { voucherCount, ledgerCount, todayVouchers: today.length };
}
