import { describe, expect, it } from "vitest";
import { InvoiceService } from "@/services/invoice-service";
import { AccountingService } from "@/services/accounting-service";
import { PayrollService } from "@/services/payroll-service";

describe("Domain Services Architecture", () => {
  it("should expose static list and listPaginated methods on InvoiceService", () => {
    expect(typeof InvoiceService.list).toBe("function");
    expect(typeof InvoiceService.listPaginated).toBe("function");
    expect(typeof InvoiceService.create).toBe("function");
  });

  it("should expose static createVoucher and createLedger methods on AccountingService", () => {
    expect(typeof AccountingService.createVoucher).toBe("function");
    expect(typeof AccountingService.createLedger).toBe("function");
    expect(typeof AccountingService.ensureSystemLedgers).toBe("function");
  });

  it("should expose static generateForMonth method on PayrollService", () => {
    expect(typeof PayrollService.generateForMonth).toBe("function");
    expect(typeof PayrollService.listRecords).toBe("function");
  });
});
