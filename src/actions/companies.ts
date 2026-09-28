"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireOrganization } from "@/lib/organization";

export interface CompanySummaryItem {
  id: string;
  name: string;
  companyName: string;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  state: string | null;
  currency: string;
  logoUrl: string | null;
  storeSlug: string;
  itemsCount: number;
  invoicesCount: number;
  isActive: boolean;
}

export async function getAvailableCompanies(): Promise<CompanySummaryItem[]> {
  const user = await requireUser();
  const currentOrg = user.organization;

  const orgs = await db.organization.findMany({
    include: {
      profile: true,
      _count: {
        select: {
          items: true,
          invoices: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return orgs.map((org) => {
    const compName = org.profile?.companyName || org.name;
    const storeSlug = compName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return {
      id: org.id,
      name: org.name,
      companyName: compName,
      taxId: org.profile?.taxId || null,
      phone: org.profile?.phone || null,
      email: org.profile?.email || null,
      address: org.profile?.address || null,
      state: org.profile?.state || "Karnataka",
      currency: org.profile?.currency || "INR",
      logoUrl: org.profile?.logoUrl || null,
      storeSlug,
      itemsCount: org._count.items,
      invoicesCount: org._count.invoices,
      isActive: org.id === currentOrg.id,
    };
  });
}

export async function switchActiveCompanyAction(targetOrgId: string) {
  const user = await requireUser();

  const targetOrg = await db.organization.findUnique({
    where: { id: targetOrgId },
    include: { profile: true },
  });

  if (!targetOrg) {
    throw new Error("Target company not found");
  }

  // Update user's active organization in DB
  await db.user.update({
    where: { id: user.id },
    data: { organizationId: targetOrgId },
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  revalidatePath("/items");
  revalidatePath("/customers");

  return {
    success: true,
    activeCompanyName: targetOrg.profile?.companyName || targetOrg.name,
    logoUrl: targetOrg.profile?.logoUrl || null,
  };
}

export async function updateCompanyLogoAction(targetOrgId: string, logoUrl: string | null) {
  const user = await requireUser();

  const targetOrg = await db.organization.findUnique({
    where: { id: targetOrgId },
    include: { profile: true },
  });

  if (!targetOrg) {
    throw new Error("Target company not found");
  }

  const cleanLogo = logoUrl?.trim() || null;

  await db.companyProfile.upsert({
    where: { organizationId: targetOrgId },
    create: {
      organizationId: targetOrgId,
      companyName: targetOrg.name,
      logoUrl: cleanLogo,
    },
    update: {
      logoUrl: cleanLogo,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/companies");
  revalidatePath("/settings");

  return {
    success: true,
    targetOrgId,
    logoUrl: cleanLogo,
    isCurrentOrg: targetOrgId === user.organizationId,
    companyName: targetOrg.profile?.companyName || targetOrg.name,
  };
}

export async function createCompanyAction(data: {
  companyName: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  currency?: string;
}) {
  const user = await requireUser();

  // Create organization
  const newOrg = await db.organization.create({
    data: {
      name: data.companyName,
      profile: {
        create: {
          companyName: data.companyName,
          taxId: data.taxId || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || "Karnataka",
          country: "India",
          currency: data.currency || "INR",
          invoicePrefix: "INV",
          nextInvoiceNumber: 1,
        },
      },
      numberSeries: {
        create: [
          { key: "SALE", prefix: "INV-", nextNumber: 1 },
          { key: "ESTIMATE", prefix: "EST-", nextNumber: 1 },
          { key: "PURCHASE", prefix: "PUR-", nextNumber: 1 },
          { key: "CREDIT_NOTE", prefix: "CN-", nextNumber: 1 },
          { key: "DEBIT_NOTE", prefix: "DN-", nextNumber: 1 },
          { key: "DELIVERY_CHALLAN", prefix: "DC-", nextNumber: 1 },
        ],
      },
    },
    include: {
      profile: true,
    },
  });

  // Switch user to new organization
  await db.user.update({
    where: { id: user.id },
    data: { organizationId: newOrg.id },
  });

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");

  return {
    success: true,
    organizationId: newOrg.id,
    companyName: newOrg.profile?.companyName || newOrg.name,
  };
}
