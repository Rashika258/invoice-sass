import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";

export async function getOrganizationForUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return user.organization;
}

export async function requireOrganization() {
  const user = await requireUser();
  return user.organization;
}

export async function getNextInvoiceNumber(organizationId: string) {
  const profile = await db.companyProfile.findUnique({
    where: { organizationId },
  });

  if (!profile) {
    throw new Error("Company profile not found");
  }

  const invoiceNumber = `${profile.invoicePrefix}-${String(profile.nextInvoiceNumber).padStart(4, "0")}`;

  await db.companyProfile.update({
    where: { organizationId },
    data: { nextInvoiceNumber: profile.nextInvoiceNumber + 1 },
  });

  return invoiceNumber;
}
