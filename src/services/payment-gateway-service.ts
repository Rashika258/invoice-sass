import { db } from "@/db";
import { recordAuditLog } from "@/lib/audit";
import {
  createPaymentOrder,
  generateUpiPayUrl,
  getPaymentGatewayConfig,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "@/lib/payment-gateway";

export interface CreateOrderParams {
  amount: number;
  receiptId: string;
  type: "SUBSCRIPTION" | "INVOICE";
  description: string;
}

export class PaymentGatewayService {
  static getConfig() {
    return getPaymentGatewayConfig();
  }

  static async createOrder(params: CreateOrderParams) {
    const order = await createPaymentOrder({
      amount: params.amount,
      receipt: params.receiptId,
      notes: {
        type: params.type,
        description: params.description,
      },
    });

    const config = this.getConfig();

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.keyId,
      isMock: order.isMock,
    };
  }

  static async verifyAndProcessPayment(params: {
    orderId: string;
    paymentId: string;
    signature: string;
    planName: string;
    tenure: string;
    amount: number;
    organizationId?: string;
  }) {
    const isValid = verifyPaymentSignature(params.orderId, params.paymentId, params.signature);

    if (!isValid) {
      throw new Error("Payment verification failed: Invalid HMAC signature");
    }

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const licenseKey = `BIL-${params.planName.toUpperCase()}-2026-${randomSuffix}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const expiresDate = new Date();
    expiresDate.setFullYear(expiresDate.getFullYear() + (params.tenure.includes("3") ? 3 : 1));

    if (params.organizationId) {
      await recordAuditLog({
        organizationId: params.organizationId,
        action: "CREATE",
        entity: "Payment",
        entityId: params.paymentId,
        changes: { amount: params.amount, orderId: params.orderId, planName: params.planName },
      });
    }

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
  }

  static async handleWebhook(rawBody: string, signature: string) {
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new Error("Invalid Razorpay Webhook Signature");
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const amount = paymentEntity.amount / 100;
      const invoiceId = paymentEntity.notes?.invoiceId;
      const paymentRef = paymentEntity.id || orderId;

      if (!paymentRef) {
        throw new Error("Missing payment transaction reference in webhook");
      }

      // 1. IDEMPOTENCY / REPLAY PROTECTION CHECK
      const existingPayment = await db.payment.findFirst({
        where: { reference: paymentRef },
      });
      if (existingPayment) {
        return { received: true, idempotent: true, message: "Payment event already processed" };
      }

      if (invoiceId) {
        const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          const bankAccount = await db.bankAccount.findFirst({ where: { organizationId: invoice.organizationId } });
          const newPaidAmount = Math.round((invoice.paidAmount + amount) * 100) / 100;
          const isFullyPaid = newPaidAmount >= Math.round(invoice.total * 100) / 100;
          const targetStatus: "PAID" | "SENT" = isFullyPaid ? "PAID" : "SENT";

          await db.$transaction(async (tx) => {
            await tx.invoice.update({
              where: { id: invoiceId },
              data: { paidAmount: newPaidAmount, status: targetStatus },
            });

            if (bankAccount) {
              const paymentCount = await tx.payment.count({ where: { organizationId: invoice.organizationId } });
              const uniqueNum = `PAY-${Date.now().toString().slice(-6)}-${String(paymentCount + 1).padStart(3, "0")}`;

              await tx.payment.create({
                data: {
                  organizationId: invoice.organizationId,
                  number: uniqueNum,
                  direction: "IN",
                  partyId: invoice.customerId,
                  invoiceId: invoice.id,
                  bankAccountId: bankAccount.id,
                  amount,
                  date: new Date(),
                  mode: "UPI",
                  reference: paymentRef,
                },
              });
            }
          });

          await recordAuditLog({
            organizationId: invoice.organizationId,
            action: "UPDATE",
            entity: "Invoice",
            entityId: invoiceId,
            changes: { status: targetStatus, paymentId: paymentRef, amount, totalPaid: newPaidAmount },
          });
        }
      }
    }

    return { received: true };
  }

  static generateUpiLink(invoiceId: string, amount: number, vpa = "9448673532@okaxis") {
    const upiUrl = generateUpiPayUrl({
      vpa,
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
}
