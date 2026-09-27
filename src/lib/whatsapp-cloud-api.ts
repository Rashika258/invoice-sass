/**
 * 📲 Meta WhatsApp Cloud API Dispatcher
 * Official Meta Graph API (v18.0) client for automated background WhatsApp PDF document dispatching.
 */

export interface WhatsAppTemplateMessageOptions {
  phoneNumber: string;       // Recipient mobile number with country code (e.g. 919876543210)
  templateName: string;      // Pre-approved Meta template name (e.g. invoice_notification)
  recipientName: string;     // Customer name
  documentNumber: string;    // Invoice #
  amount: number;            // Total Amount
  documentUrl: string;       // Direct PDF Download Link
}

export interface WhatsAppCloudApiConfig {
  phoneNumberId: string;
  accessToken: string;
}

export function getWhatsAppCloudConfig(): WhatsAppCloudApiConfig {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "100234598712345",
    accessToken: process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || "mock_meta_wa_token_2026",
  };
}

export async function sendWhatsAppInvoiceNotification(options: WhatsAppTemplateMessageOptions) {
  const config = getWhatsAppCloudConfig();
  const cleanPhone = options.phoneNumber.replace(/\D/g, "");

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: cleanPhone,
    type: "template",
    template: {
      name: options.templateName,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: options.recipientName },
            { type: "text", text: options.documentNumber },
            { type: "text", text: `₹${options.amount.toFixed(2)}` },
            { type: "text", text: options.documentUrl },
          ],
        },
      ],
    },
  };

  // Live Meta Cloud API endpoint URL
  const url = `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`;

  if (process.env.NODE_ENV === "production" && process.env.WHATSAPP_CLOUD_ACCESS_TOKEN) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp API Dispatch Failed: ${err}`);
    }

    return res.json();
  }

  // Simulated sandbox response for local development / testing
  return {
    messaging_product: "whatsapp",
    contacts: [{ input: cleanPhone, wa_id: cleanPhone }],
    messages: [{ id: `wamid.MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }],
    isMock: true,
  };
}
