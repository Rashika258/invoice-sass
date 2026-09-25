"use server";

import { db } from "@/db";
import { requireOrganization } from "@/lib/organization";
import { requirePermission } from "@/lib/permissions";
import type { ItemInput } from "@/lib/validations";
import { ItemService } from "@/services/item-service";

export async function getItems() {
  const organization = await requireOrganization();
  await requirePermission("INVENTORY_READ");
  return ItemService.list(organization.id);
}

export async function getPublicProducts() {
  return db.item.findMany({
    where: { isPublic: true },
    include: { organization: { include: { profile: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createItem(data: ItemInput) {
  const organization = await requireOrganization();
  await requirePermission("INVENTORY_MANAGE");
  return ItemService.create(organization.id, data);
}

export async function updateItem(id: string, data: ItemInput) {
  const organization = await requireOrganization();
  await requirePermission("INVENTORY_MANAGE");
  return ItemService.update(organization.id, id, data);
}

export async function deleteItem(id: string) {
  const organization = await requireOrganization();
  await requirePermission("INVENTORY_MANAGE");
  return ItemService.delete(organization.id, id);
}
