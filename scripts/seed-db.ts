import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Comprehensive Billora OS Database...');

  try {
    // 1. Organization
    const org = await prisma.organization.upsert({
      where: { id: 'default-org-1' },
      update: {},
      create: {
        id: 'default-org-1',
        name: 'Billora Enterprises Pvt Ltd',
      },
    });
    console.log(`✅ Organization Configured: ${org.name}`);

    // 2. Company Profile
    const profile = await prisma.companyProfile.upsert({
      where: { organizationId: org.id },
      update: {
        companyName: 'Billora Enterprises Pvt Ltd',
        businessVertical: 'RETAIL_WHOLESALE',
        email: 'billing@billora.app',
        phone: '+91 98765 43210',
        address: '# 100, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
        country: 'India',
        taxId: '29AAACB1234C1Z5',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200012345678',
        routingNumber: 'HDFC0001234',
        paymentTerms: 'Due on Receipt',
        currency: 'INR',
        defaultTaxRate: 18,
        enableBatchExpiry: true,
        enableBarcodes: true,
        enableStaffCommission: true,
        logoUrl: '/logo.png',
      },
      create: {
        organizationId: org.id,
        companyName: 'Billora Enterprises Pvt Ltd',
        businessVertical: 'RETAIL_WHOLESALE',
        email: 'billing@billora.app',
        phone: '+91 98765 43210',
        address: '# 100, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
        country: 'India',
        taxId: '29AAACB1234C1Z5',
        bankName: 'HDFC Bank Ltd',
        accountNumber: '50200012345678',
        routingNumber: 'HDFC0001234',
        paymentTerms: 'Due on Receipt',
        currency: 'INR',
        defaultTaxRate: 18,
        enableBatchExpiry: true,
        enableBarcodes: true,
        enableStaffCommission: true,
        logoUrl: '/logo.png',
      },
    });
    console.log(`✅ Company Configured: ${profile.companyName}`);

    // 3. Admin & Staff Users
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);

    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@billora.app' },
      update: { organizationId: org.id, role: 'ADMIN' },
      create: {
        name: 'Admin User',
        email: 'admin@billora.app',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        organizationId: org.id,
      },
    });

    const staffUser = await prisma.user.upsert({
      where: { email: 'staff@billora.app' },
      update: { organizationId: org.id, role: 'STAFF' },
      create: {
        name: 'Billing Operator',
        email: 'staff@billora.app',
        passwordHash: staffPasswordHash,
        role: 'STAFF',
        organizationId: org.id,
      },
    });
    console.log(`✅ Users Seeded: ${adminUser.email} (Admin) & ${staffUser.email} (Staff)`);

    // 4. Bank & Cash Accounts
    const hdfcBank = await prisma.bankAccount.upsert({
      where: { id: 'bank-hdfc-1' },
      update: {},
      create: {
        id: 'bank-hdfc-1',
        organizationId: org.id,
        name: 'HDFC Bank Current Account',
        accountType: 'BANK',
        accountNumber: '50200012345678',
        ifsc: 'HDFC0001234',
        openingBalance: 175000.0,
      },
    });

    const cashAccount = await prisma.bankAccount.upsert({
      where: { id: 'cash-petty-1' },
      update: {},
      create: {
        id: 'cash-petty-1',
        organizationId: org.id,
        name: 'Petty Cash in Hand',
        accountType: 'CASH',
        openingBalance: 25000.0,
      },
    });
    console.log('✅ Bank and Cash Accounts Configured');

    // 5. Number Series
    const numberSeriesList = [
      { key: 'INV', prefix: 'INV-2026-', nextNumber: 104 },
      { key: 'EST', prefix: 'EST-2026-', nextNumber: 102 },
      { key: 'PUR', prefix: 'PUR-2026-', nextNumber: 102 },
      { key: 'PAY', prefix: 'PAY-2026-', nextNumber: 103 },
      { key: 'REC', prefix: 'REC-2026-', nextNumber: 103 },
    ];
    for (const ns of numberSeriesList) {
      await prisma.numberSeries.upsert({
        where: { organizationId_key: { organizationId: org.id, key: ns.key } },
        update: {},
        create: {
          organizationId: org.id,
          key: ns.key,
          prefix: ns.prefix,
          nextNumber: ns.nextNumber,
        },
      });
    }
    console.log('✅ Document Number Series Initialized');

    // 6. Master Chart of Accounts (Tally Ledgers)
    const standardLedgers = [
      { name: 'Cash in Hand', group: 'CASH_IN_HAND' as const, balanceType: 'DR' as const, balance: 25000.0 },
      { name: 'HDFC Current Bank A/c', group: 'BANK_ACCOUNTS' as const, balanceType: 'DR' as const, balance: 175000.0 },
      { name: 'Sales Account (GST 18%)', group: 'SALES_ACCOUNTS' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Sales Account (GST 12%)', group: 'SALES_ACCOUNTS' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Sales Account (GST 5%)', group: 'SALES_ACCOUNTS' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Purchase Account', group: 'PURCHASE_ACCOUNTS' as const, balanceType: 'DR' as const, balance: 0 },
      { name: 'Output CGST', group: 'DUTIES_TAXES' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Output SGST', group: 'DUTIES_TAXES' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Output IGST', group: 'DUTIES_TAXES' as const, balanceType: 'CR' as const, balance: 0 },
      { name: 'Input CGST', group: 'DUTIES_TAXES' as const, balanceType: 'DR' as const, balance: 0 },
      { name: 'Input SGST', group: 'DUTIES_TAXES' as const, balanceType: 'DR' as const, balance: 0 },
      { name: 'Sundry Debtors Control', group: 'SUNDRY_DEBTORS' as const, balanceType: 'DR' as const, balance: 12500.0 },
      { name: 'Sundry Creditors Control', group: 'SUNDRY_CREDITORS' as const, balanceType: 'CR' as const, balance: 45000.0 },
      { name: 'Office Rent & Rates', group: 'INDIRECT_EXPENSES' as const, balanceType: 'DR' as const, balance: 0 },
      { name: 'Staff Salaries & Wages', group: 'DIRECT_EXPENSES' as const, balanceType: 'DR' as const, balance: 0 },
      { name: 'Owner Capital Account', group: 'CAPITAL_ACCOUNT' as const, balanceType: 'CR' as const, balance: 167500.0 },
    ];

    for (const led of standardLedgers) {
      await prisma.ledger.upsert({
        where: { organizationId_name: { organizationId: org.id, name: led.name } },
        update: {},
        create: {
          organizationId: org.id,
          name: led.name,
          group: led.group,
          openingBalance: led.balance,
          openingType: led.balanceType,
          isSystem: true,
        },
      });
    }
    console.log(`✅ ${standardLedgers.length} Standard Accounting Ledgers Initialized`);

    // 7. Master Item Catalogue across Verticals
    const sampleItems = [
      {
        id: 'item-pcm-500',
        name: 'Paracetamol 500mg (Strip of 10)',
        description: 'Analgesic & Antipyretic Tablets IP',
        hsn: '30049099',
        unit: 'strip',
        unitPrice: 45.0,
        purchasePrice: 28.0,
        estimatePrice: 42.0,
        stockQty: 500,
        minStock: 50,
        gstRate: 12,
        itemType: 'PRODUCT' as const,
      },
      {
        id: 'item-amox-250',
        name: 'Amoxicillin 250mg Capsules',
        description: 'Broad spectrum antibiotic capsules',
        hsn: '30041010',
        unit: 'box',
        unitPrice: 120.0,
        purchasePrice: 75.0,
        estimatePrice: 110.0,
        stockQty: 300,
        minStock: 30,
        gstRate: 12,
        itemType: 'PRODUCT' as const,
      },
      {
        id: 'item-mouse-opt',
        name: 'Wireless Optical Mouse',
        description: '2.4GHz USB wireless optical mouse with ergonomic grip',
        hsn: '84716060',
        unit: 'pcs',
        unitPrice: 650.0,
        purchasePrice: 380.0,
        estimatePrice: 600.0,
        stockQty: 85,
        minStock: 15,
        gstRate: 18,
        itemType: 'PRODUCT' as const,
      },
      {
        id: 'item-haircut-uni',
        name: 'Haircut & Styling (Unisex)',
        description: 'Professional salon haircut and blow dry styling',
        hsn: '999711',
        unit: 'service',
        unitPrice: 450.0,
        purchasePrice: 0,
        estimatePrice: 450.0,
        stockQty: 999,
        minStock: 0,
        gstRate: 18,
        itemType: 'SERVICE' as const,
      },
      {
        id: 'item-butter-chick',
        name: 'Butter Chicken + Naan Combo',
        description: 'Creamy gravy with 2 tandoori butter naans',
        hsn: '996331',
        unit: 'plate',
        unitPrice: 320.0,
        purchasePrice: 150.0,
        estimatePrice: 300.0,
        stockQty: 120,
        minStock: 20,
        gstRate: 5,
        itemType: 'PRODUCT' as const,
      },
      {
        id: 'item-lathe-job',
        name: 'Precision Lathe Turning Job',
        description: 'High precision manual lathe turning job per hour',
        hsn: '9987',
        unit: 'hr',
        unitPrice: 500.0,
        purchasePrice: 0,
        estimatePrice: 480.0,
        stockQty: 250,
        minStock: 0,
        gstRate: 18,
        itemType: 'SERVICE' as const,
      },
    ];

    const seededItems: Record<string, string> = {};
    for (const item of sampleItems) {
      const record = await prisma.item.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          unitPrice: item.unitPrice,
          purchasePrice: item.purchasePrice,
          stockQty: item.stockQty,
          gstRate: item.gstRate,
        },
        create: {
          id: item.id,
          organizationId: org.id,
          name: item.name,
          description: item.description,
          hsn: item.hsn,
          unit: item.unit,
          unitPrice: item.unitPrice,
          purchasePrice: item.purchasePrice,
          estimatePrice: item.estimatePrice,
          stockQty: item.stockQty,
          minStock: item.minStock,
          gstRate: item.gstRate,
          itemType: item.itemType,
        },
      });
      seededItems[item.name] = record.id;
    }
    console.log(`✅ ${sampleItems.length} Multi-Vertical Items Configured`);

    // 8. Sample Inventory Batch for Pharmacy Items
    await prisma.inventoryBatch.upsert({
      where: { itemId_batchNumber: { itemId: seededItems['Paracetamol 500mg (Strip of 10)'], batchNumber: 'PCM-2026-A1' } },
      update: {},
      create: {
        itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
        batchNumber: 'PCM-2026-A1',
        quantity: 500,
        costPrice: 28.0,
        expiryDate: new Date('2027-12-31'),
      },
    });
    console.log('✅ Inventory Batch & Expiry Configured');

    // 9. Customers and Suppliers (Parties)
    const sampleParties = [
      {
        id: 'cust-apex-1',
        name: 'Apex Traders',
        phone: '9845012345',
        email: 'accounts@apextraders.com',
        taxId: '29ABCDE1234F1Z8',
        partyType: 'CUSTOMER' as const,
        openingBalance: 12500.0,
        address: '# 42, Commercial Complex, MG Road, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560001',
      },
      {
        id: 'supp-medplus-1',
        name: 'MedPlus Pharma Supplier',
        phone: '9845098765',
        email: 'orders@medpluswholesalers.in',
        taxId: '29XYZDE9876F1Z2',
        partyType: 'SUPPLIER' as const,
        openingBalance: -45000.0,
        address: 'Plot 12, Phase 1, Electronic City, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560100',
      },
      {
        id: 'cust-zenith-1',
        name: 'Zenith Technologies Pvt Ltd',
        phone: '9900112233',
        email: 'procurement@zenithtech.io',
        taxId: '29AAACZ9999Z1Z5',
        partyType: 'CUSTOMER' as const,
        openingBalance: 0,
        address: 'EcoSpace Business Park, Bellandur, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560103',
      },
    ];

    for (const cust of sampleParties) {
      await prisma.customer.upsert({
        where: { id: cust.id },
        update: {
          name: cust.name,
          phone: cust.phone,
          email: cust.email,
          taxId: cust.taxId,
          openingBalance: cust.openingBalance,
          address: cust.address,
        },
        create: {
          id: cust.id,
          organizationId: org.id,
          name: cust.name,
          phone: cust.phone,
          email: cust.email,
          taxId: cust.taxId,
          partyType: cust.partyType,
          openingBalance: cust.openingBalance,
          address: cust.address,
          city: cust.city,
          state: cust.state,
          zipCode: cust.zipCode,
          country: 'India',
        },
      });
    }
    console.log(`✅ ${sampleParties.length} Customer & Supplier Parties Seeded`);

    // 10. Staff Employees & Daily Attendance
    const sampleEmployees = [
      {
        id: 'emp-rahul-1',
        name: 'Rahul Sharma',
        email: 'rahul@billora.app',
        position: 'Senior Billing Executive',
        hourlyRate: 150.0,
        overtimeRate: 225.0,
      },
      {
        id: 'emp-priya-1',
        name: 'Priya Nair',
        email: 'priya@billora.app',
        position: 'Store Operations Manager',
        hourlyRate: 250.0,
        overtimeRate: 375.0,
      },
      {
        id: 'emp-suresh-1',
        name: 'Suresh Kumar',
        email: 'suresh@billora.app',
        position: 'Lead Machinist & Technician',
        hourlyRate: 180.0,
        overtimeRate: 270.0,
      },
    ];

    for (const emp of sampleEmployees) {
      await prisma.employee.upsert({
        where: { id: emp.id },
        update: {
          name: emp.name,
          hourlyRate: emp.hourlyRate,
          overtimeRate: emp.overtimeRate,
        },
        create: {
          id: emp.id,
          organizationId: org.id,
          name: emp.name,
          email: emp.email,
          position: emp.position,
          hourlyRate: emp.hourlyRate,
          overtimeRate: emp.overtimeRate,
        },
      });

      // Sample attendance for yesterday and today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId: emp.id, date: yesterday } },
        update: {},
        create: {
          employeeId: emp.id,
          date: yesterday,
          hoursWorked: 9.5, // 8h normal + 1.5h OT
          notes: 'Standard shift with 1.5h peak evening billing overtime',
        },
      });

      await prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId: emp.id, date: today } },
        update: {},
        create: {
          employeeId: emp.id,
          date: today,
          hoursWorked: 8.0,
          notes: 'Regular on-time shift logged',
        },
      });
    }
    console.log(`✅ ${sampleEmployees.length} Staff Employees & Shift Attendance Logged`);

    // 11. Sample Invoices (Sale & Purchase)
    const now = new Date();
    const issueDatePast = new Date();
    issueDatePast.setDate(now.getDate() - 10);

    const dueDatePast = new Date();
    dueDatePast.setDate(now.getDate() - 2);

    // Invoice 1: PAID Sale Invoice
    const inv1 = await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-apex-1',
        invoiceNumber: 'INV-2026-001',
        documentType: 'SALE',
        issueDate: issueDatePast,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        subtotal: 1750.0,
        taxRate: 18.0,
        cgstAmount: 157.5,
        sgstAmount: 157.5,
        taxAmount: 315.0,
        total: 2065.0,
        paidAmount: 2065.0,
        items: {
          create: [
            {
              itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
              description: 'Paracetamol 500mg (Strip of 10)',
              hsn: '30049099',
              unit: 'strip',
              quantity: 10,
              unitPrice: 45.0,
              gstRate: 12.0,
              amount: 450.0,
              sortOrder: 0,
            },
            {
              itemId: seededItems['Wireless Optical Mouse'],
              description: 'Wireless Optical Mouse',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 2,
              unitPrice: 650.0,
              gstRate: 18.0,
              amount: 1300.0,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // Payment for Invoice 1
    await prisma.payment.upsert({
      where: { organizationId_number: { organizationId: org.id, number: 'REC-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        number: 'REC-2026-001',
        direction: 'IN',
        partyId: 'cust-apex-1',
        invoiceId: inv1.id,
        bankAccountId: hdfcBank.id,
        amount: 2065.0,
        date: issueDatePast,
        mode: 'UPI',
        reference: 'UPI/HDFC/20260920-100234',
        notes: 'Full payment received via UPI QR scan',
      },
    });

    // Invoice 2: OVERDUE Sale Invoice
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-002' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-zenith-1',
        invoiceNumber: 'INV-2026-002',
        documentType: 'SALE',
        issueDate: issueDatePast,
        dueDate: dueDatePast,
        status: 'OVERDUE',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        subtotal: 10000.0,
        taxRate: 18.0,
        cgstAmount: 900.0,
        sgstAmount: 900.0,
        taxAmount: 1800.0,
        total: 11800.0,
        paidAmount: 0.0,
        items: {
          create: [
            {
              itemId: seededItems['Precision Lathe Turning Job'],
              description: 'Precision Lathe Turning Job (Special Batch)',
              hsn: '9987',
              unit: 'hr',
              quantity: 20,
              unitPrice: 500.0,
              gstRate: 18.0,
              amount: 10000.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // Invoice 3: Purchase Bill from Supplier
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'PUR-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'supp-medplus-1',
        invoiceNumber: 'PUR-2026-001',
        documentType: 'PURCHASE',
        issueDate: issueDatePast,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        subtotal: 5600.0,
        taxRate: 12.0,
        cgstAmount: 336.0,
        sgstAmount: 336.0,
        taxAmount: 672.0,
        total: 6272.0,
        paidAmount: 6272.0,
        items: {
          create: [
            {
              itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
              description: 'Paracetamol 500mg (Strip of 10) - Stock Inward',
              hsn: '30049099',
              unit: 'strip',
              quantity: 200,
              unitPrice: 28.0,
              gstRate: 12.0,
              amount: 5600.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // Payment Out for Purchase Bill
    await prisma.payment.upsert({
      where: { organizationId_number: { organizationId: org.id, number: 'PAY-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        number: 'PAY-2026-001',
        direction: 'OUT',
        partyId: 'supp-medplus-1',
        bankAccountId: hdfcBank.id,
        amount: 6272.0,
        date: issueDatePast,
        mode: 'BANK',
        reference: 'NEFT/HDFC/MEDPLUS-9901',
        notes: 'Inward inventory shipment payment settled',
      },
    });
    console.log('✅ Realistic Sale Invoices, Purchase Bills & Payments Generated');

    // 12. Operating Expenses
    const sampleExpenses = [
      {
        number: 'EXP-2026-001',
        category: 'Rent',
        description: 'Monthly Commercial Showroom & Office Space Rent',
        amount: 25000.0,
        bankAccountId: hdfcBank.id,
      },
      {
        number: 'EXP-2026-002',
        category: 'Utilities',
        description: 'Commercial Electricity Bill & High-Speed Optical Fiber Internet',
        amount: 3450.0,
        bankAccountId: cashAccount.id,
      },
      {
        number: 'EXP-2026-003',
        category: 'Stationery',
        description: 'Thermal POS Receipt Rolls & Shipping Label Bundles',
        amount: 1200.0,
        bankAccountId: cashAccount.id,
      },
    ];

    for (const exp of sampleExpenses) {
      await prisma.expense.upsert({
        where: { organizationId_number: { organizationId: org.id, number: exp.number } },
        update: {},
        create: {
          organizationId: org.id,
          number: exp.number,
          category: exp.category,
          description: exp.description,
          amount: exp.amount,
          date: now,
          bankAccountId: exp.bankAccountId,
          notes: 'Auto-approved operational expense',
        },
      });
    }
    console.log(`✅ ${sampleExpenses.length} Operating Expenses Logged`);

    // 13. Stock Movement Logs
    await prisma.stockMovementLog.create({
      data: {
        organizationId: org.id,
        itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
        movementType: 'PURCHASE',
        quantityChange: 200,
        balanceAfter: 500,
        referenceNo: 'PUR-2026-001',
        notes: 'Inward shipment received from MedPlus',
      },
    });

    console.log('🎉 Full Billora OS Database Seeding Completed Successfully!');
    console.log('🔑 Login Credentials:');
    console.log('   Admin: admin@billora.app  |  Password: admin123');
    console.log('   Staff: staff@billora.app  |  Password: staff123');
  } catch (err) {
    console.error('❌ Database Seeding Error:', err);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
