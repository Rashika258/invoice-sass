"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { customerSchema, type CustomerInput } from "@/lib/validations";

export async function getCustomers() {
  const org = await requireOrganization();
  return db.customer.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomer(id: string) {
  const org = await requireOrganization();
  return db.customer.findFirst({
    where: { id, organizationId: org.id },
  });
}

export async function createCustomer(data: CustomerInput) {
  const parsed = customerSchema.parse(data);
  const org = await requireOrganization();

  const customer = await db.customer.create({
    data: {
      organizationId: org.id,
      ...parsed,
      email: parsed.email || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return customer;
}

export async function updateCustomer(id: string, data: CustomerInput) {
  const parsed = customerSchema.parse(data);
  const org = await requireOrganization();

  await db.customer.updateMany({
    where: { id, organizationId: org.id },
    data: {
      ...parsed,
      email: parsed.email || null,
    },
  });

  revalidatePath("/customers");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function deleteCustomer(id: string) {
  const org = await requireOrganization();

  await db.customer.deleteMany({
    where: { id, organizationId: org.id },
  });

  revalidatePath("/customers");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}
