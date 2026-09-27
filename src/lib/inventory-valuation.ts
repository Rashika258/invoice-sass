import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export interface StockTransferItem {
  itemId: string;
  quantity: number;
}

/**
 * Calculate Weighted Average Cost (WAC) for COGS valuation
 */
export function computeWeightedAverageCost(
  batches: { quantity: number; costPrice: number }[],
): number {
  const totalQty = batches.reduce((sum, b) => sum + b.quantity, 0);
  if (totalQty <= 0) return 0;

  const totalValue = batches.reduce((sum, b) => sum + b.quantity * b.costPrice, 0);
  return Math.round((totalValue / totalQty) * 100) / 100;
}

/**
 * Transfer inventory stock between store locations / warehouses
 */
export async function transferStockBetweenLocations(
  organizationId: string,
  sourceWarehouseId: string,
  targetWarehouseId: string,
  items: StockTransferItem[],
  notes?: string,
) {
  if (sourceWarehouseId === targetWarehouseId) {
    throw new AppError("VALIDATION_ERROR", "Source and target warehouses cannot be identical.", 400);
  }

  const [sourceWh, targetWh] = await Promise.all([
    db.warehouse.findFirst({ where: { id: sourceWarehouseId, organizationId } }),
    db.warehouse.findFirst({ where: { id: targetWarehouseId, organizationId } }),
  ]);

  if (!sourceWh || !targetWh) {
    throw new AppError("NOT_FOUND", "One or both warehouse locations were not found.", 404);
  }

  return db.$transaction(async (tx) => {
    const logs = [];
    for (const itemInput of items) {
      const catalog = await tx.item.findFirst({
        where: { id: itemInput.itemId, organizationId },
      });
      if (!catalog) continue;

      if (catalog.stockQty < itemInput.quantity) {
        throw new AppError(
          "CONFLICT",
          `Insufficient stock at ${sourceWh.name} for ${catalog.name}. Available: ${catalog.stockQty}, Requested: ${itemInput.quantity}`,
          400,
        );
      }

      // Record outbound movement from source
      const outbound = await tx.stockMovementLog.create({
        data: {
          organizationId,
          itemId: catalog.id,
          movementType: "MANUAL_ADJUSTMENT",
          quantityChange: -itemInput.quantity,
          balanceAfter: catalog.stockQty - itemInput.quantity,
          referenceNo: `TRANSFER_OUT_${sourceWh.code}`,
          notes: notes || `Inter-warehouse transfer out to ${targetWh.name}`,
        },
      });

      // Record inbound movement to target
      const inbound = await tx.stockMovementLog.create({
        data: {
          organizationId,
          itemId: catalog.id,
          movementType: "MANUAL_ADJUSTMENT",
          quantityChange: itemInput.quantity,
          balanceAfter: catalog.stockQty,
          referenceNo: `TRANSFER_IN_${targetWh.code}`,
          notes: notes || `Inter-warehouse transfer in from ${sourceWh.name}`,
        },
      });

      logs.push(outbound, inbound);
    }
    return logs;
  });
}
