import { AppError } from "@/lib/errors";

export interface ThreeWayMatchResult {
  matched: boolean;
  poTotal: number;
  grnTotal: number;
  vendorBillTotal: number;
  variance: number;
  message: string;
}

/**
 * 3-Way Match Verification across Purchase Order, Goods Receipt Note, and Vendor Bill
 */
export function verifyThreeWayMatch(
  poTotal: number,
  grnTotal: number,
  vendorBillTotal: number,
  allowedVarianceTolerance: number = 0.02, // 2% tolerance threshold
): ThreeWayMatchResult {
  const maxDiff = Math.max(
    Math.abs(poTotal - grnTotal),
    Math.abs(grnTotal - vendorBillTotal),
    Math.abs(poTotal - vendorBillTotal),
  );

  const variancePercentage = poTotal > 0 ? maxDiff / poTotal : 0;
  const matched = variancePercentage <= allowedVarianceTolerance;

  let message = "3-Way Match PASSED: Purchase Order, GRN, and Vendor Bill align perfectly.";
  if (!matched) {
    message = `3-Way Match MISMATCH: Variance of ₹${maxDiff.toFixed(2)} (${(variancePercentage * 100).toFixed(1)}%) exceeds allowable ${allowedVarianceTolerance * 100}% threshold. Manager sign-off required.`;
  }

  return {
    matched,
    poTotal: Math.round(poTotal * 100) / 100,
    grnTotal: Math.round(grnTotal * 100) / 100,
    vendorBillTotal: Math.round(vendorBillTotal * 100) / 100,
    variance: Math.round(maxDiff * 100) / 100,
    message,
  };
}

/**
 * Assert that a procurement transaction satisfies 3-way matching rules
 */
export function assertThreeWayMatch(poTotal: number, grnTotal: number, vendorBillTotal: number): void {
  const result = verifyThreeWayMatch(poTotal, grnTotal, vendorBillTotal);
  if (!result.matched) {
    throw new AppError("CONFLICT", result.message, 400);
  }
}
