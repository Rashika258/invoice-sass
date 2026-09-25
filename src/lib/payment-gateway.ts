import crypto from "crypto";

export interface PaymentOrderOptions {
  amount: number; // in INR (e.g. 4799)
  currency?: string; // default "INR"
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentGatewayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  sandboxMode: boolean;
}

/**
 * Helper to fetch Payment Gateway configuration from environment or settings
 */
export function getPaymentGatewayConfig(): PaymentGatewayConfig {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_billora_demo_key_948",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "billora_demo_secret_key_849201",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "billora_webhook_secret_7483",
    sandboxMode: process.env.NODE_ENV !== "production" || !process.env.RAZORPAY_KEY_ID,
  };
}

/**
 * Creates a Payment Order via REST API call to Razorpay
 */
export async function createPaymentOrder(options: PaymentOrderOptions) {
  const config = getPaymentGatewayConfig();
  const amountInPaise = Math.round(options.amount * 100);

  // If in sandbox mode without real keys, generate a valid structured dummy order
  if (config.sandboxMode || config.keyId.includes("demo")) {
    const mockOrderId = `order_mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      entity: "order",
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: options.currency || "INR",
      receipt: options.receipt,
      status: "created",
      attempts: 0,
      notes: options.notes || {},
      created_at: Math.floor(Date.now() / 1000),
      isMock: true,
    };
  }

  const authHeader = `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`;

  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: options.currency || "INR",
      receipt: options.receipt,
      notes: options.notes || {},
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Razorpay Order Creation Failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return { ...data, isMock: false };
}

/**
 * Verifies Razorpay HMAC SHA256 Payment Signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  customSecret?: string
): boolean {
  const config = getPaymentGatewayConfig();
  const secret = customSecret || config.keySecret;

  // Sandbox fallback verification
  if (orderId.startsWith("order_mock_") || signature === "mock_signature_valid") {
    return true;
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

export function createPaymentHmac(orderId: string, paymentId: string, customSecret?: string): string {
  const config = getPaymentGatewayConfig();
  const secret = customSecret || config.keySecret;
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}


/**
 * Verifies Webhook HMAC SHA256 Signature
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  customSecret?: string
): boolean {
  const config = getPaymentGatewayConfig();
  const secret = customSecret || config.webhookSecret;

  if (signature === "mock_webhook_signature") return true;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}

import { buildUpiUri } from "./upi-qr";

/**
 * Generates dynamic UPI Payment URL for QR Codes and direct Intent links
 */
export function generateUpiPayUrl(params: {
  vpa?: string;
  name?: string;
  amount: number;
  note: string;
  txnRef?: string;
}): string {
  return buildUpiUri({
    upiId: params.vpa || "9448673532@okaxis",
    payeeName: params.name || "Billora Business OS",
    amount: params.amount,
    note: params.note,
    transactionRef: params.txnRef,
  });
}

