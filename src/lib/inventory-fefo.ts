export interface InventoryBatchItem {
  id: string;
  batchNumber: string;
  expiryDate: Date | string | null;
  quantity: number;
  costPrice: number;
}

export interface LowStockAlertItem {
  id: string;
  name: string;
  stockQty: number;
  minStock: number;
  hsn?: string | null;
  unit?: string | null;
}

/**
 * Suggest earliest expiring valid batch (FEFO - First Expiry First Out)
 */
export function suggestEarliestExpiringBatch<T extends InventoryBatchItem>(batches: T[]): T | null {
  if (!batches || batches.length === 0) return null;

  const validBatches = batches.filter((b) => b.quantity > 0);
  if (validBatches.length === 0) return null;

  return validBatches.sort((a, b) => {
    if (!a.expiryDate) return 1;
    if (!b.expiryDate) return -1;
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  })[0];
}

/**
 * Filter items that have dropped below their minimum reorder stock level
 */
export function filterLowStockAlerts<T extends LowStockAlertItem>(items: T[]): T[] {
  return items
    .filter((item) => item.minStock > 0 && item.stockQty <= item.minStock)
    .sort((a, b) => a.stockQty / (a.minStock || 1) - b.stockQty / (b.minStock || 1));
}
