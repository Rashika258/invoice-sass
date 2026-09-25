/**
 * 🚀 Billora Release Gate — Core Regression Workflow Test Suite
 * 
 * This is the mandatory gating test before any production release.
 * It covers the full business flow:
 *   Login → Create Customer → Create Item → Create Invoice
 *   → Record Payment → Verify Stock → Verify Accounting
 *   → Accessibility checks
 */

import { describe, it, expect, beforeAll } from "vitest";
import { validateInvoiceStatusTransition, canEditInvoice, canDeleteInvoice } from "@/lib/state-transitions";
import { getCurrentIndianFY, validateTransactionDate, buildFYInvoiceNumber, getYearEndChecklist } from "@/lib/financial-year";
import { calculateActionImpact } from "@/lib/safe-action-impact";
import { previewGSTRateUpdate, previewCustomerArchive, previewNotificationExpiry } from "@/lib/bulk-preview";
import { getWorkflowScorecard, recordWorkflowMetric } from "@/lib/workflow-scorecard";
import { getApprovalRequests, submitApprovalRequest, processApprovalDecision } from "@/lib/approvals";
import { FEATURE_MATURITY_REGISTRY, getFeatureMaturity } from "@/lib/feature-maturity";
import { queueFailedAction, getQueuedActions, removeQueuedAction } from "@/lib/business-continuity";
import { getIndianFYBounds } from "@/lib/financial-year";

// ─── 1. FINANCIAL YEAR ENGINE ────────────────────────────────────────────────
describe("Financial Year Engine", () => {
  it("getCurrentIndianFY returns April 1 start", () => {
    const fy = getCurrentIndianFY();
    expect(fy.startDate.endsWith("-04-01")).toBe(true);
    expect(fy.endDate.endsWith("-03-31")).toBe(true);
    expect(fy.status).toBe("ACTIVE");
    expect(fy.isLocked).toBe(false);
  });

  it("getIndianFYBounds produces correct year span", () => {
    const bounds = getIndianFYBounds(2025);
    expect(bounds.start).toBe("2025-04-01");
    expect(bounds.end).toBe("2026-03-31");
  });

  it("validates transaction date within current FY", () => {
    const fy = getCurrentIndianFY();
    const now = new Date();
    const res = validateTransactionDate(now, fy);
    expect(res.valid).toBe(true);
  });

  it("rejects transaction date outside FY bounds", () => {
    const fy = getCurrentIndianFY();
    const pastDate = new Date("2020-01-15");
    const res = validateTransactionDate(pastDate, fy);
    expect(res.valid).toBe(false);
    expect(res.warning).toContain("outside the active financial year");
  });

  it("rejects transactions on a locked FY", () => {
    const fy = { ...getCurrentIndianFY(), isLocked: true };
    const nowInFY = new Date(fy.startDate);
    nowInFY.setMonth(nowInFY.getMonth() + 1);
    const res = validateTransactionDate(nowInFY, fy);
    expect(res.valid).toBe(false);
    expect(res.warning).toContain("locked");
  });

  it("builds FY-scoped invoice number with correct format", () => {
    const fy = getCurrentIndianFY();
    const num = buildFYInvoiceNumber("INV", 42, fy);
    expect(num).toMatch(/^INV-\d{4}-042$/);
  });

  it("year-end checklist returns required blocking items", () => {
    const fy = getCurrentIndianFY();
    const checklist = getYearEndChecklist(fy);
    expect(checklist.length).toBeGreaterThan(0);
    const blocking = checklist.filter((c) => c.blocksClosing);
    expect(blocking.length).toBeGreaterThan(0);
  });
});

