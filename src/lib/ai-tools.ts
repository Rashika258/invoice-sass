import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

// ─── Tool Definitions for LLM Function Calling ──────────────────────────────

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, any>;
};

export const AI_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "get_business_summary",
    description: "Get overall financial health: total sales, total purchases, cash & bank balance, total receivables, and payables.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_outstanding_receivables",
    description: "Get all customers with overdue balances, their phone numbers, last payment date, and total amount owed.",
    parameters: {
      type: "object",
      properties: {
        minAmount: { type: "number", description: "Minimum balance to filter customers by" },
      },
    },
  },
  {
    name: "get_inventory_alerts",
    description: "Get products running low on stock (stockQty <= minStock) and items with 0 stock.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_sales_analytics",
    description: "Get sales breakdown by customer, top-selling products, and revenue for a specified timeframe.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Number of top items to return (default 5)" },
      },
    },
  },
  {
    name: "get_expenses_summary",
    description: "Get breakdown of all business expenses grouped by category (Rent, Salary, Electricity, Marketing, Software, etc.).",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_profit_and_loss_summary",
    description: "Get Profit & Loss summary: Gross Sales, Purchase Costs, Expenses, Net Profit, and Net Margin percentage.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "create_draft_invoice",
    description: "Create a draft sale invoice for a specified customer with line items.",
    parameters: {
      type: "object",
      properties: {
        customerName: { type: "string", description: "Name of the customer" },
        itemName: { type: "string", description: "Name of product or service" },
        quantity: { type: "number", description: "Quantity of item" },
        unitPrice: { type: "number", description: "Unit price per item" },
      },
      required: ["customerName", "itemName", "quantity", "unitPrice"],
    },
  },
  {
    name: "prepare_whatsapp_reminder",
    description: "Generate a formatted WhatsApp payment reminder message and link for a customer with overdue dues.",
    parameters: {
      type: "object",
      properties: {
        customerName: { type: "string", description: "Customer name" },
      },
      required: ["customerName"],
    },
  },
];

// ─── Tool Handlers ────────────────────────────────────────────────────────────

