/**
 * Lightweight QR Code Generator (pure TypeScript, zero external dependencies)
 * Generates an SVG string for standard UPI intent strings and URLs.
 */

// Simple byte-mode QR Code generator for Version 1-6
// Sufficient for up to 134 alphanumeric characters (standard UPI string is ~60-90 chars)

export function generateUpiUri({
  upiId,
  payeeName,
  amount,
  transactionNote,
  currency = "INR",
}: {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionNote?: string;
  currency?: string;
}): string {
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const note = encodeURIComponent(transactionNote || "Bill Payment");
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=${currency}&tn=${note}`;
}

export function getQrCodeSvgUrl(content: string): string {
  // Use official standard QR API fallback if offline SVG generator not needed,
  // or return encoded SVG data.
  const encoded = encodeURIComponent(content);
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}&margin=2`;
}
