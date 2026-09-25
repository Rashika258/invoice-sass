import { describe, it, expect } from "vitest";

// Simulation helpers for ledger & voucher accounting rules
interface JournalEntryMock {
  ledgerId: string;
  type: "DR" | "CR";
  amount: number;
}

interface VoucherValidationResult {
  valid: boolean;
  drTotal: number;
  crTotal: number;
  difference: number;
  error?: string;
}

function validateDoubleEntryVoucher(entries: JournalEntryMock[]): VoucherValidationResult {
  if (!entries || entries.length < 2) {
    return {
      valid: false,
      drTotal: 0,
      crTotal: 0,
      difference: 0,
      error: "A voucher requires at least one Debit and one Credit entry",
    };
  }

  const drTotal = Math.round(entries.filter((e) => e.type === "DR").reduce((s, e) => s + e.amount, 0) * 100) / 100;
  const crTotal = Math.round(entries.filter((e) => e.type === "CR").reduce((s, e) => s + e.amount, 0) * 100) / 100;
  const diff = Math.abs(drTotal - crTotal);

  if (diff > 0.001) {
    return {
      valid: false,
      drTotal,
      crTotal,
      difference: diff,
      error: `Voucher is unbalanced. Total Debit (${drTotal}) does not match Total Credit (${crTotal}). Difference: ${diff}`,
    };
  }

  return {
    valid: true,
    drTotal,
    crTotal,
    difference: 0,
  };
}

function calculateInvoicePaymentStatus(total: number, paidAmount: number): {
  status: "DRAFT" | "SENT" | "PAID" | "PARTIAL" | "OVERPAID";
  balanceDue: number;
} {
  const roundedTotal = Math.round(total * 100) / 100;
  const roundedPaid = Math.round(paidAmount * 100) / 100;
  const balanceDue = Math.max(0, Math.round((roundedTotal - roundedPaid) * 100) / 100);

  if (roundedPaid === 0) {
    return { status: "SENT", balanceDue };
  } else if (roundedPaid >= roundedTotal) {
    return { status: roundedPaid > roundedTotal ? "OVERPAID" : "PAID", balanceDue: 0 };
  } else {
    return { status: "PARTIAL", balanceDue };
  }
}

describe("Payment & Ledger Accounting Flows", () => {
  describe("Invoice Settlement & Payment Status Flow", () => {
    it("should mark invoice as SENT with full balance due when no payment received", () => {
      const result = calculateInvoicePaymentStatus(5000, 0);
      expect(result.status).toBe("SENT");
      expect(result.balanceDue).toBe(5000);
    });

    it("should mark invoice as PAID and 0 balance due on full payment", () => {
      const result = calculateInvoicePaymentStatus(5000, 5000);
      expect(result.status).toBe("PAID");
      expect(result.balanceDue).toBe(0);
    });

    it("should mark invoice as PARTIAL and compute remaining balance on partial installment", () => {
      const result = calculateInvoicePaymentStatus(5000, 2000);
      expect(result.status).toBe("PARTIAL");
      expect(result.balanceDue).toBe(3000);
    });

    it("should detect overpayment and prevent negative balance due", () => {
      const result = calculateInvoicePaymentStatus(5000, 5500);
      expect(result.status).toBe("OVERPAID");
      expect(result.balanceDue).toBe(0);
    });
  });

  describe("Tally Double-Entry Journal Voucher Integrity", () => {
    it("should validate a balanced Contra voucher (Cash to Bank deposit)", () => {
      const contraVoucher: JournalEntryMock[] = [
        { ledgerId: "bank-hdfc", type: "DR", amount: 15000 },  // Bank receives funds (Asset DR)
        { ledgerId: "cash-in-hand", type: "CR", amount: 15000 }, // Cash decreases (Asset CR)
      ];

      const validation = validateDoubleEntryVoucher(contraVoucher);
      expect(validation.valid).toBe(true);
      expect(validation.drTotal).toBe(15000);
      expect(validation.crTotal).toBe(15000);
      expect(validation.difference).toBe(0);
    });

    it("should reject an unbalanced voucher where Debits do not equal Credits", () => {
      const unbalancedVoucher: JournalEntryMock[] = [
        { ledgerId: "office-rent", type: "DR", amount: 25000 },
        { ledgerId: "bank-hdfc", type: "CR", amount: 24000 }, // Off by 1,000
      ];

      const validation = validateDoubleEntryVoucher(unbalancedVoucher);
      expect(validation.valid).toBe(false);
      expect(validation.drTotal).toBe(25000);
      expect(validation.crTotal).toBe(24000);
      expect(validation.difference).toBe(1000);
      expect(validation.error).toContain("Voucher is unbalanced");
    });

    it("should reject a single-sided journal entry voucher", () => {
      const singleEntry: JournalEntryMock[] = [
        { ledgerId: "sales-account", type: "CR", amount: 10000 },
      ];

      const validation = validateDoubleEntryVoucher(singleEntry);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain("requires at least one Debit and one Credit");
    });

    it("should validate complex multi-line compound vouchers (e.g. Sales with CGST & SGST)", () => {
      const compoundSalesVoucher: JournalEntryMock[] = [
        { ledgerId: "customer-apex", type: "DR", amount: 11800 },  // Debtor owes full bill
        { ledgerId: "sales-gst-18", type: "CR", amount: 10000 },   // Base revenue
        { ledgerId: "output-cgst", type: "CR", amount: 900 },      // 9% CGST liability
        { ledgerId: "output-sgst", type: "CR", amount: 900 },      // 9% SGST liability
      ];

      const validation = validateDoubleEntryVoucher(compoundSalesVoucher);
      expect(validation.valid).toBe(true);
      expect(validation.drTotal).toBe(11800);
      expect(validation.crTotal).toBe(11800);
    });

    it("should validate vendor purchase with Input Tax Credit (ITC)", () => {
      const purchaseVoucher: JournalEntryMock[] = [
        { ledgerId: "purchase-account", type: "DR", amount: 50000 }, // Cost of Goods Sold (DR)
        { ledgerId: "input-cgst", type: "DR", amount: 4500 },        // ITC Asset (DR)
        { ledgerId: "input-sgst", type: "DR", amount: 4500 },        // ITC Asset (DR)
        { ledgerId: "vendor-medplus", type: "CR", amount: 59000 },    // Creditor Liability (CR)
      ];

      const validation = validateDoubleEntryVoucher(purchaseVoucher);
      expect(validation.valid).toBe(true);
      expect(validation.drTotal).toBe(59000);
      expect(validation.crTotal).toBe(59000);
    });
  });

  describe("Customer Ledger Balance Reconciliation", () => {
    it("should calculate correct outstanding balance through consecutive debit and credit transactions", () => {
      let customerBalance = 12500; // Opening balance: Customer owes 12,500

      // Transaction 1: New Sale Invoice issued (+5,900)
      customerBalance += 5900;
      expect(customerBalance).toBe(18400);

      // Transaction 2: Customer pays via UPI (-10,000)
      customerBalance -= 10000;
      expect(customerBalance).toBe(8400);

      // Transaction 3: Credit note issued for damaged stock return (-900)
      customerBalance -= 900;
      expect(customerBalance).toBe(7500);

      // Transaction 4: Customer settles remaining balance (-7,500)
      customerBalance -= 7500;
      expect(customerBalance).toBe(0);
    });
  });
});
