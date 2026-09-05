import { db } from "@/lib/db";

const WA_BUSINESS_API = "https://graph.facebook.com/v18.0";
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "100000000000000";
const WA_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendInvoiceViaWhatsApp(
  phoneNumber: string,
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    dueDate: string | Date;
    customerName: string;
  },
): Promise<WhatsAppSendResult> {
  try {
    if (!WA_ACCESS_TOKEN) {
      console.log(`[WhatsApp Simulated Send] Invoice ${invoice.invoiceNumber} to ${phoneNumber}`);
      return { success: true, messageId: `sim_${Date.now()}` };
    }

    const formattedDate =
      typeof invoice.dueDate === "string"
        ? invoice.dueDate
        : invoice.dueDate.toLocaleDateString();

    const res = await fetch(`${WA_BUSINESS_API}/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber.replace(/[^0-9]/g, ""),
        type: "template",
        template: {
          name: "invoice_notification",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: invoice.customerName },
                { type: "text", text: invoice.invoiceNumber },
                { type: "text", text: `₹${invoice.total.toFixed(2)}` },
                { type: "text", text: formattedDate },
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || "WhatsApp API request failed");
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error("[WhatsApp Error]", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to send WhatsApp message",
    };
  }
}

export async function sendPaymentReminderWhatsApp(
  phoneNumber: string,
  customerName: string,
  amountDue: number,
  invoiceNumber: string,
): Promise<WhatsAppSendResult> {
  try {
    if (!WA_ACCESS_TOKEN) {
      console.log(
        `[WhatsApp Reminder Simulated] Reminding ${customerName} (${phoneNumber}) for ₹${amountDue} on ${invoiceNumber}`,
      );
      return { success: true, messageId: `sim_rem_${Date.now()}` };
    }

    const res = await fetch(`${WA_BUSINESS_API}/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber.replace(/[^0-9]/g, ""),
        type: "template",
        template: {
          name: "payment_reminder",
          language: { code: "en_US" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: customerName },
                { type: "text", text: invoiceNumber },
                { type: "text", text: `₹${amountDue.toFixed(2)}` },
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || "WhatsApp Reminder request failed");
    }

    return {
      success: true,
      messageId: data?.messages?.[0]?.id,
    };
  } catch (err: any) {
    console.error("[WhatsApp Reminder Error]", err?.message || err);
    return {
      success: false,
      error: err?.message || "Failed to send WhatsApp reminder",
    };
  }
}

export async function processOverduePaymentReminders(organizationId: string) {
  const overdueInvoices = await db.invoice.findMany({
    where: {
      organizationId,
      status: { notIn: ["PAID", "CANCELLED"] },
      dueDate: { lt: new Date() },
    },
    include: { customer: true },
  });

  const results = [];
  for (const inv of overdueInvoices) {
    const dueAmount = inv.total - inv.paidAmount;
    if (dueAmount > 0 && inv.customer.phone) {
      const res = await sendPaymentReminderWhatsApp(
        inv.customer.phone,
        inv.customer.name,
        dueAmount,
        inv.invoiceNumber,
      );
      results.push({ invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, result: res });
    }
  }

  return results;
}
