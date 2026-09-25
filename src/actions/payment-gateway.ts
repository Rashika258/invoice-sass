"use server";

import { PaymentGatewayService, type CreateOrderParams } from "@/services/payment-gateway-service";
import { StripeService } from "@/services/stripe-service";
import type { StripeCheckoutSessionOptions } from "@/lib/stripe";

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

export async function createOrderAction(params: CreateOrderParams) {
  try {
    return await PaymentGatewayService.createOrder(params);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create payment order",
    };
  }
}

export async function createStripeCheckoutAction(options: StripeCheckoutSessionOptions) {
  try {
    const session = await StripeService.createCheckoutSession(options);
    return {
      success: true,
      sessionId: session.id,
      url: session.url,
      isMock: session.isMock,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to create Stripe checkout session",
    };
  }
}

export async function verifyPaymentAction(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  planName: string;
  tenure: string;
  amount: number;
}) {
  try {
    return await PaymentGatewayService.verifyAndProcessPayment(params);
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Verification failed",
    };
  }
}

export async function getPaymentSettingsAction(): Promise<GatewaySettings> {
  return inMemoryGatewaySettings;
}

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

export async function getInvoicePaymentLinkAction(invoiceId: string, amount: number, customerName: string) {
  return PaymentGatewayService.generateUpiLink(invoiceId, amount, inMemoryGatewaySettings.upiId);
}
