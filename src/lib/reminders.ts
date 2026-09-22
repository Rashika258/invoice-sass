/**
 * Automated WhatsApp & Email Payment Reminders Engine
 */

export interface ReminderConfig {
  daysBeforeDue: number; // e.g. 3 days before
  onDueDate: boolean;
  daysAfterDue: number; // e.g. 5 days overdue
  whatsappEnabled: boolean;
  emailEnabled: boolean;
}

export interface PendingReminderInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
}

export function buildWhatsAppReminderMessage(
  customerName: string,
  invoiceNumber: string,
  amountDue: number,
  dueDate: string,
  companyName: string = "Billora Enterprises"
): string {
  const formattedAmount = `₹${amountDue.toLocaleString('en-IN')}`;

  return `Dear ${customerName},

This is a gentle payment reminder from *${companyName}*.

📄 Invoice No: *${invoiceNumber}*
💰 Amount Due: *${formattedAmount}*
📅 Due Date: *${dueDate}*

Kindly clear the payment at your earliest convenience using our instant UPI/Card portal.

Thank you for your business!`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
}
