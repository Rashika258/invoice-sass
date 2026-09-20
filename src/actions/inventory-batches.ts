"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { recordAuditLog } from "@/lib/audit";

export interface InventoryBatchInput {
  itemId: string;
  batchNumber: string;
  quantity: number;
  costPrice?: number;
  expiryDate?: string;
  dateReceived?: string;
}

function parseBatchInput(input: InventoryBatchInput) {
  const batchNumber = input.batchNumber.trim();
  const quantity = Number(input.quantity);
  const costPrice = Number(input.costPrice ?? 0);
  if (!input.itemId || !batchNumber) throw new Error("Item and batch number are required");
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be greater than zero");
  if (!Number.isFinite(costPrice) || costPrice < 0) throw new Error("Cost price cannot be negative");
  const expiryDate = input.expiryDate ? new Date(input.expiryDate) : null;
  if (expiryDate && Number.isNaN(expiryDate.getTime())) throw new Error("Invalid expiry date");
  return { batchNumber, quantity, costPrice, expiryDate };
}

export async function getInventoryBatches(itemId?: string) {
  const org = await requireOrganization();
  return db.inventoryBatch.findMany({
    where: { item: { organizationId: org.id }, ...(itemId ? { itemId } : {}) },
    include: { item: true },
    orderBy: [{ expiryDate: "asc" }, { dateReceived: "desc" }],
  });
}

export async function receiveInventoryBatch(input: InventoryBatchInput) {
  const org = await requireOrganization();
  const parsed = parseBatchInput(input);
  const item = await db.item.findFirst({ where: { id: input.itemId, organizationId: org.id, itemType: "PRODUCT" } });
  if (!item) throw new Error("Product not found");

  const batch = await db.$transaction(async (tx) => {
    const created = await tx.inventoryBatch.create({
      data: {
        itemId: item.id,
        batchNumber: parsed.batchNumber,
        quantity: parsed.quantity,
        costPrice: parsed.costPrice,
        expiryDate: parsed.expiryDate,
        dateReceived: input.dateReceived ? new Date(input.dateReceived) : new Date(),
      },
    });
    await tx.item.update({ where: { id: item.id }, data: { stockQty: { increment: parsed.quantity } } });
    return created;
  });

  await recordAuditLog({ organizationId: org.id, action: "CREATE", entity: "InventoryBatch", entityId: batch.id, changes: { item: item.name, batchNumber: batch.batchNumber, quantity: batch.quantity } });
  revalidatePath("/items");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return batch;
}

export async function updateInventoryBatch(id: string, input: Omit<InventoryBatchInput, "itemId">) {
  const org = await requireOrganization();
  const parsed = parseBatchInput({ ...input, itemId: "existing" });
  const existing = await db.inventoryBatch.findFirst({ where: { id, item: { organizationId: org.id } } });
  if (!existing) throw new Error("Batch not found");
  if (parsed.quantity !== existing.quantity) throw new Error("Use stock receiving/adjustment for quantity changes");

  const updated = await db.inventoryBatch.update({ where: { id }, data: { batchNumber: parsed.batchNumber, costPrice: parsed.costPrice, expiryDate: parsed.expiryDate } });
  revalidatePath("/items");
  revalidatePath("/inventory");
  return updated;
}

export async function deleteInventoryBatch(id: string) {
  const org = await requireOrganization();
  const existing = await db.inventoryBatch.findFirst({ where: { id, item: { organizationId: org.id } } });
  if (!existing) throw new Error("Batch not found");
  if (existing.quantity > 0) throw new Error("A batch with remaining stock cannot be deleted");
  await db.inventoryBatch.delete({ where: { id } });
  revalidatePath("/items");
  revalidatePath("/inventory");
}

export async function getExpiringInventory(days = 30) {
  const org = await requireOrganization();
  const safeDays = Math.min(Math.max(Math.floor(Number(days) || 30), 1), 3650);
  const now = new Date();
  const until = new Date(now.getTime() + safeDays * 86400000);
  return db.inventoryBatch.findMany({
    where: { item: { organizationId: org.id }, quantity: { gt: 0 }, expiryDate: { gte: now, lte: until } },
    include: { item: true },
    orderBy: { expiryDate: "asc" },
  });
}
