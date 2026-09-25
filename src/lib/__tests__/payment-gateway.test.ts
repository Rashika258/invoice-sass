import { describe, expect, it } from "vitest";
import {
  generateUpiPayUrl,
  getPaymentGatewayConfig,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../payment-gateway";

describe("Payment Gateway Utility Suite", () => {
  describe("getPaymentGatewayConfig", () => {
    it("returns active configuration with key ID and sandbox mode flag", () => {
      const config = getPaymentGatewayConfig();
      expect(config).toBeDefined();
      expect(typeof config.keyId).toBe("string");
      expect(typeof config.keySecret).toBe("string");
      expect(typeof config.sandboxMode).toBe("boolean");
    });
  });

  describe("verifyPaymentSignature", () => {
    it("validates mock sandbox signatures", () => {
      const isValid = verifyPaymentSignature(
        "order_mock_12345",
        "pay_mock_9999",
        "mock_signature_valid"
      );
      expect(isValid).toBe(true);
    });

    it("verifies HMAC-SHA256 signature against orderId and paymentId", () => {
      const crypto = require("crypto");
      const secret = "test_secret_key_849201";
      const orderId = "order_N1920491";
      const paymentId = "pay_P9482019";
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      const isValid = verifyPaymentSignature(orderId, paymentId, expectedSignature, secret);
      expect(isValid).toBe(true);
    });

    it("rejects invalid or tampered payment signatures", () => {
      const isValid = verifyPaymentSignature(
        "order_123",
        "pay_456",
        "tampered_invalid_signature_string",
        "test_secret"
      );
      expect(isValid).toBe(false);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("validates mock webhook signatures", () => {
      const isValid = verifyWebhookSignature("{}", "mock_webhook_signature");
      expect(isValid).toBe(true);
    });

    it("verifies webhook body HMAC-SHA256 signature", () => {
      const crypto = require("crypto");
      const secret = "whsec_test_7483";
      const body = JSON.stringify({ event: "payment.captured", amount: 479900 });
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const isValid = verifyWebhookSignature(body, expectedSignature, secret);
      expect(isValid).toBe(true);
    });
  });

  describe("generateUpiPayUrl", () => {
    it("formats a valid UPI Intent URL with VPA, Amount, and Note", () => {
      const upiUrl = generateUpiPayUrl({
        vpa: "9448673532@okaxis",
        name: "Billora Software",
        amount: 4799,
        note: "Gold_License_Activation",
        txnRef: "TXN9849201",
      });

      expect(upiUrl).toContain("upi://pay?");
      expect(decodeURIComponent(upiUrl)).toContain("pa=9448673532@okaxis");
      expect(upiUrl).toContain("am=4799.00");

      expect(upiUrl).toContain("cu=INR");
      expect(upiUrl).toContain("tn=Gold_License_Activation");
      expect(upiUrl).toContain("tr=TXN9849201");
    });
  });
});
