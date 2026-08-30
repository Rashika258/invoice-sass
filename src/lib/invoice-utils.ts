export type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export function calculateLineAmount(quantity: number, unitPrice: number) {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateInvoiceTotals(
  items: LineItemInput[],
  taxRate: number,
  discount: number,
) {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateLineAmount(item.quantity, item.unitPrice),
    0,
  );
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const taxAmount = Math.round(discountedSubtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((discountedSubtotal + taxAmount) * 100) / 100;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount,
    total,
  };
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
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
