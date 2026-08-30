"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { itemSchema, type ItemInput } from "@/lib/validations";

export async function getItems() {
  const org = await requireOrganization();
  return db.item.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicProducts() {
  return db.item.findMany({
    where: { isPublic: true },
    include: {
      organization: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getItem(id: string) {
  const org = await requireOrganization();
  return db.item.findFirst({
    where: { id, organizationId: org.id },
  });
}

export async function createItem(data: ItemInput) {
  const parsed = itemSchema.parse(data);
  const org = await requireOrganization();

  const item = await db.item.create({
    data: {
      organizationId: org.id,
      ...parsed,
    },
  });

  revalidatePath("/items");
  revalidatePath("/invoices");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  return item;
}

export async function updateItem(id: string, data: ItemInput) {
  const parsed = itemSchema.parse(data);
  const org = await requireOrganization();

  await db.item.updateMany({
    where: { id, organizationId: org.id },
    data: parsed,
  });

  revalidatePath("/items");
  revalidatePath("/invoices");
  revalidatePath("/products");
  revalidatePath("/dashboard");
}

export async function deleteItem(id: string) {
  const org = await requireOrganization();

  await db.item.deleteMany({
    where: { id, organizationId: org.id },
  });

  revalidatePath("/items");
  revalidatePath("/invoices");
  revalidatePath("/products");
  revalidatePath("/dashboard");
}
