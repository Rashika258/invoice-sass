"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { itemSchema, type ItemInput } from "@/lib/validations";

export async function getItems() {
  const organization = await requireOrganization();
  return db.item.findMany({ where: { organizationId: organization.id }, orderBy: { name: "asc" } });
}

export async function getPublicProducts() {
  return db.item.findMany({ where: { isPublic: true }, include: { organization: { include: { profile: true } } }, orderBy: { createdAt: "desc" } });
}

export async function createItem(data: ItemInput) {
  const parsed = itemSchema.parse(data);
  const organization = await requireOrganization();
  const item = await db.item.create({ data: { organizationId: organization.id, ...parsed } });
  revalidatePath("/items"); revalidatePath("/products"); revalidatePath("/");
  return item;
}

export async function updateItem(id: string, data: ItemInput) {
  const parsed = itemSchema.parse(data);
  const organization = await requireOrganization();
  const result = await db.item.updateMany({ where: { id, organizationId: organization.id }, data: parsed });
  if (!result.count) throw new Error("Item not found");
  revalidatePath("/items"); revalidatePath("/products"); revalidatePath("/");
}

export async function deleteItem(id: string) {
  const organization = await requireOrganization();
  const result = await db.item.deleteMany({ where: { id, organizationId: organization.id } });
  if (!result.count) throw new Error("Item not found");
  revalidatePath("/items"); revalidatePath("/products"); revalidatePath("/");
}
