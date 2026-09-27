"use server";

import type { DocumentType, InvoiceStatus } from "@/generated/prisma/client";
import { requireOrganization } from "@/lib/organization";
import { requirePermission } from "@/lib/permissions";
import type { InvoiceInput } from "@/lib/validations";
import { InvoiceService } from "@/services/invoice-service";

export interface GetInvoicesOptions {
  documentType?: DocumentType;
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
}

export async function getInvoices(documentType?: DocumentType) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_READ");
  return InvoiceService.list(organization.id, documentType);
}

export async function getPaginatedInvoices(options: GetInvoicesOptions) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_READ");
  return InvoiceService.listPaginated(organization.id, options);
}

export async function getInvoice(id: string) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_READ");
  return InvoiceService.getById(organization.id, id);
}

export async function createInvoice(data: InvoiceInput) {
  await requirePermission("INVOICE_CREATE");
  const organization = await requireOrganization();
  return InvoiceService.create(organization.id, data, organization.name, organization.profile?.state);
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  await requirePermission("INVOICE_UPDATE");
  const organization = await requireOrganization();
  return InvoiceService.update(organization.id, id, data, organization.profile?.state);
}

export async function deleteInvoice(id: string) {
  await requirePermission("INVOICE_DELETE");
  const organization = await requireOrganization();
  return InvoiceService.delete(organization.id, id);
}

export async function reopenInvoice(id: string, reason: string) {
  await requirePermission("sales:reopen");
  const organization = await requireOrganization();
  return InvoiceService.reopen(organization.id, id, reason);
}
