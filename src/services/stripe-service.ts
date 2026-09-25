import { db } from "@/db";
import { recordAuditLog } from "@/lib/audit";
import { createStripeCheckoutSession, verifyStripeWebhookSignature, type StripeCheckoutSessionOptions } from "@/lib/stripe";

export class StripeService {
  static async createCheckoutSession(options: StripeCheckoutSessionOptions) {
    return createStripeCheckoutSession(options);
  }

  static async handleWebhook(rawBody: string, signature: string) {
    const isValid = verifyStripeWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new Error("Invalid Stripe Webhook Signature");
    }

    const event = JSON.parse(rawBody);

    if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
      const session = event.data.object;
      const invoiceId = session.metadata?.invoiceId;
      const amount = (session.amount_total || session.amount || 0) / 100;

      if (invoiceId) {
        const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          const bankAccount = await db.bankAccount.findFirst({ where: { organizationId: invoice.organizationId } });
          const paymentCount = await db.payment.count({ where: { organizationId: invoice.organizationId } });

          await db.invoice.update({
            where: { id: invoiceId },
            data: { status: "PAID" },
          });

          if (bankAccount) {
            await db.payment.create({
              data: {
                organizationId: invoice.organizationId,
                number: `PAY-STRIPE-${String(paymentCount + 1).padStart(4, "0")}`,
                direction: "IN",
                partyId: invoice.customerId,
                invoiceId: invoice.id,
                bankAccountId: bankAccount.id,
                amount,
                date: new Date(),
                mode: "CARD",
                reference: session.id,
              },
            });
          }

          await recordAuditLog({
            organizationId: invoice.organizationId,
            action: "UPDATE",
            entity: "Invoice",
            entityId: invoiceId,
            changes: { status: "PAID", stripeSessionId: session.id, amount },
          });
        }
      }
    }

    return { received: true };
  }
}
