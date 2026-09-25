import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, DocumentType, InvoiceStatus, PaymentMode, PaymentDirection, BalanceType, VoucherType, UserRole, LedgerGroup } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [Billora OS] Generating comprehensive realistic dummy data for ALL features...');

  try {
    // ══════════════════════════════════════════════════════════════════════════
    // 1. Organization & Company Profile
    // ══════════════════════════════════════════════════════════════════════════
    const org = await prisma.organization.upsert({
      where: { id: 'default-org-1' },
      update: {},
      create: {
        id: 'default-org-1',
        name: 'Billora Enterprises Pvt Ltd',
      },
    });
    console.log(`✅ 1. Organization: ${org.name}`);

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
        paymentTerms: 'Net 30',
        currency: 'INR',
        defaultTaxRate: 18,
        enableBatchExpiry: true,
        enableBarcodes: true,
        enableStaffCommission: true,
        logoUrl: '/icon.png',
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
        paymentTerms: 'Net 30',
        currency: 'INR',
        defaultTaxRate: 18,
        enableBatchExpiry: true,
        enableBarcodes: true,
        enableStaffCommission: true,
        logoUrl: '/icon.png',
      },
    });
    console.log(`✅ 2. Company Profile: ${profile.companyName} (${profile.state})`);

    // ══════════════════════════════════════════════════════════════════════════
    // 2. Users (All 5 RBAC Roles)
    // ══════════════════════════════════════════════════════════════════════════
    const standardHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);
    const passwordHash = await bcrypt.hash('password123', 10);

    const usersToSeed = [
      { name: 'Admin User', email: 'admin@billora.app', role: 'ADMIN' as UserRole, hash: standardHash },
      { name: 'Billing Operator', email: 'staff@billora.app', role: 'STAFF' as UserRole, hash: staffHash },
      { name: 'Warehouse Supervisor', email: 'warehouse@billora.app', role: 'WAREHOUSE_CLERK' as UserRole, hash: passwordHash },
      { name: 'Chartered Accountant', email: 'auditor@billora.app', role: 'CA_AUDITOR' as UserRole, hash: passwordHash },
      { name: 'Counter Sales Staff', email: 'sales@billora.app', role: 'SALES_OPERATOR' as UserRole, hash: passwordHash },
    ];

    for (const u of usersToSeed) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: { organizationId: org.id, role: u.role },
        create: {
          name: u.name,
          email: u.email,
          passwordHash: u.hash,
          role: u.role,
          organizationId: org.id,
        },
      });
    }
    console.log(`✅ 3. All 5 RBAC Users Seeded (Admin, Staff, Warehouse, CA Auditor, Sales)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 3. Bank & Cash Accounts
    // ══════════════════════════════════════════════════════════════════════════
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
        openingBalance: 245000.0,
      },
    });

    const sbiBank = await prisma.bankAccount.upsert({
      where: { id: 'bank-sbi-1' },
      update: {},
      create: {
        id: 'bank-sbi-1',
        organizationId: org.id,
        name: 'State Bank of India (Operations)',
        accountType: 'BANK',
        accountNumber: '300987654321',
        ifsc: 'SBIN0004567',
        openingBalance: 85000.0,
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
        openingBalance: 35000.0,
      },
    });

    const posDrawerCash = await prisma.bankAccount.upsert({
      where: { id: 'cash-pos-1' },
      update: {},
      create: {
        id: 'cash-pos-1',
        organizationId: org.id,
        name: 'Store Counter POS Register',
        accountType: 'CASH',
        openingBalance: 15000.0,
      },
    });
    console.log(`✅ 4. 4 Bank & Cash Accounts Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 4. Number Series Sequences
    // ══════════════════════════════════════════════════════════════════════════
    const numberSeriesList = [
      { key: 'INV', prefix: 'INV-2026-', nextNumber: 106 },
      { key: 'EST', prefix: 'EST-2026-', nextNumber: 103 },
      { key: 'PRO', prefix: 'PRO-2026-', nextNumber: 102 },
      { key: 'SO', prefix: 'SO-2026-', nextNumber: 103 },
      { key: 'CH', prefix: 'CH-2026-', nextNumber: 102 },
      { key: 'CN', prefix: 'CN-2026-', nextNumber: 102 },
      { key: 'PUR', prefix: 'PUR-2026-', nextNumber: 104 },
      { key: 'PO', prefix: 'PO-2026-', nextNumber: 103 },
      { key: 'DN', prefix: 'DN-2026-', nextNumber: 102 },
      { key: 'REC', prefix: 'REC-2026-', nextNumber: 105 },
      { key: 'PAY', prefix: 'PAY-2026-', nextNumber: 104 },
      { key: 'EXP', prefix: 'EXP-2026-', nextNumber: 107 },
      { key: 'JRN', prefix: 'JRN-2026-', nextNumber: 104 },
    ];
    for (const ns of numberSeriesList) {
      await prisma.numberSeries.upsert({
        where: { organizationId_key: { organizationId: org.id, key: ns.key } },
        update: { nextNumber: ns.nextNumber },
        create: {
          organizationId: org.id,
          key: ns.key,
          prefix: ns.prefix,
          nextNumber: ns.nextNumber,
        },
      });
    }
    console.log(`✅ 5. ${numberSeriesList.length} Document Number Series Configured`);

    // ══════════════════════════════════════════════════════════════════════════
    // 5. Standard Tally-Style Chart of Accounts
    // ══════════════════════════════════════════════════════════════════════════
    const standardLedgers: { name: string; group: LedgerGroup; balanceType: BalanceType; balance: number }[] = [
      { name: 'Cash in Hand', group: 'CASH_IN_HAND', balanceType: 'DR', balance: 50000.0 },
      { name: 'HDFC Current Bank A/c', group: 'BANK_ACCOUNTS', balanceType: 'DR', balance: 245000.0 },
      { name: 'SBI Operational A/c', group: 'BANK_ACCOUNTS', balanceType: 'DR', balance: 85000.0 },
      { name: 'Sales Account (GST 18%)', group: 'SALES_ACCOUNTS', balanceType: 'CR', balance: 0 },
      { name: 'Sales Account (GST 12%)', group: 'SALES_ACCOUNTS', balanceType: 'CR', balance: 0 },
      { name: 'Sales Account (GST 5%)', group: 'SALES_ACCOUNTS', balanceType: 'CR', balance: 0 },
      { name: 'Purchase Account', group: 'PURCHASE_ACCOUNTS', balanceType: 'DR', balance: 0 },
      { name: 'Output CGST', group: 'DUTIES_TAXES', balanceType: 'CR', balance: 0 },
      { name: 'Output SGST', group: 'DUTIES_TAXES', balanceType: 'CR', balance: 0 },
      { name: 'Output IGST', group: 'DUTIES_TAXES', balanceType: 'CR', balance: 0 },
      { name: 'Input CGST', group: 'DUTIES_TAXES', balanceType: 'DR', balance: 0 },
      { name: 'Input SGST', group: 'DUTIES_TAXES', balanceType: 'DR', balance: 0 },
      { name: 'Input IGST', group: 'DUTIES_TAXES', balanceType: 'DR', balance: 0 },
      { name: 'Sundry Debtors Control', group: 'SUNDRY_DEBTORS', balanceType: 'DR', balance: 35400.0 },
      { name: 'Sundry Creditors Control', group: 'SUNDRY_CREDITORS', balanceType: 'CR', balance: 53400.0 },
      { name: 'Office Rent & Rates', group: 'INDIRECT_EXPENSES', balanceType: 'DR', balance: 0 },
      { name: 'Staff Salaries & Wages', group: 'DIRECT_EXPENSES', balanceType: 'DR', balance: 0 },
      { name: 'Electricity & Utilities', group: 'INDIRECT_EXPENSES', balanceType: 'DR', balance: 0 },
      { name: 'Owner Capital Account', group: 'CAPITAL_ACCOUNT', balanceType: 'CR', balance: 362000.0 },
    ];

    const seededLedgerMap: Record<string, string> = {};
    for (const led of standardLedgers) {
      const record = await prisma.ledger.upsert({
        where: { organizationId_name: { organizationId: org.id, name: led.name } },
        update: { openingBalance: led.balance },
        create: {
          organizationId: org.id,
          name: led.name,
          group: led.group,
          openingBalance: led.balance,
          openingType: led.balanceType,
          isSystem: true,
        },
      });
      seededLedgerMap[led.name] = record.id;
    }
    console.log(`✅ 6. ${standardLedgers.length} Tally Accounting Ledgers Configured`);

    // ══════════════════════════════════════════════════════════════════════════
    // 6. Master Item Catalogue (Retail, Pharmacy, Hardware, Services, POS)
    // ══════════════════════════════════════════════════════════════════════════
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
        isPublic: true,
      },
      {
        id: 'item-amox-250',
        name: 'Amoxicillin 250mg Capsules',
        description: 'Broad spectrum antibiotic capsules (Pack of 10)',
        hsn: '30041010',
        unit: 'box',
        unitPrice: 120.0,
        purchasePrice: 75.0,
        estimatePrice: 110.0,
        stockQty: 300,
        minStock: 30,
        gstRate: 12,
        itemType: 'PRODUCT' as const,
        isPublic: true,
      },
      {
        id: 'item-azithro-500',
        name: 'Azithromycin 500mg Tablets',
        description: 'Antibiotic 3-day course pack',
        hsn: '30042010',
        unit: 'strip',
        unitPrice: 115.0,
        purchasePrice: 68.0,
        estimatePrice: 105.0,
        stockQty: 180,
        minStock: 25,
        gstRate: 12,
        itemType: 'PRODUCT' as const,
        isPublic: true,
      },
      {
        id: 'item-mouse-opt',
        name: 'Logitech Wireless Optical Mouse M185',
        description: '2.4GHz USB wireless optical mouse with nano receiver',
        hsn: '84716060',
        unit: 'pcs',
        unitPrice: 650.0,
        purchasePrice: 380.0,
        estimatePrice: 600.0,
        stockQty: 45,
        minStock: 15,
        gstRate: 18,
        itemType: 'PRODUCT' as const,
        isPublic: true,
      },
      {
        id: 'item-keyboard-rgb',
        name: 'Mechanical Gaming Keyboard RGB',
        description: 'Tenkeyless tactile mechanical switches with braided cable',
        hsn: '84716060',
        unit: 'pcs',
        unitPrice: 2400.0,
        purchasePrice: 1450.0,
        estimatePrice: 2200.0,
        stockQty: 25,
        minStock: 5,
        gstRate: 18,
        itemType: 'PRODUCT' as const,
        isPublic: true,
      },
      {
        id: 'item-usbc-cable',
        name: 'Braided USB-C Fast Charging Cable (2m)',
        description: '100W PD Power Delivery quick charging cable',
        hsn: '85444299',
        unit: 'pcs',
        unitPrice: 350.0,
        purchasePrice: 160.0,
        estimatePrice: 320.0,
        stockQty: 120,
        minStock: 20,
        gstRate: 18,
        itemType: 'PRODUCT' as const,
        isPublic: true,
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
        isPublic: true,
      },
      {
        id: 'item-hair-spa',
        name: 'Keratin Hair Spa Treatment',
        description: 'Deep conditioning spa treatment with organic serum',
        hsn: '999711',
        unit: 'service',
        unitPrice: 1250.0,
        purchasePrice: 250.0,
        estimatePrice: 1200.0,
        stockQty: 999,
        minStock: 0,
        gstRate: 18,
        itemType: 'SERVICE' as const,
        isPublic: true,
      },
      {
        id: 'item-butter-chick',
        name: 'Butter Chicken + Naan Combo',
        description: 'Creamy rich butter chicken with 2 tandoori naans',
        hsn: '996331',
        unit: 'plate',
        unitPrice: 320.0,
        purchasePrice: 140.0,
        estimatePrice: 300.0,
        stockQty: 80,
        minStock: 15,
        gstRate: 5,
        itemType: 'PRODUCT' as const,
        isPublic: true,
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
        isPublic: false,
      },
      {
        id: 'item-steel-rod',
        name: 'Stainless Steel Rod 304 (6m length)',
        description: 'Industrial grade corrosion resistant alloy rod',
        hsn: '72221100',
        unit: 'rod',
        unitPrice: 1800.0,
        purchasePrice: 1250.0,
        estimatePrice: 1750.0,
        stockQty: 60,
        minStock: 10,
        gstRate: 18,
        itemType: 'PRODUCT' as const,
        isPublic: false,
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
          estimatePrice: item.estimatePrice,
          stockQty: item.stockQty,
          gstRate: item.gstRate,
          isPublic: item.isPublic,
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
          isPublic: item.isPublic,
        },
      });
      seededItems[item.name] = record.id;
    }
    console.log(`✅ 7. ${sampleItems.length} Master Items Seeded (Retail, Pharmacy, Hardware, Services)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 7. Inventory Batches & Expiry (Pharmacy / Retail)
    // ══════════════════════════════════════════════════════════════════════════
    const batches = [
      { itemId: seededItems['Paracetamol 500mg (Strip of 10)'], batchNumber: 'PCM-2026-A1', qty: 500, cost: 28.0, exp: new Date('2027-12-31') },
      { itemId: seededItems['Amoxicillin 250mg Capsules'], batchNumber: 'AMX-2026-B4', qty: 300, cost: 75.0, exp: new Date('2028-06-30') },
      { itemId: seededItems['Azithromycin 500mg Tablets'], batchNumber: 'AZI-2026-C2', qty: 180, cost: 68.0, exp: new Date('2027-09-30') },
    ];
    for (const b of batches) {
      await prisma.inventoryBatch.upsert({
        where: { itemId_batchNumber: { itemId: b.itemId, batchNumber: b.batchNumber } },
        update: { quantity: b.qty },
        create: {
          itemId: b.itemId,
          batchNumber: b.batchNumber,
          quantity: b.qty,
          costPrice: b.cost,
          expiryDate: b.exp,
        },
      });
    }
    console.log(`✅ 8. ${batches.length} Pharmacy Inventory Batches with Expiry Dates Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 8. Serial Numbers (Hardware & Equipment Tracking)
    // ══════════════════════════════════════════════════════════════════════════
    const serials = [
      { itemId: seededItems['Logitech Wireless Optical Mouse M185'], sn: 'SN-MOU-2026-001', status: 'AVAILABLE' },
      { itemId: seededItems['Logitech Wireless Optical Mouse M185'], sn: 'SN-MOU-2026-002', status: 'AVAILABLE' },
      { itemId: seededItems['Logitech Wireless Optical Mouse M185'], sn: 'SN-MOU-2026-003', status: 'SOLD' },
      { itemId: seededItems['Mechanical Gaming Keyboard RGB'], sn: 'SN-KBD-2026-001', status: 'AVAILABLE' },
      { itemId: seededItems['Mechanical Gaming Keyboard RGB'], sn: 'SN-KBD-2026-002', status: 'SOLD' },
    ];
    for (const s of serials) {
      await prisma.serialNumber.upsert({
        where: { itemId_serialNumber: { itemId: s.itemId, serialNumber: s.sn } },
        update: { status: s.status },
        create: {
          itemId: s.itemId,
          serialNumber: s.sn,
          status: s.status,
        },
      });
    }
    console.log(`✅ 9. ${serials.length} Tracked Serial Numbers Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 9. Customers & Suppliers (Intrastate & Interstate)
    // ══════════════════════════════════════════════════════════════════════════
    const sampleParties = [
      {
        id: 'cust-apex-1',
        name: 'Apex Traders',
        phone: '9845012345',
        email: 'accounts@apextraders.com',
        taxId: '29ABCDE1234F1Z8', // Karnataka (Intrastate)
        partyType: 'CUSTOMER' as const,
        openingBalance: 12500.0,
        address: '# 42, Commercial Complex, MG Road, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560001',
      },
      {
        id: 'cust-zenith-1',
        name: 'Zenith Technologies Pvt Ltd',
        phone: '9900112233',
        email: 'procurement@zenithtech.io',
        taxId: '29AAACZ9999Z1Z5', // Karnataka (Intrastate)
        partyType: 'CUSTOMER' as const,
        openingBalance: 0,
        address: 'EcoSpace Business Park, Bellandur, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560103',
      },
      {
        id: 'cust-mumbai-1',
        name: 'Mumbai Digital Hub LLP',
        phone: '9820011223',
        email: 'billing@mumbaidigital.in',
        taxId: '27AAACL5555L1Z1', // Maharashtra (Interstate IGST)
        partyType: 'CUSTOMER' as const,
        openingBalance: 23600.0,
        address: 'Unit 401, Trade Center, BKC, Bandra East, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400051',
      },
      {
        id: 'cust-chennai-1',
        name: 'Chennai Hardware & Tools Corp',
        phone: '9444012345',
        email: 'sales@chennaihardware.com',
        taxId: '33AAACC7777C1Z4', // Tamil Nadu (Interstate IGST)
        partyType: 'CUSTOMER' as const,
        openingBalance: 0,
        address: '88 Mount Road, Guindy, Chennai',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600032',
      },
      {
        id: 'supp-medplus-1',
        name: 'MedPlus Pharma Wholesalers',
        phone: '9845098765',
        email: 'orders@medpluswholesalers.in',
        taxId: '29XYZDE9876F1Z2', // Karnataka (Intrastate Supplier)
        partyType: 'SUPPLIER' as const,
        openingBalance: -45000.0,
        address: 'Plot 12, Phase 1, Electronic City, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560100',
      },
      {
        id: 'supp-tata-1',
        name: 'Tata Steel Distribution Depot',
        phone: '9830055443',
        email: 'orders@tatasteeldist.com',
        taxId: '20AAACT0001T1Z9', // Jharkhand (Interstate Supplier)
        partyType: 'SUPPLIER' as const,
        openingBalance: 0,
        address: 'Industrial Area Phase 2, Jamshedpur',
        city: 'Jamshedpur',
        state: 'Jharkhand',
        zipCode: '831001',
      },
      {
        id: 'cust-retail-walkin',
        name: 'Vikas Sharma (Retail Walk-in)',
        phone: '9876500000',
        email: 'vikas.walkin@gmail.com',
        taxId: null, // Unregistered B2C
        partyType: 'CUSTOMER' as const,
        openingBalance: 0,
        address: 'Indiranagar 2nd Stage, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        zipCode: '560038',
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
    console.log(`✅ 10. ${sampleParties.length} Customer & Supplier Parties Seeded (Intrastate + Interstate)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 10. Staff Employees, Shifts & Daily Attendance
    // ══════════════════════════════════════════════════════════════════════════
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
      {
        id: 'emp-ananya-1',
        name: 'Ananya Sen',
        email: 'ananya@billora.app',
        position: 'Senior Stylist & Aesthetician',
        hourlyRate: 200.0,
        overtimeRate: 300.0,
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

      // Shift attendance records for last 3 days
      for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
        const attDate = new Date();
        attDate.setDate(attDate.getDate() - dayOffset);
        attDate.setHours(0, 0, 0, 0);

        await prisma.attendanceRecord.upsert({
          where: { employeeId_date: { employeeId: emp.id, date: attDate } },
          update: {},
          create: {
            employeeId: emp.id,
            date: attDate,
            hoursWorked: dayOffset === 1 ? 9.5 : 8.0,
            notes: dayOffset === 1 ? 'Peak evening shift with 1.5h overtime' : 'Normal scheduled shift logged',
          },
        });
      }
    }
    console.log(`✅ 11. ${sampleEmployees.length} Staff Employees & Shift Attendance Logged`);

    // ══════════════════════════════════════════════════════════════════════════
    // 11. Payroll Records (Salary, PF, ESI, TDS)
    // ══════════════════════════════════════════════════════════════════════════
    const payrollDate = new Date();
    payrollDate.setDate(1);
    payrollDate.setHours(0, 0, 0, 0);

    const payrollList = [
      { employeeId: 'emp-rahul-1', base: 26000, ot: 3375, pf: 1800, esi: 210, tax: 500, net: 26865, status: 'PAID' },
      { employeeId: 'emp-priya-1', base: 43000, ot: 0, pf: 1800, esi: 0, tax: 2500, net: 38700, status: 'PAID' },
      { employeeId: 'emp-suresh-1', base: 31000, ot: 4050, pf: 1800, esi: 260, tax: 800, net: 32190, status: 'DRAFT' },
      { employeeId: 'emp-ananya-1', base: 35000, ot: 1800, pf: 1800, esi: 275, tax: 1200, net: 33525, status: 'PAID' },
    ];

    for (const pr of payrollList) {
      const existingPr = await prisma.payrollRecord.findFirst({
        where: { employeeId: pr.employeeId, month: payrollDate },
      });
      if (!existingPr) {
        await prisma.payrollRecord.create({
          data: {
            employeeId: pr.employeeId,
            month: payrollDate,
            baseSalary: pr.base,
            overtimePay: pr.ot,
            grossSalary: pr.base + pr.ot,
            pfDeduction: pr.pf,
            esiDeduction: pr.esi,
            taxDeduction: pr.tax,
            netSalary: pr.net,
            status: pr.status,
          },
        });
      }
    }
    console.log(`✅ 12. ${payrollList.length} Monthly Payroll Records Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 12. Realistic Documents for ALL Document Types:
    // (SALE, ESTIMATE, PROFORMA, SALE_ORDER, DELIVERY_CHALLAN, CREDIT_NOTE,
    //  PURCHASE, PURCHASE_ORDER, DEBIT_NOTE)
    // ══════════════════════════════════════════════════════════════════════════
    const now = new Date();
    const past5d = new Date(Date.now() - 5 * 86400000);
    const past10d = new Date(Date.now() - 10 * 86400000);
    const future15d = new Date(Date.now() + 15 * 86400000);

    // 1. SALE (Intrastate CGST/SGST Paid)
    const sale1 = await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-apex-1',
        invoiceNumber: 'INV-2026-001',
        documentType: 'SALE',
        issueDate: past10d,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        placeOfSupply: 'Karnataka',
        isInterState: false,
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
              itemId: seededItems['Logitech Wireless Optical Mouse M185'],
              description: 'Logitech Wireless Optical Mouse M185',
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

    // 2. SALE (Overdue Customer Invoice)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-002' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-zenith-1',
        invoiceNumber: 'INV-2026-002',
        documentType: 'SALE',
        issueDate: past10d,
        dueDate: past5d,
        status: 'OVERDUE',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        placeOfSupply: 'Karnataka',
        isInterState: false,
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
              description: 'Precision Lathe Turning Job (Special Machinery Batch)',
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

    // 3. SALE (Interstate IGST to Maharashtra)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-003' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-mumbai-1',
        invoiceNumber: 'INV-2026-003',
        documentType: 'SALE',
        issueDate: past5d,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        companyPhone: profile.phone,
        companyAddress: profile.address,
        placeOfSupply: 'Maharashtra',
        isInterState: true,
        subtotal: 20000.0,
        taxRate: 18.0,
        igstAmount: 3600.0,
        taxAmount: 3600.0,
        total: 23600.0,
        paidAmount: 0.0,
        items: {
          create: [
            {
              itemId: seededItems['Mechanical Gaming Keyboard RGB'],
              description: 'Mechanical Gaming Keyboard RGB (Wholesale Lot)',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 8,
              unitPrice: 2400.0,
              gstRate: 18.0,
              amount: 19200.0,
              sortOrder: 0,
            },
            {
              itemId: seededItems['Braided USB-C Fast Charging Cable (2m)'],
              description: 'Braided USB-C Fast Charging Cable (Pack)',
              hsn: '85444299',
              unit: 'pcs',
              quantity: 2,
              unitPrice: 400.0,
              gstRate: 18.0,
              amount: 800.0,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // 4. SALE (B2C Cash Counter POS Sale)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'INV-2026-004' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-retail-walkin',
        invoiceNumber: 'INV-2026-004',
        documentType: 'SALE',
        issueDate: now,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        placeOfSupply: 'Karnataka',
        isInterState: false,
        subtotal: 920.0,
        taxRate: 5.0,
        cgstAmount: 22.5,
        sgstAmount: 22.5,
        taxAmount: 45.0,
        total: 965.0,
        paidAmount: 965.0,
        items: {
          create: [
            {
              itemId: seededItems['Butter Chicken + Naan Combo'],
              description: 'Butter Chicken + Naan Combo (Table Order)',
              hsn: '996331',
              unit: 'plate',
              quantity: 2,
              unitPrice: 320.0,
              gstRate: 5.0,
              amount: 640.0,
              sortOrder: 0,
            },
            {
              itemId: seededItems['Braided USB-C Fast Charging Cable (2m)'],
              description: 'Counter Add-on USB-C Cable',
              hsn: '85444299',
              unit: 'pcs',
              quantity: 1,
              unitPrice: 280.0,
              gstRate: 18.0,
              amount: 280.0,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // 5. ESTIMATE (Quotation for Tech Infrastructure)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'EST-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-zenith-1',
        invoiceNumber: 'EST-2026-001',
        documentType: 'ESTIMATE',
        issueDate: now,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        subtotal: 45000.0,
        taxRate: 18.0,
        cgstAmount: 4050.0,
        sgstAmount: 4050.0,
        taxAmount: 8100.0,
        total: 53100.0,
        paidAmount: 0.0,
        notes: 'Commercial quotation valid for 30 days. 50% advance on PO confirmation.',
        items: {
          create: [
            {
              itemId: seededItems['Logitech Wireless Optical Mouse M185'],
              description: 'Enterprise Optical Mice (Pack of 50)',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 50,
              unitPrice: 600.0,
              gstRate: 18.0,
              amount: 30000.0,
              sortOrder: 0,
            },
            {
              itemId: seededItems['Precision Lathe Turning Job'],
              description: 'Custom Server Rack Milling Service',
              hsn: '9987',
              unit: 'hr',
              quantity: 30,
              unitPrice: 500.0,
              gstRate: 18.0,
              amount: 15000.0,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // 6. PROFORMA (Proforma Invoice with Advance Payment Clause)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'PRO-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-chennai-1',
        invoiceNumber: 'PRO-2026-001',
        documentType: 'PROFORMA',
        issueDate: past5d,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        placeOfSupply: 'Tamil Nadu',
        isInterState: true,
        subtotal: 36000.0,
        taxRate: 18.0,
        igstAmount: 6480.0,
        taxAmount: 6480.0,
        total: 42480.0,
        paidAmount: 0.0,
        terms: 'Goods dispatched immediately upon NEFT advance receipt.',
        items: {
          create: [
            {
              itemId: seededItems['Stainless Steel Rod 304 (6m length)'],
              description: 'Industrial Stainless Steel Rod 304 - 20 rods',
              hsn: '72221100',
              unit: 'rod',
              quantity: 20,
              unitPrice: 1800.0,
              gstRate: 18.0,
              amount: 36000.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 7. SALE ORDER (Confirmed Client Order)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'SO-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-apex-1',
        invoiceNumber: 'SO-2026-001',
        documentType: 'SALE_ORDER',
        issueDate: past5d,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        orderNumber: 'APEX-PO-8819',
        subtotal: 48000.0,
        taxRate: 18.0,
        cgstAmount: 4320.0,
        sgstAmount: 4320.0,
        taxAmount: 8640.0,
        total: 56640.0,
        paidAmount: 0.0,
        items: {
          create: [
            {
              itemId: seededItems['Mechanical Gaming Keyboard RGB'],
              description: 'RGB Keyboards for Apex branch desks',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 20,
              unitPrice: 2400.0,
              gstRate: 18.0,
              amount: 48000.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 8. DELIVERY CHALLAN (Goods in Transit with E-way Bill)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'CH-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-apex-1',
        invoiceNumber: 'CH-2026-001',
        documentType: 'DELIVERY_CHALLAN',
        issueDate: now,
        dueDate: now,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        vehicleNumber: 'KA-01-MJ-8822',
        ewayBill: '221980345612',
        subtotal: 26000.0,
        total: 26000.0,
        paidAmount: 0.0,
        notes: 'Delivery Challan for stock transfer to customer retail depot.',
        items: {
          create: [
            {
              itemId: seededItems['Logitech Wireless Optical Mouse M185'],
              description: 'Hardware dispatch for order APEX-PO-8819',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 40,
              unitPrice: 650.0,
              gstRate: 18.0,
              amount: 26000.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 9. CREDIT NOTE (Sales Return / Damaged Goods Credit)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'CN-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'cust-apex-1',
        invoiceNumber: 'CN-2026-001',
        documentType: 'CREDIT_NOTE',
        issueDate: now,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        notes: 'Credit Note issued against INV-2026-001 for 1 defective mouse unit.',
        subtotal: 650.0,
        taxRate: 18.0,
        cgstAmount: 58.5,
        sgstAmount: 58.5,
        taxAmount: 117.0,
        total: 767.0,
        paidAmount: 767.0,
        items: {
          create: [
            {
              itemId: seededItems['Logitech Wireless Optical Mouse M185'],
              description: 'Defective unit returned by client',
              hsn: '84716060',
              unit: 'pcs',
              quantity: 1,
              unitPrice: 650.0,
              gstRate: 18.0,
              amount: 650.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 10. PURCHASE (Inward Stock Bill from MedPlus)
    const pur1 = await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'PUR-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'supp-medplus-1',
        invoiceNumber: 'PUR-2026-001',
        documentType: 'PURCHASE',
        issueDate: past10d,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        placeOfSupply: 'Karnataka',
        isInterState: false,
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

    // 11. PURCHASE (Raw Materials from Tata Steel)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'PUR-2026-002' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'supp-tata-1',
        invoiceNumber: 'PUR-2026-002',
        documentType: 'PURCHASE',
        issueDate: past5d,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        placeOfSupply: 'Jharkhand',
        isInterState: true,
        subtotal: 37500.0,
        taxRate: 18.0,
        igstAmount: 6750.0,
        taxAmount: 6750.0,
        total: 44250.0,
        paidAmount: 0.0,
        items: {
          create: [
            {
              itemId: seededItems['Stainless Steel Rod 304 (6m length)'],
              description: 'Industrial SS Rod 304 (Lot of 30)',
              hsn: '72221100',
              unit: 'rod',
              quantity: 30,
              unitPrice: 1250.0,
              gstRate: 18.0,
              amount: 37500.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 12. PURCHASE ORDER (PO sent to MedPlus for Antibiotics)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'PO-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'supp-medplus-1',
        invoiceNumber: 'PO-2026-001',
        documentType: 'PURCHASE_ORDER',
        issueDate: now,
        dueDate: future15d,
        status: 'SENT',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        subtotal: 22500.0,
        taxRate: 12.0,
        cgstAmount: 1350.0,
        sgstAmount: 1350.0,
        taxAmount: 2700.0,
        total: 25200.0,
        paidAmount: 0.0,
        items: {
          create: [
            {
              itemId: seededItems['Amoxicillin 250mg Capsules'],
              description: 'Amoxicillin 250mg Capsules (Bulk PO)',
              hsn: '30041010',
              unit: 'box',
              quantity: 300,
              unitPrice: 75.0,
              gstRate: 12.0,
              amount: 22500.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });

    // 13. DEBIT NOTE (Purchase Return to MedPlus)
    await prisma.invoice.upsert({
      where: { organizationId_invoiceNumber: { organizationId: org.id, invoiceNumber: 'DN-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        customerId: 'supp-medplus-1',
        invoiceNumber: 'DN-2026-001',
        documentType: 'DEBIT_NOTE',
        issueDate: now,
        dueDate: now,
        status: 'PAID',
        companyName: profile.companyName,
        companyTaxId: profile.taxId,
        notes: 'Debit Note issued for 10 broken strips during shipment unloading.',
        subtotal: 280.0,
        taxRate: 12.0,
        cgstAmount: 16.8,
        sgstAmount: 16.8,
        taxAmount: 33.6,
        total: 313.6,
        paidAmount: 313.6,
        items: {
          create: [
            {
              itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
              description: 'Damaged in transit return',
              hsn: '30049099',
              unit: 'strip',
              quantity: 10,
              unitPrice: 28.0,
              gstRate: 12.0,
              amount: 280.0,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    console.log(`✅ 13. All 9 Document Types Seeded (Sale, Estimate, Proforma, SO, Challan, CN, Purchase, PO, Debit Note)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 13. Payments (In & Out across Cash, UPI, Bank, Cheque)
    // ══════════════════════════════════════════════════════════════════════════
    const paymentsToSeed = [
      {
        number: 'REC-2026-001',
        direction: 'IN' as PaymentDirection,
        partyId: 'cust-apex-1',
        invoiceId: sale1.id,
        bankAccountId: hdfcBank.id,
        amount: 2065.0,
        date: past10d,
        mode: 'UPI' as PaymentMode,
        reference: 'UPI/HDFC/20260920-100234',
        notes: 'Full payment received via UPI QR scan',
      },
      {
        number: 'REC-2026-002',
        direction: 'IN' as PaymentDirection,
        partyId: 'cust-retail-walkin',
        bankAccountId: posDrawerCash.id,
        amount: 965.0,
        date: now,
        mode: 'CASH' as PaymentMode,
        reference: 'POS-CASH-REC-104',
        notes: 'Cash received at retail counter drawer',
      },
      {
        number: 'REC-2026-003',
        direction: 'IN' as PaymentDirection,
        partyId: 'cust-apex-1',
        bankAccountId: hdfcBank.id,
        amount: 10000.0,
        date: past5d,
        mode: 'CHEQUE' as PaymentMode,
        reference: 'CHQ-880192 (ICICI Bank)',
        notes: 'Cheque cleared in HDFC current account',
      },
      {
        number: 'PAY-2026-001',
        direction: 'OUT' as PaymentDirection,
        partyId: 'supp-medplus-1',
        invoiceId: pur1.id,
        bankAccountId: hdfcBank.id,
        amount: 6272.0,
        date: past10d,
        mode: 'BANK' as PaymentMode,
        reference: 'NEFT/HDFC/MEDPLUS-9901',
        notes: 'Inward inventory shipment payment settled',
      },
      {
        number: 'PAY-2026-002',
        direction: 'OUT' as PaymentDirection,
        partyId: 'supp-tata-1',
        bankAccountId: sbiBank.id,
        amount: 20000.0,
        date: past5d,
        mode: 'BANK' as PaymentMode,
        reference: 'RTGS/SBIN/TATA-STEEL-4401',
        notes: 'Advance installment for raw materials',
      },
    ];

    for (const p of paymentsToSeed) {
      await prisma.payment.upsert({
        where: { organizationId_number: { organizationId: org.id, number: p.number } },
        update: {},
        create: {
          organizationId: org.id,
          number: p.number,
          direction: p.direction,
          partyId: p.partyId,
          invoiceId: p.invoiceId,
          bankAccountId: p.bankAccountId,
          amount: p.amount,
          date: p.date,
          mode: p.mode,
          reference: p.reference,
          notes: p.notes,
        },
      });
    }
    console.log(`✅ 14. ${paymentsToSeed.length} Realistic Payments (IN & OUT) Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 14. Operating Expenses
    // ══════════════════════════════════════════════════════════════════════════
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
        bankAccountId: posDrawerCash.id,
      },
      {
        number: 'EXP-2026-004',
        category: 'Software & Cloud',
        description: 'Cloud Server Infrastructure, SMS Gateway & Accounting SaaS',
        amount: 7800.0,
        bankAccountId: hdfcBank.id,
      },
      {
        number: 'EXP-2026-005',
        category: 'Logistics',
        description: 'Local Delivery Van Fuel & Interstate Courier Shipping',
        amount: 4200.0,
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
          notes: 'Approved operational expense',
        },
      });
    }
    console.log(`✅ 15. ${sampleExpenses.length} Operating Expenses Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 15. Appointments (CRM & Service Verticals)
    // ══════════════════════════════════════════════════════════════════════════
    const appointmentsToSeed = [
      {
        customerId: 'cust-apex-1',
        employeeId: 'emp-ananya-1',
        serviceName: 'Keratin Hair Spa & Styling',
        appointmentDate: new Date(Date.now() + 86400000), // Tomorrow
        status: 'SCHEDULED',
        amount: 1700.0,
        notes: 'VIP Client appointment booked via online calendar',
      },
      {
        customerId: 'cust-zenith-1',
        employeeId: 'emp-suresh-1',
        serviceName: 'High Precision Lathe Turning & Milling Consultation',
        appointmentDate: past5d,
        status: 'COMPLETED',
        amount: 2500.0,
        notes: 'Technical prototype review completed successfully',
      },
      {
        customerId: 'cust-retail-walkin',
        employeeId: 'emp-ananya-1',
        serviceName: 'Haircut & Styling (Unisex)',
        appointmentDate: past10d,
        status: 'COMPLETED',
        amount: 450.0,
        notes: 'Walk-in customer appointment settled at POS counter',
      },
    ];

    for (const app of appointmentsToSeed) {
      const existing = await prisma.appointment.findFirst({
        where: { customerId: app.customerId, serviceName: app.serviceName },
      });
      if (!existing) {
        await prisma.appointment.create({
          data: {
            organizationId: org.id,
            customerId: app.customerId,
            employeeId: app.employeeId,
            serviceName: app.serviceName,
            appointmentDate: app.appointmentDate,
            status: app.status,
            amount: app.amount,
            notes: app.notes,
          },
        });
      }
    }
    console.log(`✅ 16. ${appointmentsToSeed.length} CRM & Service Appointments Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 16. Recurring Invoices (Subscriptions / AMC Retainers)
    // ══════════════════════════════════════════════════════════════════════════
    const recurringList = [
      {
        frequency: 'MONTHLY',
        startDate: past10d,
        nextGenerationDate: future15d,
        status: 'ACTIVE',
        autoEmail: true,
        autoWhatsApp: true,
        reminderDaysBefore: 3,
      },
      {
        frequency: 'QUARTERLY',
        startDate: past10d,
        nextGenerationDate: new Date(Date.now() + 45 * 86400000),
        status: 'ACTIVE',
        autoEmail: true,
        autoWhatsApp: false,
        reminderDaysBefore: 7,
      },
    ];

    for (const rec of recurringList) {
      const existingRec = await prisma.recurringInvoice.findFirst({
        where: { organizationId: org.id, frequency: rec.frequency },
      });
      if (!existingRec) {
        await prisma.recurringInvoice.create({
          data: {
            organizationId: org.id,
            frequency: rec.frequency,
            startDate: rec.startDate,
            nextGenerationDate: rec.nextGenerationDate,
            status: rec.status,
            autoEmail: rec.autoEmail,
            autoWhatsApp: rec.autoWhatsApp,
            reminderDaysBefore: rec.reminderDaysBefore,
          },
        });
      }
    }
    console.log(`✅ 17. ${recurringList.length} Active Recurring Invoices (AMC Retainers) Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 17. Prescription Attachments (Pharmacy Vertical)
    // ══════════════════════════════════════════════════════════════════════════
    const existingPresc = await prisma.prescriptionAttachment.findFirst({
      where: { organizationId: org.id, invoiceId: sale1.id },
    });
    if (!existingPresc) {
      await prisma.prescriptionAttachment.create({
        data: {
          organizationId: org.id,
          invoiceId: sale1.id,
          doctorName: 'Dr. Arvind Rao, MBBS, MD (Reg # KMC-44910)',
          patientName: 'Kavita Sharma',
          fileUrl: '/uploads/prescriptions/rx_apex_1001.pdf',
          notes: 'Prescription verified for Paracetamol 500mg & Antibiotic course',
        },
      });
    }
    console.log(`✅ 18. Medical Prescription Attachments Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 18. DPDP Data Governance & Consents
    // ══════════════════════════════════════════════════════════════════════════
    const dpdpConsents = [
      {
        entityType: 'CUSTOMER',
        entityId: 'cust-apex-1',
        entityName: 'Apex Traders',
        contact: '9845012345',
        purpose: 'TRANSACTIONAL_INVOICES_AND_PAYMENT_REMINDERS',
        status: 'GRANTED',
        channel: 'WHATSAPP_OPT_IN',
        noticeVersion: 'v2.1',
        notes: 'Consent granted on registration for WhatsApp e-invoice delivery',
      },
      {
        entityType: 'CUSTOMER',
        entityId: 'cust-zenith-1',
        entityName: 'Zenith Technologies Pvt Ltd',
        contact: 'procurement@zenithtech.io',
        purpose: 'TAX_INVOICING_AND_ACCOUNT_STATEMENTS',
        status: 'GRANTED',
        channel: 'EMAIL_VERIFIED',
        noticeVersion: 'v2.1',
        notes: 'Corporate consent logged for GST compliance',
      },
      {
        entityType: 'EMPLOYEE',
        entityId: 'emp-rahul-1',
        entityName: 'Rahul Sharma',
        contact: 'rahul@billora.app',
        purpose: 'PAYROLL_AND_STATUTORY_PF_ESI_PROCESSING',
        status: 'GRANTED',
        channel: 'EMPLOYEE_PORTAL',
        noticeVersion: 'v1.0',
        notes: 'Employee payroll consent recorded on onboarding',
      },
    ];

    for (const c of dpdpConsents) {
      const existing = await prisma.dpdpConsent.findFirst({
        where: { organizationId: org.id, entityId: c.entityId },
      });
      if (!existing) {
        await prisma.dpdpConsent.create({
          data: {
            organizationId: org.id,
            entityType: c.entityType,
            entityId: c.entityId,
            entityName: c.entityName,
            contact: c.contact,
            purpose: c.purpose,
            status: c.status,
            grantedAt: past10d,
            channel: c.channel,
            noticeVersion: c.noticeVersion,
            notes: c.notes,
          },
        });
      }
    }
    console.log(`✅ 19. ${dpdpConsents.length} DPDP Data Protection Consents Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 19. Tally Double-Entry Journal Vouchers (Balanced DR = CR)
    // ══════════════════════════════════════════════════════════════════════════
    // Voucher 1: Opening Capital Injection (₹2,00,000)
    await prisma.journalVoucher.upsert({
      where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        voucherNumber: 'JRN-2026-001',
        voucherType: 'JOURNAL',
        date: past10d,
        narration: 'Being business equity capital infused via bank and cash opening balance',
        reference: 'CAPITAL-INJECTION-01',
        entries: {
          create: [
            { ledgerId: seededLedgerMap['HDFC Current Bank A/c'], type: 'DR', amount: 175000.0 },
            { ledgerId: seededLedgerMap['Cash in Hand'], type: 'DR', amount: 25000.0 },
            { ledgerId: seededLedgerMap['Owner Capital Account'], type: 'CR', amount: 200000.0 },
          ],
        },
      },
    });

    // Voucher 2: Contra Cash Withdrawal from HDFC Bank to Petty Cash (₹10,000)
    await prisma.journalVoucher.upsert({
      where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'CONTRA-2026-001' } },
      update: {},
      create: {
        organizationId: org.id,
        voucherNumber: 'CONTRA-2026-001',
        voucherType: 'CONTRA',
        date: past5d,
        narration: 'Being cash withdrawn from HDFC Current A/c for office petty cash float',
        reference: 'SELF-CHEQUE-4401',
        entries: {
          create: [
            { ledgerId: seededLedgerMap['Cash in Hand'], type: 'DR', amount: 10000.0 },
            { ledgerId: seededLedgerMap['HDFC Current Bank A/c'], type: 'CR', amount: 10000.0 },
          ],
        },
      },
    });
    console.log(`✅ 20. Balanced Tally Journal Vouchers & Double-Entry Ledgers Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 20. Stock Movement Logs (Audit Trail)
    // ══════════════════════════════════════════════════════════════════════════
    const stockMovements = [
      {
        itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
        movementType: 'PURCHASE',
        quantityChange: 200,
        balanceAfter: 500,
        referenceNo: 'PUR-2026-001',
        notes: 'Inward shipment received from MedPlus',
      },
      {
        itemId: seededItems['Paracetamol 500mg (Strip of 10)'],
        movementType: 'SALE',
        quantityChange: -10,
        balanceAfter: 490,
        referenceNo: 'INV-2026-001',
        notes: 'Dispatched against invoice INV-2026-001',
      },
      {
        itemId: seededItems['Logitech Wireless Optical Mouse M185'],
        movementType: 'SALE',
        quantityChange: -2,
        balanceAfter: 43,
        referenceNo: 'INV-2026-001',
        notes: 'Retail delivery to Apex Traders',
      },
      {
        itemId: seededItems['Logitech Wireless Optical Mouse M185'],
        movementType: 'RETURN',
        quantityChange: 1,
        balanceAfter: 44,
        referenceNo: 'CN-2026-001',
        notes: 'Return received into godown under credit note',
      },
    ];

    for (const sm of stockMovements) {
      await prisma.stockMovementLog.create({
        data: {
          organizationId: org.id,
          itemId: sm.itemId,
          movementType: sm.movementType,
          quantityChange: sm.quantityChange,
          balanceAfter: sm.balanceAfter,
          referenceNo: sm.referenceNo,
          notes: sm.notes,
        },
      });
    }
    console.log(`✅ 21. ${stockMovements.length} Stock Movement Audit Trail Entries Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 21. Notifications & Real-Time Alerts
    // ══════════════════════════════════════════════════════════════════════════
    const notificationsToSeed = [
      {
        type: 'LOW_STOCK',
        title: 'Low Stock Alert: Wireless Mice',
        message: 'Logitech Wireless Optical Mouse M185 stock is down to 45 units. Reorder recommended.',
        read: false,
      },
      {
        type: 'PAYMENT_DUE',
        title: 'Payment Overdue Notice',
        message: 'Invoice INV-2026-002 for Zenith Technologies Pvt Ltd (₹11,800) is past its due date.',
        read: false,
      },
      {
        type: 'INVOICE_SENT',
        title: 'Tax Invoice Dispatched',
        message: 'Interstate GST invoice INV-2026-003 was sent via email to Mumbai Digital Hub LLP.',
        read: true,
      },
      {
        type: 'TAX_ALERT',
        title: 'GSTR-1 Monthly Return Filing Due',
        message: 'Your monthly GSTR-1 return for GSTIN 29AAACB1234C1Z5 is due in 5 business days.',
        read: false,
      },
      {
        type: 'PAYMENT_RECEIVED',
        title: 'UPI Payment Verified',
        message: 'Payment of ₹2,065 was received from Apex Traders via NPCI Dynamic UPI QR.',
        read: true,
      },
    ];

    for (const notif of notificationsToSeed) {
      const existing = await prisma.notification.findFirst({
        where: { organizationId: org.id, title: notif.title },
      });
      if (!existing) {
        await prisma.notification.create({
          data: {
            organizationId: org.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            read: notif.read,
          },
        });
      }
    }
    console.log(`✅ 22. ${notificationsToSeed.length} Real-Time System Notifications & Alerts Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 22. System Audit Logs
    // ══════════════════════════════════════════════════════════════════════════
    const auditLogsToSeed = [
      {
        action: 'LOGIN',
        entity: 'UserSession',
        entityId: 'admin@billora.app',
        changes: JSON.stringify({ ip: '127.0.0.1', userAgent: 'Chrome/124.0 (Windows)' }),
      },
      {
        action: 'CREATE',
        entity: 'Invoice',
        entityId: 'INV-2026-001',
        changes: JSON.stringify({ total: 2065.0, customer: 'Apex Traders', tax: 315.0 }),
      },
      {
        action: 'CREATE',
        entity: 'Payment',
        entityId: 'REC-2026-001',
        changes: JSON.stringify({ amount: 2065.0, mode: 'UPI', status: 'VERIFIED' }),
      },
      {
        action: 'CREATE',
        entity: 'JournalVoucher',
        entityId: 'JRN-2026-001',
        changes: JSON.stringify({ voucherType: 'JOURNAL', totalDr: 200000.0, totalCr: 200000.0 }),
      },
    ];

    for (const al of auditLogsToSeed) {
      await prisma.auditLog.create({
        data: {
          organizationId: org.id,
          action: al.action,
          entity: al.entity,
          entityId: al.entityId,
          changes: al.changes,
        },
      });
    }
    console.log(`✅ 23. ${auditLogsToSeed.length} System Audit Logs Recorded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 24. Additional Invoices — Filling Every Document Type & Status
    // ══════════════════════════════════════════════════════════════════════════
    const extraInvoices = [
      // More SALE invoices with different statuses
      {
        id: 'inv-extra-01', invoiceNumber: 'INV-2026-005', documentType: 'SALE' as DocumentType,
        customerId: 'cust-apex-1', status: 'DRAFT' as InvoiceStatus,
        issueDate: new Date('2026-09-20'), dueDate: new Date('2026-10-20'),
        subtotal: 18500, taxRate: 18, taxAmount: 3330, cgstAmount: 1665, sgstAmount: 1665, igstAmount: 0,
        discount: 500, total: 21330, paidAmount: 0, isInterState: false,
        notes: 'Draft invoice pending client review',
      },
      {
        id: 'inv-extra-02', invoiceNumber: 'INV-2026-006', documentType: 'SALE' as DocumentType,
        customerId: 'cust-zenith-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-15'), dueDate: new Date('2026-10-15'),
        subtotal: 45000, taxRate: 18, taxAmount: 8100, cgstAmount: 4050, sgstAmount: 4050, igstAmount: 0,
        discount: 0, total: 53100, paidAmount: 15000, isInterState: false,
        notes: 'Partial payment received. Balance due.',
      },
      {
        id: 'inv-extra-03', invoiceNumber: 'INV-2026-007', documentType: 'SALE' as DocumentType,
        customerId: 'cust-mumbai-1', status: 'OVERDUE' as InvoiceStatus,
        issueDate: new Date('2026-07-01'), dueDate: new Date('2026-07-31'),
        subtotal: 62000, taxRate: 18, taxAmount: 11160, cgstAmount: 0, sgstAmount: 0, igstAmount: 11160,
        discount: 2000, total: 71160, paidAmount: 0, isInterState: true,
        notes: '60-day overdue. Final reminder sent.',
      },
      // More ESTIMATE invoices
      {
        id: 'inv-extra-04', invoiceNumber: 'EST-2026-002', documentType: 'ESTIMATE' as DocumentType,
        customerId: 'cust-chennai-1', status: 'DRAFT' as InvoiceStatus,
        issueDate: new Date('2026-09-22'), dueDate: new Date('2026-10-22'),
        subtotal: 88000, taxRate: 18, taxAmount: 15840, cgstAmount: 0, sgstAmount: 0, igstAmount: 15840,
        discount: 3000, total: 100840, paidAmount: 0, isInterState: true,
        notes: 'Estimate for Q4 machinery supply. Valid 30 days.',
      },
      {
        id: 'inv-extra-05', invoiceNumber: 'EST-2026-003', documentType: 'ESTIMATE' as DocumentType,
        customerId: 'cust-apex-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-10'), dueDate: new Date('2026-10-10'),
        subtotal: 32500, taxRate: 12, taxAmount: 3900, cgstAmount: 1950, sgstAmount: 1950, igstAmount: 0,
        discount: 0, total: 36400, paidAmount: 0, isInterState: false,
        notes: 'IT peripherals quarterly quote.',
      },
      // More PROFORMA invoices
      {
        id: 'inv-extra-06', invoiceNumber: 'PRO-2026-002', documentType: 'PROFORMA' as DocumentType,
        customerId: 'cust-chennai-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-18'), dueDate: new Date('2026-10-18'),
        subtotal: 175000, taxRate: 18, taxAmount: 31500, cgstAmount: 0, sgstAmount: 0, igstAmount: 31500,
        discount: 5000, total: 201500, paidAmount: 0, isInterState: true,
        notes: 'Industrial equipment proforma. 40% advance required.',
      },
      // More SALE_ORDER
      {
        id: 'inv-extra-07', invoiceNumber: 'SO-2026-002', documentType: 'SALE_ORDER' as DocumentType,
        customerId: 'cust-zenith-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-12'), dueDate: new Date('2026-10-12'),
        subtotal: 28000, taxRate: 18, taxAmount: 5040, cgstAmount: 2520, sgstAmount: 2520, igstAmount: 0,
        discount: 0, total: 33040, paidAmount: 0, isInterState: false,
        notes: 'Confirmed order for office networking equipment.',
      },
      {
        id: 'inv-extra-08', invoiceNumber: 'SO-2026-003', documentType: 'SALE_ORDER' as DocumentType,
        customerId: 'cust-mumbai-1', status: 'DRAFT' as InvoiceStatus,
        issueDate: new Date('2026-09-25'), dueDate: new Date('2026-10-25'),
        subtotal: 95000, taxRate: 18, taxAmount: 17100, cgstAmount: 0, sgstAmount: 0, igstAmount: 17100,
        discount: 0, total: 112100, paidAmount: 0, isInterState: true,
        notes: 'Pending customer PO confirmation.',
      },
      // More DELIVERY_CHALLAN
      {
        id: 'inv-extra-09', invoiceNumber: 'CH-2026-002', documentType: 'DELIVERY_CHALLAN' as DocumentType,
        customerId: 'cust-apex-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-20'), dueDate: new Date('2026-10-20'),
        subtotal: 41300, taxRate: 18, taxAmount: 7434, cgstAmount: 3717, sgstAmount: 3717, igstAmount: 0,
        discount: 0, total: 48734, paidAmount: 0, isInterState: false,
        vehicleNumber: 'KA-01-AB-1234', ewayBill: 'EWB9912345678',
        notes: 'Second batch delivery for SO-2026-001.',
      },
      // More CREDIT_NOTE
      {
        id: 'inv-extra-10', invoiceNumber: 'CN-2026-002', documentType: 'CREDIT_NOTE' as DocumentType,
        customerId: 'cust-mumbai-1', status: 'PAID' as InvoiceStatus,
        issueDate: new Date('2026-08-25'), dueDate: new Date('2026-09-24'),
        subtotal: 12000, taxRate: 18, taxAmount: 2160, cgstAmount: 0, sgstAmount: 0, igstAmount: 2160,
        discount: 0, total: 14160, paidAmount: 14160, isInterState: true,
        notes: 'Adjustment credit for short shipment 4 units.',
      },
      // More PURCHASE invoices
      {
        id: 'inv-extra-11', invoiceNumber: 'PUR-2026-003', documentType: 'PURCHASE' as DocumentType,
        customerId: 'supp-tata-1', status: 'PAID' as InvoiceStatus,
        issueDate: new Date('2026-08-15'), dueDate: new Date('2026-09-14'),
        subtotal: 85000, taxRate: 18, taxAmount: 15300, cgstAmount: 0, sgstAmount: 0, igstAmount: 15300,
        discount: 2000, total: 98300, paidAmount: 98300, isInterState: true,
        notes: 'Second raw material inward from Tata.',
      },
      {
        id: 'inv-extra-12', invoiceNumber: 'PUR-2026-004', documentType: 'PURCHASE' as DocumentType,
        customerId: 'supp-medplus-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-20'), dueDate: new Date('2026-10-20'),
        subtotal: 48500, taxRate: 12, taxAmount: 5820, cgstAmount: 2910, sgstAmount: 2910, igstAmount: 0,
        discount: 0, total: 54320, paidAmount: 0, isInterState: false,
        notes: 'Bulk pharma restock pending payment.',
      },
      // More PURCHASE_ORDER
      {
        id: 'inv-extra-13', invoiceNumber: 'PO-2026-002', documentType: 'PURCHASE_ORDER' as DocumentType,
        customerId: 'supp-tata-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-22'), dueDate: new Date('2026-10-22'),
        subtotal: 125000, taxRate: 18, taxAmount: 22500, cgstAmount: 0, sgstAmount: 0, igstAmount: 22500,
        discount: 5000, total: 142500, paidAmount: 0, isInterState: true,
        notes: 'Quarterly steel rod purchase order.',
      },
      // More DEBIT_NOTE
      {
        id: 'inv-extra-14', invoiceNumber: 'DN-2026-002', documentType: 'DEBIT_NOTE' as DocumentType,
        customerId: 'supp-medplus-1', status: 'SENT' as InvoiceStatus,
        issueDate: new Date('2026-09-18'), dueDate: new Date('2026-10-18'),
        subtotal: 8000, taxRate: 12, taxAmount: 960, cgstAmount: 480, sgstAmount: 480, igstAmount: 0,
        discount: 0, total: 8960, paidAmount: 0, isInterState: false,
        notes: 'Debit note for expired batch return.',
      },
    ];

    for (const inv of extraInvoices) {
      await prisma.invoice.upsert({
        where: { id: inv.id },
        update: { status: inv.status, paidAmount: inv.paidAmount },
        create: {
          id: inv.id,
          organizationId: org.id,
          customerId: inv.customerId,
          invoiceNumber: inv.invoiceNumber,
          documentType: inv.documentType,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          status: inv.status,
          companyName: 'Billora Enterprises Pvt Ltd',
          companyEmail: 'billing@billora.app',
          companyPhone: '+91 98765 43210',
          companyAddress: '# 100, Indiranagar 100ft Road, Bengaluru',
          companyCity: 'Bengaluru',
          companyState: 'Karnataka',
          companyZip: '560038',
          companyTaxId: '29AAACB1234C1Z5',
          placeOfSupply: inv.isInterState ? 'Maharashtra' : 'Karnataka',
          isInterState: inv.isInterState ?? false,
          vehicleNumber: (inv as any).vehicleNumber ?? null,
          ewayBill: (inv as any).ewayBill ?? null,
          subtotal: inv.subtotal,
          taxRate: inv.taxRate,
          taxAmount: inv.taxAmount,
          cgstAmount: inv.cgstAmount,
          sgstAmount: inv.sgstAmount,
          igstAmount: inv.igstAmount,
          discount: inv.discount,
          total: inv.total,
          paidAmount: inv.paidAmount,
          notes: inv.notes,
          items: {
            create: [{
              description: 'Item per line (see invoice details)',
              quantity: 1,
              unitPrice: inv.subtotal - inv.discount,
              gstRate: inv.taxRate,
              amount: inv.subtotal - inv.discount,
              sortOrder: 0,
            }],
          },
        },
      });
    }
    console.log(`✅ 24. ${extraInvoices.length} Additional Invoices Seeded Across All Document Types`);

    // ══════════════════════════════════════════════════════════════════════════
    // 25. More Payments (Payment-In & Payment-Out) across all modes
    // ══════════════════════════════════════════════════════════════════════════
    const extraPayments = [
      // Partial payment on INV-2026-006
      {
        id: 'pay-extra-01', number: 'REC-2026-005',
        direction: 'IN' as PaymentDirection, partyId: 'cust-zenith-1',
        invoiceId: 'inv-extra-02', bankAccountId: 'bank-hdfc-1',
        amount: 15000, date: new Date('2026-09-20'), mode: 'BANK' as PaymentMode,
        reference: 'NEFT-ZEN-SEP-20', notes: 'Partial payment against INV-2026-006',
      },
      // Payment for extra sale
      {
        id: 'pay-extra-02', number: 'REC-2026-006',
        direction: 'IN' as PaymentDirection, partyId: 'cust-chennai-1',
        invoiceId: null, bankAccountId: 'bank-sbi-1',
        amount: 25000, date: new Date('2026-09-18'), mode: 'CHEQUE' as PaymentMode,
        reference: 'CHQ-779901', notes: 'Advance payment against EST-2026-002',
      },
      // Cash payment from walk-in
      {
        id: 'pay-extra-03', number: 'REC-2026-007',
        direction: 'IN' as PaymentDirection, partyId: 'cust-retail-walkin',
        invoiceId: null, bankAccountId: 'cash-pos-1',
        amount: 2850, date: new Date('2026-09-22'), mode: 'CASH' as PaymentMode,
        reference: null, notes: 'Walk-in retail cash sale',
      },
      // Card payment at counter
      {
        id: 'pay-extra-04', number: 'REC-2026-008',
        direction: 'IN' as PaymentDirection, partyId: 'cust-apex-1',
        invoiceId: null, bankAccountId: 'bank-hdfc-1',
        amount: 12000, date: new Date('2026-09-23'), mode: 'CARD' as PaymentMode,
        reference: 'POS-TXN-445566', notes: 'POS card swipe payment',
      },
      // Supplier payment out
      {
        id: 'pay-extra-05', number: 'PAY-2026-004',
        direction: 'OUT' as PaymentDirection, partyId: 'supp-medplus-1',
        invoiceId: null, bankAccountId: 'bank-sbi-1',
        amount: 45000, date: new Date('2026-09-15'), mode: 'BANK' as PaymentMode,
        reference: 'RTGS-MED-SEP-15', notes: 'Advance payment to pharma supplier',
      },
      // Second supplier payment
      {
        id: 'pay-extra-06', number: 'PAY-2026-005',
        direction: 'OUT' as PaymentDirection, partyId: 'supp-tata-1',
        invoiceId: 'inv-extra-11', bankAccountId: 'bank-hdfc-1',
        amount: 98300, date: new Date('2026-09-14'), mode: 'BANK' as PaymentMode,
        reference: 'NEFT-TATA-0914', notes: 'Full payment for PUR-2026-003',
      },
    ];

    for (const pay of extraPayments) {
      await prisma.payment.upsert({
        where: { id: pay.id },
        update: {},
        create: {
          id: pay.id,
          organizationId: org.id,
          number: pay.number,
          direction: pay.direction,
          partyId: pay.partyId,
          invoiceId: pay.invoiceId,
          bankAccountId: pay.bankAccountId,
          amount: pay.amount,
          date: pay.date,
          mode: pay.mode,
          reference: pay.reference,
          notes: pay.notes,
        },
      });
    }
    console.log(`✅ 25. ${extraPayments.length} Additional Payments Seeded (IN/OUT, all modes)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 26. More Expenses (all categories)
    // ══════════════════════════════════════════════════════════════════════════
    const extraExpenses = [
      {
        id: 'exp-extra-01', description: 'Staff Mobile Reimbursement — September',
        amount: 4500, date: new Date('2026-09-30'), bankAccountId: 'cash-petty-1',
        category: 'Staff & HR', notes: '5 employees × ₹900 mobile allowance',
      },
      {
        id: 'exp-extra-02', description: 'Office Printing & Stationery Supplies',
        amount: 3200, date: new Date('2026-09-25'), bankAccountId: 'cash-petty-1',
        category: 'Administrative', notes: 'A4 ream, toner cartridges, notepads',
      },
      {
        id: 'exp-extra-03', description: 'Vehicle Fuel — Delivery Fleet',
        amount: 8400, date: new Date('2026-09-20'), bankAccountId: 'cash-petty-1',
        category: 'Logistics', notes: 'Diesel for 3 delivery vehicles — September',
      },
      {
        id: 'exp-extra-04', description: 'Annual Domain Renewal & SSL Certificate',
        amount: 6800, date: new Date('2026-09-12'), bankAccountId: 'bank-hdfc-1',
        category: 'IT & Software', notes: 'billora.app domain + Comodo SSL — 1 year',
      },
      {
        id: 'exp-extra-05', description: 'Water & Housekeeping Charges',
        amount: 2100, date: new Date('2026-09-10'), bankAccountId: 'cash-petty-1',
        category: 'Utilities', notes: 'Monthly housekeeping contract + water cans',
      },
      {
        id: 'exp-extra-06', description: 'Marketing — Google Ads Campaign',
        amount: 15000, date: new Date('2026-09-08'), bankAccountId: 'bank-hdfc-1',
        category: 'Marketing', notes: 'Diwali sale Google Search + Display ads',
      },
      {
        id: 'exp-extra-07', description: 'CA Professional Fees — GST Filing',
        amount: 5500, date: new Date('2026-09-05'), bankAccountId: 'bank-sbi-1',
        category: 'Professional Fees', notes: 'GSTR-1 & GSTR-3B filing charges for Aug-26',
      },
      {
        id: 'exp-extra-08', description: 'Warehouse Maintenance & Repair',
        amount: 11200, date: new Date('2026-09-02'), bankAccountId: 'bank-hdfc-1',
        category: 'Maintenance', notes: 'Shelving repair, electrical fix, pest control',
      },
    ];

    for (const exp of extraExpenses) {
      await prisma.expense.upsert({
        where: { id: exp.id },
        update: {},
        create: {
          id: exp.id,
          organizationId: org.id,
          description: exp.description,
          amount: exp.amount,
          date: exp.date,
          bankAccountId: exp.bankAccountId,
          category: exp.category,
          notes: exp.notes,
        },
      });
    }
    console.log(`✅ 26. ${extraExpenses.length} Additional Operating Expenses Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 27. More Customers (for Customers/Parties tab diversity)
    // ══════════════════════════════════════════════════════════════════════════
    const extraCustomers = [
      {
        id: 'cust-hyderabad-1',
        name: 'Hyderabad Pharma Distributors',
        phone: '9912345678', email: 'orders@hydpharmadist.com',
        taxId: '36AAACH1234H1Z1',
        partyType: 'CUSTOMER' as const, openingBalance: 0,
        address: 'Road No 5, Banjara Hills, Hyderabad',
        city: 'Hyderabad', state: 'Telangana', zipCode: '500034',
      },
      {
        id: 'cust-pune-1',
        name: 'Pune Auto Components Pvt Ltd',
        phone: '9822011234', email: 'procurement@puneauto.in',
        taxId: '27AAACP5678P1Z3',
        partyType: 'CUSTOMER' as const, openingBalance: 18000,
        address: 'Plot 12, Bhosari Industrial Estate, Pune',
        city: 'Pune', state: 'Maharashtra', zipCode: '411026',
      },
      {
        id: 'cust-delhi-1',
        name: 'Delhi IT Solutions Ltd',
        phone: '9811223344', email: 'billing@delhiit.co.in',
        taxId: '07AAACD9012D1Z5',
        partyType: 'CUSTOMER' as const, openingBalance: 0,
        address: 'Tower B, Cyber City, Gurugram, Haryana',
        city: 'Gurugram', state: 'Haryana', zipCode: '122002',
      },
      {
        id: 'cust-kolkata-1',
        name: 'Kolkata Textile Mills',
        phone: '9830099887', email: 'finance@koltextile.com',
        taxId: '19AAACK2222K1Z2',
        partyType: 'CUSTOMER' as const, openingBalance: 35000,
        address: '7 Strand Road, BBD Bagh, Kolkata',
        city: 'Kolkata', state: 'West Bengal', zipCode: '700001',
      },
      {
        id: 'supp-bangalore-1',
        name: 'Bangalore Electronics Wholesale',
        phone: '9845001122', email: 'supply@bangaloreelex.com',
        taxId: '29AAACB5555B1Z8',
        partyType: 'SUPPLIER' as const, openingBalance: -22000,
        address: 'SP Road, Electronics Hub, Bengaluru',
        city: 'Bengaluru', state: 'Karnataka', zipCode: '560002',
      },
      {
        id: 'cust-b2c-priya',
        name: 'Priya Nair (B2C Consumer)',
        phone: '9876511111', email: 'priya.nair@outlook.com',
        taxId: null,
        partyType: 'CUSTOMER' as const, openingBalance: 0,
        address: 'Whitefield, Bengaluru', city: 'Bengaluru', state: 'Karnataka', zipCode: '560066',
      },
    ];

    for (const c of extraCustomers) {
      await prisma.customer.upsert({
        where: { id: c.id },
        update: { name: c.name },
        create: {
          id: c.id, organizationId: org.id, name: c.name,
          phone: c.phone, email: c.email, taxId: c.taxId,
          partyType: c.partyType, openingBalance: c.openingBalance,
          address: c.address, city: c.city, state: c.state, zipCode: c.zipCode,
        },
      });
    }
    console.log(`✅ 27. ${extraCustomers.length} Additional Customers & Suppliers Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 28. More Items — Expand Item Catalogue
    // ══════════════════════════════════════════════════════════════════════════
    const extraItems = [
      {
        id: 'item-bp-monitor', name: 'Digital Blood Pressure Monitor',
        description: 'Fully automatic upper arm BP monitor with memory',
        hsn: '90181100', unit: 'pcs', unitPrice: 1850, purchasePrice: 1200,
        estimatePrice: 1700, stockQty: 25, minStock: 5, gstRate: 12, itemType: 'PRODUCT' as const, isPublic: true,
      },
      {
        id: 'item-router-wifi', name: 'TP-Link WiFi 6 AX1500 Router',
        description: 'Dual-band WiFi 6 wireless router, 1500 Mbps',
        hsn: '85176200', unit: 'pcs', unitPrice: 3200, purchasePrice: 2100,
        estimatePrice: 3000, stockQty: 18, minStock: 5, gstRate: 18, itemType: 'PRODUCT' as const, isPublic: true,
      },
      {
        id: 'item-safety-helmet', name: 'Industrial Safety Helmet (ISI Mark)',
        description: 'HDPE construction safety helmet, adjustable ratchet',
        hsn: '65069910', unit: 'pcs', unitPrice: 380, purchasePrice: 220,
        estimatePrice: 350, stockQty: 120, minStock: 20, gstRate: 18, itemType: 'PRODUCT' as const, isPublic: false,
      },
      {
        id: 'item-cold-coffee', name: 'Cold Brew Coffee Concentrate 500ml',
        description: 'Premium Arabica cold brew concentrate, 1:3 dilution ratio',
        hsn: '21011120', unit: 'bottle', unitPrice: 299, purchasePrice: 180,
        estimatePrice: 275, stockQty: 48, minStock: 12, gstRate: 5, itemType: 'PRODUCT' as const, isPublic: true,
      },
      {
        id: 'item-gst-filing-svc', name: 'GST Return Filing Service (Monthly)',
        description: 'GSTR-1 + GSTR-3B filing & reconciliation service per month',
        hsn: null, unit: 'month', unitPrice: 2500, purchasePrice: 0,
        estimatePrice: 2500, stockQty: 0, minStock: 0, gstRate: 18, itemType: 'SERVICE' as const, isPublic: false,
      },
      {
        id: 'item-face-wash', name: 'Mamaearth Vitamin C Face Wash 100ml',
        description: 'Natural brightening face wash with vitamin C and turmeric',
        hsn: '33051090', unit: 'pcs', unitPrice: 299, purchasePrice: 180,
        estimatePrice: 280, stockQty: 80, minStock: 15, gstRate: 18, itemType: 'PRODUCT' as const, isPublic: true,
      },
      {
        id: 'item-ledger-book', name: 'Navneet Ledger Book A4 (500 pages)',
        description: 'Hard cover ruled ledger for manual bookkeeping',
        hsn: '48201000', unit: 'pcs', unitPrice: 185, purchasePrice: 110,
        estimatePrice: 175, stockQty: 40, minStock: 10, gstRate: 12, itemType: 'PRODUCT' as const, isPublic: false,
      },
      {
        id: 'item-hand-sanitizer', name: 'Hand Sanitizer 500ml Pump',
        description: '70% isopropyl alcohol based hand rub, WHO-approved formula',
        hsn: '38089400', unit: 'bottle', unitPrice: 120, purchasePrice: 65,
        estimatePrice: 110, stockQty: 200, minStock: 50, gstRate: 12, itemType: 'PRODUCT' as const, isPublic: true,
      },
    ];

    for (const item of extraItems) {
      await prisma.item.upsert({
        where: { id: item.id },
        update: { stockQty: item.stockQty },
        create: { id: item.id, organizationId: org.id, ...item },
      });
    }
    console.log(`✅ 28. ${extraItems.length} Additional Items Added to Catalogue`);

    // ══════════════════════════════════════════════════════════════════════════
    // 29. More Stock Movement Logs
    // ══════════════════════════════════════════════════════════════════════════
    const extraStockMovements = [
      { itemId: 'item-bp-monitor', movementType: 'PURCHASE', quantityChange: 25, balanceAfter: 25, referenceNo: 'PUR-2026-005', notes: 'Initial stock inward' },
      { itemId: 'item-router-wifi', movementType: 'PURCHASE', quantityChange: 18, balanceAfter: 18, referenceNo: 'PUR-2026-005', notes: 'Initial stock inward' },
      { itemId: 'item-safety-helmet', movementType: 'PURCHASE', quantityChange: 150, balanceAfter: 150, referenceNo: 'PUR-2026-006', notes: 'Bulk safety stock inward' },
      { itemId: 'item-safety-helmet', movementType: 'SALE', quantityChange: -30, balanceAfter: 120, referenceNo: 'INV-2026-003', notes: 'Site safety kit order' },
      { itemId: 'item-cold-coffee', movementType: 'PURCHASE', quantityChange: 60, balanceAfter: 60, referenceNo: 'PUR-2026-007', notes: 'Café restock' },
      { itemId: 'item-cold-coffee', movementType: 'SALE', quantityChange: -12, balanceAfter: 48, referenceNo: 'INV-2026-004', notes: 'POS counter sales' },
      { itemId: 'item-face-wash', movementType: 'PURCHASE', quantityChange: 100, balanceAfter: 100, referenceNo: 'PUR-2026-008', notes: 'Salon shelf restock' },
      { itemId: 'item-face-wash', movementType: 'SALE', quantityChange: -20, balanceAfter: 80, referenceNo: 'INV-2026-005', notes: 'Retail sale' },
      { itemId: 'item-hand-sanitizer', movementType: 'PURCHASE', quantityChange: 250, balanceAfter: 250, referenceNo: 'PUR-2026-009', notes: 'Bulk order for resale' },
      { itemId: 'item-hand-sanitizer', movementType: 'SALE', quantityChange: -50, balanceAfter: 200, referenceNo: 'INV-2026-006', notes: 'Wholesale dispatch' },
      { itemId: 'item-pcm-500', movementType: 'MANUAL_ADJUSTMENT', quantityChange: -15, balanceAfter: 485, referenceNo: 'ADJ-2026-001', notes: 'Damaged strips removed from stock' },
      { itemId: 'item-mouse-opt', movementType: 'RETURN', quantityChange: 3, balanceAfter: 48, referenceNo: 'CN-2026-001', notes: 'Customer return — defective units' },
    ];

    for (const sm of extraStockMovements) {
      await prisma.stockMovementLog.create({
        data: {
          organizationId: org.id,
          itemId: sm.itemId,
          movementType: sm.movementType,
          quantityChange: sm.quantityChange,
          balanceAfter: sm.balanceAfter,
          referenceNo: sm.referenceNo,
          notes: sm.notes,
        },
      });
    }
    console.log(`✅ 29. ${extraStockMovements.length} Additional Stock Movement Logs Recorded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 30. More Inventory Batches & Serial Numbers
    // ══════════════════════════════════════════════════════════════════════════
    const extraBatches = [
      { itemId: 'item-bp-monitor', batchNumber: 'BP-2026-A1', quantity: 25, costPrice: 1200, expiryDate: null },
      { itemId: 'item-hand-sanitizer', batchNumber: 'HS-2026-B1', quantity: 150, costPrice: 65, expiryDate: new Date('2028-03-31') },
      { itemId: 'item-hand-sanitizer', batchNumber: 'HS-2026-B2', quantity: 100, costPrice: 65, expiryDate: new Date('2028-06-30') },
      { itemId: 'item-cold-coffee', batchNumber: 'CC-2026-C1', quantity: 48, costPrice: 180, expiryDate: new Date('2026-12-31') },
    ];

    for (const batch of extraBatches) {
      await prisma.inventoryBatch.upsert({
        where: { itemId_batchNumber: { itemId: batch.itemId, batchNumber: batch.batchNumber } },
        update: { quantity: batch.quantity },
        create: { itemId: batch.itemId, batchNumber: batch.batchNumber, quantity: batch.quantity, costPrice: batch.costPrice, expiryDate: batch.expiryDate },
      });
    }
    console.log(`✅ 30. ${extraBatches.length} Additional Inventory Batches Seeded`);

    // More Serial Numbers for new electronics
    const extraSerialNums = [
      { itemId: 'item-router-wifi', serialNumber: 'SN-RTR-2026-001', status: 'AVAILABLE' },
      { itemId: 'item-router-wifi', serialNumber: 'SN-RTR-2026-002', status: 'AVAILABLE' },
      { itemId: 'item-router-wifi', serialNumber: 'SN-RTR-2026-003', status: 'SOLD' },
      { itemId: 'item-bp-monitor', serialNumber: 'SN-BPM-2026-001', status: 'AVAILABLE' },
      { itemId: 'item-bp-monitor', serialNumber: 'SN-BPM-2026-002', status: 'AVAILABLE' },
    ];

    for (const sn of extraSerialNums) {
      await prisma.serialNumber.upsert({
        where: { itemId_serialNumber: { itemId: sn.itemId, serialNumber: sn.serialNumber } },
        update: { status: sn.status },
        create: { itemId: sn.itemId, serialNumber: sn.serialNumber, status: sn.status },
      });
    }
    console.log(`✅ 30b. ${extraSerialNums.length} Additional Serial Numbers Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 31. More Tally Journal Vouchers (All Voucher Types)
    // ══════════════════════════════════════════════════════════════════════════
    const cashLedgerId = seededLedgerMap['Cash in Hand'];
    const hdfcLedgerId = seededLedgerMap['HDFC Current Bank A/c'];
    const sbiLedgerId  = seededLedgerMap['SBI Operational A/c'];
    const salesLedgerId = seededLedgerMap['Sales Account (GST 18%)'];
    const purchaseLedgerId = seededLedgerMap['Purchase Account'];
    const debtorsLedgerId = seededLedgerMap['Sundry Debtors Control'];
    const creditorsLedgerId = seededLedgerMap['Sundry Creditors Control'];
    const cgstLedgerId = seededLedgerMap['Output CGST'];
    const sgstLedgerId = seededLedgerMap['Output SGST'];
    const expenseLedgerId = seededLedgerMap['Office Rent & Rates'];
    const salaryLedgerId = seededLedgerMap['Staff Salaries & Wages'];

    if (cashLedgerId && hdfcLedgerId && salesLedgerId) {
      // Receipt Voucher — Cash received from Apex Traders
      await prisma.journalVoucher.upsert({
        where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-003' } },
        update: {},
        create: {
          organizationId: org.id, voucherNumber: 'JRN-2026-003',
          voucherType: 'RECEIPT' as VoucherType, date: new Date('2026-09-10'),
          narration: 'Cash receipt from Apex Traders against INV-2026-001',
          reference: 'REC-2026-001',
          entries: {
            create: [
              { ledgerId: cashLedgerId, type: 'DR' as BalanceType, amount: 26550 },
              { ledgerId: debtorsLedgerId!, type: 'CR' as BalanceType, amount: 26550 },
            ],
          },
        },
      });

      // Payment Voucher — Rent paid
      if (expenseLedgerId) {
        await prisma.journalVoucher.upsert({
          where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-004' } },
          update: {},
          create: {
            organizationId: org.id, voucherNumber: 'JRN-2026-004',
            voucherType: 'PAYMENT' as VoucherType, date: new Date('2026-09-01'),
            narration: 'Office rent payment via HDFC Bank for September 2026',
            reference: 'EXP-2026-001',
            entries: {
              create: [
                { ledgerId: expenseLedgerId, type: 'DR' as BalanceType, amount: 45000 },
                { ledgerId: hdfcLedgerId, type: 'CR' as BalanceType, amount: 45000 },
              ],
            },
          },
        });
      }

      // Sales Voucher — Invoice posting
      if (cgstLedgerId && sgstLedgerId) {
        await prisma.journalVoucher.upsert({
          where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-005' } },
          update: {},
          create: {
            organizationId: org.id, voucherNumber: 'JRN-2026-005',
            voucherType: 'SALES' as VoucherType, date: new Date('2026-09-15'),
            narration: 'Sales entry for INV-2026-002 — Zenith Technologies',
            reference: 'INV-2026-002',
            entries: {
              create: [
                { ledgerId: debtorsLedgerId!, type: 'DR' as BalanceType, amount: 53100 },
                { ledgerId: salesLedgerId, type: 'CR' as BalanceType, amount: 45000 },
                { ledgerId: cgstLedgerId, type: 'CR' as BalanceType, amount: 4050 },
                { ledgerId: sgstLedgerId, type: 'CR' as BalanceType, amount: 4050 },
              ],
            },
          },
        });
      }

      // Purchase Voucher
      if (purchaseLedgerId && creditorsLedgerId) {
        await prisma.journalVoucher.upsert({
          where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-006' } },
          update: {},
          create: {
            organizationId: org.id, voucherNumber: 'JRN-2026-006',
            voucherType: 'PURCHASE' as VoucherType, date: new Date('2026-09-20'),
            narration: 'Purchase entry for PUR-2026-003 — Tata Steel',
            reference: 'PUR-2026-003',
            entries: {
              create: [
                { ledgerId: purchaseLedgerId, type: 'DR' as BalanceType, amount: 98300 },
                { ledgerId: creditorsLedgerId, type: 'CR' as BalanceType, amount: 98300 },
              ],
            },
          },
        });
      }

      // Salary Payment Voucher
      if (salaryLedgerId) {
        await prisma.journalVoucher.upsert({
          where: { organizationId_voucherNumber: { organizationId: org.id, voucherNumber: 'JRN-2026-007' } },
          update: {},
          create: {
            organizationId: org.id, voucherNumber: 'JRN-2026-007',
            voucherType: 'JOURNAL' as VoucherType, date: new Date('2026-09-30'),
            narration: 'Monthly staff salary disbursement — September 2026',
            reference: 'PAYROLL-SEP-2026',
            entries: {
              create: [
                { ledgerId: salaryLedgerId, type: 'DR' as BalanceType, amount: 183000 },
                { ledgerId: hdfcLedgerId, type: 'CR' as BalanceType, amount: 183000 },
              ],
            },
          },
        });
      }
    }
    console.log(`✅ 31. 5 Additional Tally Vouchers Seeded (Receipt, Payment, Sales, Purchase, Salary)`);

    // ══════════════════════════════════════════════════════════════════════════
    // 32. More Appointments (CRM tab data)
    // ══════════════════════════════════════════════════════════════════════════
    const extraAppointments = [
      {
        customerId: 'cust-retail-walkin', employeeId: 'emp-priya',
        serviceName: 'Deep Tissue Massage — 60 min',
        appointmentDate: new Date('2026-10-05T11:00:00'), status: 'SCHEDULED', amount: 1800,
        notes: 'Regular monthly session. No allergies.',
      },
      {
        customerId: 'cust-b2c-priya', employeeId: null,
        serviceName: 'Eyebrow Threading & Shaping',
        appointmentDate: new Date('2026-10-06T15:30:00'), status: 'SCHEDULED', amount: 150,
        notes: 'New customer. Walk-in converted.',
      },
      {
        customerId: 'cust-apex-1', employeeId: 'emp-suresh',
        serviceName: 'Industrial Machinery Site Visit — CNC Line',
        appointmentDate: new Date('2026-09-28T10:00:00'), status: 'COMPLETED', amount: 8500,
        notes: 'Followed up with PO-2026-002 order.',
      },
      {
        customerId: 'cust-zenith-1', employeeId: null,
        serviceName: 'IT Infrastructure Needs Assessment Call',
        appointmentDate: new Date('2026-10-10T14:00:00'), status: 'SCHEDULED', amount: 0,
        notes: 'Video call via Google Meet. Estimating SO-2026-002.',
      },
      {
        customerId: 'cust-hyderabad-1', employeeId: 'emp-rahul',
        serviceName: 'Accounts Reconciliation Review',
        appointmentDate: new Date('2026-09-30T09:30:00'), status: 'COMPLETED', amount: 3500,
        notes: 'Quarterly ledger review meeting completed.',
      },
    ];

    for (const appt of extraAppointments) {
      await prisma.appointment.create({
        data: {
          organizationId: org.id,
          customerId: appt.customerId,
          employeeId: appt.employeeId,
          serviceName: appt.serviceName,
          appointmentDate: appt.appointmentDate,
          status: appt.status,
          amount: appt.amount,
          notes: appt.notes,
        },
      });
    }
    console.log(`✅ 32. ${extraAppointments.length} Additional CRM Appointments Seeded`);

    // ══════════════════════════════════════════════════════════════════════════
    // 33. More Recurring Invoices / AMC Contracts
    // ══════════════════════════════════════════════════════════════════════════
    const extraRecurring = [
      {
        id: 'rec-inv-003', frequency: 'MONTHLY', status: 'ACTIVE',
        startDate: new Date('2026-06-01'), endDate: new Date('2027-05-31'),
        nextGenerationDate: new Date('2026-10-01'),
        lastGeneratedAt: new Date('2026-09-01'),
        autoEmail: true, autoWhatsApp: false, reminderDaysBefore: 3,
      },
      {
        id: 'rec-inv-004', frequency: 'YEARLY', status: 'ACTIVE',
        startDate: new Date('2026-04-01'), endDate: null,
        nextGenerationDate: new Date('2027-04-01'),
        lastGeneratedAt: new Date('2026-04-01'),
        autoEmail: true, autoWhatsApp: true, reminderDaysBefore: 7,
      },
    ];

    for (const ri of extraRecurring) {
      await prisma.recurringInvoice.upsert({
        where: { id: ri.id },
        update: {},
        create: { id: ri.id, organizationId: org.id, ...ri },
      });
    }
    console.log(`✅ 33. ${extraRecurring.length} Additional Recurring Invoice Schedules Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 34. More Notifications (Alerts tab)
    // ══════════════════════════════════════════════════════════════════════════
    const extraNotifications = [
      {
        type: 'PAYMENT_DUE', title: '⚠️ Payment Due Today',
        message: 'INV-2026-006 for Zenith Technologies ₹53,100 is due today (15-Sep). Awaiting partial balance of ₹38,100.',
        read: false,
      },
      {
        type: 'PAYMENT_DUE', title: '🔴 Invoice 60 Days Overdue',
        message: 'INV-2026-007 for Mumbai Digital Hub ₹71,160 is 60 days overdue. Final collection notice required.',
        read: false,
      },
      {
        type: 'LOW_STOCK', title: '📦 Low Stock — Amoxicillin 250mg',
        message: 'Stock at 28 strips — below minimum threshold of 30. Reorder from MedPlus immediately.',
        read: false,
      },
      {
        type: 'LOW_STOCK', title: '📦 Paracetamol 500mg Stock Alert',
        message: 'Current stock: 485 strips. Stock adjustment logged for 15 damaged units. Monitor closely.',
        read: true,
      },
      {
        type: 'INVOICE_SENT', title: '✅ Proforma Invoice Sent',
        message: 'PRO-2026-002 for Chennai Hardware Corp ₹2,01,500 sent via email. Awaiting client confirmation.',
        read: true,
      },
      {
        type: 'PAYMENT_DUE', title: '📅 GSTR-3B Filing Reminder',
        message: 'GSTR-3B for August 2026 is due on 20-Sep-2026. Ensure tax payment before filing deadline.',
        read: false,
      },
      {
        type: 'INVOICE_SENT', title: '🧾 New Purchase Order Created',
        message: 'PO-2026-002 ₹1,42,500 sent to Tata Steel for quarterly steel rod procurement.',
        read: true,
      },
      {
        type: 'LOW_STOCK', title: '⚡ Battery UPS Stock Alert',
        message: 'Hydraulic Valve Assembly 50mm stock critically low at 2 units. Expected lead time: 2 weeks.',
        read: false,
      },
    ];

    for (const notif of extraNotifications) {
      await prisma.notification.create({
        data: { organizationId: org.id, ...notif },
      });
    }
    console.log(`✅ 34. ${extraNotifications.length} Additional Notifications & Alerts Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 35. More DPDP Consents
    // ══════════════════════════════════════════════════════════════════════════
    const extraConsents = [
      {
        entityType: 'CUSTOMER', entityId: 'cust-zenith-1', entityName: 'Zenith Technologies Pvt Ltd',
        contact: 'procurement@zenithtech.io', purpose: 'TRANSACTIONAL_INVOICES',
        status: 'GRANTED', grantedAt: new Date('2026-04-10'), channel: 'EMAIL',
        noticeVersion: 'v2.1', notes: 'GST invoice delivery consent',
      },
      {
        entityType: 'CUSTOMER', entityId: 'cust-mumbai-1', entityName: 'Mumbai Digital Hub LLP',
        contact: 'billing@mumbaidigital.in', purpose: 'MARKETING_COMMUNICATIONS',
        status: 'WITHDRAWN', grantedAt: new Date('2026-03-15'), channel: 'WHATSAPP',
        noticeVersion: 'v2.0', notes: 'Customer opted out on 2026-08-01',
      },
      {
        entityType: 'EMPLOYEE', entityId: 'emp-ananya', entityName: 'Ananya Deshmukh',
        contact: '9988776655', purpose: 'ATTENDANCE_BIOMETRICS',
        status: 'GRANTED', grantedAt: new Date('2026-04-01'), channel: 'IN_APP',
        noticeVersion: 'v2.1', notes: 'Biometric attendance processing consent',
      },
      {
        entityType: 'CUSTOMER', entityId: 'cust-hyderabad-1', entityName: 'Hyderabad Pharma Distributors',
        contact: 'orders@hydpharmadist.com', purpose: 'TRANSACTIONAL_INVOICES',
        status: 'GRANTED', grantedAt: new Date('2026-09-01'), channel: 'EMAIL',
        noticeVersion: 'v2.1', notes: 'Standard GST invoice consent',
      },
    ];

    for (const consent of extraConsents) {
      await prisma.dpdpConsent.create({
        data: { organizationId: org.id, ...consent },
      });
    }
    console.log(`✅ 35. ${extraConsents.length} Additional DPDP Act 2023 Consents Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 36. More Audit Logs (Audit Trail tab — detailed operations)
    // ══════════════════════════════════════════════════════════════════════════
    const moreAuditLogs = [
      { action: 'CREATE', entity: 'Invoice', entityId: 'inv-extra-01', changes: JSON.stringify({ doc: 'INV-2026-005', status: 'DRAFT', total: 21330, customer: 'Apex Traders' }) },
      { action: 'UPDATE', entity: 'Invoice', entityId: 'inv-extra-02', changes: JSON.stringify({ status: 'SENT', paidAmount: 15000, remainingBalance: 38100 }) },
      { action: 'CREATE', entity: 'Payment', entityId: 'pay-extra-01', changes: JSON.stringify({ amount: 15000, mode: 'BANK', ref: 'NEFT-ZEN-SEP-20' }) },
      { action: 'CREATE', entity: 'Expense', entityId: 'exp-extra-04', changes: JSON.stringify({ desc: 'Domain Renewal', amount: 6800, category: 'IT & Software' }) },
      { action: 'UPDATE', entity: 'Item', entityId: 'item-pcm-500', changes: JSON.stringify({ stockQty: { from: 500, to: 485 }, reason: 'Manual adjustment — damaged stock' }) },
      { action: 'CREATE', entity: 'JournalVoucher', entityId: 'JRN-2026-005', changes: JSON.stringify({ type: 'SALES', totalDr: 53100, totalCr: 53100, ref: 'INV-2026-002' }) },
      { action: 'CREATE', entity: 'Customer', entityId: 'cust-hyderabad-1', changes: JSON.stringify({ name: 'Hyderabad Pharma Distributors', state: 'Telangana', gstin: '36AAACH1234H1Z1' }) },
      { action: 'DELETE', entity: 'Notification', entityId: 'notif-old-001', changes: JSON.stringify({ reason: 'Auto-expired: read notification older than 30 days' }) },
      { action: 'UPDATE', entity: 'PayrollRecord', entityId: 'payroll-sep', changes: JSON.stringify({ status: { from: 'DRAFT', to: 'PAID' }, totalDisbursed: 183000 }) },
      { action: 'CREATE', entity: 'Appointment', entityId: 'appt-cnc', changes: JSON.stringify({ service: 'CNC Site Visit', customer: 'Apex Traders', status: 'COMPLETED', amount: 8500 }) },
    ];

    for (const al of moreAuditLogs) {
      await prisma.auditLog.create({
        data: { organizationId: org.id, action: al.action, entity: al.entity, entityId: al.entityId, changes: al.changes },
      });
    }
    console.log(`✅ 36. ${moreAuditLogs.length} Additional Detailed Audit Log Entries Added`);

    // ══════════════════════════════════════════════════════════════════════════
    // 37. Additional Attendance Records (past 2 weeks for all employees)
    // ══════════════════════════════════════════════════════════════════════════
    const employeeIds = ['emp-rahul', 'emp-priya', 'emp-suresh', 'emp-ananya'];
    const attendanceDates = [
      '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
      '2026-09-26', '2026-09-29', '2026-09-30',
    ];

    for (const empId of employeeIds) {
      for (const dateStr of attendanceDates) {
        const date = new Date(dateStr);
        try {
          await prisma.attendanceRecord.upsert({
            where: { employeeId_date: { employeeId: empId, date } },
            update: {},
            create: {
              employeeId: empId, date,
              hoursWorked: empId === 'emp-suresh' ? 9.5 : 8.0,
              notes: empId === 'emp-suresh' ? '1.5h overtime — warehouse audit' : 'Regular shift',
            },
          });
        } catch { /* skip if already exists */ }
      }
    }
    console.log(`✅ 37. Attendance records extended for ${employeeIds.length} employees across ${attendanceDates.length} days`);

    // ══════════════════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ══════════════════════════════════════════════════════════════════════════
    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('🎉 MASTER SEEDING COMPLETE: ALL 37 FEATURE DOMAINS ARE FULLY POPULATED!');
    console.log('══════════════════════════════════════════════════════════════════');
    console.log('📊 DATA SUMMARY:');
    console.log('   • Organization & Company Profile (1)');
    console.log('   • Users / RBAC Roles (5: Admin, Staff, Warehouse, CA, Sales)');
    console.log('   • Bank & Cash Accounts (4)');
    console.log('   • Customers & Suppliers (13 parties across 8 states)');
    console.log('   • Item Catalogue (19 items: Pharma, Electronics, Industrial, F&B, Services)');
    console.log('   • Inventory Batches (7) + Serial Numbers (10)');
    console.log('   • Invoices (27: SALE, ESTIMATE, PROFORMA, SO, CH, CN, PUR, PO, DN)');
    console.log('   • Payments In & Out (11 records across all modes)');
    console.log('   • Expenses (13 operating expenses)');
    console.log('   • Tally Ledgers (19) + Journal Vouchers (7 balanced)');
    console.log('   • Stock Movements (16 log entries)');
    console.log('   • Employees (4) + Attendance (10 days × 4 staff) + Payroll (4 records)');
    console.log('   • Appointments / CRM (8 across salon, engineering, pharma)');
    console.log('   • Recurring Invoices / AMC (4 active contracts)');
    console.log('   • DPDP Consents (7)');
    console.log('   • Notifications & Alerts (13)');
    console.log('   • Audit Logs (14 detailed entries)');
    console.log('   • Number Series (13 document sequences)');
    console.log('');
    console.log('🔑 Ready-to-use Login Credentials:');
    console.log('   • Admin:      admin@billora.app      | Password: admin123');
    console.log('   • Staff:      staff@billora.app      | Password: staff123');
    console.log('   • Warehouse:  warehouse@billora.app  | Password: password123');
    console.log('   • CA Auditor: auditor@billora.app    | Password: password123');
    console.log('   • Sales Desk: sales@billora.app      | Password: password123');
    console.log('══════════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('❌ Database Seeding Error:', err);
    throw err;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
