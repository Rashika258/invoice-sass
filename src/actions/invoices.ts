"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { calculateInvoiceTotals } from "@/lib/invoice-utils";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";

function refreshInvoices() {
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
}

export async function getInvoices() {
  const organization = await requireOrganization();
  return db.invoice.findMany({ where: { organizationId: organization.id }, include: { customer: true, items: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } });
}

export async function getInvoice(id: string) {
  const organization = await requireOrganization();
  return db.invoice.findFirst({ where: { id, organizationId: organization.id }, include: { customer: true, items: { orderBy: { sortOrder: "asc" } } } });
}

export async function createInvoice(data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const organization = await requireOrganization();
  const customer = await db.customer.findFirst({ where: { id: parsed.customerId, organizationId: organization.id } });
  if (!customer) throw new Error("Customer not found");
  const totals = calculateInvoiceTotals(parsed.items, parsed.taxRate, parsed.discount);
  const invoice = await db.$transaction(async (tx) => {
    const profile = await tx.companyProfile.upsert({ where: { organizationId: organization.id }, create: { organizationId: organization.id, companyName: organization.name }, update: {} });
    const invoiceNumber = `${profile.invoicePrefix}-${String(profile.nextInvoiceNumber).padStart(4, "0")}`;
    await tx.companyProfile.update({ where: { organizationId: organization.id }, data: { nextInvoiceNumber: { increment: 1 } } });
    return tx.invoice.create({
      data: {
        organizationId: organization.id, customerId: customer.id, invoiceNumber,
        issueDate: new Date(parsed.issueDate), dueDate: new Date(parsed.dueDate), status: parsed.status,
        companyName: profile.companyName || organization.name, companyEmail: profile.email, companyPhone: profile.phone,
        companyAddress: profile.address, companyCity: profile.city, companyState: profile.state, companyZip: profile.zipCode,
        companyCountry: profile.country, companyTaxId: profile.taxId, notes: parsed.notes || null, terms: parsed.terms || null,
        ...totals, taxRate: parsed.taxRate, discount: parsed.discount,
        items: { create: parsed.items.map((item, sortOrder) => ({ ...item, amount: item.quantity * item.unitPrice, sortOrder })) },
      },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    });
  });
  refreshInvoices();
  return invoice;
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const organization = await requireOrganization();
  const customer = await db.customer.findFirst({ where: { id: parsed.customerId, organizationId: organization.id } });
  if (!customer) throw new Error("Customer not found");
  if (!await db.invoice.findFirst({ where: { id, organizationId: organization.id } })) throw new Error("Invoice not found");
  const totals = calculateInvoiceTotals(parsed.items, parsed.taxRate, parsed.discount);
  const invoice = await db.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    return tx.invoice.update({
      where: { id },
      data: {
        customerId: customer.id, issueDate: new Date(parsed.issueDate), dueDate: new Date(parsed.dueDate), status: parsed.status,
        notes: parsed.notes || null, terms: parsed.terms || null, ...totals, taxRate: parsed.taxRate, discount: parsed.discount,
        items: { create: parsed.items.map((item, sortOrder) => ({ ...item, amount: item.quantity * item.unitPrice, sortOrder })) },
      },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    });
  });
  refreshInvoices(); revalidatePath(`/invoices/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  const organization = await requireOrganization();
  const result = await db.invoice.deleteMany({ where: { id, organizationId: organization.id } });
  if (!result.count) throw new Error("Invoice not found");
  refreshInvoices();
}
