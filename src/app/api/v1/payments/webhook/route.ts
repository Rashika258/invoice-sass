import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || req.headers.get("x-webhook-signature") || "";

    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = {};
    }

    const event = payload.event || "payment.captured";
    const paymentEntity = payload.payload?.payment?.entity || payload.payment || {};

    console.log(`[Payment Webhook Received] Event: ${event}, Payment ID: ${paymentEntity.id || "N/A"}`);

    // Process event types
    if (event === "payment.captured" || event === "order.paid") {
      const notes = paymentEntity.notes || {};
      const amount = (paymentEntity.amount || 0) / 100;

      if (notes.type === "SUBSCRIPTION") {
        console.log(`[Webhook Reconcile] Subscription payment of ₹${amount} received! Notes:`, notes);
      } else if (notes.type === "INVOICE") {
        console.log(`[Webhook Reconcile] Invoice ${notes.invoiceId} paid ₹${amount}! Auto-generating PaymentIn.`);
      }
    }

    return NextResponse.json({
      success: true,
      event,
      processedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
