"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { roundMoney } from "@/lib/invoice-utils";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/lib/audit";

export interface GeneratePayrollInput {
  monthDate: string; // YYYY-MM
}

export async function generatePayrollForMonth(input: GeneratePayrollInput) {
  const org = await requireOrganization();
  const [yearStr, monthStr] = input.monthDate.split("-");
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;

  const startOfMonth = new Date(year, monthIdx, 1);
  const endOfMonth = new Date(year, monthIdx + 1, 0, 23, 59, 59);

  const employees = await db.employee.findMany({
    where: { organizationId: org.id },
    include: {
      attendance: {
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      },
    },
  });

  const generatedRecords = [];

  for (const emp of employees) {
    const totalHoursWorked = emp.attendance.reduce((sum, a) => sum + a.hoursWorked, 0);
    const standardWorkHours = 8 * 22; // 8 hours x 22 standard working days = 176 hrs
    const overtimeHours = Math.max(0, totalHoursWorked - standardWorkHours);
    const regularHours = Math.min(totalHoursWorked, standardWorkHours);

    const baseSalary = roundMoney(regularHours * emp.hourlyRate);
    const overtimePay = roundMoney(overtimeHours * emp.overtimeRate);
    const grossSalary = roundMoney(baseSalary + overtimePay);

    // Statutory deductions
    const pfDeduction = roundMoney(grossSalary * 0.12); // PF @ 12%
    const esiDeduction = grossSalary < 21000 ? roundMoney(grossSalary * 0.0475) : 0; // ESI @ 4.75% for gross under ₹21k
    const taxDeduction = grossSalary > 50000 ? roundMoney((grossSalary - 50000) * 0.1) : 0;

    const netSalary = roundMoney(grossSalary - pfDeduction - esiDeduction - taxDeduction);

    // Save or update existing payroll record for employee + month
    const record = await db.payrollRecord.create({
      data: {
        employeeId: emp.id,
        month: startOfMonth,
        baseSalary,
        overtimePay,
        grossSalary,
        pfDeduction,
        esiDeduction,
        taxDeduction,
        netSalary,
        status: "DRAFT",
      },
    });

    generatedRecords.push(record);
  }

  await recordAuditLog({
    organizationId: org.id,
    action: "GENERATE",
    entity: "Payroll",
    entityId: input.monthDate,
    changes: {
      employeesProcessed: generatedRecords.length,
    },
  });

  revalidatePath("/employees");
  revalidatePath("/attendance");
  return generatedRecords;
}

export async function getPayrollRecords() {
  const org = await requireOrganization();
  return db.payrollRecord.findMany({
    where: {
      employee: {
        organizationId: org.id,
      },
    },
    include: {
      employee: true,
    },
    orderBy: { month: "desc" },
  });
}
