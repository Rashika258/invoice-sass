"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";

export async function getStoreCatalog(slug?: string) {
  let org;
  if (slug) {
    // Look up by organization name or id
    org = await db.organization.findFirst({
      where: {
        OR: [
          { id: slug },
          { name: { equals: slug } },
        ],
      },
      include: {
        profile: true,
        items: {
          where: { itemType: "PRODUCT" },
          orderBy: { name: "asc" },
        },
      },
    });
  }

  if (!org) {
    // Fallback to active organization if user is logged in
    try {
      const active = await requireOrganization();
      org = await db.organization.findUnique({
        where: { id: active.id },
        include: {
          profile: true,
          items: {
            where: { itemType: "PRODUCT" },
            orderBy: { name: "asc" },
          },
        },
      });
    } catch {
      // Not logged in and no valid slug
      return null;
    }
  }

  if (!org) return null;

  return {
    organizationId: org.id,
    companyName: org.profile?.companyName || org.name,
    phone: org.profile?.phone || "",
    email: org.profile?.email || "",
    address: org.profile?.address || "",
    city: org.profile?.city || "",
    state: org.profile?.state || "",
    currency: org.profile?.currency || "INR",
    logoUrl: org.profile?.logoUrl || null,
    items: org.items.map((it) => ({
      id: it.id,
      name: it.name,
      description: it.description,
      unitPrice: it.unitPrice,
      unit: it.unit || "PCS",
      stockQty: it.stockQty,
      isPublic: it.isPublic,
      gstRate: it.gstRate,
    })),
  };
}

export async function publishAllItemsToStore() {
  const org = await requireOrganization();

  await db.item.updateMany({
    where: { organizationId: org.id },
    data: { isPublic: true },
  });

  revalidatePath("/grow/online-store");
  revalidatePath("/items");
  return { success: true };
}

export async function toggleItemStoreVisibility(itemId: string, isPublic: boolean) {
  const org = await requireOrganization();

  await db.item.updateMany({
    where: { id: itemId, organizationId: org.id },
    data: { isPublic },
  });

  revalidatePath("/grow/online-store");
  revalidatePath("/items");
  return { success: true };
}
