"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireOrganization } from "@/lib/organization";
import {
  companyProfileSchema,
  type CompanyProfileInput,
} from "@/lib/validations";

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
