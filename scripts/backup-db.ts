import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Starting Comprehensive Billora OS Database Backup...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

  try {
    const [
      orgs,
      profiles,
      users,
      bankAccounts,
      items,
      customers,
      employees,
      attendance,
      ledgers,
      invoices,
      payments,
      expenses,
      batches,
      movements,
    ] = await Promise.all([
      prisma.organization.findMany(),
      prisma.companyProfile.findMany(),
      prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, organizationId: true, createdAt: true } }),
      prisma.bankAccount.findMany(),
      prisma.item.findMany(),
      prisma.customer.findMany(),
      prisma.employee.findMany(),
      prisma.attendanceRecord.findMany(),
      prisma.ledger.findMany(),
      prisma.invoice.findMany({ include: { items: true } }),
      prisma.payment.findMany(),
      prisma.expense.findMany(),
      prisma.inventoryBatch.findMany(),
      prisma.stockMovementLog.findMany(),
    ]);

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        totalOrganizations: orgs.length,
        totalItems: items.length,
        totalCustomers: customers.length,
        totalEmployees: employees.length,
        totalInvoices: invoices.length,
        totalPayments: payments.length,
        totalExpenses: expenses.length,
        totalLedgers: ledgers.length,
      },
      data: {
        organizations: orgs,
        profiles,
        users,
        bankAccounts,
        items,
        customers,
        employees,
        attendance,
        ledgers,
        invoices,
        payments,
        expenses,
        inventoryBatches: batches,
        stockMovementLogs: movements,
      },
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`✅ Complete Backup successfully created at:\n   ${backupPath}`);
    console.log(`📊 Summary: ${invoices.length} Invoices, ${customers.length} Parties, ${items.length} Items, ${employees.length} Staff, ${ledgers.length} Ledgers`);
  } catch (error) {
    console.error('❌ Backup Failed:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
