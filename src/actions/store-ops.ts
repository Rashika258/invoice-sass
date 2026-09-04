"use server";

import { revalidatePath } from "next/cache";
import {
  addStoreProduct,
  createStoreBill,
  getStoreBill,
  getStoreBills,
  getStoreProducts,
  updateStoreProduct,
  type StoreProduct,
} from "@/lib/store-db";
import { getAppSettings, saveAppSettings, type AppSettings } from "@/lib/settings-store";

export async function fetchStoreProducts() {
  return getStoreProducts();
}

export async function fetchStoreBills() {
  return getStoreBills();
}

export async function fetchStoreBill(id: string) {
  return getStoreBill(id);
}

export async function updateStoreProductAction(id: string, updates: Partial<StoreProduct>) {
  const updated = updateStoreProduct(id, updates);
  revalidatePath("/grow/online-store");
  return updated;
}

export async function createStoreProductAction(data: Omit<StoreProduct, "id">) {
  const created = addStoreProduct(data);
  revalidatePath("/grow/online-store");
  return created;
}

export async function generateStoreBillAction(order: {
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: { productId: string; quantity: number }[];
  paymentMode: string;
  isInterState?: boolean;
}) {
  const bill = createStoreBill(order);
  revalidatePath("/grow/online-store");
  return bill;
}

export async function fetchAppSettings() {
  return getAppSettings();
}

export async function saveAppSettingsAction(settings: Partial<AppSettings>) {
  const saved = saveAppSettings(settings);
  revalidatePath("/settings");
  revalidatePath("/grow/online-store");
  return saved;
}
