import { describe, expect, it } from "vitest";

export function getStockStatus(quantity: number, reorderLevel: number = 10): "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK" {
  if (quantity <= 0) return "OUT_OF_STOCK";
  if (quantity <= reorderLevel) return "LOW_STOCK";
  return "IN_STOCK";
}

export function filterActiveBatches(
  batches: Array<{ batchNumber: string; expiryDate: string; stock: number }>
) {
  const todayStr = new Date().toISOString().split("T")[0];
  return batches.filter((b) => b.stock > 0 && b.expiryDate >= todayStr);
}

describe("Inventory, Stock & Pharmacy Batch Suite", () => {
  describe("getStockStatus", () => {
    it("classifies stock levels accurately", () => {
      expect(getStockStatus(0, 10)).toBe("OUT_OF_STOCK");
      expect(getStockStatus(-5, 10)).toBe("OUT_OF_STOCK");
      expect(getStockStatus(5, 10)).toBe("LOW_STOCK");
      expect(getStockStatus(10, 10)).toBe("LOW_STOCK");
      expect(getStockStatus(25, 10)).toBe("IN_STOCK");
    });
  });

  describe("filterActiveBatches", () => {
    it("filters out expired batches and zero stock batches for pharmacy billing", () => {
      const sampleBatches = [
        { batchNumber: "B001", expiryDate: "2028-12-31", stock: 50 },
        { batchNumber: "B002", expiryDate: "2020-01-01", stock: 100 }, // Expired
        { batchNumber: "B003", expiryDate: "2028-10-15", stock: 0 }, // Out of stock
      ];

      const active = filterActiveBatches(sampleBatches);
      expect(active).toHaveLength(1);
      expect(active[0].batchNumber).toBe("B001");
    });
  });
});