export async function executeAiTool(toolName: string, args: Record<string, any>) {
  const org = await requireOrganization();

  switch (toolName) {
    case "get_business_summary": {
      const [invoices, payments, expenses, items, customers] = await Promise.all([
        db.invoice.findMany({ where: { organizationId: org.id, status: { not: "CANCELLED" } } }),
        db.payment.findMany({ where: { organizationId: org.id } }),
        db.expense.findMany({ where: { organizationId: org.id } }),
        db.item.findMany({ where: { organizationId: org.id } }),
        db.customer.findMany({ where: { organizationId: org.id }, include: { invoices: true } }),
      ]);

      const salesTotal = invoices.filter((i) => i.documentType === "SALE").reduce((s, i) => s + i.total, 0);
      const purchaseTotal = invoices.filter((i) => i.documentType === "PURCHASE").reduce((s, i) => s + i.total, 0);
      const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);

      const totalReceivables = customers.reduce((sum, c) => {
        const due = c.invoices.filter((i) => i.documentType === "SALE").reduce((s, i) => s + Math.max(i.total - i.paidAmount, 0), 0);
        return sum + due;
      }, 0);

      return {
        salesTotal,
        purchaseTotal,
        expenseTotal,
        netEstimatedProfit: salesTotal - purchaseTotal - expenseTotal,
        totalReceivables,
        totalCustomers: customers.length,
        totalCatalogItems: items.length,
      };
    }

    case "get_outstanding_receivables": {
      const minAmount = args.minAmount ?? 0;
      const customers = await db.customer.findMany({
        where: { organizationId: org.id },
        include: {
          invoices: {
            where: { documentType: "SALE", status: { not: "CANCELLED" } },
          },
        },
      });

      const debtors = customers
        .map((c) => {
          const balance = c.invoices.reduce((s, i) => s + Math.max(i.total - i.paidAmount, 0), 0);
          return {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            balance,
            unpaidInvoicesCount: c.invoices.filter((i) => i.total > i.paidAmount).length,
          };
        })
        .filter((c) => c.balance >= minAmount && c.balance > 0)
        .sort((a, b) => b.balance - a.balance);

      const totalDue = debtors.reduce((s, d) => s + d.balance, 0);

      return {
        debtorsCount: debtors.length,
        totalDue,
        debtors,
      };
    }

    case "get_inventory_alerts": {
      const items = await db.item.findMany({
        where: { organizationId: org.id, itemType: "PRODUCT" },
      });

      const lowStock = items.filter((i) => i.stockQty <= i.minStock || i.stockQty <= 10);
      const outOfStock = items.filter((i) => i.stockQty <= 0);

      return {
        totalProducts: items.length,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStockItems: lowStock.map((i) => ({
          name: i.name,
          currentStock: i.stockQty,
          minStock: i.minStock,
          unit: i.unit || "PCS",
          unitPrice: i.unitPrice,
        })),
      };
    }

    case "get_sales_analytics": {
      const limit = args.limit || 5;
      const invoices = await db.invoice.findMany({
        where: { organizationId: org.id, documentType: "SALE", status: { not: "CANCELLED" } },
        include: { items: true, customer: { select: { name: true } } },
        orderBy: { issueDate: "desc" },
      });

      const totalRevenue = invoices.reduce((s, i) => s + i.total, 0);

      // Group by item
      const itemMap: Record<string, { qty: number; revenue: number }> = {};
      for (const inv of invoices) {
        for (const item of inv.items) {
          if (!itemMap[item.description]) itemMap[item.description] = { qty: 0, revenue: 0 };
          itemMap[item.description].qty += item.quantity;
          itemMap[item.description].revenue += item.amount;
        }
      }

      const topProducts = Object.entries(itemMap)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

      return {
        totalSalesCount: invoices.length,
        totalRevenue,
        topProducts,
        recentInvoices: invoices.slice(0, 5).map((i) => ({
          number: i.invoiceNumber,
          customer: i.customer.name,
          date: i.issueDate.toISOString().slice(0, 10),
          total: i.total,
          status: i.status,
        })),
      };
    }

    case "get_expenses_summary": {
      const expenses = await db.expense.findMany({
        where: { organizationId: org.id },
        orderBy: { date: "desc" },
      });

      const categoryTotals: Record<string, number> = {};
      for (const exp of expenses) {
        const cat = exp.category || "General";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + exp.amount;
      }

      const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);

      return {
        totalExpenseCount: expenses.length,
        totalExpenseAmount: totalExpense,
        categoryBreakdown: Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount,
          pct: totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) + "%" : "0%",
        })),
      };
    }

    case "get_profit_and_loss_summary": {
      const invoices = await db.invoice.findMany({
        where: { organizationId: org.id, status: { not: "CANCELLED" } },
      });
      const expenses = await db.expense.findMany({ where: { organizationId: org.id } });

      const sales = invoices.filter((i) => i.documentType === "SALE").reduce((s, i) => s + i.total, 0);
      const purchases = invoices.filter((i) => i.documentType === "PURCHASE").reduce((s, i) => s + i.total, 0);
      const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

      const grossProfit = sales - purchases;
      const netProfit = grossProfit - totalExpenses;
      const margin = sales > 0 ? ((netProfit / sales) * 100).toFixed(1) : "0";

      return {
        grossSales: sales,
        purchaseCost: purchases,
        operatingExpenses: totalExpenses,
        grossProfit,
        netProfit,
        netMarginPercentage: `${margin}%`,
        isProfitable: netProfit >= 0,
      };
    }

    case "create_draft_invoice": {
      const customer = await db.customer.findFirst({
        where: { organizationId: org.id, name: { contains: args.customerName } },
      });

      if (!customer) {
        return { error: `Customer "${args.customerName}" not found. Please create the party first.` };
      }

      const count = await db.invoice.count({ where: { organizationId: org.id, documentType: "SALE" } });
      const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
      const amount = args.quantity * args.unitPrice;

      const invoice = await db.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          invoiceNumber,
          documentType: "SALE",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "DRAFT",
          companyName: org.name,
          subtotal: amount,
          total: amount,
          paidAmount: 0,
          items: {
            create: [
              {
                description: args.itemName,
                quantity: args.quantity,
                unitPrice: args.unitPrice,
                amount,
              },
            ],
          },
        },
      });

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: customer.name,
        total: invoice.total,
        actionHref: `/invoices`,
        message: `Draft invoice ${invoice.invoiceNumber} created for ${customer.name} for ₹${amount.toLocaleString("en-IN")}.`,
      };
    }

    case "prepare_whatsapp_reminder": {
      const customer = await db.customer.findFirst({
        where: { organizationId: org.id, name: { contains: args.customerName } },
        include: { invoices: { where: { documentType: "SALE", status: { not: "CANCELLED" } } } },
      });

      if (!customer) return { error: `Customer "${args.customerName}" not found.` };

      const dueInvoices = customer.invoices.filter((i) => i.total > i.paidAmount);
      const totalDue = dueInvoices.reduce((s, i) => s + (i.total - i.paidAmount), 0);

      const text = encodeURIComponent(
        `Dear ${customer.name}, you have a pending payment of ₹${totalDue.toLocaleString("en-IN")} for invoice ${dueInvoices[0]?.invoiceNumber || ""}. Kindly settle at your earliest. Thank you, ${org.name}.`
      );

      const phone = customer.phone ? customer.phone.replace(/\D/g, "") : "";
      const whatsappUrl = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;

      return {
        customerName: customer.name,
        phone: customer.phone || "N/A",
        totalDue,
        whatsappUrl,
        message: `Prepared payment reminder for ${customer.name} (₹${totalDue.toLocaleString("en-IN")}).`,
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