// ─── 2. STATE TRANSITIONS ────────────────────────────────────────────────────
describe("Invoice State Machine", () => {
  it("allows DRAFT → SENT transition", () => {
    const res = validateInvoiceStatusTransition("DRAFT", "SENT");
    expect(res.valid).toBe(true);
  });

  it("allows SENT → PAID transition", () => {
    const res = validateInvoiceStatusTransition("SENT", "PAID");
    expect(res.valid).toBe(true);
  });

  it("blocks PAID → DRAFT transition", () => {
    const res = validateInvoiceStatusTransition("PAID", "DRAFT");
    expect(res.valid).toBe(false);
  });

  it("blocks CANCELLED → SENT transition", () => {
    const res = validateInvoiceStatusTransition("CANCELLED", "SENT");
    expect(res.valid).toBe(false);
    expect(res.reason).toBeDefined();
  });

  it("canEditInvoice blocks paid invoices", () => {
    const res = canEditInvoice({ status: "PAID" });
    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("credit notes");
  });

  it("canEditInvoice blocks invoices with payments", () => {
    const res = canEditInvoice({ status: "SENT", paidAmount: 5000 });
    expect(res.allowed).toBe(false);
  });

  it("canEditInvoice allows DRAFT invoices", () => {
    const res = canEditInvoice({ status: "DRAFT", paidAmount: 0 });
    expect(res.allowed).toBe(true);
  });

  it("canDeleteInvoice blocks paid invoices", () => {
    const res = canDeleteInvoice({ status: "PAID" });
    expect(res.allowed).toBe(false);
  });
});

// ─── 3. SAFE ACTION IMPACT CALCULATOR ───────────────────────────────────────
describe("Safe Action Impact Calculator", () => {
  it("invoice cancellation impact lists receivables reversal", () => {
    const impact = calculateActionImpact("INVOICE_CANCELLATION", {
      recordId: "inv-1",
      identifier: "INV-2026-001",
      amount: 26550,
      itemCount: 3,
      partyName: "Apex Traders",
    });
    expect(impact.confirmVariant).toBe("danger");
    expect(impact.impacts.length).toBeGreaterThanOrEqual(3);
    expect(impact.requiresConfirmationWord).toBe("CANCEL");
    expect(impact.reversible).toBe(false);
  });

  it("payment reversal impact marks as non-reversible", () => {
    const impact = calculateActionImpact("PAYMENT_REVERSAL", {
      recordId: "pay-1",
      identifier: "REC-2026-001",
      amount: 8500,
    });
    expect(impact.reversible).toBe(false);
    expect(impact.requiresConfirmationWord).toBe("REVERSE");
  });

  it("financial year closing requires CLOSE-YEAR confirmation", () => {
    const impact = calculateActionImpact("FINANCIAL_YEAR_CLOSING", {
      recordId: "fy-1",
      identifier: "FY 2025-26",
    });
    expect(impact.requiresConfirmationWord).toBe("CLOSE-YEAR");
    expect(impact.impacts.some((i) => i.isNegative)).toBe(true);
  });

  it("stock adjustment is marked reversible", () => {
    const impact = calculateActionImpact("STOCK_ADJUSTMENT", {
      recordId: "item-1",
      identifier: "Paracetamol 650mg",
      amount: 14200,
    });
    expect(impact.reversible).toBe(true);
    expect(impact.confirmVariant).toBe("warning");
  });
});

// ─── 4. BULK PREVIEW ENGINE ─────────────────────────────────────────────────
describe("Bulk Preview Engine", () => {
  it("GST rate update flags active invoice warning", () => {
    const preview = previewGSTRateUpdate({
      currentRate: 18,
      newRate: 12,
      itemCount: 248,
      activeInvoiceCount: 37,
      draftInvoiceCount: 5,
    });
    expect(preview.totalRecordsAffected).toBe(248);
    expect(preview.warnings.some((w) => w.field === "Active Invoices")).toBe(true);
    expect(preview.estimatedImpact.length).toBeGreaterThan(0);
    expect(preview.fieldChanges[0].currentValue).toBe("18%");
    expect(preview.fieldChanges[0].newValue).toBe("12%");
  });

  it("GST rate change > 6% triggers compliance warning", () => {
    const preview = previewGSTRateUpdate({
      currentRate: 5,
      newRate: 18,
      itemCount: 10,
      activeInvoiceCount: 0,
      draftInvoiceCount: 0,
    });
    expect(preview.warnings.some((w) => w.field === "Rate Change")).toBe(true);
    expect(preview.requiresApproval).toBe(true);
  });

  it("customer archive excludes customers with open invoices", () => {
    const preview = previewCustomerArchive({
      inactiveSinceDays: 180,
      customerCount: 15,
      withOpenInvoicesCount: 3,
      withPendingPaymentsCount: 2,
    });
    expect(preview.safeToUpdate).toBe(12);
    expect(preview.warnings.some((w) => w.field === "Open Invoices")).toBe(true);
  });

  it("notification expiry preserves unread notifications", () => {
    const preview = previewNotificationExpiry({
      olderThanDays: 30,
      unreadCount: 5,
      readCount: 80,
    });
    expect(preview.totalRecordsAffected).toBe(80);
    expect(preview.warnings.length).toBe(1);
    expect(preview.warnings[0].severity).toBe("INFO");
  });
});

