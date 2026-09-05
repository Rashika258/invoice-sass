import { db } from "@/lib/db";
import { roundMoney } from "@/lib/invoice-utils";

export interface BusinessInsightsResult {
  thisMonthSales: number;
  lastMonthSales: number;
  growthRate: number;
  topCustomers: { name: string; total: number; percentage: number }[];
  slowMovingItems: { id: string; name: string; stockQty: number; unitPrice: number }[];
  aiInsights: string[];
}

export async function getBusinessInsights(organizationId: string): Promise<BusinessInsightsResult> {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonthInvoices, lastMonthInvoices, topCustomerGroups, allItems] = await Promise.all([
    db.invoice.aggregate({
      where: {
        organizationId,
        documentType: "SALE",
        status: { not: "CANCELLED" },
        createdAt: { gte: firstDayThisMonth },
      },
      _sum: { total: true },
    }),
    db.invoice.aggregate({
      where: {
        organizationId,
        documentType: "SALE",
        status: { not: "CANCELLED" },
        createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth },
      },
      _sum: { total: true },
    }),
    db.invoice.groupBy({
      by: ["customerId"],
      where: {
        organizationId,
        documentType: "SALE",
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    db.item.findMany({
      where: { organizationId, itemType: "PRODUCT" },
      orderBy: { stockQty: "desc" },
    }),
  ]);

  const thisMonthSales = roundMoney(thisMonthInvoices._sum.total ?? 0);
  const lastMonthSales = roundMoney(lastMonthInvoices._sum.total ?? 0);

  const growthRate =
    lastMonthSales > 0
      ? roundMoney(((thisMonthSales - lastMonthSales) / lastMonthSales) * 100)
      : thisMonthSales > 0
        ? 100
        : 0;

  // Resolve customer names for top customers
  const customerIds = topCustomerGroups.map((g) => g.customerId);
  const customers = await db.customer.findMany({
    where: { id: { in: customerIds } },
    select: { id: true, name: true },
  });
  const customerNameMap = new Map(customers.map((c) => [c.id, c.name]));

  const totalSalesSum = topCustomerGroups.reduce((acc, g) => acc + (g._sum.total ?? 0), 0) || 1;

  const topCustomers = topCustomerGroups.map((g) => {
    const amt = g._sum.total ?? 0;
    return {
      name: customerNameMap.get(g.customerId) || "Customer",
      total: roundMoney(amt),
      percentage: roundMoney((amt / totalSalesSum) * 100),
    };
  });

  const slowMovingItems = allItems
    .filter((i) => i.stockQty > 20)
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      name: i.name,
      stockQty: i.stockQty,
      unitPrice: i.unitPrice,
    }));

  // Generate AI Business Intelligence insights
  const aiInsights: string[] = [];

  if (growthRate > 15) {
    aiInsights.push(`📈 Sales performance is strong! Revenue grew ${growthRate}% compared to last month.`);
  } else if (growthRate < -10) {
    aiInsights.push(`📉 Revenue dipped by ${Math.abs(growthRate)}% this month. Consider launching WhatsApp promotional campaigns.`);
  } else {
    aiInsights.push(`📊 Revenue remains steady with ${growthRate}% month-over-month growth.`);
  }

  if (topCustomers.length > 0 && topCustomers[0].percentage > 40) {
    aiInsights.push(
      `⚠️ High Risk: ${topCustomers[0].name} accounts for ${topCustomers[0].percentage}% of total sales. Diversify customer acquisitions.`,
    );
  }

  if (slowMovingItems.length > 0) {
    aiInsights.push(
      `📦 Stock Intelligence: ${slowMovingItems.length} product items have surplus inventory. Consider bundling discounts.`,
    );
  }

  return {
    thisMonthSales,
    lastMonthSales,
    growthRate,
    topCustomers,
    slowMovingItems,
    aiInsights,
  };
}
