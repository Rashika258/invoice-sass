"use server";

import {
  createPaymentOrder,
  generateUpiPayUrl,
  getPaymentGatewayConfig,
  verifyPaymentSignature,
} from "@/lib/payment-gateway";

export interface GatewaySettings {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  webhookSecret: string;
  upiId: string;
  autoReconcile: boolean;
  sandboxMode: boolean;
}

let inMemoryGatewaySettings: GatewaySettings = {
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
  upiId: "9448673532@okaxis",
  autoReconcile: true,
  sandboxMode: true,
};

/**
 * Server Action: Creates a Payment Order for Subscription Upgrade or Invoice
 */
export async function createOrderAction(params: {
  amount: number;
  receiptId: string;
  type: "SUBSCRIPTION" | "INVOICE";
  description: string;
}) {
  try {
    const order = await createPaymentOrder({
      amount: params.amount,
      receipt: params.receiptId,
      notes: {
        type: params.type,
        description: params.description,
      },
    });

    const config = getPaymentGatewayConfig();

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      isMock: order.isMock,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create payment order",
    };
  }
}

/**
 * Server Action: Verifies Payment HMAC Signature and returns License / Receipt Data
 */
export async function verifyPaymentAction(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  planName: string;
  tenure: string;
  amount: number;
}) {
  try {
    const isValid = verifyPaymentSignature(
      params.orderId,
      params.paymentId,
      params.signature
    );

    if (!isValid) {
      return {
        success: false,
        error: "Payment verification failed: Invalid HMAC signature.",
      };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `BIL-${params.planName.toUpperCase()}-2026-${randomSuffix}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const expiresDate = new Date();
    expiresDate.setFullYear(
      expiresDate.getFullYear() + (params.tenure.includes("3") ? 3 : 1)
    );

    return {
      success: true,
      licenseKey,
      expiresAt: expiresDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      txnId: `TXN_${params.paymentId}_${Date.now().toString().slice(-6)}`,
      activatedOn: new Date().toISOString(),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Verification failed",
    };
  }
}

/**
 * Server Action: Fetches Payment Gateway Settings
 */
export async function getPaymentSettingsAction(): Promise<GatewaySettings> {
  return inMemoryGatewaySettings;
}

/**
 * Server Action: Saves Payment Gateway Settings
 */
export async function savePaymentSettingsAction(settings: Partial<GatewaySettings>) {
  inMemoryGatewaySettings = {
    ...inMemoryGatewaySettings,
    ...settings,
  };

  return {
    success: true,
    settings: inMemoryGatewaySettings,
  };
}

/**
 * Server Action: Generates dynamic Invoice Payment Link and UPI QR Code data
 */
export async function getInvoicePaymentLinkAction(invoiceId: string, amount: number, customerName: string) {
  const upiUrl = generateUpiPayUrl({
    vpa: inMemoryGatewaySettings.upiId,
    name: "Billora Business OS",
    amount,
    note: `Inv_${invoiceId}`,
    txnRef: invoiceId,
  });

  return {
    success: true,
    upiUrl,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      upiUrl
    )}&margin=6`,
    payLink: `/api/v1/payments/pay-invoice/${invoiceId}`,
  };
}
