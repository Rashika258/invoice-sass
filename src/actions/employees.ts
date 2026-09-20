"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import {
  attendanceSchema,
  employeeSchema,
  type AttendanceInput,
  type EmployeeInput,
} from "@/lib/validations";

export async function getEmployees() {
  const org = await requireOrganization();
  return db.employee.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEmployee(data: EmployeeInput) {
  const parsed = employeeSchema.parse(data);
  const org = await requireOrganization();

  const employee = await db.employee.create({
    data: {
      organizationId: org.id,
      ...parsed,
      email: parsed.email || null,
    },
  });

  revalidatePath("/employees");
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return employee;
}

export async function updateEmployee(id: string, data: EmployeeInput) {
  const parsed = employeeSchema.parse(data);
  const org = await requireOrganization();

  const result = await db.employee.updateMany({
    where: { id, organizationId: org.id },
    data: {
      ...parsed,
      email: parsed.email || null,
    },
  });

  if (result.count === 0) {
    throw new Error("Employee not found");
  }

  revalidatePath("/employees");
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function deleteEmployee(id: string) {
  const org = await requireOrganization();

  const result = await db.employee.deleteMany({
    where: { id, organizationId: org.id },
  });

  if (result.count === 0) {
    throw new Error("Employee not found");
  }

  revalidatePath("/employees");
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}

export async function getAttendanceRecords(month?: string) {
  const org = await requireOrganization();

  const where: {
    employee: { organizationId: string };
    date?: { gte: Date; lte?: Date; lt?: Date };
  } = {
    employee: { organizationId: org.id },
  };

  if (month) {
    const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
    if (!match) {
      throw new Error("Month must use YYYY-MM format");
    }

    const year = Number(match[1]);
    const monthNum = Number(match[2]);
    const start = new Date(Date.UTC(year, monthNum - 1, 1));
    const end = new Date(Date.UTC(year, monthNum, 1));
    where.date = { gte: start, lt: end };
  }

  return db.attendanceRecord.findMany({
    where,
    include: { employee: true },
    orderBy: [{ date: "desc" }, { employee: { name: "asc" } }],
  });
}

export async function createAttendance(data: AttendanceInput) {
  const parsed = attendanceSchema.parse(data);
  const org = await requireOrganization();

  const employee = await db.employee.findFirst({
    where: { id: parsed.employeeId, organizationId: org.id },
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const record = await db.attendanceRecord.upsert({
    where: {
      employeeId_date: {
        employeeId: parsed.employeeId,
        date: new Date(parsed.date),
      },
    },
    create: {
      employeeId: parsed.employeeId,
      date: new Date(parsed.date),
      hoursWorked: parsed.hoursWorked,
      notes: parsed.notes || null,
    },
    update: {
      hoursWorked: parsed.hoursWorked,
      notes: parsed.notes || null,
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  return record;
}

export async function deleteAttendance(id: string) {
  const org = await requireOrganization();

  const record = await db.attendanceRecord.findFirst({
    where: { id, employee: { organizationId: org.id } },
  });

  if (!record) {
    throw new Error("Attendance record not found");
  }

  await db.attendanceRecord.delete({ where: { id } });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
}
