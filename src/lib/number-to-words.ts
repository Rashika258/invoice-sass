const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(n: number): string {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + " ";
  }
  return str.trim();
}

/**
 * Converts a number to words formatted according to Indian financial conventions.
 * E.g. 125430 -> "Rupees One Lakh Twenty Five Thousand Four Hundred Thirty Only"
 */
export function numberToWordsIndian(amount: number): string {
  if (amount === 0) return "Rupees Zero Only";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let remaining = rupees;
  const parts: string[] = [];

  // Crores (>= 1,00,00,000)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    parts.push(convertBelowThousand(crore) + " Crore");
    remaining %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    parts.push(convertBelowThousand(lakh) + " Lakh");
    remaining %= 100000;
  }

  // Thousands (>= 1,000)
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    parts.push(convertBelowThousand(thousand) + " Thousand");
    remaining %= 1000;
  }

  // Hundreds & below
  if (remaining > 0) {
    parts.push(convertBelowThousand(remaining));
  }

  let words = "Rupees " + parts.join(" ").replace(/\s+/g, " ").trim();

  if (paise > 0) {
    words += " and " + convertBelowThousand(paise) + " Paise";
  }

  words += " Only";

  return isNegative ? "Minus " + words : words;
}
