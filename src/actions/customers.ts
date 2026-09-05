"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { customerSchema, type CustomerInput } from "@/lib/validations";

export async function getCustomers() {
  const organization = await requireOrganization();
  return db.customer.findMany({ where: { organizationId: organization.id }, orderBy: { name: "asc" } });
}

export async function createCustomer(data: CustomerInput) {
  const parsed = customerSchema.parse(data);
  const organization = await requireOrganization();
  const customer = await db.customer.create({
    data: {
      organizationId: organization.id,
      ...parsed,
      email: parsed.email || null,
    },
  });
  revalidatePath("/customers"); revalidatePath("/invoices/new"); revalidatePath("/dashboard");
  return customer;
}

export async function updateCustomer(id: string, data: CustomerInput) {
  const parsed = customerSchema.parse(data);
  const organization = await requireOrganization();
  const result = await db.customer.updateMany({ where: { id, organizationId: organization.id }, data: { ...parsed, email: parsed.email || null } });
  if (!result.count) throw new Error("Customer not found");
  revalidatePath("/customers"); revalidatePath("/invoices");
}

export async function deleteCustomer(id: string) {
  const organization = await requireOrganization();
  if (await db.invoice.count({ where: { customerId: id, organizationId: organization.id } })) {
    throw new Error("Parties with bills cannot be deleted");
  }
  if (await db.payment.count({ where: { partyId: id, organizationId: organization.id } })) {
    throw new Error("Parties with payments cannot be deleted");
  }
  const result = await db.customer.deleteMany({ where: { id, organizationId: organization.id } });
  if (!result.count) throw new Error("Customer not found");
  revalidatePath("/customers"); revalidatePath("/dashboard");
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
  let count = 0;
  for (const party of parties) {
    if (!party.name?.trim()) continue;
    await db.customer.create({
      data: {
        organizationId: organization.id,
        name: party.name.trim(),
        partyType: party.type || "CUSTOMER",
        phone: party.phone || null,
        taxId: party.gstin || null,
        state: party.state || null,
        openingBalance: Number(party.openingBalance) || 0,
      },
    });
    count++;
  }
  revalidatePath("/customers");
  revalidatePath("/invoices/new");
  revalidatePath("/dashboard");
  return { success: true, count };
}
