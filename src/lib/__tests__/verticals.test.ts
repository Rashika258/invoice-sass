import { describe, it, expect } from "vitest";
import {
  VERTICAL_CONFIGS,
  buildRealEstateRentLine,
  buildRealEstateMaintenanceLine,
  buildEducationCourseFeeLine,
} from "@/lib/verticals";

describe("Business Verticals Module Tests", () => {
  it("should contain metadata configuration for Real Estate vertical", () => {
    const config = VERTICAL_CONFIGS.REAL_ESTATE;
    expect(config).toBeDefined();
    expect(config.label).toContain("Real Estate");
    expect(config.defaultInvoicePrefix).toBe("RNT");
    expect(config.features.enableLeaseTracking).toBe(true);
  });

  it("should contain metadata configuration for Education vertical", () => {
    const config = VERTICAL_CONFIGS.EDUCATION;
    expect(config).toBeDefined();
    expect(config.label).toContain("Education");
    expect(config.defaultInvoicePrefix).toBe("FEE");
    expect(config.features.enableStudentBatches).toBe(true);
  });

  it("should correctly build Real Estate monthly rent invoice line item", () => {
    const line = buildRealEstateRentLine("Flat 302, Prestige Towers", 25000, "October 2026");
    expect(line.description).toContain("Flat 302, Prestige Towers");
    expect(line.unitPrice).toBe(25000);
    expect(line.hsn).toBe("997211");
    expect(line.quantity).toBe(1);
    expect(line.gstRate).toBe(0);
  });

  it("should correctly build Real Estate common maintenance fee line item", () => {
    const line = buildRealEstateMaintenanceLine("Shop #14, Apex Mall", 4500);
    expect(line.description).toContain("Shop #14, Apex Mall");
    expect(line.unitPrice).toBe(4500);
    expect(line.gstRate).toBe(18);
  });

  it("should correctly build Education course fee installment line item", () => {
    const line = buildEducationCourseFeeLine("IIT-JEE Advanced 1-Year Batch", 2, 18000);
    expect(line.description).toContain("IIT-JEE Advanced");
    expect(line.unitPrice).toBe(18000);
    expect(line.hsn).toBe("999293");
    expect(line.gstRate).toBe(0);
  });
});
