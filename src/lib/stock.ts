import type { DocumentType, Prisma } from "@/generated/prisma/client";
import { DOCUMENT_META } from "@/lib/documents";

type Tx = Prisma.TransactionClient;

export type StockReasonCode =
  | "DAMAGE"
  | "EXPIRY"
  | "AUDIT_DISCREPANCY"
  | "INTERNAL_USE"
  | "RETURN"
  | "SALE"
  | "PURCHASE"
  | "MANUAL_ADJUSTMENT";

export async function applyStockChange(
  tx: Tx,
  organizationId: string,
  documentType: DocumentType,
  items: { itemId?: string | null; quantity: number }[],
  direction: 1 | -1,
  referenceNo?: string,
) {
  const effect = DOCUMENT_META[documentType].affectsStock;
  if (!effect) return;

  const sign = (effect === "out" ? -1 : 1) * direction;
  const movementType = documentType === "PURCHASE" ? "PURCHASE" : "SALE";

  for (const item of items) {
    if (!item.itemId) continue;
    const catalog = await tx.item.findFirst({
      where: { id: item.itemId, organizationId, itemType: "PRODUCT" },
    });
    if (!catalog) continue;

    const delta = sign * item.quantity;
    const updated = await tx.item.update({
      where: { id: catalog.id },
      data: { stockQty: { increment: delta } },
    });

    await tx.stockMovementLog.create({
      data: {
        organizationId,
        itemId: catalog.id,
        movementType,
        quantityChange: delta,
        balanceAfter: updated.stockQty,
        referenceNo: referenceNo || null,
        notes: `Document movement (${documentType})`,
      },
    });
  }
}

export async function recordManualStockAdjustment(
  tx: Tx,
  organizationId: string,
  itemId: string,
  quantityChange: number,
  reasonCode: StockReasonCode,
  notes?: string,
) {
  const catalog = await tx.item.findFirst({
    where: { id: itemId, organizationId, itemType: "PRODUCT" },
  });
  if (!catalog) throw new Error("Inventory item not found");

  const updated = await tx.item.update({
    where: { id: catalog.id },
    data: { stockQty: { increment: quantityChange } },
  });

  return tx.stockMovementLog.create({
    data: {
      organizationId,
      itemId: catalog.id,
      movementType: "MANUAL_ADJUSTMENT",
      quantityChange,
      balanceAfter: updated.stockQty,
      referenceNo: reasonCode,
      notes: notes || `Manual stock adjustment (${reasonCode})`,
    },
  });
}

export function shouldAffectStock(status: string) {
  return status !== "CANCELLED" && status !== "DRAFT";
}
