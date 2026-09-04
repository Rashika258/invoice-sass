/**
 * Customer Digital Khata & Loyalty Engine
 * Generates automated WhatsApp payment reminders with UPI payload,
 * and tracks customer loyalty reward points.
 */

export interface KhataEntry {
  id: string;
  date: string;
  type: "SALE" | "PAYMENT_IN" | "RETURN";
  referenceNumber: string;
  amount: number;
  balanceAfter: number;
  notes?: string;
}

export function generateWhatsAppReminderUrl({
  customerName,
  phone,
  balance,
  companyName = "Sri Manjunatha Engineering Works",
  upiId = "srimanjunatha@upi",
}: {
  customerName: string;
  phone?: string | null;
  balance: number;
  companyName?: string;
  upiId?: string;
}): string {
  const cleanPhone = phone?.replace(/[^0-9]/g, "") || "";
  const recipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(companyName)}&am=${balance.toFixed(2)}&cu=INR`;

  const message = `Namaste ${customerName},\n\nThis is a friendly payment reminder from *${companyName}*.\n\nYour total outstanding balance is *₹${balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}*.\n\nKindly make the payment via UPI ID: *${upiId}*\nOr tap to pay directly: ${upiLink}\n\nFor any queries or statement details, feel free to reply here. Thank you for your business!`;

  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function calculateLoyaltyPoints(totalSpent: number): {
  points: number;
  pointValueRupees: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
} {
  // 1 loyalty point for every ₹100 spent
  const points = Math.floor(totalSpent / 100);
  const pointValueRupees = points * 1; // 1 point = ₹1 discount

  let tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" = "BRONZE";
  if (points >= 1000) tier = "PLATINUM";
  else if (points >= 500) tier = "GOLD";
  else if (points >= 150) tier = "SILVER";

  return { points, pointValueRupees, tier };
}
