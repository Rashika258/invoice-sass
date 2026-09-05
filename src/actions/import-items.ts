"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

export type BulkImportItem = {
  name: string;
  unitPrice: number;
  purchasePrice?: number;
  gstRate?: number;
  hsn?: string;
  stockQty?: number;
  unit?: string;
};

// Standard Retail FMCG & General Items Library for 1-Click Import
export const PREDEFINED_RETAIL_LIBRARY: BulkImportItem[] = [
  { name: "Basmati Rice 5kg", unitPrice: 550, purchasePrice: 480, gstRate: 5, hsn: "1006", stockQty: 25, unit: "BAG" },
  { name: "Aashirvaad Atta 10kg", unitPrice: 420, purchasePrice: 380, gstRate: 5, hsn: "1101", stockQty: 30, unit: "BAG" },
  { name: "Tata Salt 1kg", unitPrice: 28, purchasePrice: 24, gstRate: 0, hsn: "2501", stockQty: 100, unit: "PCS" },
  { name: "Fortune Sunflower Oil 1L", unitPrice: 145, purchasePrice: 130, gstRate: 5, hsn: "1512", stockQty: 40, unit: "BTL" },
  { name: "Maggi 2-Minute Noodles 70g", unitPrice: 14, purchasePrice: 12, gstRate: 12, hsn: "1902", stockQty: 120, unit: "PCS" },
  { name: "Amul Butter 500g", unitPrice: 275, purchasePrice: 250, gstRate: 12, hsn: "0405", stockQty: 15, unit: "PCS" },
  { name: "Parle-G Gold Biscuits", unitPrice: 10, purchasePrice: 8.5, gstRate: 18, hsn: "1905", stockQty: 150, unit: "PCS" },
  { name: "Dettol Antiseptic Liquid 250ml", unitPrice: 165, purchasePrice: 140, gstRate: 18, hsn: "3004", stockQty: 20, unit: "BTL" },
  { name: "Surf Excel Detergent Powder 1kg", unitPrice: 150, purchasePrice: 132, gstRate: 18, hsn: "3402", stockQty: 35, unit: "PCS" },
  { name: "Colgate Strong Teeth 200g", unitPrice: 110, purchasePrice: 95, gstRate: 18, hsn: "3306", stockQty: 50, unit: "PCS" },
  { name: "Tata Tea Gold 500g", unitPrice: 320, purchasePrice: 285, gstRate: 5, hsn: "0902", stockQty: 25, unit: "PCS" },
  { name: "Toor Dal 1kg", unitPrice: 160, purchasePrice: 142, gstRate: 0, hsn: "0713", stockQty: 50, unit: "KG" },
  { name: "Sugar Premium 1kg", unitPrice: 48, purchasePrice: 42, gstRate: 5, hsn: "1701", stockQty: 80, unit: "KG" },
  { name: "Britannia Good Day 100g", unitPrice: 25, purchasePrice: 21, gstRate: 18, hsn: "1905", stockQty: 90, unit: "PCS" },
  { name: "Everest Turmeric Powder 100g", unitPrice: 38, purchasePrice: 32, gstRate: 5, hsn: "0910", stockQty: 40, unit: "PCS" },
];

export async function importItemsInBulk(items: BulkImportItem[]) {
  const organization = await requireOrganization();

  if (!items || items.length === 0) {
    throw new Error("No items provided for import");
  }

  const validItems = items
    .filter((it) => it.name && it.name.trim().length > 0 && it.unitPrice >= 0)
    .map((it) => ({
      organizationId: organization.id,
      name: it.name.trim(),
      unitPrice: Number(it.unitPrice) || 0,
      purchasePrice: Number(it.purchasePrice) || 0,
      gstRate: Number(it.gstRate ?? 18),
      hsn: it.hsn ? String(it.hsn).trim() : null,
      stockQty: Number(it.stockQty) || 0,
      unit: it.unit ? String(it.unit).trim().toUpperCase() : "PCS",
      itemType: "PRODUCT" as const,
      isPublic: true,
    }));

  if (validItems.length === 0) {
    throw new Error("No valid items found in the upload");
  }

  // Insert items in transaction
  const created = await db.$transaction(
    validItems.map((item) => db.item.create({ data: item })),
  );

  revalidatePath("/items");
  revalidatePath("/utilities/import-items");
  revalidatePath("/dashboard");

  return { success: true, count: created.length };
}

export async function importFromBilloraLibrary() {
  return await importItemsInBulk(PREDEFINED_RETAIL_LIBRARY);
}

export async function quickAddBarcodeItem(barcode: string, name: string, price: number, purchasePrice: number = 0) {
  const organization = await requireOrganization();

  const item = await db.item.create({
    data: {
      organizationId: organization.id,
      name: name.trim() || `Item #${barcode}`,
      description: `Barcode: ${barcode}`,
      hsn: barcode.slice(0, 8),
      unitPrice: Number(price) || 100,
      purchasePrice: Number(purchasePrice) || 80,
      gstRate: 18,
      stockQty: 10,
      unit: "PCS",
      itemType: "PRODUCT",
      isPublic: true,
    },
  });

  revalidatePath("/items");
  revalidatePath("/dashboard");

  return { success: true, item };
}
