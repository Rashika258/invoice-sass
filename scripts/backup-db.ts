import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Starting Billora OS Database Backup...');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `backup_${timestamp}.json`);

  try {
    const orgs = await prisma.organization.findMany();
    const items = await prisma.item.findMany();
    const customers = await prisma.customer.findMany();
    const invoices = await prisma.invoice.findMany({ include: { items: true } });

    const backupData = {
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        totalOrganizations: orgs.length,
        totalItems: items.length,
        totalCustomers: customers.length,
        totalInvoices: invoices.length,
      },
      data: {
        organizations: orgs,
        items,
        customers,
        invoices,
      },
    };

    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`✅ Backup successfully created at:\n   ${backupPath}`);
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
