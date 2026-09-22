"use server";

import { revalidatePath } from "next/cache";

export interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  address: string;
  isDefault: boolean;
  totalItems: number;
}

export interface StockTransferRecord {
  id: string;
  transferNo: string;
  date: string;
  sourceWarehouse: string;
  destWarehouse: string;
  itemName: string;
  quantity: number;
  status: "DRAFT" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
}

let mockWarehouses: WarehouseItem[] = [
  {
    id: "wh-1",
    name: "Central Distribution Warehouse",
    code: "WH-CENTRAL",
    address: "Peenya Industrial Area Stage 2, Bengaluru",
    isDefault: true,
    totalItems: 1420,
  },
  {
    id: "wh-2",
    name: "Indiranagar Retail Branch Store",
    code: "STORE-INDIRA",
    address: "100ft Road, Indiranagar, Bengaluru",
    isDefault: false,
    totalItems: 380,
  },
  {
    id: "wh-3",
    name: "Whitefield Regional Hub",
    code: "WH-WHITEFIELD",
    address: "ITPL Main Road, Whitefield, Bengaluru",
    isDefault: false,
    totalItems: 650,
  },
];

let mockTransfers: StockTransferRecord[] = [
  {
    id: "tr-101",
    transferNo: "STR-2026-001",
    date: new Date().toISOString().split("T")[0],
    sourceWarehouse: "Central Distribution Warehouse",
    destWarehouse: "Indiranagar Retail Branch Store",
    itemName: "Paracetamol 500mg (Strip of 10)",
    quantity: 100,
    status: "COMPLETED",
  },
  {
    id: "tr-102",
    transferNo: "STR-2026-002",
    date: new Date().toISOString().split("T")[0],
    sourceWarehouse: "Central Distribution Warehouse",
    destWarehouse: "Whitefield Regional Hub",
    itemName: "Butter Chicken + Naan Combo",
    quantity: 50,
    status: "IN_TRANSIT",
  },
];

export async function getWarehousesAction() {
  return mockWarehouses;
}

export async function getStockTransfersAction() {
  return mockTransfers;
}

export async function createStockTransferAction(data: {
  sourceWarehouse: string;
  destWarehouse: string;
  itemName: string;
  quantity: number;
}) {
  const newTransfer: StockTransferRecord = {
    id: `tr-${Date.now()}`,
    transferNo: `STR-2026-00${mockTransfers.length + 1}`,
    date: new Date().toISOString().split("T")[0],
    sourceWarehouse: data.sourceWarehouse,
    destWarehouse: data.destWarehouse,
    itemName: data.itemName,
    quantity: data.quantity,
    status: "IN_TRANSIT",
  };

  mockTransfers.unshift(newTransfer);
  revalidatePath("/items/stock-transfer");

  return { success: true, transfer: newTransfer };
}
