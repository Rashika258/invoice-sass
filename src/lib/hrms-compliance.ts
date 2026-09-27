export interface EpfoCalculation {
  wageConsidered: number;
  employeePf: number;
  employerEps: number; // 8.33% to Pension Fund (capped at ₹1,250)
  employerEpfo: number; // 3.67% to PF
  totalEpfoContribution: number;
}

export interface EsicCalculation {
  grossWage: number;
  applicable: boolean;
  employeeEsic: number;
  employerEsic: number;
  totalEsicContribution: number;
}

/**
 * Calculate Provident Fund (EPFO) Contribution (12% Employee + 12% Employer)
 */
export function calculateEpfoContribution(baseWage: number): EpfoCalculation {
  const WAGE_CEILING = 15000;
  const wageConsidered = Math.min(baseWage, WAGE_CEILING);

  const employeePf = Math.round(wageConsidered * 0.12);
  const employerEps = Math.min(1250, Math.round(wageConsidered * 0.0833));
  const employerEpfo = Math.max(0, employeePf - employerEps);

  return {
    wageConsidered,
    employeePf,
    employerEps,
    employerEpfo,
    totalEpfoContribution: employeePf + employerEps + employerEpfo,
  };
}

/**
 * Calculate Employee State Insurance (ESIC) Contribution (0.75% Employee + 3.25% Employer)
 */
export function calculateEsicContribution(grossWage: number): EsicCalculation {
  const ESI_WAGE_LIMIT = 21000;
  const applicable = grossWage <= ESI_WAGE_LIMIT && grossWage > 0;

  if (!applicable) {
    return {
      grossWage,
      applicable: false,
      employeeEsic: 0,
      employerEsic: 0,
      totalEsicContribution: 0,
    };
  }

  const employeeEsic = Math.ceil(grossWage * 0.0075);
  const employerEsic = Math.ceil(grossWage * 0.0325);

  return {
    grossWage,
    applicable: true,
    employeeEsic,
    employerEsic,
    totalEsicContribution: employeeEsic + employerEsic,
  };
}

/**
 * Calculate Loss of Pay (LOP) Salary Deduction
 */
export function calculateLossOfPay(
  basePay: number,
  unapprovedAbsenceDays: number,
  workingDaysInMonth: number = 26,
): { perDayRate: number; lopDeduction: number; adjustedBasePay: number } {
  if (unapprovedAbsenceDays <= 0) {
    return { perDayRate: Math.round(basePay / workingDaysInMonth), lopDeduction: 0, adjustedBasePay: basePay };
  }

  const perDayRate = basePay / workingDaysInMonth;
  const lopDeduction = Math.round(perDayRate * unapprovedAbsenceDays);
  const adjustedBasePay = Math.max(0, Math.round(basePay - lopDeduction));

  return {
    perDayRate: Math.round(perDayRate * 100) / 100,
    lopDeduction,
    adjustedBasePay,
  };
}
