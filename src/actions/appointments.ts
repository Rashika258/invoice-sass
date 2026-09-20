"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: {
  customerId: string;
  employeeId?: string;
  serviceName: string;
  appointmentDate: string;
  amount?: number;
  notes?: string;
}) {
  const org = await requireOrganization();

  const appointment = await db.appointment.create({
    data: {
      organizationId: org.id,
      customerId: data.customerId,
      employeeId: data.employeeId || null,
      serviceName: data.serviceName,
      appointmentDate: new Date(data.appointmentDate),
      amount: data.amount ?? 0,
      notes: data.notes || null,
      status: "SCHEDULED",
    },
  });

  revalidatePath("/appointments");
  return appointment;
}

export async function updateAppointmentStatus(id: string, status: "SCHEDULED" | "COMPLETED" | "CANCELLED") {
  const org = await requireOrganization();

  await db.appointment.updateMany({
    where: { id, organizationId: org.id },
    data: { status },
  });

  revalidatePath("/appointments");
}

export async function getAppointments() {
  const org = await requireOrganization();

  return db.appointment.findMany({
    where: { organizationId: org.id },
    include: {
      customer: true,
      employee: true,
    },
    orderBy: {
      appointmentDate: "asc",
    },
  });
}
