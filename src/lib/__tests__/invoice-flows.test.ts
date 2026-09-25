import { describe, it, expect } from "vitest";
import {
  calculateDocumentTotals,
  calculateLineAmount,
  calculateInvoiceTotals,
  splitGst,
  roundMoney,
  type GstLineInput,
} from "../invoice-utils";
import { invoiceSchema } from "../validations";

describe("Invoice Creation & Calculation Flows", () => {
  describe("Line Item Calculations", () => {
    it("should calculate exact line amount without precision drift", () => {
      expect(calculateLineAmount(3, 45.5)).toBe(136.5);
      expect(calculateLineAmount(10, 19.99)).toBe(199.9);
      expect(calculateLineAmount(0, 500)).toBe(0);
    });

    it("should round amounts to two decimal places", () => {
      expect(roundMoney(10.555)).toBe(10.56);
      expect(roundMoney(10.554)).toBe(10.55);
      expect(roundMoney(100)).toBe(100);
    });
  });

  describe("GST Tax Splitting (Intrastate vs Interstate)", () => {
    it("should split taxes equally between CGST and SGST for intrastate sales", () => {
      const taxable = 1000;
      const gstRate = 18; // 18% GST = 180 total tax
      const split = splitGst(taxable, gstRate, false);

      expect(split.taxAmount).toBe(180);
      expect(split.cgstAmount).toBe(90);
      expect(split.sgstAmount).toBe(90);
      expect(split.igstAmount).toBe(0);
      expect(split.cgstAmount + split.sgstAmount).toBe(split.taxAmount);
    });

    it("should allocate 100% to IGST and 0% to CGST/SGST for interstate sales", () => {
      const taxable = 2500;
      const gstRate = 12; // 12% GST = 300 total tax
      const split = splitGst(taxable, gstRate, true);

      expect(split.taxAmount).toBe(300);
      expect(split.cgstAmount).toBe(0);
      expect(split.sgstAmount).toBe(0);
      expect(split.igstAmount).toBe(300);
    });

    it("should handle odd paise rounding gracefully between CGST and SGST", () => {
      const taxable = 99.99;
      const gstRate = 18;
      const split = splitGst(taxable, gstRate, false);

      expect(split.cgstAmount + split.sgstAmount).toBe(split.taxAmount);
    });
  });

  describe("Mixed Multi-Rate GST Invoice Document Totals", () => {
    it("should accurately compute totals for a mixed basket of items with different GST slabs", () => {
      const items: GstLineInput[] = [
        { quantity: 2, unitPrice: 320, gstRate: 5 },   // Subtotal 640 @ 5% GST = 32.00
        { quantity: 10, unitPrice: 45, gstRate: 12 },  // Subtotal 450 @ 12% GST = 54.00
        { quantity: 1, unitPrice: 650, gstRate: 18 },  // Subtotal 650 @ 18% GST = 117.00
        { quantity: 1, unitPrice: 1000, gstRate: 28 }, // Subtotal 1000 @ 28% GST = 280.00
      ];

      const totals = calculateDocumentTotals(items, 0, false);

      expect(totals.subtotal).toBe(640 + 450 + 650 + 1000); // 2740.00
      expect(totals.taxAmount).toBe(32 + 54 + 117 + 280);    // 483.00
      expect(totals.cgstAmount).toBe(roundMoney(483 / 2));    // 241.50
      expect(totals.sgstAmount).toBe(roundMoney(483 / 2));    // 241.50
      expect(totals.igstAmount).toBe(0);
      expect(totals.total).toBe(2740 + 483);                 // 3223.00
    });

    it("should apply discounts proportionally before computing tax amounts", () => {
      const items: GstLineInput[] = [
        { quantity: 2, unitPrice: 500, gstRate: 18 }, // Subtotal: 1000
      ];
      const discount = 200; // Taxable base: 800

      const totals = calculateDocumentTotals(items, discount, false);

      expect(totals.subtotal).toBe(1000);
      expect(totals.discount).toBe(200);
      expect(totals.taxAmount).toBe(144); // 18% of 800 = 144
      expect(totals.total).toBe(800 + 144); // 944
    });

    it("should never allow discount to exceed the invoice subtotal", () => {
      const items: GstLineInput[] = [
        { quantity: 1, unitPrice: 100, gstRate: 18 },
      ];
      const excessiveDiscount = 500;

      const totals = calculateDocumentTotals(items, excessiveDiscount, false);

      expect(totals.discount).toBe(100);
      expect(totals.total).toBe(0);
      expect(totals.taxAmount).toBe(0);
    });

    it("should handle zero-tax (exempt/nil-rated) invoices properly", () => {
      const items: GstLineInput[] = [
        { quantity: 5, unitPrice: 200, gstRate: 0 },
      ];

      const totals = calculateDocumentTotals(items, 0, false);

      expect(totals.subtotal).toBe(1000);
      expect(totals.taxAmount).toBe(0);
      expect(totals.total).toBe(1000);
    });
  });

  describe("Invoice Schema Validation Rules", () => {
    it("should validate a properly structured invoice payload", () => {
      const validPayload = {
        customerId: "cust-123",
        invoiceNumber: "INV-2026-001",
        issueDate: "2026-09-25",
        dueDate: "2026-10-25",
        status: "DRAFT" as const,
        taxRate: 18,
        discount: 0,
        items: [
          {
            description: "Industrial Precision Machining",
            quantity: 5,
            unitPrice: 500,
            gstRate: 18,
          },
        ],
        notes: "Thank you for your business",
        terms: "Net 30 days",
      };

      const result = invoiceSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("should fail validation if line items are empty", () => {
      const invalidPayload = {
        customerId: "cust-123",
        invoiceNumber: "INV-2026-001",
        issueDate: "2026-09-25",
        dueDate: "2026-10-25",
        items: [],
      };

      const result = invoiceSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes("items"))).toBe(true);
      }
    });

    it("should reject negative or zero quantities", () => {
      const invalidPayload = {
        customerId: "cust-123",
        invoiceNumber: "INV-2026-001",
        issueDate: "2026-09-25",
        dueDate: "2026-10-25",
        items: [
          {
            description: "Product",
            quantity: -5,
            unitPrice: 100,
            gstRate: 18,
          },
        ],
      };

      const result = invoiceSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("should reject negative unit prices", () => {
      const invalidPayload = {
        customerId: "cust-123",
        invoiceNumber: "INV-2026-001",
        issueDate: "2026-09-25",
        dueDate: "2026-10-25",
        items: [
          {
            description: "Product",
            quantity: 2,
            unitPrice: -50,
            gstRate: 18,
          },
        ],
      };

      const result = invoiceSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
