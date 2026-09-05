"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/lib/audit";

export interface RecurringInvoiceInput {
  invoiceTemplateId?: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  startDate: string;
  endDate?: string;
  autoEmail?: boolean;
  autoWhatsApp?: boolean;
  reminderDaysBefore?: number;
}

function calculateNextDate(
  frequency: string,
  fromDate: Date = new Date(),
): Date {
  const next = new Date(fromDate);
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3);
      break;
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export async function createRecurringInvoiceSchedule(input: RecurringInvoiceInput) {
  const org = await requireOrganization();
  const startDate = new Date(input.startDate);
  const nextGenerationDate = calculateNextDate(input.frequency, startDate);

  const recurring = await db.recurringInvoice.create({
    data: {
      organizationId: org.id,
      invoiceTemplateId: input.invoiceTemplateId || null,
      frequency: input.frequency,
      startDate,
      endDate: input.endDate ? new Date(input.endDate) : null,
      nextGenerationDate,
      status: "ACTIVE",
      autoEmail: input.autoEmail ?? true,
      autoWhatsApp: input.autoWhatsApp ?? false,
      reminderDaysBefore: input.reminderDaysBefore ?? 3,
    },
  });

  await recordAuditLog({
    organizationId: org.id,
    action: "CREATE",
    entity: "RecurringInvoice",
    entityId: recurring.id,
    changes: {
      frequency: recurring.frequency,
      nextGenerationDate: nextGenerationDate.toISOString(),
    },
  });

  revalidatePath("/invoices");
  return recurring;
}

export async function getRecurringInvoices() {
  const org = await requireOrganization();
  return db.recurringInvoice.findMany({
    where: { organizationId: org.id },
    orderBy: { nextGenerationDate: "asc" },
  });
}

export async function deleteRecurringInvoiceSchedule(id: string) {
  const org = await requireOrganization();
  await db.recurringInvoice.deleteMany({
    where: { id, organizationId: org.id },
  });

  await recordAuditLog({
    organizationId: org.id,
    action: "DELETE",
    entity: "RecurringInvoice",
    entityId: id,
  });

  revalidatePath("/invoices");
}
