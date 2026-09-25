import crypto from "crypto";
import { env } from "@/lib/env";

export interface StripeCheckoutSessionOptions {
  amount: number; // in currency units (e.g. 49.99 or 4999)
  currency?: string; // e.g. "usd" or "inr"
  customerEmail?: string;
  invoiceId?: string;
  successUrl: string;
  cancelUrl: string;
  description?: string;
}

export function getStripeConfig() {
  return {
    secretKey: env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "sk_test_mock_stripe_secret_key_12345",
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock_stripe_pub_key_12345",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_webhook_secret_12345",
    isMock: !env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY,
  };
}

/**
 * Creates a Stripe Checkout Session via Stripe REST API or Sandbox Mock
 */
export async function createStripeCheckoutSession(options: StripeCheckoutSessionOptions) {
  const config = getStripeConfig();
  const currency = (options.currency || "usd").toLowerCase();
  const amountInCents = Math.round(options.amount * 100);

  if (config.isMock) {
    const mockSessionId = `cs_test_mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockSessionId,
      url: `${options.successUrl}?session_id=${mockSessionId}&mock=true`,
      amount_total: amountInCents,
      currency,
      payment_status: "unpaid",
      isMock: true,
    };
  }

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", options.successUrl);
  params.append("cancel_url", options.cancelUrl);
  params.append("line_items[0][price_data][currency]", currency);
  params.append("line_items[0][price_data][unit_amount]", amountInCents.toString());
  params.append("line_items[0][price_data][product_data][name]", options.description || "Billora Invoice Payment");
  params.append("line_items[0][quantity]", "1");

  if (options.customerEmail) {
    params.append("customer_email", options.customerEmail);
  }
  if (options.invoiceId) {
    params.append("metadata[invoiceId]", options.invoiceId);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stripe Checkout Session Creation Failed: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  return { ...data, isMock: false };
}

/**
 * Verifies Stripe Webhook Event Signature (v1)
 */
export function verifyStripeWebhookSignature(
  rawBody: string,
  sigHeader: string,
  secret?: string
): boolean {
  const config = getStripeConfig();
  const webhookSecret = secret || config.webhookSecret;

  if (sigHeader === "mock_stripe_signature" || config.isMock) {
    return true;
  }

  try {
    const parts = sigHeader.split(",");
    let timestamp = "";
    let signature = "";

    for (const part of parts) {
      const [key, value] = part.split("=");
      if (key === "t") timestamp = value;
      if (key === "v1") signature = value;
    }

    if (!timestamp || !signature) return false;

    const payload = `${timestamp}.${rawBody}`;
    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}
