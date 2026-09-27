import { db } from "@/lib/db";
import { DOCUMENT_META } from "@/lib/documents";
import { calculateDocumentTotals, statesMatch } from "@/lib/invoice-utils";
import { nextDocumentNumber } from "@/lib/number-series";
import { applyStockChange, shouldAffectStock } from "@/lib/stock";
import { invoiceSchema, type InvoiceInput } from "@/lib/validations";
import { recordAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { DocumentType, InvoiceStatus } from "@/generated/prisma/client";
import { AccountingService } from "@/services/accounting-service";

const MAX_PAGE_SIZE = 100;

function refreshDocuments(href: string) {
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  if (href) revalidatePath(href);
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

export class InvoiceService {
  static async list(organizationId: string, documentType?: DocumentType) {
    return db.invoice.findMany({
      where: {
        organizationId,
        ...(documentType ? { documentType } : {}),
      },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async listPaginated(
    organizationId: string,
    options: {
      documentType?: DocumentType;
      page?: number;
      limit?: number;
      search?: string;
      status?: InvoiceStatus;
    },
  ) {
    const page = Number.isFinite(options.page) ? Math.max(1, Math.floor(options.page!)) : 1;
    const limit = Number.isFinite(options.limit)
      ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(options.limit!)))
      : 10;
    const skip = (page - 1) * limit;
    const search = options.search?.trim().slice(0, 100);

    const where = {
      organizationId,
      ...(options.documentType ? { documentType: options.documentType } : {}),
      ...(options.status ? { status: options.status } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search } },
              { customer: { name: { contains: search } } },
            ],
          }
        : {}),
    };

    const [invoices, total] = await Promise.all([
      db.invoice.findMany({
        where,
        include: { customer: true, items: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getById(organizationId: string, id: string) {
    return db.invoice.findFirst({
      where: { id, organizationId },
      include: { customer: true, items: { orderBy: { sortOrder: "asc" } }, payments: true },
    });
  }

  static async create(
    organizationId: string,
    data: InvoiceInput,
    orgName: string,
    orgProfileState?: string | null,
  ) {
    const parsed = invoiceSchema.parse(data);
    const customer = await db.customer.findFirst({ where: { id: parsed.customerId, organizationId } });
    if (!customer) throw new Error("Party not found");

    const placeOfSupply = parsed.placeOfSupply || customer.state || "";
    const isInterState = parsed.isInterState || !statesMatch(orgProfileState, placeOfSupply);
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
        where: { organizationId },
        create: { organizationId, companyName: orgName },
        update: {},
      });
      const invoiceNumber = await nextDocumentNumber(
        tx,
        organizationId,
        parsed.documentType,
        profile.invoicePrefix,
      );
      const created = await tx.invoice.create({
        data: {
          organizationId,
          customerId: customer.id,
          invoiceNumber,
          documentType: parsed.documentType,
          issueDate: new Date(parsed.issueDate),
          dueDate: new Date(parsed.dueDate),
          status: parsed.status,
          companyName: profile.companyName || orgName,
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
      if (shouldAffectStock(parsed.status))
        await applyStockChange(tx, organizationId, parsed.documentType, parsed.items, 1);
      if (parsed.documentType === "SALE") {
        await AccountingService.postInvoiceVoucher(tx, organizationId, created);
      }
      return created;
    });

    await recordAuditLog({
      organizationId,
      action: "CREATE",
      entity: "Invoice",
      entityId: invoice.id,
      changes: {
        invoiceNumber: invoice.invoiceNumber,
        documentType: invoice.documentType,
        total: invoice.total,
        customer: customer.name,
      },
    });
    refreshDocuments(DOCUMENT_META[parsed.documentType].href);
    return invoice;
  }

  static async update(
    organizationId: string,
    id: string,
    data: InvoiceInput,
    orgProfileState?: string | null,
  ) {
    const parsed = invoiceSchema.parse(data);
    const customer = await db.customer.findFirst({ where: { id: parsed.customerId, organizationId } });
    if (!customer) throw new Error("Party not found");
    const existing = await db.invoice.findFirst({ where: { id, organizationId }, include: { items: true } });
    if (!existing) throw new Error("Document not found");

    if (existing.status === "PAID" || existing.status === "CANCELLED") {
      throw new Error(`Invoice #${existing.invoiceNumber} is ${existing.status.toLowerCase()} and locked against direct edits. Reopen the invoice to make modifications.`);
    }

    const placeOfSupply = parsed.placeOfSupply || customer.state || "";
    const isInterState = parsed.isInterState || !statesMatch(orgProfileState, placeOfSupply);
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
      if (shouldAffectStock(existing.status))
        await applyStockChange(tx, organizationId, existing.documentType, existing.items, -1);
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
      if (shouldAffectStock(parsed.status))
        await applyStockChange(tx, organizationId, parsed.documentType, parsed.items, 1);
      return updated;
    });

    await recordAuditLog({
      organizationId,
      action: "UPDATE",
      entity: "Invoice",
      entityId: invoice.id,
      changes: {
        invoiceNumber: invoice.invoiceNumber,
        documentType: invoice.documentType,
        total: invoice.total,
      },
    });
    refreshDocuments(DOCUMENT_META[parsed.documentType].href);
    revalidatePath(`/invoices/${id}`);
    return invoice;
  }

  static async delete(organizationId: string, id: string) {
    const existing = await db.invoice.findFirst({ where: { id, organizationId }, include: { items: true } });
    if (!existing) throw new Error("Document not found");
    await db.$transaction(async (tx) => {
      if (shouldAffectStock(existing.status))
        await applyStockChange(tx, organizationId, existing.documentType, existing.items, -1);
      await tx.invoice.delete({ where: { id } });
    });
    await recordAuditLog({
      organizationId,
      action: "DELETE",
      entity: "Invoice",
      entityId: id,
      changes: {
        invoiceNumber: existing.invoiceNumber,
        documentType: existing.documentType,
      },
    });
    refreshDocuments(DOCUMENT_META[existing.documentType].href);
  }

  static async reopen(organizationId: string, id: string, reason: string) {
    const existing = await db.invoice.findFirst({ where: { id, organizationId } });
    if (!existing) throw new Error("Document not found");

    const updated = await db.invoice.update({
      where: { id },
      data: { status: "DRAFT" },
    });

    await recordAuditLog({
      organizationId,
      action: "UPDATE",
      entity: "Invoice",
      entityId: id,
      changes: {
        action: "REOPEN_INVOICE",
        previousStatus: existing.status,
        newStatus: "DRAFT",
        reason,
      },
    });

    refreshDocuments(DOCUMENT_META[existing.documentType].href);
    revalidatePath(`/invoices/${id}`);
    return updated;
  }
}
