"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/organization";
import { recordAuditLog } from "@/lib/audit";

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export interface RecurringInvoiceInput {
  invoiceTemplateId?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  autoEmail?: boolean;
  autoWhatsApp?: boolean;
  reminderDaysBefore?: number;
}

function nextDate(frequency: RecurringFrequency, from: Date) {
  const value = new Date(from);
  if (frequency === "DAILY") value.setDate(value.getDate() + 1);
  if (frequency === "WEEKLY") value.setDate(value.getDate() + 7);
  if (frequency === "MONTHLY") value.setMonth(value.getMonth() + 1);
  if (frequency === "QUARTERLY") value.setMonth(value.getMonth() + 3);
  if (frequency === "YEARLY") value.setFullYear(value.getFullYear() + 1);
  return value;
}

function validateInput(input: RecurringInvoiceInput) {
  if (!input.frequency) throw new Error("Frequency is required");
  const startDate = new Date(input.startDate);
  if (Number.isNaN(startDate.getTime())) throw new Error("Invalid start date");
  const endDate = input.endDate ? new Date(input.endDate) : null;
  if (endDate && (Number.isNaN(endDate.getTime()) || endDate < startDate)) throw new Error("End date must be after the start date");
  const reminderDaysBefore = Math.min(Math.max(Math.floor(Number(input.reminderDaysBefore ?? 3)), 0), 90);
  return { startDate, endDate, reminderDaysBefore };
}

export async function createRecurringInvoiceSchedule(input: RecurringInvoiceInput) {
  const org = await requireOrganization();
  const parsed = validateInput(input);
  if (input.invoiceTemplateId) {
    const template = await db.invoice.findFirst({ where: { id: input.invoiceTemplateId, organizationId: org.id } });
    if (!template) throw new Error("Invoice template not found");
  }
  const recurring = await db.recurringInvoice.create({ data: { organizationId: org.id, invoiceTemplateId: input.invoiceTemplateId || null, frequency: input.frequency, startDate: parsed.startDate, endDate: parsed.endDate, nextGenerationDate: parsed.startDate, status: "ACTIVE", autoEmail: input.autoEmail ?? true, autoWhatsApp: input.autoWhatsApp ?? false, reminderDaysBefore: parsed.reminderDaysBefore } });
  await recordAuditLog({ organizationId: org.id, action: "CREATE", entity: "RecurringInvoice", entityId: recurring.id, changes: { frequency: recurring.frequency } });
  revalidatePath("/invoices");
  return recurring;
}

export async function getRecurringInvoices() {
  const org = await requireOrganization();
  return db.recurringInvoice.findMany({ where: { organizationId: org.id }, orderBy: { nextGenerationDate: "asc" } });
}

export async function setRecurringInvoiceStatus(id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
  const org = await requireOrganization();
  const result = await db.recurringInvoice.updateMany({ where: { id, organizationId: org.id }, data: { status } });
  if (!result.count) throw new Error("Recurring schedule not found");
  revalidatePath("/invoices");
  return { success: true };
}

export async function advanceRecurringInvoiceSchedule(id: string) {
  const org = await requireOrganization();
  const schedule = await db.recurringInvoice.findFirst({ where: { id, organizationId: org.id } });
  if (!schedule) throw new Error("Recurring schedule not found");
  const next = nextDate(schedule.frequency as RecurringFrequency, schedule.nextGenerationDate);
  const status = schedule.endDate && next > schedule.endDate ? "COMPLETED" : schedule.status;
  const updated = await db.recurringInvoice.update({ where: { id }, data: { nextGenerationDate: next, lastGeneratedAt: new Date(), status } });
  revalidatePath("/invoices");
  return updated;
}

export async function deleteRecurringInvoiceSchedule(id: string) {
  const org = await requireOrganization();
  const result = await db.recurringInvoice.deleteMany({ where: { id, organizationId: org.id } });
  if (!result.count) throw new Error("Recurring schedule not found");
  revalidatePath("/invoices");
}
