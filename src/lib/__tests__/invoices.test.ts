import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTaxAmount, calculateTotal } from '../invoices';

describe('invoice calculations', () => {
  it('calculates subtotal', () => {
    const items = [
      { id: 'a', description: 'x', quantity: 2, rate: 10 },
      { id: 'b', description: 'y', quantity: 1, rate: 5 },
    ];
    expect(calculateSubtotal(items)).toBe(25);
  });

  it('calculates tax and total', () => {
    const items = [
      { id: 'a', description: 'x', quantity: 2, rate: 10 },
    ];
    const subtotal = calculateSubtotal(items);
    expect(calculateTaxAmount(subtotal, 10)).toBe(2);
    expect(calculateTotal(items, 10)).toBe(22);
  });
});
