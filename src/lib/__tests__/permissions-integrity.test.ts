import { describe, expect, it } from "vitest";
import { hasPermission, PERMISSIONS, type PermissionKey } from "../permissions";
import { calculateDocumentTotals } from "../invoice-utils";

describe("RBAC Permissions Integrity", () => {
  it("should allow ADMIN full access to all system permissions", () => {
    Object.keys(PERMISSIONS).forEach((permissionKey) => {
      expect(hasPermission("ADMIN", permissionKey as PermissionKey)).toBe(true);
    });
  });

  it("should restrict WAREHOUSE_CLERK from mutating accounting and deleting invoices", () => {
    expect(hasPermission("WAREHOUSE_CLERK", "INVOICE_DELETE")).toBe(false);
    expect(hasPermission("WAREHOUSE_CLERK", "ACCOUNTING_MUTATE")).toBe(false);
    expect(hasPermission("WAREHOUSE_CLERK", "INVENTORY_READ")).toBe(true);
  });

  it("should allow CA_AUDITOR to read financial ledgers but prevent deleting invoices", () => {
    expect(hasPermission("CA_AUDITOR", "ACCOUNTING_READ")).toBe(true);
    expect(hasPermission("CA_AUDITOR", "INVOICE_DELETE")).toBe(false);
  });

  it("should allow SALES_OPERATOR to create invoices but block system settings management", () => {
    expect(hasPermission("SALES_OPERATOR", "INVOICE_CREATE")).toBe(true);
    expect(hasPermission("SALES_OPERATOR", "SETTINGS_MANAGE")).toBe(false);
  });
});

describe("Financial Total & Double-Entry Integrity", () => {
  it("should accurately compute intra-state totals with CGST & SGST split", () => {
    const items = [
      { quantity: 2, unitPrice: 500, gstRate: 18 },
    ];
    const result = calculateDocumentTotals(items, 0, false);
    expect(result.subtotal).toBe(1000);
    expect(result.taxAmount).toBe(180);
    expect(result.cgstAmount).toBe(90);
    expect(result.sgstAmount).toBe(90);
    expect(result.igstAmount).toBe(0);
    expect(result.total).toBe(1180);
  });

  it("should accurately compute inter-state totals with IGST", () => {
    const items = [
      { quantity: 1, unitPrice: 1000, gstRate: 18 },
    ];
    const result = calculateDocumentTotals(items, 100, true);
    expect(result.subtotal).toBe(1000);
    expect(result.taxAmount).toBe(162); // (1000 - 100) * 18% = 162
    expect(result.cgstAmount).toBe(0);
    expect(result.sgstAmount).toBe(0);
    expect(result.igstAmount).toBe(162);
    expect(result.total).toBe(1062);
  });
});
