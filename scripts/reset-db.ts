import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⚠️ Preparing to Reset Database Transaction Data...');

  try {
    const deletedInvoiceItems = await prisma.invoiceItem.deleteMany({});
    const deletedInvoices = await prisma.invoice.deleteMany({});
    const deletedPayments = await prisma.payment.deleteMany({});
    const deletedExpenses = await prisma.expense.deleteMany({});
    const deletedAttendance = await prisma.attendanceRecord.deleteMany({});
    const deletedPayrolls = await prisma.payrollRecord.deleteMany({});
    const deletedStockMovements = await prisma.stockMovementLog.deleteMany({});
    const deletedAppointments = await prisma.appointment.deleteMany({});
    const deletedJournalEntries = await prisma.journalEntry.deleteMany({});
    const deletedJournalVouchers = await prisma.journalVoucher.deleteMany({});

    console.log(`✅ Cleared ${deletedInvoiceItems.count} Invoice Line Items`);
    console.log(`✅ Cleared ${deletedInvoices.count} Invoices`);
    console.log(`✅ Cleared ${deletedPayments.count} Payments`);
    console.log(`✅ Cleared ${deletedExpenses.count} Expenses`);
    console.log(`✅ Cleared ${deletedAttendance.count} Attendance Records`);
    console.log(`✅ Cleared ${deletedPayrolls.count} Payroll Records`);
    console.log(`✅ Cleared ${deletedStockMovements.count} Stock Movement Logs`);
    console.log(`✅ Cleared ${deletedAppointments.count} Appointments`);
    console.log(`✅ Cleared ${deletedJournalEntries.count} Journal Entries & ${deletedJournalVouchers.count} Vouchers`);
    console.log('🎉 Transactional Reset Completed cleanly while preserving Masters & Configuration.');
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
