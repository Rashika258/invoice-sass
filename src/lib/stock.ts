import type { DocumentType, Prisma } from "@/generated/prisma/client";
import { DOCUMENT_META } from "@/lib/documents";

type Tx = Prisma.TransactionClient;

export async function applyStockChange(
  tx: Tx,
  organizationId: string,
  documentType: DocumentType,
  items: { itemId?: string | null; quantity: number }[],
  direction: 1 | -1,
) {
  const effect = DOCUMENT_META[documentType].affectsStock;
  if (!effect) return;

  const sign = (effect === "out" ? -1 : 1) * direction;

  for (const item of items) {
    if (!item.itemId) continue;
    const catalog = await tx.item.findFirst({
      where: { id: item.itemId, organizationId, itemType: "PRODUCT" },
    });
    if (!catalog) continue;
    await tx.item.update({
      where: { id: catalog.id },
      data: { stockQty: { increment: sign * item.quantity } },
    });
  }
}

export function shouldAffectStock(status: string) {
  return status !== "CANCELLED" && status !== "DRAFT";
}
