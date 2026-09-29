"use server";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { roundMoney } from "@/lib/invoice-utils";
import { subDays, startOfDay, endOfDay, format, startOfMonth, subMonths } from "date-fns";

export type TimeRangeFilter = "7d" | "30d" | "thisMonth" | "3m" | "6m" | "1y";

export interface AnalyticsSummary {
  kpis: {
    totalSales: number;
    salesGrowthPct: number;
    totalPurchases: number;
    totalExpenses: number;
    netProfit: number;
    profitMarginPct: number;
    receivables: number;
    payables: number;
    averageOrderValue: number;
    totalInvoicesCount: number;
    outputGst: number;
    inputGst: number;
    netGstPayable: number;
  };
  timeSeries: {
    dateLabel: string;
    rawDate: string;
    sales: number;
    purchases: number;
    expenses: number;
    netProfit: number;
  }[];
  categoryBreakdown: {
    name: string;
    revenue: number;
    percentage: number;
    count: number;
  }[];
  paymentModeBreakdown: {
    mode: "CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD";
    amount: number;
    percentage: number;
    count: number;
  }[];
  partyConcentration: {
    id: string;
    name: string;
    revenue: number;
    percentage: number;
    partyType: string;
  }[];
  inventoryVelocity: {
    fastMoving: { id: string; name: string; stockQty: number; unitPrice: number; salesCount: number }[];
    slowMoving: { id: string; name: string; stockQty: number; unitPrice: number; totalValue: number }[];
    totalStockValue: number;
  };
  aiInsights: string[];
}

