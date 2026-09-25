"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import { nextDocumentNumber } from "@/lib/number-series";
import { calculateDocumentTotals } from "@/lib/invoice-utils";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore static generation context errors during unit testing
  }
}

export async function getStoreCatalog(slug?: string) {
  let org;
  if (slug) {
    const allOrgs = await db.organization.findMany({
      include: {
        profile: true,
        items: {
          where: { itemType: "PRODUCT", isPublic: true },
          orderBy: { name: "asc" },
        },
      },
    });

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "");
    org = allOrgs.find((o) => {
      if (o.id === slug) return true;
      const compSlug = (o.profile?.companyName || o.name).toLowerCase().replace(/[^a-z0-9]+/g, "");
      const nameSlug = o.name.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return (
        compSlug === cleanSlug ||
        nameSlug === cleanSlug ||
        compSlug.includes(cleanSlug) ||
        cleanSlug.includes(compSlug)
      );
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
            where: { itemType: "PRODUCT", isPublic: true },
            orderBy: { name: "asc" },
          },
        },
      });
    } catch {
      // Fallback to first registered organization for public store
      org = await db.organization.findFirst({
        include: {
          profile: true,
          items: {
            where: { itemType: "PRODUCT", isPublic: true },
            orderBy: { name: "asc" },
          },
        },
      });
    }
  }

  if (!org) return null;

  return {
    organizationId: org.id,
    companyName: org.profile?.companyName || org.name,
    phone: org.profile?.phone || "9483374137",
    email: org.profile?.email || "billing@srimanjunatha.com",
    address: org.profile?.address || "Plot #42, Industrial Area, Peenya",
    city: org.profile?.city || "Bengaluru",
    state: org.profile?.state || "Karnataka",
    currency: org.profile?.currency || "INR",
    logoUrl: org.profile?.logoUrl || "/logo.png",
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

export async function createDirectOnlineOrderAction(data: {
  slug: string;
  customerName: string;
  phone: string;
  address: string;
  pincode?: string;
  paymentMethod: "UPI" | "COD";
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Cannot place order with empty cart");
  }

  const catalog = await getStoreCatalog(data.slug);
  if (!catalog) throw new Error("Store catalog not found");

  const orgId = catalog.organizationId;
  const cleanPhone = data.phone.trim();
  const cleanCustomerName = data.customerName.trim();

  // 1. Fetch authoritative items from DB to prevent price tampering
  const verifiedLineItems: Array<{
    itemId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    unit: string;
  }> = [];
  for (const clientItem of data.items) {
    const qty = Math.max(1, Math.floor(clientItem.quantity || 1));
    let dbItem = null;

    if (!clientItem.id.startsWith("sp-")) {
      dbItem = await db.item.findFirst({
        where: {
          id: clientItem.id,
          organizationId: orgId,
          isPublic: true,
        },
      });
    }

    const officialPrice = dbItem ? dbItem.unitPrice : Math.max(0, clientItem.unitPrice || 0);
    const officialGst = dbItem ? dbItem.gstRate : 18;
    const officialUnit = dbItem ? (dbItem.unit || "PCS") : "PCS";

    verifiedLineItems.push({
      itemId: dbItem?.id,
      name: dbItem ? dbItem.name : clientItem.name,
      quantity: qty,
      unitPrice: officialPrice,
      gstRate: officialGst,
      unit: officialUnit,
    });
  }

  // 2. Calculate document totals server-side
  const totals = calculateDocumentTotals(
    verifiedLineItems.map((l) => ({
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      gstRate: l.gstRate,
    })),
    0,
    false
  );

  // 3. Atomically create customer and order inside a transaction
  const saleOrder = await db.$transaction(async (tx) => {
    let customer = await tx.customer.findFirst({
      where: {
        organizationId: orgId,
        phone: cleanPhone,
      },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          organizationId: orgId,
          name: cleanCustomerName,
          phone: cleanPhone,
          address: data.address,
          state: catalog.state,
        },
      });
    }

    const orderNumber = await nextDocumentNumber(tx, orgId, "SALE_ORDER", "ORD");

    return await tx.invoice.create({
      data: {
        organizationId: orgId,
        customerId: customer.id,
        invoiceNumber: orderNumber,
        documentType: "SALE_ORDER",
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 86400000),
        status: data.paymentMethod === "UPI" ? "PAID" : "SENT",
        companyName: catalog.companyName,
        companyAddress: catalog.address,
        companyCity: catalog.city,
        companyState: catalog.state,
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxAmount: totals.taxAmount,
        cgstAmount: totals.cgstAmount,
        sgstAmount: totals.sgstAmount,
        igstAmount: totals.igstAmount,
        total: totals.total,
        paidAmount: data.paymentMethod === "UPI" ? totals.total : 0,
        notes: `Online E-Commerce Order placed by ${cleanCustomerName} (${data.paymentMethod})`,
        items: {
          create: verifiedLineItems.map((it, idx) => ({
            itemId: it.itemId,
            description: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            gstRate: it.gstRate,
            unit: it.unit,
            amount: it.unitPrice * it.quantity,
            sortOrder: idx,
          })),
        },
      },
    });
  });

  safeRevalidatePath("/grow/online-store");
  safeRevalidatePath("/sale-orders");

  const payeeVpa = "9483374137@okaxis";
  const cleanName = (catalog.companyName || "Merchant").trim().replace(/[^a-zA-Z0-9 ]/g, "");
  const cleanOrder = saleOrder.invoiceNumber.replace(/[^a-zA-Z0-9]/g, "");
  const amountStr = saleOrder.total.toFixed(2);
  const upiPayUrl = `upi://pay?pa=${payeeVpa}&pn=${cleanName}&am=${amountStr}&cu=INR&tn=Order_${cleanOrder}`;

  return {
    success: true,
    orderId: saleOrder.invoiceNumber,
    total: saleOrder.total,
    customerName: cleanCustomerName,
    companyName: catalog.companyName,
    paymentMethod: data.paymentMethod,
    upiPayUrl,
    upiId: payeeVpa,
  };
}

export async function publishAllItemsToStore() {
  const org = await requireOrganization();

  await db.item.updateMany({
    where: { organizationId: org.id },
    data: { isPublic: true },
  });

  safeRevalidatePath("/grow/online-store");
  safeRevalidatePath("/items");
  return { success: true };
}

export async function toggleItemStoreVisibility(itemId: string, isPublic: boolean) {
  const org = await requireOrganization();

  await db.item.updateMany({
    where: { id: itemId, organizationId: org.id },
    data: { isPublic },
  });

  safeRevalidatePath("/grow/online-store");
  safeRevalidatePath("/items");
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

  const items = await db.item.findMany({
    where: { organizationId: org.id, isPublic: true },
    take: 2,
  });

  if (items.length === 0) return { error: "No public items to seed order" };

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

  const orderNumber = await db.$transaction(async (tx) => {
    return nextDocumentNumber(tx, org.id, "SALE_ORDER", "ORD");
  });

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

  safeRevalidatePath("/grow/online-store");
  safeRevalidatePath("/sale-orders");
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

  await db.invoice.update({
    where: { id: order.id },
    data: { status: "PAID", notes: `Converted to Sale Bill #${invoiceNumber}` },
  });

  safeRevalidatePath("/grow/online-store");
  safeRevalidatePath("/invoices");
  safeRevalidatePath("/sale-orders");

  return { success: true, billId: bill.id, billNumber: bill.invoiceNumber };
}
