import { describe, expect, it } from "vitest";

/**
 * Attendance & Payroll Helper functions for testing shift OT and salary calculation
 */
function calculateOvertime(totalHoursWorked: number, standardShiftHours: number = 8): number {
  if (totalHoursWorked <= standardShiftHours) return 0;
  return Number((totalHoursWorked - standardShiftHours).toFixed(2));
}

function calculateStaffSalary(params: {
  monthlyBaseSalary: number;
  totalPresentDays: number;
  totalWorkingDays: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  deductions?: number;
}) {
  const perDayPay = params.monthlyBaseSalary / (params.totalWorkingDays || 26);
  const earnedBaseSalary = perDayPay * params.totalPresentDays;
  const overtimePay = params.overtimeHours * params.hourlyRate * params.overtimeMultiplier;
  const grossPay = earnedBaseSalary + overtimePay;
  const netPay = grossPay - (params.deductions || 0);

  return {
    earnedBaseSalary: Math.round(earnedBaseSalary),
    overtimePay: Math.round(overtimePay),
    grossPay: Math.round(grossPay),
    netPay: Math.round(netPay),
  };
}

describe("Attendance & Staff Payroll Suite", () => {
  describe("calculateOvertime", () => {
    it("returns 0 overtime when worked hours are less than or equal to standard 8h shift", () => {
      expect(calculateOvertime(8, 8)).toBe(0);
      expect(calculateOvertime(6.5, 8)).toBe(0);
    });

    it("calculates exact overtime hours when working beyond standard shift", () => {
      expect(calculateOvertime(10.5, 8)).toBe(2.5);
      expect(calculateOvertime(12, 8)).toBe(4);
    });
  });

  describe("calculateStaffSalary", () => {
    it("calculates base earned salary, overtime pay, and net salary correctly", () => {
      const result = calculateStaffSalary({
        monthlyBaseSalary: 26000, // ₹1,000 / day
        totalPresentDays: 24,
        totalWorkingDays: 26,
        overtimeHours: 10,
        hourlyRate: 150,
        overtimeMultiplier: 1.5, // 150 * 1.5 = ₹225/hr OT rate
        deductions: 500,
      });

      expect(result.earnedBaseSalary).toBe(24000);
      expect(result.overtimePay).toBe(2250); // 10 hrs * 225
      expect(result.grossPay).toBe(26250); // 24000 + 2250
      expect(result.netPay).toBe(25750); // 26250 - 500
    });
  });
});
