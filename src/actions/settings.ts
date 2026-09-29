"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import {
  companyProfileSchema,
  type CompanyProfileInput,
} from "@/lib/validations";
import type { BusinessVertical } from "@/generated/prisma/enums";
import { VERTICAL_CONFIGS } from "@/lib/verticals";

export async function getCompanyProfile() {
  const org = await requireOrganization();
  return org.profile;
}

export async function updateCompanyProfile(data: CompanyProfileInput) {
  const parsed = companyProfileSchema.parse(data);
  const org = await requireOrganization();

  await db.companyProfile.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      ...parsed,
      email: parsed.email || null,
    },
    update: {
      ...parsed,
      email: parsed.email || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/invoices");
  revalidatePath("/products");
}

export async function updateBusinessVertical(vertical: BusinessVertical) {
  const org = await requireOrganization();
  const config = VERTICAL_CONFIGS[vertical] || VERTICAL_CONFIGS.RETAIL_WHOLESALE;

  const profile = await db.companyProfile.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      companyName: org.name,
      businessVertical: vertical,
      enableBatchExpiry: config.features.enableBatchExpiry,
      enableBarcodes: config.features.enableBarcodes,
      enableStaffCommission: config.features.enableStaffCommission,
      defaultItemType: config.defaultItemType,
      invoicePrefix: config.defaultInvoicePrefix,
    },
    update: {
      businessVertical: vertical,
      enableBatchExpiry: config.features.enableBatchExpiry,
      enableBarcodes: config.features.enableBarcodes,
      enableStaffCommission: config.features.enableStaffCommission,
      defaultItemType: config.defaultItemType,
      invoicePrefix: config.defaultInvoicePrefix,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/items");
  revalidatePath("/invoices");

  return { success: true, vertical, profile };
}
