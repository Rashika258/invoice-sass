/**
 * ⏰ Billora Automated Debt Collection Schedule Engine
 * Calculates reminder trigger dates and templates for WhatsApp/SMS debt collection.
 */

export interface InvoiceReminderTrigger {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string | null;
  amountDue: number;
  dueDate: Date;
  daysOverdue: number;
  reminderStage: "PRE_DUE" | "DUE_TODAY" | "OVERDUE_LIGHT" | "OVERDUE_CRITICAL";
  recommendedChannel: "WHATSAPP" | "SMS";
  messageText: string;
}

export function calculateReminderSchedule(invoices: Array<{
  id: string;
  invoiceNumber: string;
  total: number;
  paidAmount: number;
  dueDate: Date;
  customer: { name: string; phone?: string | null };
}>): InvoiceReminderTrigger[] {
  const now = new Date();

  return invoices
    .map((inv) => {
      const dueAmount = Math.max(0, Math.round((inv.total - inv.paidAmount) * 100) / 100);
      if (dueAmount <= 0) return null;

      const diffMs = now.getTime() - new Date(inv.dueDate).getTime();
      const daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let reminderStage: "PRE_DUE" | "DUE_TODAY" | "OVERDUE_LIGHT" | "OVERDUE_CRITICAL";
      let recommendedChannel: "WHATSAPP" | "SMS" = "WHATSAPP";
      let messageText = "";

      if (daysOverdue < 0 && daysOverdue >= -3) {
        reminderStage = "PRE_DUE";
        messageText = `Dear ${inv.customer.name}, friendly reminder that Invoice #${inv.invoiceNumber} for ₹${dueAmount.toFixed(2)} is due on ${new Date(inv.dueDate).toLocaleDateString()}. Thank you!`;
      } else if (daysOverdue === 0) {
        reminderStage = "DUE_TODAY";
        messageText = `Dear ${inv.customer.name}, Invoice #${inv.invoiceNumber} for ₹${dueAmount.toFixed(2)} is due today. Kindly complete payment via UPI.`;
      } else if (daysOverdue > 0 && daysOverdue <= 15) {
        reminderStage = "OVERDUE_LIGHT";
        messageText = `Dear ${inv.customer.name}, Invoice #${inv.invoiceNumber} for ₹${dueAmount.toFixed(2)} is now ${daysOverdue} days overdue. Please process payment at your earliest convenience.`;
      } else if (daysOverdue > 15) {
        reminderStage = "OVERDUE_CRITICAL";
        recommendedChannel = "WHATSAPP";
        messageText = `URGENT NOTICE: ${inv.customer.name}, Invoice #${inv.invoiceNumber} (₹${dueAmount.toFixed(2)}) is ${daysOverdue} days overdue. Please clear balance immediately to avoid credit hold.`;
      } else {
        return null;
      }

      return {
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customer.name,
        customerPhone: inv.customer.phone,
        amountDue: dueAmount,
        dueDate: new Date(inv.dueDate),
        daysOverdue,
        reminderStage,
        recommendedChannel,
        messageText,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}
