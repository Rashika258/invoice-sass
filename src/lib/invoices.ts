export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
};

export type Invoice = {
  id: string;
  number?: string;
  date?: string;
  dueDate?: string;
  from?: string;
  to?: string;
  taxPercent?: number; // e.g. 10 for 10%
  items: LineItem[];
  notes?: string;
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
