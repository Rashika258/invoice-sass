/**
 * Customer Loyalty Points & Promo Coupon Engine
 */

export interface LoyaltyAccount {
  customerId: string;
  pointsBalance: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpent: number;
}

export interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minOrderAmount: number;
  expiryDate: string;
  isActive: boolean;
}

export const SAMPLE_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 500,
    expiryDate: '2026-12-31',
    isActive: true,
  },
  {
    code: 'FESTIVE500',
    discountType: 'FLAT',
    discountValue: 500,
    minOrderAmount: 3000,
    expiryDate: '2026-12-31',
    isActive: true,
  },
];

/**
 * Calculates loyalty points earned on bill amount (e.g. 1 point for every ₹100 spent)
 */
export function calculateEarnedPoints(billTotal: number): number {
  if (billTotal <= 0) return 0;
  return Math.floor(billTotal / 100);
}

/**
 * Calculates cash value of redeemed loyalty points (e.g. 1 point = ₹1.00)
 */
export function calculatePointRedemptionValue(points: number): number {
  if (points <= 0) return 0;
  return points * 1.0;
}

/**
 * Validates and applies promo coupon code to order subtotal
 */
export function applyCouponCode(code: string, subtotal: number): {
  valid: boolean;
  discountAmount: number;
  message: string;
} {
  const cleanCode = code.trim().toUpperCase();
  const coupon = SAMPLE_COUPONS.find((c) => c.code === cleanCode && c.isActive);

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid or expired coupon code' };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Coupon requires a minimum bill amount of ₹${coupon.minOrderAmount}`,
    };
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  return {
    valid: true,
    discountAmount: Math.min(discount, subtotal),
    message: `Coupon ${coupon.code} applied successfully!`,
  };
}