export async function getAnalyticsData(range: TimeRangeFilter = "30d"): Promise<AnalyticsSummary> {
  const user = await requireUser();
  const organizationId = user.organizationId;
  const now = new Date();

  // Determine start date based on range filter
  let startDate: Date;
  let prevPeriodStartDate: Date;

  switch (range) {
    case "7d":
      startDate = subDays(now, 6);
      prevPeriodStartDate = subDays(startDate, 7);
      break;
    case "30d":
      startDate = subDays(now, 29);
      prevPeriodStartDate = subDays(startDate, 30);
      break;
    case "thisMonth":
      startDate = startOfMonth(now);
      prevPeriodStartDate = startOfMonth(subMonths(now, 1));
      break;
    case "3m":
      startDate = subMonths(now, 3);
      prevPeriodStartDate = subMonths(startDate, 3);
      break;
    case "6m":
      startDate = subMonths(now, 6);
      prevPeriodStartDate = subMonths(startDate, 6);
      break;
    case "1y":
      startDate = subMonths(now, 12);
      prevPeriodStartDate = subMonths(startDate, 12);
      break;
    default:
      startDate = subDays(now, 29);
      prevPeriodStartDate = subDays(startDate, 30);
      break;
  }

  const startGte = startOfDay(startDate);

  // Fetch current period documents
  const [
    salesInvoices,
    purchaseInvoices,
    expenses,
    payments,
    allCustomers,
    allItems,
    prevPeriodSales,
  ] = await Promise.all([
    db.invoice.findMany({
      where: {
        organizationId,
        documentType: "SALE",
        status: { not: "CANCELLED" },
        issueDate: { gte: startGte },
      },
      include: {
        items: true,
        customer: true,
      },
      orderBy: { issueDate: "asc" },
    }),

    db.invoice.findMany({
      where: {
        organizationId,
        documentType: "PURCHASE",
        status: { not: "CANCELLED" },
        issueDate: { gte: startGte },
      },
      orderBy: { issueDate: "asc" },
    }),

    db.expense.findMany({
      where: {
        organizationId,
        date: { gte: startGte },
      },
    }),

    db.payment.findMany({
      where: {
        organizationId,
        date: { gte: startGte },
      },
    }),

    db.customer.findMany({
      where: { organizationId },
      include: {
        invoices: {
          where: { documentType: "SALE", status: { not: "CANCELLED" } },
          select: { total: true, paidAmount: true },
        },
      },
    }),

    db.item.findMany({
      where: { organizationId },
    }),

    db.invoice.aggregate({
      where: {
        organizationId,
        documentType: "SALE",
        status: { not: "CANCELLED" },
        issueDate: { gte: startOfDay(prevPeriodStartDate), lt: startGte },
      },
      _sum: { total: true },
    }),
  ]);

  // 1. Calculate KPI totals
  const totalSales = roundMoney(salesInvoices.reduce((acc, inv) => acc + inv.total, 0));
  const prevSales = roundMoney(prevPeriodSales._sum.total ?? 0);
  const salesGrowthPct =
    prevSales > 0
      ? roundMoney(((totalSales - prevSales) / prevSales) * 100)
      : totalSales > 0
        ? 100
        : 0;

  const totalPurchases = roundMoney(purchaseInvoices.reduce((acc, inv) => acc + inv.total, 0));
  const totalExpenses = roundMoney(expenses.reduce((acc, exp) => acc + exp.amount, 0));

  const netProfit = roundMoney(totalSales - (totalPurchases + totalExpenses));
  const profitMarginPct = totalSales > 0 ? roundMoney((netProfit / totalSales) * 100) : 0;

  // Receivables & Payables
  let receivables = 0;
  let payables = 0;
  allCustomers.forEach((c) => {
    let customerUnpaid = 0;
    c.invoices.forEach((inv) => {
      customerUnpaid += Math.max(inv.total - inv.paidAmount, 0);
    });
    if (c.partyType === "SUPPLIER") {
      payables += customerUnpaid;
    } else {
      receivables += customerUnpaid;
    }
  });
  receivables = roundMoney(receivables);
  payables = roundMoney(payables);

  const totalInvoicesCount = salesInvoices.length;
  const averageOrderValue =
    totalInvoicesCount > 0 ? roundMoney(totalSales / totalInvoicesCount) : 0;

  // GST Calculation
  const outputGst = roundMoney(salesInvoices.reduce((acc, inv) => acc + inv.taxAmount, 0));
  const inputGst = roundMoney(purchaseInvoices.reduce((acc, inv) => acc + inv.taxAmount, 0));
  const netGstPayable = roundMoney(Math.max(outputGst - inputGst, 0));

  // 2. Build Time Series
  const timeSeriesMap = new Map<
    string,
    { sales: number; purchases: number; expenses: number; label: string }
  >();

  // Determine interval points
  const daysDiff = Math.max(
    Math.ceil((now.getTime() - startGte.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  const numBuckets = range === "7d" ? 7 : range === "30d" ? 10 : range === "3m" ? 12 : 12;

  for (let i = 0; i < numBuckets; i++) {
    const daysAgo = Math.round(daysDiff - (i * daysDiff) / (numBuckets - 1 || 1));
    const targetDate = subDays(now, Math.max(daysAgo, 0));
    const rawKey = format(targetDate, "yyyy-MM-dd");
    const label = range === "7d" ? format(targetDate, "EEE d") : format(targetDate, "MMM d");

    timeSeriesMap.set(rawKey, { sales: 0, purchases: 0, expenses: 0, label });
  }

  // Populate time series with actual invoices
  const keys = Array.from(timeSeriesMap.keys());

  salesInvoices.forEach((inv) => {
    const invDateStr = format(new Date(inv.issueDate), "yyyy-MM-dd");
    // Find closest key
    const closestKey = keys.reduce((prev, curr) =>
      Math.abs(new Date(curr).getTime() - new Date(invDateStr).getTime()) <
      Math.abs(new Date(prev).getTime() - new Date(invDateStr).getTime())
        ? curr
        : prev
    );
    if (timeSeriesMap.has(closestKey)) {
      timeSeriesMap.get(closestKey)!.sales += inv.total;
    }
  });

  purchaseInvoices.forEach((inv) => {
    const invDateStr = format(new Date(inv.issueDate), "yyyy-MM-dd");
    const closestKey = keys.reduce((prev, curr) =>
      Math.abs(new Date(curr).getTime() - new Date(invDateStr).getTime()) <
      Math.abs(new Date(prev).getTime() - new Date(invDateStr).getTime())
        ? curr
        : prev
    );
    if (timeSeriesMap.has(closestKey)) {
      timeSeriesMap.get(closestKey)!.purchases += inv.total;
    }
  });

  expenses.forEach((exp) => {
    const expDateStr = format(new Date(exp.date), "yyyy-MM-dd");
    const closestKey = keys.reduce((prev, curr) =>
      Math.abs(new Date(curr).getTime() - new Date(expDateStr).getTime()) <
      Math.abs(new Date(prev).getTime() - new Date(expDateStr).getTime())
        ? curr
        : prev
    );
    if (timeSeriesMap.has(closestKey)) {
      timeSeriesMap.get(closestKey)!.expenses += exp.amount;
    }
  });

  const timeSeries = Array.from(timeSeriesMap.entries()).map(([rawDate, val]) => {
    const s = roundMoney(val.sales);
    const p = roundMoney(val.purchases);
    const e = roundMoney(val.expenses);
    const np = roundMoney(s - (p + e));
    return {
      rawDate,
      dateLabel: val.label,
      sales: s,
      purchases: p,
      expenses: e,
      netProfit: np,
    };
  });

  // 3. Category Breakdown
  const categoryMap = new Map<string, { revenue: number; count: number }>();
  salesInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const itemName = item.description || "General";
      const cat = itemName.split(" ")[0] || "General";
      const existing = categoryMap.get(cat) || { revenue: 0, count: 0 };
      categoryMap.set(cat, {
        revenue: existing.revenue + item.amount,
        count: existing.count + item.quantity,
      });
    });
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      revenue: roundMoney(data.revenue),
      percentage: totalSales > 0 ? roundMoney((data.revenue / totalSales) * 100) : 0,
      count: data.count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // 4. Payment Mode Breakdown
  const paymentModeMap = new Map<
    "CASH" | "UPI" | "BANK" | "CHEQUE" | "CARD",
    { amount: number; count: number }
  >([
    ["CASH", { amount: 0, count: 0 }],
    ["UPI", { amount: 0, count: 0 }],
    ["BANK", { amount: 0, count: 0 }],
    ["CHEQUE", { amount: 0, count: 0 }],
    ["CARD", { amount: 0, count: 0 }],
  ]);

  payments.forEach((p) => {
    const current = paymentModeMap.get(p.mode) || { amount: 0, count: 0 };
    paymentModeMap.set(p.mode, {
      amount: current.amount + p.amount,
      count: current.count + 1,
    });
  });

  const totalPaymentsCollected =
    Array.from(paymentModeMap.values()).reduce((acc, val) => acc + val.amount, 0) || 1;

  const paymentModeBreakdown = Array.from(paymentModeMap.entries()).map(([mode, data]) => ({
    mode,
    amount: roundMoney(data.amount),
    percentage: roundMoney((data.amount / totalPaymentsCollected) * 100),
    count: data.count,
  }));

  // 5. Party Concentration Risk
  const partyRevenueMap = new Map<string, { name: string; revenue: number; partyType: string }>();
  salesInvoices.forEach((inv) => {
    const customerId = inv.customerId;
    const name = inv.customer?.name || "Customer";
    const current = partyRevenueMap.get(customerId) || {
      name,
      revenue: 0,
      partyType: inv.customer?.partyType || "CUSTOMER",
    };
    partyRevenueMap.set(customerId, {
      ...current,
      revenue: current.revenue + inv.total,
    });
  });

  const partyConcentration = Array.from(partyRevenueMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      revenue: roundMoney(data.revenue),
      percentage: totalSales > 0 ? roundMoney((data.revenue / totalSales) * 100) : 0,
      partyType: data.partyType,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // 6. Inventory Velocity
  const itemSalesCountMap = new Map<string, number>();
  salesInvoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const itemName = item.description || "";
      const current = itemSalesCountMap.get(itemName) || 0;
      itemSalesCountMap.set(itemName, current + item.quantity);
    });
  });

  const fastMoving = allItems
    .map((i) => ({
      id: i.id,
      name: i.name,
      stockQty: i.stockQty,
      unitPrice: i.unitPrice,
      salesCount: itemSalesCountMap.get(i.name) || 0,
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  const slowMoving = allItems
    .filter((i) => i.itemType === "PRODUCT" && i.stockQty > 10)
    .map((i) => ({
      id: i.id,
      name: i.name,
      stockQty: i.stockQty,
      unitPrice: i.unitPrice,
      totalValue: roundMoney(i.stockQty * i.unitPrice),
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const totalStockValue = roundMoney(
    allItems.reduce((acc, i) => acc + i.stockQty * i.unitPrice, 0)
  );

  // 7. AI Insights Generation
  const aiInsights: string[] = [];

  if (totalSales > 0 || totalPurchases > 0) {
    if (salesGrowthPct > 10) {
      aiInsights.push(
        `🚀 Strong Revenue Growth: Sales grew by ${salesGrowthPct}% compared to the prior period.`
      );
    } else if (salesGrowthPct < -10) {
      aiInsights.push(
        `⚠️ Declining Sales: Revenue contracted by ${Math.abs(salesGrowthPct)}%. Consider launching promotional WhatsApp broadcasts.`
      );
    } else {
      aiInsights.push(
        `📊 Stable Cash Velocity: Turnover is steady (${salesGrowthPct}% growth) for the selected timeframe.`
      );
    }
  }

  if (partyConcentration.length > 0 && partyConcentration[0].percentage > 35) {
    aiInsights.push(
      `🚨 Customer Dependency Risk: ${partyConcentration[0].name} accounts for ${partyConcentration[0].percentage}% of your total billing. Expanding customer acquisition is recommended.`
    );
  }

  if (profitMarginPct < 15 && totalSales > 0) {
    aiInsights.push(
      `💡 Margin Optimization: Net profit margin stands at ${profitMarginPct}%. Review supplier item pricing and overhead expenses.`
    );
  }

  if (slowMoving.length > 0) {
    aiInsights.push(
      `📦 Inventory Capital: ₹${slowMoving.reduce((sum, item) => sum + item.totalValue, 0).toLocaleString("en-IN")} is tied up in slow-moving items. Run targeted stock clearance sales.`
    );
  }

  return {
    kpis: {
      totalSales,
      salesGrowthPct,
      totalPurchases,
      totalExpenses,
      netProfit,
      profitMarginPct,
      receivables,
      payables,
      averageOrderValue,
      totalInvoicesCount,
      outputGst,
      inputGst,
      netGstPayable,
    },
    timeSeries,
    categoryBreakdown,
    paymentModeBreakdown,
    partyConcentration,
    inventoryVelocity: {
      fastMoving,
      slowMoving,
      totalStockValue,
    },
    aiInsights,
  };
}
