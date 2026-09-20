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
