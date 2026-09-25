import { describe, it, expect } from "vitest";
import {
  generateSupportId,
  sanitizeDiagnosticText,
  createDiagnosticPayload,
  formatDiagnosticTextForCopy,
} from "../support-diagnostics";

describe("Support Technical Diagnostics", () => {
  it("generates a formatted support reference ID in ERR-2026-XXXX format", () => {
    const id = generateSupportId();
    expect(id).toMatch(/^ERR-\d{4}-\d{4}-[A-Z0-9]{4}$/);
  });

  it("sanitizes PII from diagnostic text including emails, phone numbers, and GSTINs", () => {
    const sensitiveText =
      "Error processing order for customer user@example.com with phone +91 9876543210 and GSTIN 27AABCU9603R1ZM";

    const sanitized = sanitizeDiagnosticText(sensitiveText);

    expect(sanitized).not.toContain("user@example.com");
    expect(sanitized).not.toContain("9876543210");
    expect(sanitized).not.toContain("27AABCU9603R1ZM");
    expect(sanitized).toContain("[EMAIL_REDACTED]");
    expect(sanitized).toContain("[PHONE_REDACTED]");
    expect(sanitized).toContain("[GSTIN_REDACTED]");
  });

  it("creates a complete diagnostic payload for support tickets", () => {
    const err = new Error("Failed to post invoice journal entry for user john@acme.com");
    const payload = createDiagnosticPayload(err, "ACCOUNTANT", "/invoices/new");

    expect(payload.supportId).toMatch(/^ERR-/);
    expect(payload.appVersion).toBe("v1.4.2");
    expect(payload.dbSchemaVersion).toBe("v12");
    expect(payload.userRole).toBe("ACCOUNTANT");
    expect(payload.errorMessage).toContain("[EMAIL_REDACTED]");

    const formattedText = formatDiagnosticTextForCopy(payload);
    expect(formattedText).toContain("=== BILLORA SUPPORT DIAGNOSTIC PAYLOAD ===");
    expect(formattedText).toContain(payload.supportId);
  });
});
