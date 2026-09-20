"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

export async function sendWhatsAppMetaCloudMessage({
  phone,
  customerName,
  invoiceNumber,
  totalAmount,
  pdfUrl,
}: {
  phone: string;
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
  pdfUrl?: string;
}) {
  const org = await requireOrganization();
  const profile = await db.companyProfile.findUnique({
    where: { organizationId: org.id },
  });

  const companyName = profile?.companyName || "Our Business";
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Clean phone number (remove +, spaces, hyphens)
  const cleanPhone = phone.replace(/\D/g, "");

  if (!cleanPhone) {
    throw new Error("Invalid customer phone number");
  }

  // If official Meta Cloud API credentials are provided in env, call Meta Graph API directly
  if (apiToken && phoneNumberId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "text",
            text: {
              body: `Namaste ${customerName},\n\nYour invoice *${invoiceNumber}* for *₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}* from *${companyName}* has been generated successfully.\n${pdfUrl ? `\nView / Download PDF: ${pdfUrl}\n` : ""}\nThank you for doing business with us!`,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to send Meta WhatsApp message");
      }

      return { success: true, method: "META_CLOUD_API", messageId: data.messages?.[0]?.id };
    } catch (err: any) {
      console.warn("Meta Cloud API failed, falling back to wa.me link:", err.message);
    }
  }

  // Fallback: Generate wa.me web link for browser dispatch
  const message = encodeURIComponent(
    `Namaste ${customerName},\n\nYour invoice *${invoiceNumber}* for *₹${totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}* from *${companyName}* is ready.\n${pdfUrl ? `\nView PDF: ${pdfUrl}\n` : ""}\nThank you for your business!`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;

  return { success: true, method: "WA_ME_LINK", waUrl };
}

export const sendWhatsAppInvoiceAction = sendWhatsAppMetaCloudMessage;
