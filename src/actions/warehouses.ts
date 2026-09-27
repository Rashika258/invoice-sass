"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

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

export async function getWarehousesAction(): Promise<WarehouseItem[]> {
  const session = await requireUser();
  const records = await db.warehouse.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" },
  });

  if (records.length === 0) {
    const defaultWh = await db.warehouse.create({
      data: {
        organizationId: session.organizationId,
        name: "Central Distribution Warehouse",
        code: "WH-MAIN",
        address: "Main Storage Compound",
      },
    });
    return [
      {
        id: defaultWh.id,
        name: defaultWh.name,
        code: defaultWh.code,
        address: defaultWh.address || "",
        isDefault: true,
        totalItems: 0,
      },
    ];
  }

  return records.map((w, idx) => ({
    id: w.id,
    name: w.name,
    code: w.code,
    address: w.address || "",
    isDefault: idx === 0,
    totalItems: 0,
  }));
}

export async function getStockTransfersAction(): Promise<StockTransferRecord[]> {
  const session = await requireUser();
  const transfers = await db.stockTransfer.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return transfers.map((t) => ({
    id: t.id,
    transferNo: t.transferNumber,
    date: t.createdAt.toISOString().split("T")[0],
    sourceWarehouse: t.fromWarehouseId,
    destWarehouse: t.toWarehouseId,
    itemName: t.itemId,
    quantity: t.quantity,
    status: t.status as "DRAFT" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED",
  }));
}

export async function createStockTransferAction(data: {
  sourceWarehouse: string;
  destWarehouse: string;
  itemName: string;
  quantity: number;
}) {
  const session = await requireUser();
  const count = await db.stockTransfer.count({
    where: { organizationId: session.organizationId },
  });
  const transferNumber = `STR-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const created = await db.stockTransfer.create({
    data: {
      organizationId: session.organizationId,
      transferNumber,
      fromWarehouseId: data.sourceWarehouse,
      toWarehouseId: data.destWarehouse,
      itemId: data.itemName,
      quantity: data.quantity,
      status: "COMPLETED",
    },
  });

  revalidatePath("/items/stock-transfer");

  return {
    success: true,
    transfer: {
      id: created.id,
      transferNo: created.transferNumber,
      date: created.createdAt.toISOString().split("T")[0],
      sourceWarehouse: created.fromWarehouseId,
      destWarehouse: created.toWarehouseId,
      itemName: created.itemId,
      quantity: created.quantity,
      status: created.status as "COMPLETED",
    },
  };
}
