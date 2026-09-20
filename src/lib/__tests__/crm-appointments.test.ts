import { describe, expect, it } from "vitest";

export function calculateCustomerKhataBalance(
  invoices: Array<{ total: number; status: string }>,
  paymentsIn: Array<{ amount: number }>
) {
  const totalBilled = invoices
    .filter((inv) => inv.status !== "CANCELLED")
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPaid = paymentsIn.reduce((sum, p) => sum + p.amount, 0);
  const netBalanceDue = Math.max(totalBilled - totalPaid, 0);

  return {
    totalBilled,
    totalPaid,
    netBalanceDue,
    status: netBalanceDue === 0 ? "SETTLED" : "DUE",
  };
}

describe("CRM & Salon Appointments Suite", () => {
  describe("calculateCustomerKhataBalance", () => {
    it("calculates total billed, total paid, and net balance due for customer Khata ledger", () => {
      const invoices = [
        { total: 5000, status: "SENT" },
        { total: 3000, status: "PAID" },
        { total: 2000, status: "CANCELLED" },
      ];

      const paymentsIn = [{ amount: 3000 }, { amount: 2000 }];

      const summary = calculateCustomerKhataBalance(invoices, paymentsIn);
      expect(summary.totalBilled).toBe(8000); // 5000 + 3000 (cancelled excluded)
      expect(summary.totalPaid).toBe(5000);
      expect(summary.netBalanceDue).toBe(3000); // 8000 - 5000
      expect(summary.status).toBe("DUE");
    });

    it("returns SETTLED status when total paid matches total billed", () => {
      const invoices = [{ total: 4500, status: "PAID" }];
      const paymentsIn = [{ amount: 4500 }];

      const summary = calculateCustomerKhataBalance(invoices, paymentsIn);
      expect(summary.netBalanceDue).toBe(0);
      expect(summary.status).toBe("SETTLED");
    });
  });
});
