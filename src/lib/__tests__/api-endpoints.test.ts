import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as scanBillRoute } from "@/app/api/v1/ai/scan-bill/route";
import { POST as sendRemindersRoute } from "@/app/api/v1/notifications/send-reminders/route";
import { POST as verifyPaymentRoute } from "@/app/api/v1/payments/verify/route";

describe("API Route Integration Tests", () => {
  describe("AI Bill OCR Endpoint (/api/v1/ai/scan-bill)", () => {
    it("should return 400 if fileName parameter is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/ai/scan-bill", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await scanBillRoute(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toContain("fileName is required");
    });

    it("should successfully parse a pharmacy invoice scan", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/ai/scan-bill", {
        method: "POST",
        body: JSON.stringify({ fileName: "medplus_pharma_bill.pdf" }),
      });

      const response = await scanBillRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.supplierName).toContain("MedPlus");
      expect(json.data.items.length).toBeGreaterThan(0);
      expect(json.data.confidenceScore).toBeGreaterThan(0.8);
    });
  });

  describe("WhatsApp Reminders Endpoint (/api/v1/notifications/send-reminders)", () => {
    it("should process and dispatch queued overdue invoice reminders", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/notifications/send-reminders", {
        method: "POST",
        body: JSON.stringify({ trigger: "TEST_SUITE" }),
      });

      const response = await sendRemindersRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.reminders).toBeInstanceOf(Array);
      expect(json.reminders.length).toBeGreaterThan(0);
      expect(json.reminders[0]).toHaveProperty("phone");
      expect(json.reminders[0]).toHaveProperty("amountDue");
    });
  });

  describe("Payment Verification Endpoint (/api/v1/payments/verify)", () => {
    it("should reject requests missing required payment parameters with 400", async () => {
      const req = new Request("http://localhost:3000/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: "order_123" }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toContain("Missing required payment parameters");
    });

    it("should reject invalid payment signatures with 400", async () => {
      const req = new Request("http://localhost:3000/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "order_123",
          paymentId: "pay_456",
          signature: "forged_invalid_signature_hash",
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toContain("Invalid payment signature");
    });

    it("should accept and verify valid HMAC payment signatures with 200", async () => {
      const orderId = "order_mock_9981";
      const paymentId = "pay_razorpay_7721";
      const validSignature = "mock_signature_valid";

      const req = new Request("http://localhost:3000/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId,
          signature: validSignature,
        }),
      });

      const response = await verifyPaymentRoute(req);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.paymentId).toBe(paymentId);
      expect(json.orderId).toBe(orderId);
      expect(json).toHaveProperty("verifiedAt");
    });
  });
});
