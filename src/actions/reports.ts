"use server";

import { db } from "@/lib/db";
import { roundMoney } from "@/lib/invoice-utils";
import { requireOrganization } from "@/lib/organization";

const COUNTED = ["SALE", "CREDIT_NOTE", "PURCHASE", "DEBIT_NOTE"] as const;

export async function getBusinessSummary() {
  const organization = await requireOrganization();
  const [documents, payments, expenses, items, parties, accounts] = await Promise.all([
    db.invoice.findMany({
      where: {
        organizationId: organization.id,
        status: { not: "CANCELLED" },
        documentType: { in: [...COUNTED] },
      },
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({ where: { organizationId: organization.id } }),
    db.expense.findMany({ where: { organizationId: organization.id } }),
    db.item.findMany({ where: { organizationId: organization.id } }),
    db.customer.findMany({ where: { organizationId: organization.id } }),
    db.bankAccount.findMany({
      where: { organizationId: organization.id },
      include: { payments: true, expenses: true },
    }),
  ]);

  const sales = documents.filter((doc) => doc.documentType === "SALE");
  const purchases = documents.filter((doc) => doc.documentType === "PURCHASE");
  const saleReturns = documents.filter((doc) => doc.documentType === "CREDIT_NOTE");
  const purchaseReturns = documents.filter((doc) => doc.documentType === "DEBIT_NOTE");

  const saleTotal = sales.reduce((sum, doc) => sum + doc.total, 0);
  const purchaseTotal = purchases.reduce((sum, doc) => sum + doc.total, 0);
  const saleReturnTotal = saleReturns.reduce((sum, doc) => sum + doc.total, 0);
  const purchaseReturnTotal = purchaseReturns.reduce((sum, doc) => sum + doc.total, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount + expense.taxAmount, 0);
  const paymentIn = payments.filter((p) => p.direction === "IN").reduce((sum, p) => sum + p.amount, 0);
  const paymentOut = payments.filter((p) => p.direction === "OUT").reduce((sum, p) => sum + p.amount, 0);

  const netSales = saleTotal - saleReturnTotal;
  const netPurchases = purchaseTotal - purchaseReturnTotal;
  const profit = netSales - netPurchases - expenseTotal;

  const toCollect = sales.reduce((sum, doc) => sum + Math.max(doc.total - doc.paidAmount, 0), 0);
  const toPay = purchases.reduce((sum, doc) => sum + Math.max(doc.total - doc.paidAmount, 0), 0);

  const cashBank = accounts.map((account) => {
    const inAmt = account.payments
      .filter((p) => p.direction === "IN")
      .reduce((sum, p) => sum + p.amount, 0);
    const outAmt = account.payments
      .filter((p) => p.direction === "OUT")
      .reduce((sum, p) => sum + p.amount, 0);
    const expAmt = account.expenses.reduce((sum, e) => sum + e.amount + e.taxAmount, 0);
    return {
      ...account,
      balance: roundMoney(account.openingBalance + inAmt - outAmt - expAmt),
    };
  });

  const lowStock = items.filter(
    (item) => item.itemType === "PRODUCT" && item.stockQty <= item.minStock,
  );

  const gstOutward = documents
    .filter((doc) => doc.documentType === "SALE")
    .reduce(
      (acc, doc) => ({
        taxable: acc.taxable + (doc.subtotal - doc.discount),
        cgst: acc.cgst + doc.cgstAmount,
        sgst: acc.sgst + doc.sgstAmount,
        igst: acc.igst + doc.igstAmount,
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
    );

  const gstInward = documents
    .filter((doc) => doc.documentType === "PURCHASE")
    .reduce(
      (acc, doc) => ({
        taxable: acc.taxable + (doc.subtotal - doc.discount),
        cgst: acc.cgst + doc.cgstAmount,
        sgst: acc.sgst + doc.sgstAmount,
        igst: acc.igst + doc.igstAmount,
      }),
      { taxable: 0, cgst: 0, sgst: 0, igst: 0 },
    );

  const gstr1ByRate = new Map<number, { taxable: number; tax: number; invoices: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const rate = item.gstRate;
      const current = gstr1ByRate.get(rate) ?? { taxable: 0, tax: 0, invoices: 0 };
      const line = item.quantity * item.unitPrice;
      current.taxable += line;
      current.tax += line * (rate / 100);
      gstr1ByRate.set(rate, current);
    }
  }
  for (const sale of sales) {
    const rates = new Set(sale.items.map((item) => item.gstRate));
    for (const rate of rates) {
      const current = gstr1ByRate.get(rate);
      if (current) current.invoices += 1;
    }
  }

  return {
    saleTotal: roundMoney(netSales),
    purchaseTotal: roundMoney(netPurchases),
    expenseTotal: roundMoney(expenseTotal),
    paymentIn: roundMoney(paymentIn),
    paymentOut: roundMoney(paymentOut),
    profit: roundMoney(profit),
    toCollect: roundMoney(toCollect),
    toPay: roundMoney(toPay),
    cashBank,
    cashInHand: roundMoney(
      cashBank.filter((a) => a.accountType === "CASH").reduce((sum, a) => sum + a.balance, 0),
    ),
    bankBalance: roundMoney(
      cashBank.filter((a) => a.accountType === "BANK").reduce((sum, a) => sum + a.balance, 0),
    ),
    lowStock,
    gstOutward: {
      taxable: roundMoney(gstOutward.taxable),
      cgst: roundMoney(gstOutward.cgst),
      sgst: roundMoney(gstOutward.sgst),
      igst: roundMoney(gstOutward.igst),
      totalTax: roundMoney(gstOutward.cgst + gstOutward.sgst + gstOutward.igst),
    },
    gstInward: {
      taxable: roundMoney(gstInward.taxable),
      cgst: roundMoney(gstInward.cgst),
      sgst: roundMoney(gstInward.sgst),
      igst: roundMoney(gstInward.igst),
      totalTax: roundMoney(gstInward.cgst + gstInward.sgst + gstInward.igst),
    },
    gstr1: Array.from(gstr1ByRate.entries())
      .map(([rate, value]) => ({
        rate,
        taxable: roundMoney(value.taxable),
        tax: roundMoney(value.tax),
        invoices: value.invoices,
      }))
      .sort((a, b) => a.rate - b.rate),
    partiesCount: parties.length,
    itemsCount: items.length,
    sales,
    purchases,
    expenses,
    items,
    recentSales: sales.slice(0, 8),
  };
}

export async function getPartyBalances() {
  const organization = await requireOrganization();
  const parties = await db.customer.findMany({
    where: { organizationId: organization.id },
    include: {
      invoices: {
        where: {
          status: { not: "CANCELLED" },
          documentType: { in: [...COUNTED] },
        },
      },
      payments: true,
    },
    orderBy: { name: "asc" },
  });

  return parties.map((party) => {
    const sales = party.invoices
      .filter((doc) => doc.documentType === "SALE")
      .reduce((sum, doc) => sum + doc.total, 0);
    const credits = party.invoices
      .filter((doc) => doc.documentType === "CREDIT_NOTE")
      .reduce((sum, doc) => sum + doc.total, 0);
    const purchases = party.invoices
      .filter((doc) => doc.documentType === "PURCHASE")
      .reduce((sum, doc) => sum + doc.total, 0);
    const debits = party.invoices
      .filter((doc) => doc.documentType === "DEBIT_NOTE")
      .reduce((sum, doc) => sum + doc.total, 0);
    const received = party.payments
      .filter((p) => p.direction === "IN")
      .reduce((sum, p) => sum + p.amount, 0);
    const paid = party.payments
      .filter((p) => p.direction === "OUT")
      .reduce((sum, p) => sum + p.amount, 0);

    const receivable = roundMoney(party.openingBalance + sales - credits - received);
    const payable = roundMoney(purchases - debits - paid);
    return {
      ...party,
      receivable,
      payable,
      balance: roundMoney(receivable - payable),
    };
  });
}

export async function getDayBook(dateStr?: string) {
  const organization = await requireOrganization();
  const targetDate = dateStr ? new Date(dateStr) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [invoices, payments, expenses] = await Promise.all([
    db.invoice.findMany({
      where: {
        organizationId: organization.id,
        issueDate: { gte: startOfDay, lte: endOfDay },
      },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: {
        organizationId: organization.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: { party: true, bankAccount: true },
      orderBy: { createdAt: "desc" },
    }),
    db.expense.findMany({
      where: {
        organizationId: organization.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    date: startOfDay,
    invoices,
    payments,
    expenses,
    totalSale: invoices.filter((i) => i.documentType === "SALE").reduce((s, i) => s + i.total, 0),
    totalPurchase: invoices.filter((i) => i.documentType === "PURCHASE").reduce((s, i) => s + i.total, 0),
    totalIn: payments.filter((p) => p.direction === "IN").reduce((s, p) => s + p.amount, 0),
    totalOut: payments.filter((p) => p.direction === "OUT").reduce((s, p) => s + p.amount, 0),
    totalExpense: expenses.reduce((s, e) => s + e.amount + e.taxAmount, 0),
  };
}

export async function getBillWiseProfit() {
  const organization = await requireOrganization();
  const sales = await db.invoice.findMany({
    where: {
      organizationId: organization.id,
      documentType: "SALE",
      status: { not: "CANCELLED" },
    },
    include: {
      items: true,
      customer: true,
    },
    orderBy: { issueDate: "desc" },
    take: 50,
  });

  return sales.map((sale) => {
    const saleAmount = sale.total;
    // Estimate cost based on 70% of sale or item purchase price
    const estimatedCost = sale.items.reduce((sum, it) => sum + it.amount * 0.75, 0);
    const profit = roundMoney(saleAmount - estimatedCost);
    const marginPct = saleAmount > 0 ? roundMoney((profit / saleAmount) * 100) : 0;

    return {
      id: sale.id,
      invoiceNumber: sale.invoiceNumber,
      date: sale.issueDate,
      partyName: sale.customer.name,
      saleAmount,
      costAmount: roundMoney(estimatedCost),
      profit,
      marginPct,
    };
  });
}

