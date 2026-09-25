import { describe, expect, it } from "vitest";
import { calculateDocumentTotals } from "../invoice-utils";
import { PERMISSIONS, hasPermission } from "../permissions";
import { logger } from "../logger";

describe("Core Business Workflows Smoke Test", () => {
  it("Workflow 1: Invoice calculation & GST tax split", () => {
    const items = [
      { quantity: 5, unitPrice: 200, gstRate: 18 }, // subtotal 1000, tax 180
      { quantity: 2, unitPrice: 500, gstRate: 12 }, // subtotal 1000, tax 120
    ];
    const totals = calculateDocumentTotals(items, 0, false);
    expect(totals.subtotal).toBe(2000);
    expect(totals.taxAmount).toBe(300);
    expect(totals.cgstAmount).toBe(150);
    expect(totals.sgstAmount).toBe(150);
    expect(totals.total).toBe(2300);
  });

  it("Workflow 2: RBAC permissions gate verification", () => {
    expect(hasPermission("ADMIN", "INVOICE_CREATE")).toBe(true);
    expect(hasPermission("WAREHOUSE_CLERK", "INVOICE_DELETE")).toBe(false);
    expect(hasPermission("CA_AUDITOR", "ACCOUNTING_READ")).toBe(true);
  });

  it("Workflow 3: Structured logging engine execution", () => {
    expect(() => {
      logger.info("Smoke test execution started", { testId: "smoke-1" });
      logger.audit("CREATE", "Invoice", "inv_smoke_123", "org_123", { amount: 2300 });
    }).not.toThrow();
  });
});
