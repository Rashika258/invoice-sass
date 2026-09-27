import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";
import { AppError } from "@/lib/errors";

export interface ArAgingBucket {
  current: number; // Not yet overdue
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
}

export interface CustomerAgingSummary {
  customerId: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  aging: ArAgingBucket;
}

/**
 * Compute Accounts Receivable (AR) Aging across all customers
 */
export async function getAccountsReceivableAging(
  organizationId: string,
): Promise<CustomerAgingSummary[]> {
  const customers = await db.customer.findMany({
    where: { organizationId },
    include: {
      invoices: {
        where: { status: { in: ["SENT", "OVERDUE"] } },
      },
    },
  });

  const now = new Date();

  return customers.map((c) => {
    const bucket: ArAgingBucket = {
      current: 0,
      days1To30: 0,
      days31To60: 0,
      days61To90: 0,
      days90Plus: 0,
      totalOutstanding: 0,
    };

    for (const inv of c.invoices) {
      const balance = Math.max(0, inv.total - inv.paidAmount);
      if (balance <= 0) continue;

      bucket.totalOutstanding += balance;

      const dueDate = new Date(inv.dueDate);
      if (dueDate >= now) {
        bucket.current += balance;
      } else {
        const dpd = differenceInDays(now, dueDate);
        if (dpd <= 30) bucket.days1To30 += balance;
        else if (dpd <= 60) bucket.days31To60 += balance;
        else if (dpd <= 90) bucket.days61To90 += balance;
        else bucket.days90Plus += balance;
      }
    }

    // Round balances
    bucket.current = Math.round(bucket.current * 100) / 100;
    bucket.days1To30 = Math.round(bucket.days1To30 * 100) / 100;
    bucket.days31To60 = Math.round(bucket.days31To60 * 100) / 100;
    bucket.days61To90 = Math.round(bucket.days61To90 * 100) / 100;
    bucket.days90Plus = Math.round(bucket.days90Plus * 100) / 100;
    bucket.totalOutstanding = Math.round(bucket.totalOutstanding * 100) / 100;

    return {
      customerId: c.id,
      customerName: c.name,
      phone: c.phone,
      email: c.email,
      aging: bucket,
    };
  });
}

/**
 * Validate whether a new document total violates customer credit limit
 */
export async function validateCustomerCreditLimit(
  organizationId: string,
  customerId: string,
  newAmount: number,
  creditLimitThreshold: number = 500000, // Default ₹5,00,000 credit limit
): Promise<{ allowed: boolean; currentOutstanding: number; projectedTotal: number }> {
  const agingList = await getAccountsReceivableAging(organizationId);
  const found = agingList.find((a) => a.customerId === customerId);
  const currentOutstanding = found ? found.aging.totalOutstanding : 0;
  const projectedTotal = currentOutstanding + newAmount;

  if (projectedTotal > creditLimitThreshold) {
    throw new AppError(
      "FORBIDDEN",
      `Credit Limit Violation: Outstanding (₹${currentOutstanding}) + new sale (₹${newAmount}) exceeds credit threshold ₹${creditLimitThreshold}. Manager override required.`,
      403,
    );
  }

  return { allowed: true, currentOutstanding, projectedTotal };
}
