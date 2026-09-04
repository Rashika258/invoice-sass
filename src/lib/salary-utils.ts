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

export function calculateShiftFromTimes(
  checkIn: string,
  checkOut: string,
): { hours: number; error?: string } {
  if (!checkIn || !checkOut) {
    return { hours: 0 };
  }

  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);

  if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) {
    return { hours: 0, error: "Invalid time format" };
  }

  const inMinutes = inH * 60 + inM;
  let outMinutes = outH * 60 + outM;

  // Handle overnight shift if checkout is earlier than checkin
  if (outMinutes < inMinutes) {
    outMinutes += 24 * 60;
  }

  const diffMinutes = outMinutes - inMinutes;
  const hours = Math.round((diffMinutes / 60) * 10) / 10;

  return { hours };
}
