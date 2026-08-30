export const STANDARD_WORK_HOURS = 8;

export function calculateDayPay(
  hoursWorked: number,
  hourlyRate: number,
  overtimeRate: number,
) {
  const regularHours = Math.min(hoursWorked, STANDARD_WORK_HOURS);
  const overtimeHours = Math.max(hoursWorked - STANDARD_WORK_HOURS, 0);
  const regularPay = Math.round(regularHours * hourlyRate * 100) / 100;
  const overtimePay = Math.round(overtimeHours * overtimeRate * 100) / 100;

  return {
    regularHours,
    overtimeHours,
    regularPay,
    overtimePay,
    totalPay: Math.round((regularPay + overtimePay) * 100) / 100,
  };
}

export function calculatePeriodSalary(
  records: { hoursWorked: number }[],
  hourlyRate: number,
  overtimeRate: number,
) {
  return records.reduce(
    (acc, record) => {
      const day = calculateDayPay(record.hoursWorked, hourlyRate, overtimeRate);
      return {
        totalHours: acc.totalHours + record.hoursWorked,
        regularHours: acc.regularHours + day.regularHours,
        overtimeHours: acc.overtimeHours + day.overtimeHours,
        regularPay: acc.regularPay + day.regularPay,
        overtimePay: acc.overtimePay + day.overtimePay,
        totalPay: acc.totalPay + day.totalPay,
      };
    },
    {
      totalHours: 0,
      regularHours: 0,
      overtimeHours: 0,
      regularPay: 0,
      overtimePay: 0,
      totalPay: 0,
    },
  );
}
