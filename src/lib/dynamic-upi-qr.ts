/**
 * 💳 Billora Dynamic UPI Payment QR Engine
 * Generates standards-compliant NPCI UPI Payment URIs for instant payment collection.
 */

export interface UpiPayloadOptions {
  vpa: string;           // Virtual Payment Address (e.g., store@okaxis)
  payeeName: string;     // Business Name (e.g., Billora Store)
  amount: number;        // Transaction Amount in INR
  transactionRef: string;// Unique Invoice/Bill Reference Number
  note?: string;         // Note to display on customer's GPay/PhonePe screen
}

export function buildUpiPayUrl(options: UpiPayloadOptions): string {
  const { vpa, payeeName, amount, transactionRef, note } = options;
  const cleanVpa = encodeURIComponent(vpa.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const formattedAmount = amount.toFixed(2);
  const cleanRef = encodeURIComponent(transactionRef.trim());
  const cleanNote = encodeURIComponent(note ? note.trim() : `Payment for ${transactionRef}`);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tr=${cleanRef}&tn=${cleanNote}`;
}

export function generateQrCodeImageUrl(upiUrl: string, size = 220): string {
  const encodedUrl = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&margin=8`;
}
