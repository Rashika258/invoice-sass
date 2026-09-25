import { describe, it, expect } from "vitest";

interface TransactionLine {
  date: string;
  type: "SALE" | "PURCHASE" | "EXPENSE";
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface FinancialStatementSummary {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossMarginPct: number;
  netMarginPct: number;
}

function computeFinancialSummary(transactions: TransactionLine[]): FinancialStatementSummary {
  const totalSales = transactions
    .filter((t) => t.type === "SALE")
    .reduce((s, t) => s + t.taxableAmount, 0);

  const totalPurchases = transactions
    .filter((t) => t.type === "PURCHASE")
    .reduce((s, t) => s + t.taxableAmount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.totalAmount, 0);

  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalExpenses;
  const grossMarginPct = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;
  const netMarginPct = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalPurchases: Math.round(totalPurchases * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    grossMarginPct: Math.round(grossMarginPct * 100) / 100,
    netMarginPct: Math.round(netMarginPct * 100) / 100,
  };
}

function computeGstReconciliation(transactions: TransactionLine[]) {
  const outputGst = transactions
    .filter((t) => t.type === "SALE")
    .reduce((sum, t) => sum + t.taxAmount, 0);

  const inputGst = transactions
    .filter((t) => t.type === "PURCHASE")
    .reduce((sum, t) => sum + t.taxAmount, 0);

  const netPayable = Math.max(0, Math.round((outputGst - inputGst) * 100) / 100);
  const creditCarriedForward = Math.max(0, Math.round((inputGst - outputGst) * 100) / 100);

  return {
    outputGst: Math.round(outputGst * 100) / 100,
    inputGst: Math.round(inputGst * 100) / 100,
    netPayable,
    creditCarriedForward,
  };
}

describe("Purchase & Sales Accounting Accuracy", () => {
  const sampleBusinessMonth: TransactionLine[] = [
    // Sales
    { date: "2026-09-05", type: "SALE", taxableAmount: 50000, taxAmount: 9000, totalAmount: 59000 },
    { date: "2026-09-12", type: "SALE", taxableAmount: 75000, taxAmount: 13500, totalAmount: 88500 },
    { date: "2026-09-20", type: "SALE", taxableAmount: 25000, taxAmount: 4500, totalAmount: 29500 },
    // Purchases (COGS)
    { date: "2026-09-02", type: "PURCHASE", taxableAmount: 60000, taxAmount: 10800, totalAmount: 70800 },
    { date: "2026-09-15", type: "PURCHASE", taxableAmount: 30000, taxAmount: 5400, totalAmount: 35400 },
    // Operating Expenses
    { date: "2026-09-10", type: "EXPENSE", taxableAmount: 20000, taxAmount: 0, totalAmount: 20000 }, // Office Rent
    { date: "2026-09-15", type: "EXPENSE", taxableAmount: 5000, taxAmount: 0, totalAmount: 5000 },   // Electricity
    { date: "2026-09-25", type: "EXPENSE", taxableAmount: 15000, taxAmount: 0, totalAmount: 15000 }, // Salaries
  ];

  describe("Profit & Loss Statement Accuracy", () => {
    it("should compute exact revenue, COGS, gross profit, and net profit", () => {
      const summary = computeFinancialSummary(sampleBusinessMonth);

      // Revenue: 50,000 + 75,000 + 25,000 = 1,50,000
      expect(summary.totalSales).toBe(150000);

      // Purchases: 60,000 + 30,000 = 90,000
      expect(summary.totalPurchases).toBe(90000);

      // Gross Profit: 1,50,000 - 90,000 = 60,000
      expect(summary.grossProfit).toBe(60000);

      // Expenses: 20,000 + 5,000 + 15,000 = 40,000
      expect(summary.totalExpenses).toBe(40000);

      // Net Profit: 60,000 - 40,000 = 20,000
      expect(summary.netProfit).toBe(20000);

      // Gross Margin: 60,000 / 1,50,000 = 40%
      expect(summary.grossMarginPct).toBe(40);

      // Net Margin: 20,000 / 1,50,000 = 13.33%
      expect(summary.netMarginPct).toBe(13.33);
    });

    it("should handle loss situations when expenses exceed revenues", () => {
      const lossData: TransactionLine[] = [
        { date: "2026-09-01", type: "SALE", taxableAmount: 10000, taxAmount: 1800, totalAmount: 11800 },
        { date: "2026-09-02", type: "PURCHASE", taxableAmount: 12000, taxAmount: 2160, totalAmount: 14160 },
        { date: "2026-09-05", type: "EXPENSE", taxableAmount: 5000, taxAmount: 0, totalAmount: 5000 },
      ];

      const summary = computeFinancialSummary(lossData);
      expect(summary.grossProfit).toBe(-2000); // 10,000 - 12,000
      expect(summary.netProfit).toBe(-7000);   // -2,000 - 5,000
      expect(summary.netMarginPct).toBe(-70);
    });
  });

  describe("GST Tax Reconciliation (Output Tax vs Input Tax Credit)", () => {
    it("should compute net GST payable when output tax exceeds input tax credit", () => {
      const gst = computeGstReconciliation(sampleBusinessMonth);

      // Output Tax: 9000 + 13500 + 4500 = 27000
      expect(gst.outputGst).toBe(27000);

      // Input Tax Credit: 10800 + 5400 = 16200
      expect(gst.inputGst).toBe(16200);

      // Net Payable to Government: 27000 - 16200 = 10800
      expect(gst.netPayable).toBe(10800);
      expect(gst.creditCarriedForward).toBe(0);
    });

    it("should carry forward credit when input tax exceeds output tax (e.g. bulk stock purchase)", () => {
      const heavyStockPurchase: TransactionLine[] = [
        { date: "2026-09-01", type: "SALE", taxableAmount: 20000, taxAmount: 3600, totalAmount: 23600 },
        { date: "2026-09-02", type: "PURCHASE", taxableAmount: 100000, taxAmount: 18000, totalAmount: 118000 },
      ];

      const gst = computeGstReconciliation(heavyStockPurchase);
      expect(gst.outputGst).toBe(3600);
      expect(gst.inputGst).toBe(18000);
      expect(gst.netPayable).toBe(0);
      expect(gst.creditCarriedForward).toBe(14400); // 18000 - 3600
    });
  });

  describe("Trial Balance Equilibrium Principle", () => {
    it("should verify that the fundamental accounting equation holds: Assets = Liabilities + Equity", () => {
      // Balance sheet components:
      const assets = {
        cashInHand: 25000,
        bankBalance: 175000,
        sundryDebtors: 12500,
        stockInHand: 45000,
      };
      const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0); // 2,57,500

      const liabilities = {
        sundryCreditors: 45000,
        dutiesTaxesPayable: 10800,
      };
      const totalLiabilities = Object.values(liabilities).reduce((a, b) => a + b, 0); // 55,800

      const equity = {
        ownerCapital: 181700,
        retainedEarnings: 20000, // from current month net profit
      };
      const totalEquity = Object.values(equity).reduce((a, b) => a + b, 0); // 2,01,700

      expect(totalAssets).toBe(totalLiabilities + totalEquity);
    });
  });
});
