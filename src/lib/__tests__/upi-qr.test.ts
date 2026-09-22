import { describe, expect, it } from 'vitest';
import { buildUpiUri, generateUpiQrSvg } from '../upi-qr';

describe('UPI QR Code Generator', () => {
  it('should build a valid UPI URI with merchant VPA and amount', () => {
    const uri = buildUpiUri({
      upiId: 'merchant@okaxis',
      payeeName: 'Billora Store',
      amount: 1250.5,
      transactionRef: 'INV-2026-001',
    });

    expect(uri).toContain('upi://pay?');
    expect(uri).toContain('pa=merchant%40okaxis');
    expect(uri).toContain('pn=Billora+Store');
    expect(uri).toContain('am=1250.50');
    expect(uri).toContain('tr=INV-2026-001');
  });

  it('should generate an SVG string containing UPI badge', () => {
    const svg = generateUpiQrSvg({
      upiId: 'merchant@okaxis',
      payeeName: 'Billora Store',
      amount: 500,
    });

    expect(svg).toContain('<svg');
    expect(svg).toContain('UPI');
    expect(svg).toContain('</svg>');
  });
});
