import { describe, expect, it, vi } from "vitest";
import { assertPermission, hasPermission } from "@/lib/permissions";
import { shouldAffectStock } from "@/lib/stock";

describe("RBAC Permissions Engine & State Locks", () => {
  it("should grant all permissions to ADMIN role", () => {
    expect(hasPermission("ADMIN", "sales:create")).toBe(true);
    expect(hasPermission("ADMIN", "sales:reopen")).toBe(true);
    expect(hasPermission("ADMIN", "inventory:adjust")).toBe(true);
    expect(hasPermission("ADMIN", "accounting:close_period")).toBe(true);
  });

  it("should restrict dangerous actions for WAREHOUSE_CLERK and SALES_OPERATOR", () => {
    expect(hasPermission("WAREHOUSE_CLERK", "inventory:adjust")).toBe(true);
    expect(hasPermission("WAREHOUSE_CLERK", "sales:reopen")).toBe(false);
    expect(hasPermission("WAREHOUSE_CLERK", "accounting:post_voucher")).toBe(false);

    expect(hasPermission("SALES_OPERATOR", "sales:create")).toBe(true);
    expect(hasPermission("SALES_OPERATOR", "sales:reopen")).toBe(false);
    expect(hasPermission("SALES_OPERATOR", "inventory:adjust")).toBe(false);
  });

  it("should support legacy permission aliases transparently", () => {
    expect(hasPermission("ADMIN", "INVOICE_READ")).toBe(true);
    expect(hasPermission("ADMIN", "INVOICE_REOPEN")).toBe(true);
    expect(hasPermission("WAREHOUSE_CLERK", "INVOICE_REOPEN")).toBe(false);
  });

  it("should throw AppError when assertPermission fails", () => {
    expect(() => assertPermission("SALES_OPERATOR", "sales:reopen")).toThrow(
      /Permission denied: Role 'SALES_OPERATOR' lacks mandatory permission 'sales:reopen'/,
    );
  });

  it("should enforce stock movement status rules correctly", () => {
    expect(shouldAffectStock("DRAFT")).toBe(false);
    expect(shouldAffectStock("CANCELLED")).toBe(false);
    expect(shouldAffectStock("SENT")).toBe(true);
    expect(shouldAffectStock("PAID")).toBe(true);
  });
});
