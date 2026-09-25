import { NextRequest, NextResponse } from "next/server";
import { StripeService } from "@/services/stripe-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature") || "mock_stripe_signature";

    const result = await StripeService.handleWebhook(rawBody, signature);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
