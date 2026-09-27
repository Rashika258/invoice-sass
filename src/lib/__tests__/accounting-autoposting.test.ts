import { describe, it, expect } from "vitest";
import { AccountingService } from "@/services/accounting-service";
import { generatePayslipPdf } from "@/lib/payslip-pdf";
import { suggestEarliestExpiringBatch, filterLowStockAlerts } from "@/lib/inventory-fefo";

describe("ERP Engine Advanced Verification Tests", () => {
  describe("Accounting Double-Entry Governance", () => {
    it("should pass validation when Total Debit equals Total Credit", () => {
      const result = AccountingService.validateVoucherBalance([
        { ledgerId: "led_debtors", type: "DR", amount: 1180 },
        { ledgerId: "led_sales", type: "CR", amount: 1000 },
        { ledgerId: "led_gst", type: "CR", amount: 180 },
      ]);
      expect(result.drTotal).toBe(1180);
      expect(result.crTotal).toBe(1180);
    });

    it("should throw error when Total Debit does not equal Total Credit", () => {
      expect(() =>
        AccountingService.validateVoucherBalance([
          { ledgerId: "led_debtors", type: "DR", amount: 1500 },
          { ledgerId: "led_sales", type: "CR", amount: 1000 },
        ])
      ).toThrow("Voucher out of balance");
    });
  });

  describe("Inventory FEFO & Reorder Engine", () => {
    it("should suggest the earliest expiring batch (FEFO)", () => {
      const batches = [
        { id: "b1", batchNumber: "B202", expiryDate: "2026-12-31", quantity: 50, costPrice: 100 },
        { id: "b2", batchNumber: "B101", expiryDate: "2026-06-30", quantity: 20, costPrice: 100 },
        { id: "b3", batchNumber: "B303", expiryDate: "2027-03-31", quantity: 100, costPrice: 100 },
      ];

      const chosen = suggestEarliestExpiringBatch(batches);
      expect(chosen).toBeDefined();
      expect(chosen?.batchNumber).toBe("B101");
    });

    it("should filter items at or below minimum stock reorder level", () => {
      const items = [
        { id: "item1", name: "Paracetamol 500mg", stockQty: 5, minStock: 20 },
        { id: "item2", name: "Cough Syrup", stockQty: 50, minStock: 10 },
        { id: "item3", name: "Bandages Box", stockQty: 2, minStock: 10 },
      ];

      const alerts = filterLowStockAlerts(items);
      expect(alerts.length).toBe(2);
      expect(alerts[0].name).toBe("Bandages Box"); // Most critical ratio (2/10 < 5/20)
    });
  });

  describe("Payroll Payslip PDF Export", () => {
    it("should generate a valid jsPDF document for employee payslip", () => {
      const doc = generatePayslipPdf({
        employeeName: "Ramesh Kumar",
        position: "Senior Accounts Executive",
        employeeEmail: "ramesh@example.com",
        monthYear: "September 2026",
        baseSalary: 45000,
        overtimePay: 3500,
        grossSalary: 48500,
        pfDeduction: 1800,
        esiDeduction: 363,
        taxDeduction: 2000,
        netSalary: 44337,
      });

      expect(doc).toBeDefined();
      expect(doc.output).toBeDefined();
    });
  });
});
