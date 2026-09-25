import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  buildIdempotencyKey,
  executeIdempotentOperation,
  getIdempotentResult,
  setIdempotentResult,
  clearIdempotencyCache,
} from "@/lib/idempotency";
import {
  validateInvoiceStatusTransition,
  canEditInvoice,
  canDeleteInvoice,
} from "@/lib/state-transitions";
import { AppError, createErrorResponse } from "@/lib/errors";
import { verifyOrganizationInvariants } from "@/lib/data-verification";

describe("Shared Reliability Layer & Data Integrity Engine", () => {
  beforeEach(() => {
    clearIdempotencyCache();
  });

  describe("1. Idempotency Engine", () => {
    it("should generate deterministic idempotency keys", () => {
      const key = buildIdempotencyKey("org_123", "create_invoice", "req_abc_999");
      expect(key).toBe("org_123:CREATE_INVOICE:req_abc_999");
    });

    it("should cache and return previous operation result without re-executing", async () => {
      const key = buildIdempotencyKey("org_101", "payment_checkout", "client_req_001");
      let executionCount = 0;

      const operation = async () => {
        executionCount++;
        return { invoiceId: "inv_99", status: "PAID", amount: 2500 };
      };

      const first = await executeIdempotentOperation(key, operation);
      expect(first.isCached).toBe(false);
      expect(first.result.invoiceId).toBe("inv_99");
      expect(executionCount).toBe(1);

      // Re-send duplicate request with same idempotency key
      const second = await executeIdempotentOperation(key, operation);
      expect(second.isCached).toBe(true);
      expect(second.result.invoiceId).toBe("inv_99");
      expect(executionCount).toBe(1); // Crucial: operation was NOT re-executed!
    });
  });

  describe("2. Explicit State-Transition Rules", () => {
    it("should allow valid transitions: DRAFT -> SENT -> PAID", () => {
      expect(validateInvoiceStatusTransition("DRAFT", "SENT").valid).toBe(true);
      expect(validateInvoiceStatusTransition("SENT", "PAID").valid).toBe(true);
      expect(validateInvoiceStatusTransition("SENT", "OVERDUE").valid).toBe(true);
      expect(validateInvoiceStatusTransition("OVERDUE", "PAID").valid).toBe(true);
    });

    it("should reject invalid transitions: PAID -> DRAFT, CANCELLED -> SENT", () => {
      const invalidPaid = validateInvoiceStatusTransition("PAID", "DRAFT");
      expect(invalidPaid.valid).toBe(false);
      expect(invalidPaid.reason).toContain("Cannot transition invoice status from PAID to DRAFT");

      const invalidCancelled = validateInvoiceStatusTransition("CANCELLED", "SENT");
      expect(invalidCancelled.valid).toBe(false);
    });

    it("should block direct editing and deleting of PAID invoices", () => {
      const paidInvoice = { status: "PAID" as const, paidAmount: 1500 };
      expect(canEditInvoice(paidInvoice).allowed).toBe(false);
      expect(canDeleteInvoice(paidInvoice).allowed).toBe(false);

      const draftInvoice = { status: "DRAFT" as const, paidAmount: 0 };
      expect(canEditInvoice(draftInvoice).allowed).toBe(true);
      expect(canDeleteInvoice(draftInvoice).allowed).toBe(true);
    });
  });

  describe("3. Standardized Error Handling", () => {
    it("should produce clean structured JSON error response from AppError", () => {
      const err = new AppError("CONFLICT", "Invoice status transition not allowed", 409);
      const { statusCode, response } = createErrorResponse(err, "req_xyz_777");

      expect(statusCode).toBe(409);
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("CONFLICT");
      expect(response.error.message).toBe("Invoice status transition not allowed");
      expect(response.error.requestId).toBe("req_xyz_777");
    });
  });

  describe("4. Data Verification Invariants Engine", () => {
    it("should audit organization invoices and pass when totals and payments match math rules", async () => {
      const org = await db.organization.create({
        data: { name: `Audit Org ${Date.now()}` },
      });

      const customer = await db.customer.create({
        data: { organizationId: org.id, name: "Audit Customer" },
      });

      // Valid Invoice: subtotal=1000, taxAmount=180, discount=0 -> total=1180
      await db.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          invoiceNumber: `AUDIT-INV-${Date.now()}`,
          documentType: "SALE",
          issueDate: new Date(),
          dueDate: new Date(),
          status: "SENT",
          subtotal: 1000,
          taxAmount: 180,
          discount: 0,
          total: 1180,
          paidAmount: 500,
          companyName: org.name,
        },
      });

      const report = await verifyOrganizationInvariants(org.id);
      expect(report.organizationId).toBe(org.id);
      expect(report.totalIssuesFound).toBe(0);
      expect(report.status).toBe("PASSED");
    });

    it("should detect math inconsistency and flag error when totals do not balance", async () => {
      const org = await db.organization.create({
        data: { name: `Corrupt Audit Org ${Date.now()}` },
      });

      const customer = await db.customer.create({
        data: { organizationId: org.id, name: "Audit Customer 2" },
      });

      // Corrupted Invoice: subtotal=1000, taxAmount=180, discount=0 -> total=9999 (Inconsistent!)
      const corruptInv = await db.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          invoiceNumber: `BAD-INV-${Date.now()}`,
          documentType: "SALE",
          issueDate: new Date(),
          dueDate: new Date(),
          status: "SENT",
          subtotal: 1000,
          taxAmount: 180,
          discount: 0,
          total: 9999, // Broken math!
          paidAmount: 0,
          companyName: org.name,
        },
      });

      const report = await verifyOrganizationInvariants(org.id);
      expect(report.totalIssuesFound).toBeGreaterThan(0);
      expect(report.status).toBe("ISSUES_DETECTED");

      const mathIssue = report.issues.find((i) => i.entityId === corruptInv.id);
      expect(mathIssue).toBeDefined();
      expect(mathIssue?.rule).toBe("Invoice Total = Subtotal + Tax - Discount");
    });
  });
});
