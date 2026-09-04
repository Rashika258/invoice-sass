export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export type GstLineInput = {
  quantity: number;
  unitPrice: number;
  gstRate: number;
};

export function calculateLineAmount(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function splitGst(taxable: number, gstRate: number, isInterState: boolean) {
  const taxAmount = roundMoney(taxable * (gstRate / 100));
  if (isInterState) {
    return { cgstAmount: 0, sgstAmount: 0, igstAmount: taxAmount, taxAmount };
  }
  const cgstAmount = roundMoney(taxAmount / 2);
  const sgstAmount = roundMoney(taxAmount - cgstAmount);
  return { cgstAmount, sgstAmount, igstAmount: 0, taxAmount };
}

export function calculateDocumentTotals(
  items: GstLineInput[],
  discount: number,
  isInterState: boolean,
) {
  const subtotal = roundMoney(
    items.reduce(
      (sum, item) => sum + calculateLineAmount(item.quantity, item.unitPrice),
      0,
    ),
  );
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxableBase = roundMoney(subtotal - safeDiscount);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let taxAmount = 0;

  if (subtotal > 0) {
    for (const item of items) {
      const lineAmount = calculateLineAmount(item.quantity, item.unitPrice);
      const lineTaxable = roundMoney((lineAmount / subtotal) * taxableBase);
      const split = splitGst(lineTaxable, item.gstRate, isInterState);
      cgstAmount = roundMoney(cgstAmount + split.cgstAmount);
      sgstAmount = roundMoney(sgstAmount + split.sgstAmount);
      igstAmount = roundMoney(igstAmount + split.igstAmount);
      taxAmount = roundMoney(taxAmount + split.taxAmount);
    }
  }

  const total = roundMoney(taxableBase + taxAmount);
  const weightedRate =
    taxableBase > 0 ? roundMoney((taxAmount / taxableBase) * 100) : 0;

  return {
    subtotal,
    discount: safeDiscount,
    taxRate: weightedRate,
    taxAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    total,
  };
}

export type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export function calculateInvoiceTotals(
  items: LineItemInput[],
  taxRate: number,
  discount: number,
) {
  return calculateDocumentTotals(
    items.map((item) => ({ ...item, gstRate: taxRate })),
    discount,
    false,
  );
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAddress(parts: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
}) {
  const line1 = parts.address?.trim();
  const line2 = [parts.city, parts.state, parts.zipCode]
    .filter(Boolean)
    .join(", ");
  const line3 = parts.country?.trim();

  return [line1, line2, line3].filter(Boolean).join("\n");
}

export function statesMatch(a?: string | null, b?: string | null) {
  return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
}
