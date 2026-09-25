"use server";

import { requireOrganization } from "@/lib/organization";
import { requirePermission } from "@/lib/permissions";
import { PayrollService, type GeneratePayrollInput } from "@/services/payroll-service";

export async function generatePayrollForMonth(input: GeneratePayrollInput) {
  const org = await requireOrganization();
  await requirePermission("PAYROLL_MUTATE");
  return PayrollService.generateForMonth(org.id, input);
}

export async function getPayrollRecords() {
  const org = await requireOrganization();
  await requirePermission("PAYROLL_READ");
  return PayrollService.listRecords(org.id);
}
