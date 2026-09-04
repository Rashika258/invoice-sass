"use server";

import { revalidatePath } from "next/cache";
import type { DocumentType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { DOCUMENT_META } from "@/lib/documents";
import { calculateDocumentTotals, statesMatch } from "@/lib/invoice-utils";
import { nextDocumentNumber } from "@/lib/number-series";
import { requireOrganization } from "@/lib/organization";
import { applyStockChange, shouldAffectStock } from "@/lib/stock";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";

function refreshDocuments(href: string) {
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath("/estimates");
  revalidatePath("/credit-notes");
  revalidatePath("/challans");
  revalidatePath("/purchases");
  revalidatePath("/debit-notes");
  revalidatePath("/purchase-orders");
  revalidatePath("/items");
  revalidatePath("/customers");
  revalidatePath("/reports");
  revalidatePath(href);
}

export async function getInvoices(documentType?: DocumentType) {
  const organization = await requireOrganization();
  return db.invoice.findMany({
    where: {
      organizationId: organization.id,
      ...(documentType ? { documentType } : {}),
    },
    include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  const organization = await requireOrganization();
  return db.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { customer: true, items: { orderBy: { sortOrder: "asc" } }, payments: true },
  });
}

function linePayload(parsed: InvoiceInput) {
  return parsed.items.map((item, sortOrder) => ({
    itemId: item.itemId || null,
    description: item.description,
    hsn: item.hsn || null,
    unit: item.unit || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    gstRate: item.gstRate ?? parsed.taxRate,
    amount: item.quantity * item.unitPrice,
    sortOrder,
  }));
}

export async function createInvoice(data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const organization = await requireOrganization();
  const customer = await db.customer.findFirst({
    where: { id: parsed.customerId, organizationId: organization.id },
  });
  if (!customer) throw new Error("Party not found");

  const placeOfSupply = parsed.placeOfSupply || customer.state || "";
  const isInterState = parsed.isInterState || !statesMatch(organization.profile?.state, placeOfSupply);
  const totals = calculateDocumentTotals(
    parsed.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate ?? parsed.taxRate,
    })),
    parsed.discount,
    isInterState,
  );

  const invoice = await db.$transaction(async (tx) => {
    const profile = await tx.companyProfile.upsert({
      where: { organizationId: organization.id },
      create: { organizationId: organization.id, companyName: organization.name },
      update: {},
    });
    const invoiceNumber = await nextDocumentNumber(
      tx,
      organization.id,
      parsed.documentType,
      profile.invoicePrefix,
    );

    const created = await tx.invoice.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        invoiceNumber,
        documentType: parsed.documentType,
        issueDate: new Date(parsed.issueDate),
        dueDate: new Date(parsed.dueDate),
        status: parsed.status,
        companyName: profile.companyName || organization.name,
        companyEmail: profile.email,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        companyCity: profile.city,
        companyState: profile.state,
        companyZip: profile.zipCode,
        companyCountry: profile.country,
        companyTaxId: profile.taxId,
        notes: parsed.notes || null,
        terms: parsed.terms || null,
        placeOfSupply: placeOfSupply || null,
        isInterState,
        vehicleNumber: parsed.vehicleNumber || null,
        ewayBill: parsed.ewayBill || null,
        orderNumber: parsed.orderNumber || null,
        ...totals,
        discount: parsed.discount,
        items: { create: linePayload(parsed) },
      },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    });

    if (shouldAffectStock(parsed.status)) {
      await applyStockChange(tx, organization.id, parsed.documentType, parsed.items, 1);
    }

    return created;
  });

  refreshDocuments(DOCUMENT_META[parsed.documentType].href);
  return invoice;
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const parsed = invoiceSchema.parse(data);
  const organization = await requireOrganization();
  const customer = await db.customer.findFirst({
    where: { id: parsed.customerId, organizationId: organization.id },
  });
  if (!customer) throw new Error("Party not found");

  const existing = await db.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { items: true },
  });
  if (!existing) throw new Error("Document not found");

  const placeOfSupply = parsed.placeOfSupply || customer.state || "";
  const isInterState = parsed.isInterState || !statesMatch(organization.profile?.state, placeOfSupply);
  const totals = calculateDocumentTotals(
    parsed.items.map((item) => ({
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate ?? parsed.taxRate,
    })),
    parsed.discount,
    isInterState,
  );

  const invoice = await db.$transaction(async (tx) => {
    if (shouldAffectStock(existing.status)) {
      await applyStockChange(
        tx,
        organization.id,
        existing.documentType,
        existing.items,
        -1,
      );
    }

    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    const updated = await tx.invoice.update({
      where: { id },
      data: {
        customerId: customer.id,
        documentType: parsed.documentType,
        issueDate: new Date(parsed.issueDate),
        dueDate: new Date(parsed.dueDate),
        status: parsed.status,
        notes: parsed.notes || null,
        terms: parsed.terms || null,
        placeOfSupply: placeOfSupply || null,
        isInterState,
        vehicleNumber: parsed.vehicleNumber || null,
        ewayBill: parsed.ewayBill || null,
        orderNumber: parsed.orderNumber || null,
        ...totals,
        discount: parsed.discount,
        items: { create: linePayload(parsed) },
      },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
    });

    if (shouldAffectStock(parsed.status)) {
      await applyStockChange(tx, organization.id, parsed.documentType, parsed.items, 1);
    }

    return updated;
  });

  refreshDocuments(DOCUMENT_META[parsed.documentType].href);
  revalidatePath(`/invoices/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  const organization = await requireOrganization();
  const existing = await db.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { items: true },
  });
  if (!existing) throw new Error("Document not found");

  await db.$transaction(async (tx) => {
    if (shouldAffectStock(existing.status)) {
      await applyStockChange(
        tx,
        organization.id,
        existing.documentType,
        existing.items,
        -1,
      );
    }
    await tx.invoice.delete({ where: { id } });
  });

  refreshDocuments(DOCUMENT_META[existing.documentType].href);
}
