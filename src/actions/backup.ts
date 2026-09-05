"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { requireOrganization } from "@/lib/organization";

export async function createCompanyBackup() {
  const organization = await requireOrganization();

  const [profile, customers, items, invoices, bankAccounts, payments, expenses, employees, attendance] =
    await Promise.all([
      db.companyProfile.findUnique({ where: { organizationId: organization.id } }),
      db.customer.findMany({ where: { organizationId: organization.id } }),
      db.item.findMany({ where: { organizationId: organization.id } }),
      db.invoice.findMany({
        where: { organizationId: organization.id },
        include: { items: true },
      }),
      db.bankAccount.findMany({ where: { organizationId: organization.id } }),
      db.payment.findMany({ where: { organizationId: organization.id } }),
      db.expense.findMany({ where: { organizationId: organization.id } }),
      db.employee.findMany({ where: { organizationId: organization.id } }),
      db.attendanceRecord.findMany({ where: { employee: { organizationId: organization.id } } }),
    ]);

  const backupPayload = {
    version: "2.0",
    exportDate: new Date().toISOString(),
    organization: {
      id: organization.id,
      name: organization.name,
    },
    profile,
    customers,
    items,
    invoices,
    bankAccounts,
    payments,
    expenses,
    employees,
    attendance,
  };

  return {
    success: true,
    data: JSON.stringify(backupPayload, null, 2),
    filename: `billora_backup_${organization.name.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.json`,
    stats: {
      customers: customers.length,
      items: items.length,
      invoices: invoices.length,
      payments: payments.length,
      employees: employees.length,
      attendance: attendance.length,
    },
  };
}

export async function restoreCompanyBackup(jsonString: string) {
  await requireAdmin();
  const organization = await requireOrganization();

  try {
    const data = JSON.parse(jsonString);
    if (!data.items && !data.customers && !data.invoices) {
      throw new Error("Invalid Billora backup file format");
    }

    // Merge/Restore Items if available
    let itemsRestored = 0;
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (!item.name) continue;
        const exists = await db.item.findFirst({
          where: { organizationId: organization.id, name: item.name },
        });
        if (!exists) {
          await db.item.create({
            data: {
              organizationId: organization.id,
              name: item.name,
              description: item.description ?? null,
              hsn: item.hsn ?? null,
              unitPrice: Number(item.unitPrice) || 0,
              purchasePrice: Number(item.purchasePrice) || 0,
              gstRate: Number(item.gstRate ?? 18),
              stockQty: Number(item.stockQty) || 0,
              unit: item.unit ?? "PCS",
              itemType: "PRODUCT",
              isPublic: true,
            },
          });
          itemsRestored++;
        }
      }
    }

    // Merge/Restore Customers if available
    let partiesRestored = 0;
    if (Array.isArray(data.customers)) {
      for (const cust of data.customers) {
        if (!cust.name) continue;
        const exists = await db.customer.findFirst({
          where: { organizationId: organization.id, name: cust.name },
        });
        if (!exists) {
          await db.customer.create({
            data: {
              organizationId: organization.id,
              name: cust.name,
              phone: cust.phone ?? null,
              email: cust.email ?? null,
              address: cust.address ?? null,
              city: cust.city ?? null,
              state: cust.state ?? null,
              taxId: cust.taxId ?? null,
              partyType: cust.partyType ?? "CUSTOMER",
              openingBalance: Number(cust.openingBalance) || 0,
            },
          });
          partiesRestored++;
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/customers");

    return {
      success: true,
      itemsRestored,
      partiesRestored,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to restore backup file");
  }
}
