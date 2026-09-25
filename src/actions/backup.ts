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
      bankAccounts: bankAccounts.length,
      expenses: expenses.length,
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

    let itemsRestored = 0;
    let partiesRestored = 0;
    let bankAccountsRestored = 0;
    let employeesRestored = 0;
    let expensesRestored = 0;

    await db.$transaction(async (tx) => {
      // 1. Restore Bank Accounts
      if (Array.isArray(data.bankAccounts)) {
        for (const bankAcc of data.bankAccounts) {
          if (!bankAcc.name) continue;
          const exists = await tx.bankAccount.findFirst({
            where: { organizationId: organization.id, name: bankAcc.name },
          });
          if (!exists) {
            await tx.bankAccount.create({
              data: {
                organizationId: organization.id,
                name: bankAcc.name,
                accountType: bankAcc.accountType ?? "BANK",
                accountNumber: bankAcc.accountNumber ?? null,
                ifsc: bankAcc.ifsc ?? null,
                openingBalance: Number(bankAcc.openingBalance) || 0,
              },
            });
            bankAccountsRestored++;
          }
        }
      }

      // 2. Restore Items
      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          if (!item.name) continue;
          const exists = await tx.item.findFirst({
            where: { organizationId: organization.id, name: item.name },
          });
          if (!exists) {
            await tx.item.create({
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
                itemType: item.itemType ?? "PRODUCT",
                isPublic: item.isPublic ?? true,
              },
            });
            itemsRestored++;
          }
        }
      }

      // 3. Restore Customers/Parties
      if (Array.isArray(data.customers)) {
        for (const cust of data.customers) {
          if (!cust.name) continue;
          const exists = await tx.customer.findFirst({
            where: { organizationId: organization.id, name: cust.name },
          });
          if (!exists) {
            await tx.customer.create({
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

      // 4. Restore Employees
      if (Array.isArray(data.employees)) {
        for (const emp of data.employees) {
          if (!emp.name) continue;
          const exists = await tx.employee.findFirst({
            where: { organizationId: organization.id, name: emp.name },
          });
          if (!exists) {
            await tx.employee.create({
              data: {
                organizationId: organization.id,
                name: emp.name,
                email: emp.email ?? null,
                position: emp.position ?? null,
                hourlyRate: Number(emp.hourlyRate) || 0,
                overtimeRate: Number(emp.overtimeRate) || 0,
              },
            });
            employeesRestored++;
          }
        }
      }

      // 5. Restore Expenses
      if (Array.isArray(data.expenses)) {
        const defaultAccount = await tx.bankAccount.findFirst({
          where: { organizationId: organization.id },
        });
        if (defaultAccount) {
          for (const exp of data.expenses) {
            if (!exp.amount) continue;
            await tx.expense.create({
              data: {
                organizationId: organization.id,
                bankAccountId: defaultAccount.id,
                number: exp.number ?? `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                category: exp.category ?? "Office",
                description: exp.description ?? "",
                amount: Number(exp.amount) || 0,
                gstRate: Number(exp.gstRate) || 0,
                date: exp.date ? new Date(exp.date) : new Date(),
                notes: exp.notes ?? null,
              },
            });
            expensesRestored++;
          }
        }
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/items");
    revalidatePath("/customers");
    revalidatePath("/employees");
    revalidatePath("/expenses");

    return {
      success: true,
      itemsRestored,
      partiesRestored,
      bankAccountsRestored,
      employeesRestored,
      expensesRestored,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to restore backup file");
  }
}
