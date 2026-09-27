import { NextResponse } from "next/server";
import { createPaymentOrder, getPaymentGatewayConfig } from "@/lib/payment-gateway";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { amount, receipt, notes } = body;

    // If an invoiceId is supplied in notes, enforce server-calculated outstanding balance
    if (notes?.invoiceId) {
      const invoice = await db.invoice.findUnique({ where: { id: notes.invoiceId } });
      if (!invoice) {
        return NextResponse.json({ error: "Associated invoice not found." }, { status: 404 });
      }
      const dueAmount = Math.max(0, Math.round((invoice.total - invoice.paidAmount) * 100) / 100);
      if (dueAmount <= 0) {
        return NextResponse.json({ error: "Invoice is already fully paid." }, { status: 400 });
      }
      // Override client amount with authoritative server due amount if unspecified or invalid
      if (!amount || amount > dueAmount) {
        amount = dueAmount;
      }
    }

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
