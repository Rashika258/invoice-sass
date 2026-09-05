"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

export type AiInsightResult = {
  query: string;
  headline: string;
  summary: string;
  type: "DEBTORS" | "TOP_ITEMS" | "PROFIT" | "LOW_STOCK" | "GENERAL";
  metrics: Array<{ label: string; value: string; trend?: string }>;
  itemsList?: Array<{ name: string; detail: string; badge?: string; amount?: string }>;
  actionLabel?: string;
  actionHref?: string;
};

export async function askBusinessAi(userQuery: string): Promise<AiInsightResult> {
  const org = await requireOrganization();
  const orgName = org.name || "Your Business";
  const q = userQuery.toLowerCase().trim();

  // 1. "Who owes me the most" / "debtors" / "pending" / "dues"
  if (
    q.includes("owe") ||
    q.includes("debt") ||
    q.includes("pending") ||
    q.includes("due") ||
    q.includes("collect")
  ) {
    const customers = await db.customer.findMany({
      where: { organizationId: org.id },
      include: {
        invoices: {
          where: { status: { not: "CANCELLED" } },
        },
        payments: true,
      },
    });

    const debtors = customers
      .map((c) => {
        const salesDue = c.invoices
          .filter((i) => i.documentType === "SALE")
          .reduce((sum, inv) => sum + Math.max(inv.total - inv.paidAmount, 0), 0);
        const opening = c.openingBalance || 0;
        const totalDue = Math.max(opening + salesDue, 0);
        return { name: c.name, phone: c.phone, balance: totalDue };
      })
      .filter((c) => c.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const totalDue = debtors.reduce((sum, d) => sum + d.balance, 0);

    if (debtors.length === 0) {
      return {
        query: userQuery,
        headline: `No outstanding customer dues in ${orgName}!`,
        summary: `All parties are fully settled with ₹0 pending balance. When you create sale invoices with credit terms or opening balances, debtors will automatically track here.`,
        type: "DEBTORS",
        metrics: [
          { label: "Total Receivables", value: "₹0" },
          { label: "Parties with Dues", value: "0" },
          { label: "Payment Health", value: "100% Clear" },
        ],
        actionLabel: "Create New Sale Invoice",
        actionHref: "/invoices/new",
      };
    }

    return {
      query: userQuery,
      headline: `You have ₹${totalDue.toLocaleString("en-IN")} in outstanding customer dues`,
      summary: `${debtors.length} parties have unpaid balances in ${orgName}. Your top debtor is ${debtors[0]?.name || "N/A"} owing ₹${(debtors[0]?.balance || 0).toLocaleString("en-IN")}.`,
      type: "DEBTORS",
      metrics: [
        { label: "Total Receivables", value: `₹${totalDue.toLocaleString("en-IN")}` },
        { label: "Parties with Dues", value: `${debtors.length} customers` },
        { label: "Highest Single Due", value: `₹${(debtors[0]?.balance || 0).toLocaleString("en-IN")}` },
      ],
      itemsList: debtors.slice(0, 5).map((d) => ({
        name: d.name,
        detail: d.phone ? `Ph: ${d.phone}` : "No phone listed",
        amount: `₹${d.balance.toLocaleString("en-IN")}`,
        badge: "OVERDUE",
      })),
      actionLabel: "Open Digital Khata to Send WhatsApp Reminders",
      actionHref: "/customers",
    };
  }

  // 2. "Low stock" / "reorder" / "inventory alert" (CHECKED BEFORE TOP ITEMS)
  if (
    q.includes("low") ||
    q.includes("shortage") ||
    q.includes("reorder") ||
    (q.includes("stock") && !q.includes("top") && !q.includes("best"))
  ) {
    const allProducts = await db.item.findMany({
      where: {
        organizationId: org.id,
        itemType: "PRODUCT",
      },
    });

    if (allProducts.length === 0) {
      return {
        query: userQuery,
        headline: `No products in inventory catalog yet`,
        summary: `You haven't added items to ${orgName}'s inventory yet. Once you add products and set min-stock levels, AI will alert you before supplies run out.`,
        type: "LOW_STOCK",
        metrics: [
          { label: "Catalog Products", value: "0" },
          { label: "Stock Alerts", value: "0" },
        ],
        actionLabel: "Add First Product to Catalog",
        actionHref: "/items",
      };
    }

    const lowStockItems = allProducts.filter(
      (i) => i.stockQty <= (i.minStock || 10)
    );

    if (lowStockItems.length === 0) {
      return {
        query: userQuery,
        headline: `All inventory is healthy in ${orgName}!`,
        summary: `None of your ${allProducts.length} catalog items are below their minimum threshold. All stock levels are sufficient for current operations.`,
        type: "LOW_STOCK",
        metrics: [
          { label: "Products Monitored", value: `${allProducts.length} items` },
          { label: "Shortage Count", value: "0" },
          { label: "Stock Health", value: "Optimal" },
        ],
        actionLabel: "View Full Inventory",
        actionHref: "/items",
      };
    }

    return {
      query: userQuery,
      headline: `${lowStockItems.length} items are running below reorder threshold`,
      summary: `These products need purchase replenishment from suppliers to avoid stockouts in ${orgName}.`,
      type: "LOW_STOCK",
      metrics: [
        { label: "Items Below Alert Level", value: `${lowStockItems.length} items` },
        { label: "Total Catalog Items", value: `${allProducts.length} items` },
      ],
      itemsList: lowStockItems.slice(0, 5).map((i) => ({
        name: i.name,
        detail: `Min Stock: ${i.minStock || 10} ${i.unit || "NOS"}`,
        amount: `${i.stockQty} left`,
        badge: "LOW STOCK",
      })),
      actionLabel: "Create Supplier Purchase Order",
      actionHref: "/purchases/new",
    };
  }

  // 3. "Top selling" / "best items" / "products" / "catalog"
  if (
    q.includes("top") ||
    q.includes("best") ||
    q.includes("sell") ||
    q.includes("item") ||
    q.includes("product") ||
    q.includes("catalog")
  ) {
    const items = await db.item.findMany({
      where: { organizationId: org.id },
      orderBy: { stockQty: "desc" },
    });

    if (items.length === 0) {
      return {
        query: userQuery,
        headline: `No products found in ${orgName} catalog`,
        summary: `Your inventory catalog does not have any items yet. Add your products, services, and rates to unlock automatic stock tracking and AI sales insights.`,
        type: "TOP_ITEMS",
        metrics: [
          { label: "Total Items", value: "0 products" },
          { label: "Catalog Value", value: "₹0" },
        ],
        actionLabel: "Add First Product to Catalog",
        actionHref: "/items",
      };
    }

    const topItems = items.slice(0, 5);

    return {
      query: userQuery,
      headline: `Top catalog performers in ${orgName}`,
      summary: `Your catalog contains ${items.length} items. Top active products include ${topItems.map((i) => i.name).slice(0, 3).join(", ")}.`,
      type: "TOP_ITEMS",
      metrics: [
        { label: "Total Catalog Items", value: `${items.length} products` },
        { label: "High Volume Stock", value: `${topItems[0]?.stockQty || 0} units` },
      ],
      itemsList: topItems.map((item) => ({
        name: item.name,
        detail: `HSN: ${item.hsn || "General"} • Stock: ${item.stockQty} ${item.unit || "NOS"}`,
        amount: `₹${item.unitPrice.toLocaleString("en-IN")}`,
        badge: item.estimatePrice > 0 ? `Est: ₹${item.estimatePrice}` : "Price",
      })),
      actionLabel: "Manage Catalog & Pricing",
      actionHref: "/items",
    };
  }

  // 4. Default / "profit" / "margin" / general business health
  const [invoices, expenses] = await Promise.all([
    db.invoice.findMany({
      where: { organizationId: org.id, status: { not: "CANCELLED" } },
    }),
    db.expense.findMany({
      where: { organizationId: org.id },
    }),
  ]);

  const sales = invoices.filter((i) => i.documentType === "SALE");
  const purchases = invoices.filter((i) => i.documentType === "PURCHASE");
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (totalSales === 0 && totalPurchases === 0) {
    return {
      query: userQuery,
      headline: `No sales or purchase transactions recorded yet for ${orgName}`,
      summary: `To calculate your real-time profit margin, revenue, and cashflow, start by generating your first sale invoice or entering purchase bills.`,
      type: "PROFIT",
      metrics: [
        { label: "Total Sales", value: "₹0" },
        { label: "Purchase Costs", value: "₹0" },
        { label: "Recorded Expenses", value: `₹${totalExpenses.toLocaleString("en-IN")}` },
      ],
      itemsList: [
        { name: "Sales Invoices", detail: "0 recorded", amount: "₹0" },
        { name: "Purchase Bills", detail: "0 recorded", amount: "₹0" },
        { name: "Expenses", detail: `${expenses.length} entries`, amount: `₹${totalExpenses.toLocaleString("en-IN")}` },
      ],
      actionLabel: "Create First Sale Invoice",
      actionHref: "/invoices/new",
    };
  }

  const netProfit = totalSales - totalPurchases - totalExpenses;
  const marginPct = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : "0.0";

  return {
    query: userQuery,
    headline: `Estimated Net Profit Margin is ${marginPct}% for ${orgName}`,
    summary: `Based on ₹${totalSales.toLocaleString("en-IN")} total sales vs ₹${totalPurchases.toLocaleString("en-IN")} purchases and ₹${totalExpenses.toLocaleString("en-IN")} operating expenses.`,
    type: "PROFIT",
    metrics: [
      { label: "Total Turnover", value: `₹${totalSales.toLocaleString("en-IN")}` },
      { label: "Gross Purchase Cost", value: `₹${totalPurchases.toLocaleString("en-IN")}` },
      { label: "Net Operating Margin", value: `${marginPct}%`, trend: netProfit >= 0 ? "+Positive" : "-Deficit" },
    ],
    itemsList: [
      { name: "Revenue from Sales", detail: `${sales.length} invoices generated`, amount: `₹${totalSales.toLocaleString("en-IN")}` },
      { name: "Material Procurement", detail: `${purchases.length} supplier bills`, amount: `₹${totalPurchases.toLocaleString("en-IN")}` },
      { name: "Recorded Expenses", detail: `${expenses.length} expense vouchers`, amount: `₹${totalExpenses.toLocaleString("en-IN")}` },
    ],
    actionLabel: "View Full Profit & Loss Statement",
    actionHref: "/ca-portal",
  };
}
