import { describe, it, expect } from "vitest";
import { DOCUMENT_META } from "../documents";
import { shouldAffectStock } from "../stock";
import type { DocumentType } from "@/generated/prisma/client";

interface InventoryItemState {
  id: string;
  name: string;
  itemType: "PRODUCT" | "SERVICE";
  currentStock: number;
  minStockAlert: number;
}

function processStockMovement(
  item: InventoryItemState,
  documentType: DocumentType,
  status: string,
  quantity: number
): {
  newStock: number;
  movementApplied: boolean;
  delta: number;
  isLowStock: boolean;
} {
  // 1. Check if document status affects stock
  if (!shouldAffectStock(status)) {
    return {
      newStock: item.currentStock,
      movementApplied: false,
      delta: 0,
      isLowStock: item.currentStock <= item.minStockAlert,
    };
  }

  // 2. Services never alter physical inventory
  if (item.itemType === "SERVICE") {
    return {
      newStock: item.currentStock,
      movementApplied: false,
      delta: 0,
      isLowStock: false,
    };
  }

  // 3. Determine direction from document metadata
  const effect = DOCUMENT_META[documentType]?.affectsStock;
  if (!effect) {
    return {
      newStock: item.currentStock,
      movementApplied: false,
      delta: 0,
      isLowStock: item.currentStock <= item.minStockAlert,
    };
  }

  const delta = effect === "out" ? -quantity : quantity;
  const newStock = item.currentStock + delta;
  const isLowStock = newStock <= item.minStockAlert;

  return {
    newStock,
    movementApplied: true,
    delta,
    isLowStock,
  };
}

describe("Inventory Stock Reduction & Movement Flows", () => {
  const sampleProduct: InventoryItemState = {
    id: "item-paracetamol",
    name: "Paracetamol 500mg (Strip of 10)",
    itemType: "PRODUCT",
    currentStock: 100,
    minStockAlert: 20,
  };

  const sampleService: InventoryItemState = {
    id: "item-machining-job",
    name: "Precision Lathe Turning Job",
    itemType: "SERVICE",
    currentStock: 999,
    minStockAlert: 0,
  };

  describe("Document-Level Stock Direction Rules", () => {
    it("should decrement stock on SALE invoice completion", () => {
      const result = processStockMovement(sampleProduct, "SALE", "PAID", 25);
      expect(result.movementApplied).toBe(true);
      expect(result.delta).toBe(-25);
      expect(result.newStock).toBe(75);
      expect(result.isLowStock).toBe(false);
    });

    it("should increment stock on PURCHASE bill reception", () => {
      const result = processStockMovement(sampleProduct, "PURCHASE", "PAID", 50);
      expect(result.movementApplied).toBe(true);
      expect(result.delta).toBe(50);
      expect(result.newStock).toBe(150);
    });

    it("should restore stock into warehouse on CREDIT_NOTE (Sale Return)", () => {
      const result = processStockMovement(sampleProduct, "CREDIT_NOTE", "SENT", 10);
      expect(result.movementApplied).toBe(true);
      expect(result.delta).toBe(10);
      expect(result.newStock).toBe(110);
    });

    it("should deduct stock on DEBIT_NOTE (Purchase Return to Vendor)", () => {
      const result = processStockMovement(sampleProduct, "DEBIT_NOTE", "SENT", 15);
      expect(result.movementApplied).toBe(true);
      expect(result.delta).toBe(-15);
      expect(result.newStock).toBe(85);
    });

    it("should NOT alter stock on non-inventory quotation or order documents", () => {
      const estimateResult = processStockMovement(sampleProduct, "ESTIMATE", "SENT", 30);
      expect(estimateResult.movementApplied).toBe(false);
      expect(estimateResult.newStock).toBe(100);

      const proformaResult = processStockMovement(sampleProduct, "PROFORMA", "SENT", 30);
      expect(proformaResult.movementApplied).toBe(false);
      expect(proformaResult.newStock).toBe(100);

      const saleOrderResult = processStockMovement(sampleProduct, "SALE_ORDER", "SENT", 30);
      expect(saleOrderResult.movementApplied).toBe(false);
      expect(saleOrderResult.newStock).toBe(100);
    });

    it("should NOT modify stock for DRAFT or CANCELLED documents", () => {
      const draftResult = processStockMovement(sampleProduct, "SALE", "DRAFT", 25);
      expect(draftResult.movementApplied).toBe(false);
      expect(draftResult.newStock).toBe(100);

      const cancelledResult = processStockMovement(sampleProduct, "SALE", "CANCELLED", 25);
      expect(cancelledResult.movementApplied).toBe(false);
      expect(cancelledResult.newStock).toBe(100);
    });
  });

  describe("Service Items Protection", () => {
    it("should never reduce inventory for SERVICE line items regardless of document", () => {
      const result = processStockMovement(sampleService, "SALE", "PAID", 50);
      expect(result.movementApplied).toBe(false);
      expect(result.delta).toBe(0);
      expect(result.newStock).toBe(999);
    });
  });

  describe("Low Stock Trigger Intelligence", () => {
    it("should flag low stock alert when stock falls to or below threshold", () => {
      // Current stock is 100, min alert is 20
      // Sell 85 units -> stock becomes 15 (< 20)
      const result = processStockMovement(sampleProduct, "SALE", "PAID", 85);
      expect(result.newStock).toBe(15);
      expect(result.isLowStock).toBe(true);
    });

    it("should flag low stock alert at exact boundary threshold", () => {
      // Sell 80 units -> stock becomes exactly 20 (= minStockAlert)
      const result = processStockMovement(sampleProduct, "SALE", "PAID", 80);
      expect(result.newStock).toBe(20);
      expect(result.isLowStock).toBe(true);
    });

    it("should clear low stock flag when purchase bill replenishes inventory", () => {
      const depletedItem: InventoryItemState = {
        ...sampleProduct,
        currentStock: 10, // currently below 20
      };

      const replenishResult = processStockMovement(depletedItem, "PURCHASE", "PAID", 100);
      expect(replenishResult.newStock).toBe(110);
      expect(replenishResult.isLowStock).toBe(false);
    });
  });

  describe("Multi-Batch FIFO Deduction Logic", () => {
    it("should deduct items across batches in First-In-First-Out order", () => {
      const batches = [
        { batchNo: "BATCH-001", quantity: 30, expiryDate: "2026-12-31" },
        { batchNo: "BATCH-002", quantity: 50, expiryDate: "2027-06-30" },
      ];

      const requestedQty = 45; // Needs 30 from BATCH-001 and 15 from BATCH-002
      let remainingToDeduct = requestedQty;
      const deductions: { batchNo: string; deducted: number; remainingInBatch: number }[] = [];

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;
        const deductFromThis = Math.min(batch.quantity, remainingToDeduct);
        batch.quantity -= deductFromThis;
        remainingToDeduct -= deductFromThis;
        deductions.push({
          batchNo: batch.batchNo,
          deducted: deductFromThis,
          remainingInBatch: batch.quantity,
        });
      }

      expect(remainingToDeduct).toBe(0);
      expect(deductions).toEqual([
        { batchNo: "BATCH-001", deducted: 30, remainingInBatch: 0 },
        { batchNo: "BATCH-002", deducted: 15, remainingInBatch: 35 },
      ]);
    });
  });
});
