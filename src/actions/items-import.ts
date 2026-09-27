"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { requireOrganization } from "@/lib/organization";
import { requirePermission } from "@/lib/permissions";

export interface CsvItemRow {
  name: string;
  description?: string;
  hsn?: string;
  unitPrice: number;
  purchasePrice?: number;
  unit?: string;
  gstRate?: number;
  itemType?: "PRODUCT" | "SERVICE";
  stockQty?: number;
  minStock?: number;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export async function bulkImportItems(rows: CsvItemRow[]): Promise<ImportResult> {
  const organization = await requireOrganization();
  await requirePermission("INVENTORY_MANAGE");

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.name || row.name.trim() === "") {
      skipped++;
      continue;
    }
    if (isNaN(row.unitPrice) || row.unitPrice < 0) {
      errors.push(`Row "${row.name}": invalid unit price`);
      skipped++;
      continue;
    }
    try {
      await db.item.create({
        data: {
          organizationId: organization.id,
          name: row.name.trim(),
          description: row.description?.trim() || null,
          hsn: row.hsn?.trim() || null,
          unitPrice: row.unitPrice,
          purchasePrice: row.purchasePrice ?? 0,
          estimatePrice: row.unitPrice,
          unit: row.unit?.trim() || "PCS",
          gstRate: row.gstRate ?? 18,
          itemType: row.itemType ?? "PRODUCT",
          stockQty: row.stockQty ?? 0,
          minStock: row.minStock ?? 0,
          isPublic: false,
        },
      });
      imported++;
    } catch (err) {
      errors.push(`Row "${row.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
      skipped++;
    }
  }

  revalidatePath("/items");
  revalidatePath("/dashboard");

  return { imported, skipped, errors };
}
