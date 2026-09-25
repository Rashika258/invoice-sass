import { NextRequest, NextResponse } from "next/server";
import { PaymentGatewayService } from "@/services/payment-gateway-service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "mock_webhook_signature";

    const result = await PaymentGatewayService.handleWebhook(rawBody, signature);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}
