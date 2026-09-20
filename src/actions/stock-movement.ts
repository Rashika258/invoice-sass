"use server";

import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

export async function logStockMovement({
  itemId,
  movementType,
  quantityChange,
  referenceNo,
  notes,
}: {
  itemId: string;
  movementType: "SALE" | "PURCHASE" | "MANUAL_ADJUSTMENT" | "RETURN";
  quantityChange: number;
  referenceNo?: string;
  notes?: string;
}) {
  const org = await requireOrganization();
  const item = await db.item.findFirst({
    where: { id: itemId, organizationId: org.id },
  });

  if (!item) throw new Error("Item not found");

  const newBalance = Math.max(0, item.stockQty + quantityChange);

  await db.item.update({
    where: { id: itemId },
    data: { stockQty: newBalance },
  });

  return db.stockMovementLog.create({
    data: {
      organizationId: org.id,
      itemId,
      movementType,
      quantityChange,
      balanceAfter: newBalance,
      referenceNo: referenceNo || null,
      notes: notes || null,
    },
  });
}

export async function getStockMovementHistory(itemId?: string) {
  const org = await requireOrganization();

  return db.stockMovementLog.findMany({
    where: {
      organizationId: org.id,
      ...(itemId ? { itemId } : {}),
    },
    include: {
      item: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}
