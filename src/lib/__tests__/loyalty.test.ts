import { describe, expect, it } from 'vitest';
import { applyCouponCode, calculateEarnedPoints, calculatePointRedemptionValue } from '../loyalty';

describe('Loyalty Points & Promo Coupon Engine', () => {
  it('should calculate earned points based on total bill amount', () => {
    expect(calculateEarnedPoints(1250)).toBe(12);
    expect(calculateEarnedPoints(99)).toBe(0);
  });

  it('should calculate cash redemption value of points', () => {
    expect(calculatePointRedemptionValue(50)).toBe(50.0);
  });

  it('should validate and apply percentage coupon codes', () => {
    const res = applyCouponCode('WELCOME10', 1000);

    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(100);
  });

  it('should reject coupon code when order total is below minimum threshold', () => {
    const res = applyCouponCode('FESTIVE500', 1000);

    expect(res.valid).toBe(false);
    expect(res.message).toContain('minimum bill amount');
  });
});