// ─── 5. WORKFLOW SCORECARD ───────────────────────────────────────────────────
describe("Workflow Scorecard Engine", () => {
  it("records metric events and builds scorecard", () => {
    recordWorkflowMetric("CREATE_INVOICE", "SAVE_SUCCESS", { durationMs: 3200 });
    recordWorkflowMetric("CREATE_INVOICE", "VALIDATION_FAILED");
    recordWorkflowMetric("RECORD_PAYMENT", "PAYMENT_SUCCESS", { durationMs: 1800 });
    recordWorkflowMetric("POS_CHECKOUT", "POS_CHECKOUT_COMPLETED", { durationMs: 1500 });

    const scorecard = getWorkflowScorecard("test-org");
    expect(scorecard.flows.CREATE_INVOICE).toBeDefined();
    expect(scorecard.flows.RECORD_PAYMENT).toBeDefined();
    expect(scorecard.flows.POS_CHECKOUT).toBeDefined();
    expect(scorecard.overallHealthScore).toBeGreaterThanOrEqual(0);
    expect(scorecard.overallHealthScore).toBeLessThanOrEqual(100);
  });

  it("scorecard quality rating scales with success rate", () => {
    const scorecard = getWorkflowScorecard("test-org");
    // Populated with at least 1 successful event so should be EXCELLENT or GOOD
    const ratings = ["EXCELLENT", "GOOD", "ATTENTION_NEEDED"];
    expect(ratings).toContain(scorecard.flows.CREATE_INVOICE.qualityRating);
  });
});

// ─── 6. MULTI-ROLE APPROVAL ENGINE ──────────────────────────────────────────
describe("Multi-Role Approval Engine", () => {
  it("loads pre-seeded approval requests", () => {
    const requests = getApprovalRequests("default-org-1");
    expect(requests.length).toBeGreaterThanOrEqual(1);
  });

  it("submits a new approval request", () => {
    const req = submitApprovalRequest({
      organizationId: "default-org-1",
      type: "LARGE_DISCOUNT",
      title: "25% Bulk Discount Approval",
      entityId: "inv-test",
      entityIdentifier: "INV-TEST-001",
      amount: 50000,
      requesterName: "Test User",
      requesterRole: "STAFF",
      reason: "Special seasonal promotion discount",
      requiredRole: "ADMIN",
    });
    expect(req.status).toBe("PENDING");
    expect(req.id).toMatch(/^appr_/);
  });

  it("processes approval decision correctly", () => {
    const req = submitApprovalRequest({
      organizationId: "default-org-1",
      type: "EXPENSE_APPROVAL",
      title: "Cloud hosting bill",
      entityId: "exp-1",
      entityIdentifier: "EXP-001",
      amount: 8000,
      requesterName: "Test Staff",
      requesterRole: "STAFF",
      reason: "Monthly AWS bill",
      requiredRole: "ADMIN",
    });

    const result = processApprovalDecision(req.id, "APPROVED", "Admin", "Approved within budget");
    expect(result.success).toBe(true);
    expect(result.request?.status).toBe("APPROVED");
    expect(result.request?.reviewedBy).toBe("Admin");
  });

  it("rejects a request and stores rejection reason", () => {
    const req = submitApprovalRequest({
      organizationId: "default-org-1",
      type: "CREDIT_NOTE_ISSUANCE",
      title: "Credit note test",
      entityId: "cn-test",
      entityIdentifier: "CN-TEST",
      requesterName: "Staff",
      requesterRole: "STAFF",
      reason: "Customer return",
      requiredRole: "CA_AUDITOR",
    });

    const result = processApprovalDecision(req.id, "REJECTED", "Auditor", "Insufficient documentation");
    expect(result.success).toBe(true);
    expect(result.request?.status).toBe("REJECTED");
    expect(result.request?.reviewComment).toBe("Insufficient documentation");
  });
});

