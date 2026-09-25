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

    console.log('\n══════════════════════════════════════════════════════════════════');
    console.log('🎉 MASTER SEEDING COMPLETE: ALL 22 FEATURE DOMAINS ARE FULLY POPULATED!');
    console.log('══════════════════════════════════════════════════════════════════');
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
