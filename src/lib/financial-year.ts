/**
 * 🗓️ Billora India Financial Year Engine
 * Manages FY selection, period locking, opening balance carry-forward,
 * and invoice numbering per financial year.
 */

export interface FinancialYear {
  id: string;
  label: string;           // e.g. "FY 2025-26"
  startDate: string;       // ISO "2025-04-01"
  endDate: string;         // ISO "2026-03-31"
  status: "ACTIVE" | "CLOSED" | "FUTURE";
  isLocked: boolean;
  closingEntryPosted: boolean;
  openingBalanceCarriedForward: boolean;
  gstReturnVerified: boolean;
  yearEndBackupCreated: boolean;
}

export interface PeriodLock {
  financialYearId: string;
  lockedFrom: string;       // ISO date
  lockedTo: string;         // ISO date
  lockedAt: string;
  lockedByUserName: string;
  reason: string;
}

// Standard Indian FY: April 1 → March 31
export function getIndianFYBounds(startYear: number): { start: string; end: string } {
  return {
    start: `${startYear}-04-01`,
    end:   `${startYear + 1}-03-31`,
  };
}

export function getCurrentIndianFY(): FinancialYear {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const { start, end } = getIndianFYBounds(startYear);

  return {
    id: `fy_${startYear}_${startYear + 1}`,
    label: `FY ${startYear}-${String(startYear + 1).slice(2)}`,
    startDate: start,
    endDate: end,
    status: "ACTIVE",
    isLocked: false,
    closingEntryPosted: false,
    openingBalanceCarriedForward: false,
    gstReturnVerified: false,
    yearEndBackupCreated: false,
  };
}

export function listFinancialYears(): FinancialYear[] {
  const now = new Date();
  const currentStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

  return [
    // Past 2 FYs (closed)
    ...[-2, -1].map((offset) => {
      const sy = currentStartYear + offset;
      const { start, end } = getIndianFYBounds(sy);
      return {
        id: `fy_${sy}_${sy + 1}`,
        label: `FY ${sy}-${String(sy + 1).slice(2)}`,
        startDate: start,
        endDate: end,
        status: "CLOSED" as const,
        isLocked: true,
        closingEntryPosted: true,
        openingBalanceCarriedForward: true,
        gstReturnVerified: sy < currentStartYear - 1,
        yearEndBackupCreated: true,
      };
    }),
    // Current FY
    getCurrentIndianFY(),
    // Next FY (future)
    (() => {
      const sy = currentStartYear + 1;
      const { start, end } = getIndianFYBounds(sy);
      return {
        id: `fy_${sy}_${sy + 1}`,
        label: `FY ${sy}-${String(sy + 1).slice(2)}`,
        startDate: start,
        endDate: end,
        status: "FUTURE" as const,
        isLocked: false,
        closingEntryPosted: false,
        openingBalanceCarriedForward: false,
        gstReturnVerified: false,
        yearEndBackupCreated: false,
      };
    })(),
  ];
}

/**
 * Validate that a given date falls within the active (unlocked) financial year.
 * Returns a warning string if the date is in the wrong period.
 */
export function validateTransactionDate(
  date: Date,
  activeFY: FinancialYear
): { valid: boolean; warning?: string } {
  const fyStart = new Date(activeFY.startDate);
  const fyEnd   = new Date(activeFY.endDate);

  if (date < fyStart || date > fyEnd) {
    return {
      valid: false,
      warning: `⚠️ Transaction date ${date.toLocaleDateString("en-IN")} falls outside the active financial year (${activeFY.label}: ${new Date(activeFY.startDate).toLocaleDateString("en-IN")} – ${new Date(activeFY.endDate).toLocaleDateString("en-IN")}). Select the correct FY or adjust the date.`,
    };
  }

  if (activeFY.isLocked) {
    return {
      valid: false,
      warning: `🔒 ${activeFY.label} is locked for editing. Contact your Administrator to post adjustments via Post-Closing Journal Entries only.`,
    };
  }

  return { valid: true };
}

/**
 * Build invoice number prefix including FY for uniqueness per financial year.
 * e.g. "INV-2526-001"
 */
export function buildFYInvoiceNumber(
  prefix: string,
  nextNumber: number,
  activeFY: FinancialYear
): string {
  const startYear = activeFY.startDate.slice(2, 4); // "25"
  const endYear   = activeFY.endDate.slice(2, 4);   // "26"
  const paddedNum = String(nextNumber).padStart(3, "0");
  return `${prefix}-${startYear}${endYear}-${paddedNum}`;
}

/**
 * FY Year-End Closing Checklist
 */
export interface YearEndChecklist {
  label: string;
  completed: boolean;
  blocksClosing: boolean;
}

export function getYearEndChecklist(fy: FinancialYear): YearEndChecklist[] {
  return [
    {
      label: "All sales invoices reconciled with payments",
      completed: true,
      blocksClosing: true,
    },
    {
      label: "GSTR-1 and GSTR-3B returns verified and filed",
      completed: fy.gstReturnVerified,
      blocksClosing: true,
    },
    {
      label: "All journal vouchers balanced (DR = CR)",
      completed: true,
      blocksClosing: true,
    },
    {
      label: "Bank accounts reconciled with statements",
      completed: false,
      blocksClosing: false,
    },
    {
      label: "Stock physical count verified against system",
      completed: false,
      blocksClosing: false,
    },
    {
      label: "Payroll and TDS deductions filed for the year",
      completed: true,
      blocksClosing: false,
    },
    {
      label: "Year-end database backup created and verified",
      completed: fy.yearEndBackupCreated,
      blocksClosing: true,
    },
    {
      label: "Opening balances carried forward to next FY",
      completed: fy.openingBalanceCarriedForward,
      blocksClosing: true,
    },
  ];
}
