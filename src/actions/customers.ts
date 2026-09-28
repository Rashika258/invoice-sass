"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { requirePermission } from "@/lib/permissions";
import type { CustomerInput } from "@/lib/validations";
import { CustomerService } from "@/services/customer-service";

export async function getCustomers() {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_READ");
  return CustomerService.list(organization.id);
}

export async function createCustomer(data: CustomerInput) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_CREATE");
  return CustomerService.create(organization.id, data);
}

export async function updateCustomer(id: string, data: CustomerInput) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_UPDATE");
  return CustomerService.update(organization.id, id, data);
}

export async function deleteCustomer(id: string) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_DELETE");
  return CustomerService.delete(organization.id, id);
}

export async function bulkCreateCustomers(
  parties: Array<{
    name: string;
    type?: "CUSTOMER" | "SUPPLIER" | "BOTH";
    phone?: string;
    gstin?: string;
    state?: string;
    openingBalance?: number;
  }>
) {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_CREATE");
  let count = 0;
  for (const party of parties) {
    if (!party.name?.trim()) continue;
    await CustomerService.create(organization.id, {
      name: party.name.trim(),
      partyType: party.type || "CUSTOMER",
      phone: party.phone || "",
      taxId: party.gstin || "",
      state: party.state || "",
      openingBalance: Number(party.openingBalance) || 0,
    });
    count++;
  }
  return { success: true, count };
}

export async function getOrCreateWalkinCustomer() {
  const organization = await requireOrganization();
  await requirePermission("INVOICE_CREATE");
  let walkin = await db.customer.findFirst({
    where: {
      organizationId: organization.id,
      name: "Walk-in Customer",
    },
  });
  if (!walkin) {
    walkin = await CustomerService.create(organization.id, {
      name: "Walk-in Customer",
      partyType: "CUSTOMER",
      openingBalance: 0,
    });
  }
  return walkin;
}
