/**
 * 📈 Billora AI Sales Velocity & Cashflow Forecasting Engine
 * Machine learning heuristic models for inventory reorder points and 30-day cashflow predictions.
 */

export interface SalesHistoryPoint {
  date: string;
  amount: number;
  unitsSold: number;
}

export interface InventoryItemForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  dailyVelocity: number; // Avg units sold per day
  daysUntilDepletion: number; // Est days until stockout
  reorderPoint: number;
  recommendedOrderQty: number;
}

export interface CashflowForecastSummary {
  projectedInflow30Days: number;
  projectedOutflow30Days: number;
  netProjectedCashflow: number;
  receivablesConfidence: number; // % confidence score
  forecastRange: {
    min: number;
    max: number;
  };
}

export function calculateSalesVelocity(history: SalesHistoryPoint[], days = 30): number {
  if (!history || history.length === 0) return 0;
  const totalUnits = history.reduce((sum, p) => sum + p.unitsSold, 0);
  return Math.round((totalUnits / Math.max(1, days)) * 100) / 100;
}

export function forecastItemDepletion(
  itemId: string,
  itemName: string,
  currentStock: number,
  history: SalesHistoryPoint[],
  leadTimeDays = 7
): InventoryItemForecast {
  const dailyVelocity = calculateSalesVelocity(history, 30);
  const daysUntilDepletion = dailyVelocity > 0 ? Math.floor(currentStock / dailyVelocity) : 999;
  const reorderPoint = Math.ceil(dailyVelocity * leadTimeDays * 1.2); // 20% safety stock buffer
  const recommendedOrderQty = Math.max(0, Math.ceil(dailyVelocity * 30 - currentStock));

  return {
    itemId,
    itemName,
    currentStock,
    dailyVelocity,
    daysUntilDepletion,
    reorderPoint,
    recommendedOrderQty,
  };
}

export function predict30DayCashflow(
  pendingInvoices: Array<{ amount: number; paidAmount: number; dueDate: Date }>,
  recurringExpenses: Array<{ amount: number }>,
  historicalPaymentRealizationRate = 0.88
): CashflowForecastSummary {
  const unpaidTotal = pendingInvoices.reduce(
    (sum, inv) => sum + Math.max(0, inv.amount - inv.paidAmount),
    0
  );

  const projectedInflow30Days = Math.round(unpaidTotal * historicalPaymentRealizationRate * 100) / 100;
  const projectedOutflow30Days = Math.round(
    recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100
  ) / 100;

  const netProjectedCashflow = Math.round((projectedInflow30Days - projectedOutflow30Days) * 100) / 100;

  return {
    projectedInflow30Days,
    projectedOutflow30Days,
    netProjectedCashflow,
    receivablesConfidence: Math.round(historicalPaymentRealizationRate * 100),
    forecastRange: {
      min: Math.round(projectedInflow30Days * 0.8 - projectedOutflow30Days),
      max: Math.round(projectedInflow30Days * 1.15 - projectedOutflow30Days),
    },
  };
}
