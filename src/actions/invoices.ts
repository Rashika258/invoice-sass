"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  calculateInvoiceTotals,
  calculateLineAmount,
} from "@/lib/invoice-utils";
import {
  getNextInvoiceNumber,
  requireOrganization,
} from "@/lib/organization";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";

async function getCompanySnapshot(organizationId: string) {
  const profile = await db.companyProfile.findUnique({
    where: { organizationId },
  });

  if (!profile) {
    throw new Error("Company profile not found");
  }

  return {
    companyName: profile.companyName,
    companyEmail: profile.email,
    companyPhone: profile.phone,
    companyAddress: profile.address,
    companyCity: profile.city,
    companyState: profile.state,
    companyZip: profile.zipCode,
    companyCountry: profile.country,
    companyTaxId: profile.taxId,
  };
}

export async function getInvoices() {
  const org = await requireOrganization();
  return db.invoice.findMany({
    where: { organizationId: org.id },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  const org = await requireOrganization();
  return db.invoice.findFirst({
    where: { id, organizationId: org.id },
    include: {
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function createInvoice(data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const org = await requireOrganization();
  const snapshot = await getCompanySnapshot(org.id);
  const invoiceNumber = await getNextInvoiceNumber(org.id);
  const totals = calculateInvoiceTotals(
    parsed.items,
    parsed.taxRate,
    parsed.discount,
  );

  const invoice = await db.invoice.create({
    data: {
      organizationId: org.id,
      customerId: parsed.customerId,
      invoiceNumber,
      issueDate: new Date(parsed.issueDate),
      dueDate: new Date(parsed.dueDate),
      status: parsed.status,
      ...snapshot,
      notes: parsed.notes || null,
      terms: parsed.terms || org.profile?.paymentTerms || null,
      subtotal: totals.subtotal,
      taxRate: parsed.taxRate,
      taxAmount: totals.taxAmount,
      discount: parsed.discount,
      total: totals.total,
      items: {
        create: parsed.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: calculateLineAmount(item.quantity, item.unitPrice),
          sortOrder: index,
        })),
      },
    },
    include: {
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return invoice;
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const org = await requireOrganization();
  const totals = calculateInvoiceTotals(
    parsed.items,
    parsed.taxRate,
    parsed.discount,
  );

  await db.invoiceItem.deleteMany({ where: { invoiceId: id } });

  const invoice = await db.invoice.updateMany({
    where: { id, organizationId: org.id },
    data: {
      customerId: parsed.customerId,
      issueDate: new Date(parsed.issueDate),
      dueDate: new Date(parsed.dueDate),
      status: parsed.status,
      notes: parsed.notes || null,
      terms: parsed.terms || null,
      subtotal: totals.subtotal,
      taxRate: parsed.taxRate,
      taxAmount: totals.taxAmount,
      discount: parsed.discount,
      total: totals.total,
    },
  });

  if (invoice.count === 0) {
    throw new Error("Invoice not found");
  }

  await db.invoiceItem.createMany({
    data: parsed.items.map((item, index) => ({
      invoiceId: id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: calculateLineAmount(item.quantity, item.unitPrice),
      sortOrder: index,
    })),
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteInvoice(id: string) {
  const org = await requireOrganization();

  await db.invoice.deleteMany({
    where: { id, organizationId: org.id },
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceInput["status"],
) {
  const org = await requireOrganization();

  await db.invoice.updateMany({
    where: { id, organizationId: org.id },
    data: { status },
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
}
