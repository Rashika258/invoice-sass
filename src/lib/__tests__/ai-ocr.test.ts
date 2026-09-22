import { describe, expect, it } from 'vitest';
import { parseBillWithAI } from '../ai-ocr';

describe('AI Bill Scanner OCR', () => {
  it('should parse pharmacy bill scan correctly', async () => {
    const result = await parseBillWithAI('pharma_purchase_bill.pdf');

    expect(result.supplierName).toContain('MedPlus');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeGreaterThan(0.9);
  });

  it('should parse raw material purchase bill correctly', async () => {
    const result = await parseBillWithAI('steel_bill.png');

    expect(result.supplierName).toContain('Steel');
    expect(result.subtotal).toBeGreaterThan(0);
    expect(result.total).toBe(result.subtotal + result.taxAmount);
  });
});
