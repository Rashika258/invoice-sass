import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠️ Preparing to Reset Database Transaction Data...');

  try {
    const deletedInvoiceItems = await prisma.invoiceItem.deleteMany({});
    const deletedInvoices = await prisma.invoice.deleteMany({});

    console.log(`✅ Cleared ${deletedInvoiceItems.count} Invoice Line Items`);
    console.log(`✅ Cleared ${deletedInvoices.count} Invoices`);
    console.log('🎉 Reset Completed cleanly.');
  } catch (error) {
    console.error('❌ Reset Failed:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
