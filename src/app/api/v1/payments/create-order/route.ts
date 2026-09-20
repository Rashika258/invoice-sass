import { NextResponse } from "next/server";
import { createPaymentOrder, getPaymentGatewayConfig } from "@/lib/payment-gateway";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be greater than 0." },
        { status: 400 }
      );
    }

    const receiptId = receipt || `rcpt_${Date.now()}`;
    const order = await createPaymentOrder({
      amount: Number(amount),
      receipt: receiptId,
      notes: notes || {},
    });

    const config = getPaymentGatewayConfig();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      isMock: order.isMock,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
