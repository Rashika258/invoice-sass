export type LineItem = {
  id: string;
  description: string;
  hsn?: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  number?: string;
  date?: string;
  dueDate?: string;
  from?: string; // seller
  to?: string; // buyer
  gstin?: string;
  state?: string;
  taxPercent?: number; // e.g. 10 for 10%
  items: LineItem[];
  notes?: string;
  logoUrl?: string;
};

export function calculateSubtotal(items: LineItem[]) {
  return items.reduce((sum, it) => sum + (it.quantity || 0) * (it.rate || 0), 0);
}

export function calculateTaxAmount(subtotal: number, taxPercent?: number) {
  if (!taxPercent) return 0;
  return (subtotal * taxPercent) / 100;
}

export function calculateTotal(items: LineItem[], taxPercent?: number) {
  const subtotal = calculateSubtotal(items);
  const tax = calculateTaxAmount(subtotal, taxPercent);
  return subtotal + tax;
}

// Convert number to words (Indian numbering upto crores)
const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitsToWord(n: number) {
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
}

export function amountToWords(amount: number) {
  if (!isFinite(amount) || isNaN(amount)) return "";
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return "Zero Rupees";

  const parts: string[] = [];
  const crore = Math.floor(rupees / 10000000);
  if (crore) {
    parts.push(`${amountToWordsBasic(crore)} Crore`);
  }
  const lakh = Math.floor((rupees % 10000000) / 100000);
  if (lakh) parts.push(`${amountToWordsBasic(lakh)} Lakh`);
  const thousand = Math.floor((rupees % 100000) / 1000);
  if (thousand) parts.push(`${amountToWordsBasic(thousand)} Thousand`);
  const hundred = Math.floor((rupees % 1000) / 100);
  if (hundred) parts.push(`${ones[hundred]} Hundred`);
  const lastTwo = rupees % 100;
  if (lastTwo) parts.push(twoDigitsToWord(lastTwo));

  const rupeePart = parts.join(" ").trim() + " Rupees";
  if (paise) {
    const paisePart = `${twoDigitsToWord(paise)} Paise`;
    return `${rupeePart} and ${paisePart}`;
  }
  return rupeePart;
}

function amountToWordsBasic(n: number) {
  // 1-99 or more but called with small numbers
  if (n < 100) return twoDigitsToWord(n);
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return `${ones[hundred]} Hundred${rest ? " " + twoDigitsToWord(rest) : ""}`.trim();
}
