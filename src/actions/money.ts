"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { roundMoney } from "@/lib/invoice-utils";
import { nextNumber } from "@/lib/number-series";
import { requireOrganization } from "@/lib/organization";
import {
  bankAccountSchema,
  expenseSchema,
  paymentSchema,
  type BankAccountInput,
  type ExpenseInput,
  type PaymentInput,
} from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";
import { AccountingService } from "@/services/accounting-service";

function refreshMoney() {
  revalidatePath("/dashboard");
  revalidatePath("/payments");
  revalidatePath("/expenses");
  revalidatePath("/cash-bank");
  revalidatePath("/customers");
  revalidatePath("/invoices");
  revalidatePath("/reports");
}

async function ensureCashAccount(organizationId: string) {
  const existing = await db.bankAccount.findFirst({
    where: { organizationId, accountType: "CASH" },
  });
  if (existing) return existing;
  return db.bankAccount.create({
    data: {
      organizationId,
      name: "Cash in Hand",
      accountType: "CASH",
      openingBalance: 0,
    },
  });
}

export async function getBankAccounts() {
  const organization = await requireOrganization();
  await ensureCashAccount(organization.id);
  return db.bankAccount.findMany({
    where: { organizationId: organization.id },
    include: { payments: true, expenses: true },
    orderBy: [{ accountType: "asc" }, { name: "asc" }],
  });
}

export async function createBankAccount(data: BankAccountInput) {
  const parsed = bankAccountSchema.parse(data);
  const organization = await requireOrganization();
  const account = await db.bankAccount.create({
    data: { organizationId: organization.id, ...parsed },
  });
  refreshMoney();
  return account;
}

export async function updateBankAccount(id: string, data: BankAccountInput) {
  const parsed = bankAccountSchema.parse(data);
  const organization = await requireOrganization();
  const result = await db.bankAccount.updateMany({
    where: { id, organizationId: organization.id },
    data: parsed,
  });
  if (!result.count) throw new Error("Account not found");
  refreshMoney();
}

export async function deleteBankAccount(id: string) {
  const organization = await requireOrganization();
  const account = await db.bankAccount.findFirst({
    where: { id, organizationId: organization.id },
    include: { _count: { select: { payments: true, expenses: true } } },
  });
  if (!account) throw new Error("Account not found");
  if (account._count.payments || account._count.expenses) {
    throw new Error("Accounts with transactions cannot be deleted");
  }
  await db.bankAccount.delete({ where: { id } });
  refreshMoney();
}

export interface GetPaymentsOptions {
  direction?: "IN" | "OUT";
  page?: number;
  limit?: number;
}

export async function getPayments(direction?: "IN" | "OUT") {
  const organization = await requireOrganization();
  return db.payment.findMany({
    where: {
      organizationId: organization.id,
      ...(direction ? { direction } : {}),
    },
    include: { party: true, invoice: true, bankAccount: true },
    orderBy: { date: "desc" },
  });
}