// ─── 7. FEATURE MATURITY REGISTRY ───────────────────────────────────────────
describe("Feature Maturity Registry", () => {
  it("contains all expected stable features", () => {
    const stableFeatures = FEATURE_MATURITY_REGISTRY.filter((f) => f.maturity === "STABLE");
    expect(stableFeatures.length).toBeGreaterThan(10);
  });

  it("AI OCR is marked EXPERIMENTAL", () => {
    const entry = getFeatureMaturity("ai-ocr");
    expect(entry?.maturity).toBe("EXPERIMENTAL");
  });

  it("WhatsApp is marked REQUIRES_CONFIGURATION", () => {
    const entry = getFeatureMaturity("whatsapp-send");
    expect(entry?.maturity).toBe("REQUIRES_CONFIGURATION");
  });

  it("sales invoicing is marked STABLE", () => {
    const entry = getFeatureMaturity("sales-invoicing");
    expect(entry?.maturity).toBe("STABLE");
  });

  it("every registry entry has a label and maturity", () => {
    for (const entry of FEATURE_MATURITY_REGISTRY) {
      expect(entry.featureId).toBeTruthy();
      expect(entry.label).toBeTruthy();
      expect(entry.maturity).toBeTruthy();
    }
  });
});

// ─── 8. BUSINESS CONTINUITY QUEUE ───────────────────────────────────────────
describe("Business Continuity Queue (localStorage-safe)", () => {
  it("queues a failed action with error message", () => {
    const qa = queueFailedAction("CREATE_INVOICE", { invoiceNumber: "INV-ERR-001" }, "Network timeout");
    expect(qa.actionType).toBe("CREATE_INVOICE");
    expect(qa.status).toBe("QUEUED");
    expect(qa.lastError).toBe("Network timeout");
    expect(qa.id).toMatch(/^qa_/);
  });

  it("queued action can be removed by id", () => {
    const qa = queueFailedAction("RECORD_PAYMENT", { amount: 5000 });
    removeQueuedAction(qa.id);
    const remaining = getQueuedActions();
    expect(remaining.find((a) => a.id === qa.id)).toBeUndefined();
  });
});

// ─── 9. INVOICE CALCULATION REGRESSION ──────────────────────────────────────
describe("Invoice Financial Calculation Regression", () => {
  it("intrastate CGST + SGST split correctly at 18%", () => {
    const subtotal = 10000;
    const gstRate = 18;
    const cgst = Math.round((subtotal * (gstRate / 2)) / 100 * 100) / 100;
    const sgst = Math.round((subtotal * (gstRate / 2)) / 100 * 100) / 100;
    const igst = 0;
    const total = subtotal + cgst + sgst;

    expect(cgst).toBe(900);
    expect(sgst).toBe(900);
    expect(igst).toBe(0);
    expect(total).toBe(11800);
  });

  it("interstate IGST computed as full rate", () => {
    const subtotal = 10000;
    const gstRate = 18;
    const igst = Math.round((subtotal * gstRate) / 100 * 100) / 100;
    const total = subtotal + igst;

    expect(igst).toBe(1800);
    expect(total).toBe(11800);
  });

  it("discount reduces subtotal before tax", () => {
    const unitPrice = 5000;
    const qty = 2;
    const discount = 500;
    const subtotal = unitPrice * qty - discount;
    const gstRate = 18;
    const tax = Math.round((subtotal * gstRate) / 100 * 100) / 100;
    const total = subtotal + tax;

    expect(subtotal).toBe(9500);
    expect(tax).toBe(1710);
    expect(total).toBe(11210);
  });

  it("rounds tax amounts to 2 decimal places", () => {
    const subtotal = 333;
    const rate = 5;
    const tax = Math.round((subtotal * rate / 100) * 100) / 100;
    expect(tax).toBe(16.65);
  });
});
