import { describe, expect, it } from "vitest";
import {
  calculateTdsDeduction,
  generateNicEInvoicePayload,
} from "@/lib/tax-compliance";
import { computeWeightedAverageCost } from "@/lib/inventory-valuation";
import { verifyThreeWayMatch } from "@/lib/procurement";
import {
  calculateEpfoContribution,
  calculateEsicContribution,
  calculateLossOfPay,
} from "@/lib/hrms-compliance";
import { generateEscPosReceiptBytes } from "@/lib/escpos-printer";
import { checkRateLimit } from "@/lib/rate-limiter";

describe("Enterprise Scale & Regulatory Compliance Engine", () => {
  describe("Tax Compliance & E-Invoicing", () => {
    it("should generate a valid 64-digit SHA-256 IRN payload", () => {
      const payload = generateNicEInvoicePayload({
        invoiceNumber: "INV-2026-001",
        companyTaxId: "29ABCDE1234F1Z5",
        companyName: "Billora Enterprises",
        issueDate: "2026-09-27",
        total: 11800,
      });

      expect(payload.Irn).toHaveLength(64);
      expect(payload.DocDtls.No).toBe("INV-2026-001");
      expect(payload.ValDtls.TotVal).toBe(11800);
    });

    it("should calculate TDS 194C and 194J deductions correctly", () => {
      const tds194c = calculateTdsDeduction(100000, "194C");
      expect(tds194c.tdsRate).toBe(1);
      expect(tds194c.tdsAmount).toBe(1000);
      expect(tds194c.netPayable).toBe(99000);

      const tds194j = calculateTdsDeduction(50000, "194J");
      expect(tds194j.tdsRate).toBe(10);
      expect(tds194j.tdsAmount).toBe(5000);
      expect(tds194j.netPayable).toBe(45000);
    });
  });

  describe("Inventory Weighted Average Cost (WAC)", () => {
    it("should compute weighted average cost across inventory purchase batches", () => {
      const batches = [
        { quantity: 100, costPrice: 50 },
        { quantity: 200, costPrice: 65 },
      ];
      const wac = computeWeightedAverageCost(batches);
      expect(wac).toBe(60); // (5000 + 13000) / 300 = 60
    });
  });

  describe("Procurement 3-Way Matching", () => {
    it("should pass 3-way match when PO, GRN, and Vendor Bill totals align", () => {
      const result = verifyThreeWayMatch(10000, 10000, 10000);
      expect(result.matched).toBe(true);
      expect(result.variance).toBe(0);
    });

    it("should flag mismatch when variance exceeds 2% threshold", () => {
      const result = verifyThreeWayMatch(10000, 10000, 11500); // 15% discrepancy
      expect(result.matched).toBe(false);
      expect(result.variance).toBe(1500);
    });
  });

  describe("HRMS Statutory Compliance (EPFO, ESIC, LOP)", () => {
    it("should calculate EPFO 12% contribution with ₹15,000 wage ceiling", () => {
      const epfo = calculateEpfoContribution(25000); // Base wage higher than ceiling
      expect(epfo.wageConsidered).toBe(15000);
      expect(epfo.employeePf).toBe(1800); // 12% of 15,000
    });

    it("should calculate ESIC contributions for wages under ₹21,000 limit", () => {
      const esic = calculateEsicContribution(18000);
      expect(esic.applicable).toBe(true);
      expect(esic.employeeEsic).toBe(135); // 0.75% of 18,000 = 135
      expect(esic.employerEsic).toBe(585); // 3.25% of 18,000 = 585

      const nonEligible = calculateEsicContribution(35000);
      expect(nonEligible.applicable).toBe(false);
      expect(nonEligible.employeeEsic).toBe(0);
    });

    it("should calculate Loss of Pay (LOP) salary deductions", () => {
      const lop = calculateLossOfPay(52000, 2, 26);
      expect(lop.perDayRate).toBe(2000);
      expect(lop.lopDeduction).toBe(4000);
      expect(lop.adjustedBasePay).toBe(48000);
    });
  });

  describe("ESC/POS Thermal Receipt Hardware Printing", () => {
    it("should generate Uint8Array byte string containing ESC/POS commands and paper cut", () => {
      const bytes = generateEscPosReceiptBytes({
        companyName: "Billora Retail Store",
        invoiceNumber: "INV-998",
        date: "2026-09-27",
        items: [{ name: "Engine Oil", qty: 2, price: 450, total: 900 }],
        subtotal: 900,
        tax: 162,
        total: 1062,
        paymentMode: "UPI",
      });

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(50);
    });
  });

  describe("API Protection & Rate Limiter", () => {
    it("should allow requests up to rate limit threshold and block excess requests", () => {
      const testId = "test_user_ip_1";
      const limit = 3;

      expect(checkRateLimit(testId, limit, 10000).allowed).toBe(true);
      expect(checkRateLimit(testId, limit, 10000).allowed).toBe(true);
      expect(checkRateLimit(testId, limit, 10000).allowed).toBe(true);

      const blocked = checkRateLimit(testId, limit, 10000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });
  });
});
