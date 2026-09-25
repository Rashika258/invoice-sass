import { db } from "@/lib/db";

export interface VerificationIssue {
  entity: "Invoice" | "JournalVoucher" | "Item" | "Customer" | "Payment";
  entityId: string;
  rule: string;
  expected: number | string;
  actual: number | string;
  difference?: number;
  severity: "WARNING" | "ERROR";
  recommendedAction: string;
}

export interface VerificationReport {
  organizationId: string;
  timestamp: string;
  totalChecksPassed: number;
  totalIssuesFound: number;
  status: "PASSED" | "ISSUES_DETECTED";
  issues: VerificationIssue[];
}

export async function verifyOrganizationInvariants(
  organizationId: string
): Promise<VerificationReport> {
  const issues: VerificationIssue[] = [];
  let checksPassed = 0;

  // 1. Verify Invoice Totals (total = subtotal + taxAmount - discount)
  const invoices = await db.invoice.findMany({
    where: { organizationId },
    select: {
      id: true,
      invoiceNumber: true,
      subtotal: true,
      taxAmount: true,
      discount: true,
      total: true,
      paidAmount: true,
      status: true,
    },
  });

  for (const inv of invoices) {
    const expectedTotal = Math.round((inv.subtotal + inv.taxAmount - inv.discount) * 100) / 100;
    const actualTotal = Math.round(inv.total * 100) / 100;

    if (Math.abs(expectedTotal - actualTotal) > 0.05) {
      issues.push({
        entity: "Invoice",
        entityId: inv.id,
        rule: "Invoice Total = Subtotal + Tax - Discount",
        expected: expectedTotal,
        actual: actualTotal,
        difference: Math.abs(expectedTotal - actualTotal),
        severity: "ERROR",
        recommendedAction: `Recalculate document totals for Invoice #${inv.invoiceNumber}`,
      });
    } else {
      checksPassed++;
    }

    if (inv.paidAmount > inv.total + 0.01) {
      issues.push({
        entity: "Invoice",
        entityId: inv.id,
        rule: "Paid Amount <= Invoice Total",
        expected: inv.total,
        actual: inv.paidAmount,
        difference: inv.paidAmount - inv.total,
        severity: "ERROR",
        recommendedAction: `Reconcile payments for Invoice #${inv.invoiceNumber} to prevent overpayment`,
      });
    } else {
      checksPassed++;
    }
  }

  // 2. Verify Accounting Journal Vouchers (Total Debit DR = Total Credit CR)
  const vouchers = await db.journalVoucher.findMany({
    where: { organizationId },
    include: { entries: true },
  });

  for (const voucher of vouchers) {
    const totalDebit = voucher.entries
      .filter((e) => e.type === "DR")
      .reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalCredit = voucher.entries
      .filter((e) => e.type === "CR")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      issues.push({
        entity: "JournalVoucher",
        entityId: voucher.id,
        rule: "Total Debit = Total Credit",
        expected: totalDebit,
        actual: totalCredit,
        difference: Math.abs(totalDebit - totalCredit),
        severity: "ERROR",
        recommendedAction: `Balance journal voucher #${voucher.voucherNumber}`,
      });
    } else {
      checksPassed++;
    }
  }

  // 3. Verify Unique Invoice Numbers per Organization
  const invNumberCounts = new Map<string, number>();
  for (const inv of invoices) {
    const count = (invNumberCounts.get(inv.invoiceNumber) || 0) + 1;
    invNumberCounts.set(inv.invoiceNumber, count);
  }

  for (const [invNum, count] of invNumberCounts.entries()) {
    if (count > 1) {
      issues.push({
        entity: "Invoice",
        entityId: invNum,
        rule: "Unique Invoice Number per Organization",
        expected: 1,
        actual: count,
        severity: "ERROR",
        recommendedAction: `Renumber duplicate invoice series for #${invNum}`,
      });
    } else {
      checksPassed++;
    }
  }

  // 4. Verify Stock Quantities non-negative
  const items = await db.item.findMany({
    where: { organizationId, itemType: "PRODUCT" },
    select: { id: true, name: true, stockQty: true, minStock: true },
  });

  for (const item of items) {
    if (item.stockQty < 0) {
      issues.push({
        entity: "Item",
        entityId: item.id,
        rule: "Non-Negative Stock Quantity",
        expected: 0,
        actual: item.stockQty,
        severity: "WARNING",
        recommendedAction: `Perform stock adjustment for product '${item.name}'`,
      });
    } else {
      checksPassed++;
    }
  }

  return {
    organizationId,
    timestamp: new Date().toISOString(),
    totalChecksPassed: checksPassed,
    totalIssuesFound: issues.length,
    status: issues.length === 0 ? "PASSED" : "ISSUES_DETECTED",
    issues,
  };
}
