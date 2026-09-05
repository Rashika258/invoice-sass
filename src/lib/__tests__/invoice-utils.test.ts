import { describe, it, expect } from "vitest";
import {
  roundMoney,
  splitGst,
  calculateDocumentTotals,
  formatCurrency,
  statesMatch,
} from "../invoice-utils";

describe("invoice-utils", () => {
  describe("roundMoney", () => {
    it("rounds numbers to 2 decimal places", () => {
      expect(roundMoney(10.1234)).toBe(10.12);
      expect(roundMoney(10.1256)).toBe(10.13);
      expect(roundMoney(10)).toBe(10);
    });
  });

  describe("splitGst", () => {
    it("splits tax into CGST and SGST for Intra-State sales", () => {
      const result = splitGst(1000, 18, false);
      expect(result.taxAmount).toBe(180);
      expect(result.cgstAmount).toBe(90);
      expect(result.sgstAmount).toBe(90);
      expect(result.igstAmount).toBe(0);
    });

    it("assigns full tax to IGST for Inter-State sales", () => {
      const result = splitGst(1000, 18, true);
      expect(result.taxAmount).toBe(180);
      expect(result.cgstAmount).toBe(0);
      expect(result.sgstAmount).toBe(0);
      expect(result.igstAmount).toBe(180);
    });
  });

  describe("calculateDocumentTotals", () => {
    it("calculates totals accurately with multi-item GST and discount", () => {
      const items = [
        { quantity: 2, unitPrice: 500, gstRate: 18 }, // 1000 base
        { quantity: 1, unitPrice: 1000, gstRate: 12 }, // 1000 base
      ]; // total subtotal 2000

      const result = calculateDocumentTotals(items, 200, false);
      expect(result.subtotal).toBe(2000);
      expect(result.discount).toBe(200);
      // Taxable base = 1800 (900 for 18% item, 900 for 12% item)
      // Tax 18% on 900 = 162, Tax 12% on 900 = 108 -> Total Tax = 270
      expect(result.taxAmount).toBe(270);
      expect(result.cgstAmount).toBe(135);
      expect(result.sgstAmount).toBe(135);
      expect(result.total).toBe(2070);
    });
  });

  describe("statesMatch", () => {
    it("compares state names case-insensitively and trims spaces", () => {
      expect(statesMatch("Maharashtra", "maharashtra ")).toBe(true);
      expect(statesMatch("Delhi", "Mumbai")).toBe(false);
      expect(statesMatch(null, undefined)).toBe(true);
    });
  });
});
