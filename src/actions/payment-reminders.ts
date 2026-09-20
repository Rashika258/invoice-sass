"use server";

import { requireOrganization } from "@/lib/organization";
import { db } from "@/lib/db";
import { sendPaymentReminderWhatsApp } from "@/lib/whatsapp";

export async function getOverduePaymentReminders() {
  const org = await requireOrganization();
  const now = new Date();
  const invoices = await db.invoice.findMany({
    where: { organizationId: org.id, documentType: "SALE", dueDate: { lt: now }, status: { in: ["SENT", "OVERDUE"] }, paidAmount: { lt: 0 } },
    include: { customer: true },
    orderBy: { dueDate: "asc" },
  });
  return invoices.filter((invoice) => invoice.total > invoice.paidAmount).map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customerName: invoice.customer.name,
    phone: invoice.customer.phone,
    dueDate: invoice.dueDate,
    amountDue: Math.max(invoice.total - invoice.paidAmount, 0),
  }));
}

export async function sendInvoicePaymentReminder(invoiceId: string) {
  const org = await requireOrganization();
  const invoice = await db.invoice.findFirst({ where: { id: invoiceId, organizationId: org.id, documentType: "SALE" }, include: { customer: true } });
  if (!invoice) throw new Error("Invoice not found");
  if (!invoice.customer.phone) throw new Error("Customer does not have a phone number");
  const amountDue = Math.max(invoice.total - invoice.paidAmount, 0);
  if (amountDue <= 0) throw new Error("Invoice is already fully paid");
  return sendPaymentReminderWhatsApp(invoice.customer.phone, invoice.customer.name, amountDue, invoice.invoiceNumber);
}
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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

/**
 * Fetch all overdue invoices for the current user's company.
 * An invoice is overdue when its status is SENT (unpaid) and dueDate has passed.
 */
export async function getOverdueInvoices(): Promise<OverdueInvoice[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoices = await prisma.invoice.findMany({
    where: {
      userId: user.id,
      status: "SENT",
      dueDate: {
        lt: today,
      },
      documentType: { in: ["INVOICE", "SALE"] },
    },
    include: {
      customer: true,
    },
    orderBy: {
      dueDate: "asc",
    },
  });

  return invoices.map((inv: any) => {
    const due = new Date(inv.dueDate!);
    const diff = Math.floor(
      (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer?.name ?? inv.customerName ?? "Unknown Customer",
      customerPhone: inv.customer?.phone ?? undefined,
      amount: inv.total,
      dueDate: due,
      daysOverdue: diff,
      currency: inv.currency ?? "INR",
    };
  });
}

/**
 * Send a WhatsApp payment reminder for a specific overdue invoice.
 * Falls back to a simple wa.me link if WhatsApp Business API is not configured.
 */
export async function sendPaymentReminderAction(
  invoiceId: string
): Promise<{ success: boolean; message: string; waLink?: string }> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: user.id },
    include: { customer: true, items: true },
  });
  if (!invoice) throw new Error("Invoice not found");

  const phone = invoice.customer?.phone;
  const customerName = invoice.customer?.name ?? invoice.customerName ?? "Customer";
  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: invoice.currency ?? "INR",
    minimumFractionDigits: 0,
  }).format(invoice.total);

  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "as per terms";

  const reminderText = `Dear ${customerName},\n\nThis is a gentle reminder that Invoice *${invoice.invoiceNumber}* for *${amount}* was due on ${dueDate} and remains unpaid.\n\nKindly arrange payment at your earliest convenience to avoid any inconvenience.\n\nThank you for your business!\n\n— ${user.name ?? "Billora User"}`;

  // Attempt API-based WhatsApp delivery
  try {
    await sendWhatsAppInvoiceAction({
      phone: phone || "",
      customerName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.total,
    });
    return { success: true, message: "Payment reminder sent via WhatsApp API." };
  } catch {
    // Fallback: build a wa.me deep link for manual send
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
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const items = await prisma.item.findMany({
    where: {
      userId: user.id,
      type: "PRODUCT",
    },
  });

  const alerts: ReorderAlert[] = [];
  for (const item of items) {
    const reorderLevel = (item as any).reorderLevel ?? 0;
    const currentStock = (item as any).stockQuantity ?? (item as any).stock ?? 0;
    if (reorderLevel > 0 && currentStock <= reorderLevel) {
      alerts.push({
        id: item.id,
        name: item.name,
        sku: (item as any).sku ?? "",
        currentStock,
        reorderLevel,
        unit: (item as any).unit ?? "pcs",
      });
    }
  }

  // Sort: most critical (lowest stock relative to reorder) first
  alerts.sort(
    (a, b) =>
      a.currentStock / (a.reorderLevel || 1) -
      b.currentStock / (b.reorderLevel || 1)
  );

  return alerts;
}

/**
 * Dismiss/mark a payment reminder as sent (update invoice notes).
 */
export async function markReminderSentAction(invoiceId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.invoice.update({
    where: { id: invoiceId, userId: user.id },
    data: {
      notes: {
        set: `[Reminder sent ${new Date().toLocaleDateString("en-IN")}]`,
      },
    },
  });
}
