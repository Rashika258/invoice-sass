"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { nextDocumentNumber } from "@/lib/number-series";
import { calculateDocumentTotals } from "@/lib/invoice-utils";

export async function getStoreCatalog(slug?: string) {
  let org;
  if (slug) {
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
      estimatePrice: it.estimatePrice,
      purchasePrice: it.purchasePrice,
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

export async function getOnlineOrders() {
  const org = await requireOrganization();

  const orders = await db.invoice.findMany({
    where: {
      organizationId: org.id,
      documentType: "SALE_ORDER",
    },
    include: {
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}

export async function seedSampleOnlineOrder() {
  const org = await requireOrganization();

  // Find or create customer
  let customer = await db.customer.findFirst({
    where: { organizationId: org.id, phone: "9876543210" },
  });

  if (!customer) {
    customer = await db.customer.create({
      data: {
        organizationId: org.id,
        name: "Vikram Sharma (Online)",
        phone: "9876543210",
        address: "45 MG Road, Indiranagar",
        city: "Bengaluru",
        state: "Karnataka",
      },
    });
  }

  // Find 2 inventory items
  const items = await db.item.findMany({
    where: { organizationId: org.id },
    take: 2,
  });

  if (items.length === 0) return { error: "No items to seed order" };

  const lineItems = items.map((it, idx) => ({
    itemId: it.id,
    description: it.name,
    hsn: it.hsn || "7318",
    unit: it.unit || "PCS",
    quantity: idx === 0 ? 5 : 2,
    unitPrice: it.unitPrice,
    gstRate: it.gstRate,
    amount: (idx === 0 ? 5 : 2) * it.unitPrice,
    sortOrder: idx,
  }));

  const totals = calculateDocumentTotals(
    lineItems.map((l) => ({ quantity: l.quantity, unitPrice: l.unitPrice, gstRate: l.gstRate })),
    0,
    false
  );

  const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const order = await db.invoice.create({
    data: {
      organizationId: org.id,
      customerId: customer.id,
      invoiceNumber: orderNumber,
      documentType: "SALE_ORDER",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 86400000),
      status: "SENT",
      orderNumber,
      notes: "Online Store WhatsApp Order - Standard Delivery",
      companyName: org.name,
      ...totals,
      items: {
        create: lineItems,
      },
    },
    include: {
      customer: true,
      items: true,
    },
  });

  revalidatePath("/grow/online-store");
  revalidatePath("/sale-orders");
  return { success: true, orderId: order.id, orderNumber: order.invoiceNumber };
}

export async function convertOrderToBill(orderId: string) {
  const org = await requireOrganization();

  const order = await db.invoice.findFirst({
    where: { id: orderId, organizationId: org.id },
    include: { customer: true, items: true },
  });

  if (!order) throw new Error("Order not found");

  const profile = await db.companyProfile.findUnique({
    where: { organizationId: org.id },
  });

  const invoiceNumber = await db.$transaction(async (tx) => {
    return nextDocumentNumber(tx, org.id, "SALE", profile?.invoicePrefix || "INV");
  });

  // Create formal SALE invoice
  const bill = await db.invoice.create({
    data: {
      organizationId: org.id,
      customerId: order.customerId,
      invoiceNumber,
      documentType: "SALE",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 86400000),
      status: "SENT",
      companyName: order.companyName,
      companyAddress: order.companyAddress,
      companyCity: order.companyCity,
      companyState: order.companyState,
      companyCountry: order.companyCountry,
      companyTaxId: order.companyTaxId,
      orderNumber: order.invoiceNumber,
      notes: `Converted from Online Order #${order.invoiceNumber}`,
      subtotal: order.subtotal,
      discount: order.discount,
      taxAmount: order.taxAmount,
      cgstAmount: order.cgstAmount,
      sgstAmount: order.sgstAmount,
      igstAmount: order.igstAmount,
      total: order.total,
      paidAmount: 0,
      items: {
        create: order.items.map((it) => ({
          itemId: it.itemId,
          description: it.description,
          hsn: it.hsn,
          unit: it.unit,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          gstRate: it.gstRate,
          amount: it.amount,
          sortOrder: it.sortOrder,
        })),
      },
    },
  });

  // Mark the order as PAID / CONVERTED
  await db.invoice.update({
    where: { id: order.id },
    data: { status: "PAID", notes: `Converted to Sale Bill #${invoiceNumber}` },
  });

  revalidatePath("/grow/online-store");
  revalidatePath("/invoices");
  revalidatePath("/sale-orders");

  return { success: true, billId: bill.id, billNumber: bill.invoiceNumber };
}