export async function getPaginatedPayments(options: GetPaymentsOptions) {
  const organization = await requireOrganization();
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (Math.max(page, 1) - 1) * limit;

  const where = {
    organizationId: organization.id,
    ...(options.direction ? { direction: options.direction } : {}),
  };

  const [payments, total] = await Promise.all([
    db.payment.findMany({
      where,
      include: { party: true, invoice: true, bankAccount: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    db.payment.count({ where }),
  ]);

  return {
    payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function syncInvoicePaid(
  tx: Prisma.TransactionClient,
  invoiceId: string | null | undefined,
) {
  if (!invoiceId) return;
  const payments = await tx.payment.findMany({ where: { invoiceId } });
  const paidAmount = roundMoney(payments.reduce((sum, payment) => sum + payment.amount, 0));
  const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return;
  const status =
    invoice.status === "CANCELLED"
      ? invoice.status
      : paidAmount >= invoice.total
        ? "PAID"
        : invoice.status === "PAID"
          ? "SENT"
          : invoice.status;
  await tx.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount, status },
  });
}

export async function createPayment(data: PaymentInput) {
  const parsed = paymentSchema.parse(data);
  const organization = await requireOrganization();
  await ensureCashAccount(organization.id);

  const account = await db.bankAccount.findFirst({
    where: { id: parsed.bankAccountId, organizationId: organization.id },
  });
  if (!account) throw new Error("Cash/bank account not found");

  if (parsed.partyId) {
    const party = await db.customer.findFirst({
      where: { id: parsed.partyId, organizationId: organization.id },
    });
    if (!party) throw new Error("Party not found");
  }

  if (parsed.invoiceId) {
    const invoice = await db.invoice.findFirst({
      where: { id: parsed.invoiceId, organizationId: organization.id },
    });
    if (!invoice) throw new Error("Document not found");
  }

  const payment = await db.$transaction(async (tx) => {
    const number = await nextNumber(
      tx,
      organization.id,
      parsed.direction === "IN" ? "PAYMENT_IN" : "PAYMENT_OUT",
    );
    const created = await tx.payment.create({
      data: {
        organizationId: organization.id,
        number,
        direction: parsed.direction,
        partyId: parsed.partyId || null,
        invoiceId: parsed.invoiceId || null,
        bankAccountId: parsed.bankAccountId,
        amount: parsed.amount,
        date: new Date(parsed.date),
        mode: parsed.mode,
        reference: parsed.reference || null,
        notes: parsed.notes || null,
      },
    });
    await syncInvoicePaid(tx, parsed.invoiceId || null);
    await AccountingService.postPaymentVoucher(tx, organization.id, created);
    return created;
  });

  await recordAuditLog({
    organizationId: organization.id,
    action: "CREATE",
    entity: "Payment",
    entityId: payment.id,
    changes: {
      number: payment.number,
      amount: payment.amount,
      direction: payment.direction,
    },
  });

  refreshMoney();
  return payment;
}

export async function deletePayment(id: string) {
  const organization = await requireOrganization();
  const existing = await db.payment.findFirst({
    where: { id, organizationId: organization.id },
  });
  if (!existing) throw new Error("Payment not found");

  await db.$transaction(async (tx) => {
    await tx.payment.delete({ where: { id } });
    await syncInvoicePaid(tx, existing.invoiceId);
  });

  await recordAuditLog({
    organizationId: organization.id,
    action: "DELETE",
    entity: "Payment",
    entityId: id,
    changes: {
      number: existing.number,
      amount: existing.amount,
    },
  });

  refreshMoney();
}

export interface GetExpensesOptions {
  page?: number;
  limit?: number;
}

export async function getExpenses() {
  const organization = await requireOrganization();
  return db.expense.findMany({
    where: { organizationId: organization.id },
    include: { bankAccount: true },
    orderBy: { date: "desc" },
  });
}

export async function getPaginatedExpenses(options: GetExpensesOptions) {
  const organization = await requireOrganization();
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (Math.max(page, 1) - 1) * limit;

  const where = { organizationId: organization.id };

  const [expenses, total] = await Promise.all([
    db.expense.findMany({
      where,
      include: { bankAccount: true },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    db.expense.count({ where }),
  ]);

  return {
    expenses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function createExpense(data: ExpenseInput) {
  const parsed = expenseSchema.parse(data);
  const organization = await requireOrganization();
  await ensureCashAccount(organization.id);
  const account = await db.bankAccount.findFirst({
    where: { id: parsed.bankAccountId, organizationId: organization.id },
  });
  if (!account) throw new Error("Cash/bank account not found");

  const taxAmount = roundMoney(parsed.amount * ((parsed.gstRate ?? 0) / 100));
  const expense = await db.$transaction(async (tx) => {
    const number = await nextNumber(tx, organization.id, "EXPENSE");
    return tx.expense.create({
      data: {
        organizationId: organization.id,
        number,
        category: parsed.category,
        description: parsed.description || null,
        amount: parsed.amount,
        gstRate: parsed.gstRate ?? 0,
        taxAmount,
        date: new Date(parsed.date),
        bankAccountId: parsed.bankAccountId,
        notes: parsed.notes || null,
      },
    });
  });

  await recordAuditLog({
    organizationId: organization.id,
    action: "CREATE",
    entity: "Expense",
    entityId: expense.id,
    changes: {
      number: expense.number,
      category: expense.category,
      amount: expense.amount,
    },
  });

  refreshMoney();
  return expense;
}

export async function deleteExpense(id: string) {
  const organization = await requireOrganization();
  const existing = await db.expense.findFirst({
    where: { id, organizationId: organization.id },
  });
  if (!existing) throw new Error("Expense not found");

  await db.expense.delete({ where: { id } });

  await recordAuditLog({
    organizationId: organization.id,
    action: "DELETE",
    entity: "Expense",
    entityId: id,
    changes: {
      number: existing.number,
      category: existing.category,
      amount: existing.amount,
    },
  });

  refreshMoney();
}
