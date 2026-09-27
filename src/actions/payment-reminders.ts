"use server";

import { requireOrganization } from "@/lib/organization";
import { db } from "@/lib/db";
import { sendPaymentReminderWhatsApp } from "@/lib/whatsapp";
import { sendWhatsAppInvoiceAction } from "@/actions/whatsapp-api";

export interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  dueDate: Date;
  daysOverdue: number;
  currency: string;
}

export interface ReorderAlert {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
}

export async function getOverduePaymentReminders() {
  const org = await requireOrganization();
  const now = new Date();
  const invoices = await db.invoice.findMany({
    where: {
      organizationId: org.id,
      documentType: "SALE",
      dueDate: { lt: now },
      status: { in: ["SENT", "OVERDUE"] },
    },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
  });

  return invoices
    .filter((invoice) => invoice.total > invoice.paidAmount)
    .map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer.name,
      phone: invoice.customer.phone || undefined,
      dueDate: invoice.dueDate,
      amountDue: Math.max(invoice.total - invoice.paidAmount, 0),
    }));
}

export async function sendInvoicePaymentReminder(invoiceId: string) {
  const org = await requireOrganization();
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId: org.id, documentType: "SALE" },
    include: { customer: true },
  });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.customer.phone) throw new Error("Customer does not have a phone number");
  const amountDue = Math.max(invoice.total - invoice.paidAmount, 0);
  if (amountDue <= 0) throw new Error("Invoice is already fully paid");
  return sendPaymentReminderWhatsApp(
    invoice.customer.phone,
    invoice.customer.name,
    amountDue,
    invoice.invoiceNumber,
  );
}

/**
 * Fetch all overdue invoices for the current organization.
 */
export async function getOverdueInvoices(): Promise<OverdueInvoice[]> {
  const org = await requireOrganization();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoices = await db.invoice.findMany({
    where: {
      organizationId: org.id,
      status: { in: ["SENT", "OVERDUE"] },
      dueDate: { lt: today },
      documentType: "SALE",
    },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
  });

  return invoices
    .filter((inv) => inv.total > inv.paidAmount)
    .map((inv) => {
      const due = new Date(inv.dueDate);
      const diff = Math.floor(
        (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.name,
        customerPhone: inv.customer.phone || undefined,
        amount: inv.total - inv.paidAmount,
        dueDate: due,
        daysOverdue: Math.max(0, diff),
        currency: "INR",
      };
    });
}

/**
 * Send a WhatsApp payment reminder for a specific overdue invoice.
 */
export async function sendPaymentReminderAction(
  invoiceId: string,
): Promise<{ success: boolean; message: string; waLink?: string }> {
  const org = await requireOrganization();
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId: org.id },
    include: { customer: true },
  });
  if (!invoice) throw new Error("Invoice not found");

  const phone = invoice.customer.phone;
  const customerName = invoice.customer.name;
  const amountDue = invoice.total - invoice.paidAmount;
  const amountStr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amountDue);

  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "as per terms";

  const reminderText = `Dear ${customerName},\n\nThis is a gentle reminder that Invoice *${invoice.invoiceNumber}* for *${amountStr}* was due on ${dueDateStr} and remains unpaid.\n\nKindly arrange payment at your earliest convenience.\n\nThank you for your business!`;

  try {
    await sendWhatsAppInvoiceAction({
      phone: phone || "",
      customerName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: amountDue,
    });
    return { success: true, message: "Payment reminder sent via WhatsApp API." };
  } catch {
    const waPhone = phone?.replace(/[^0-9]/g, "") ?? "";
    const waLink = waPhone
      ? `https://wa.me/${waPhone.startsWith("91") ? waPhone : `91${waPhone}`}?text=${encodeURIComponent(reminderText)}`
      : undefined;

    return {
      success: false,
      message: waLink
        ? "WhatsApp API not configured — click the link to send manually."
        : "No phone number found for this customer.",
      waLink,
    };
  }
}

/**
 * Get items that are at or below their reorder level (low stock alerts).
 */
export async function getReorderAlerts(): Promise<ReorderAlert[]> {
  const org = await requireOrganization();
  const items = await db.item.findMany({
    where: {
      organizationId: org.id,
      itemType: "PRODUCT",
    },
  });

  const alerts: ReorderAlert[] = [];
  for (const item of items) {
    if (item.minStock > 0 && item.stockQty <= item.minStock) {
      alerts.push({
        id: item.id,
        name: item.name,
        sku: item.hsn || "",
        currentStock: item.stockQty,
        reorderLevel: item.minStock,
        unit: item.unit || "pcs",
      });
    }
  }

  alerts.sort(
    (a, b) =>
      a.currentStock / (a.reorderLevel || 1) -
      b.currentStock / (b.reorderLevel || 1),
  );

  return alerts;
}

/**
 * Dismiss/mark a payment reminder as sent (update invoice notes).
 */
export async function markReminderSentAction(invoiceId: string): Promise<void> {
  const org = await requireOrganization();
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId: org.id },
  });

  if (!invoice) throw new Error("Invoice not found");

  const existingNotes = invoice.notes || "";
  const updatedNotes = `${existingNotes}\n[Reminder sent ${new Date().toLocaleDateString("en-IN")}]`.trim();

  await db.invoice.update({
    where: { id: invoiceId },
    data: { notes: updatedNotes },
  });
}
