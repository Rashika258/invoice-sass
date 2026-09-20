import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Billora OS Database...');

  try {
    const org = await prisma.organization.upsert({
      where: { id: 'default-org-1' },
      update: {},
      create: {
        id: 'default-org-1',
        name: 'Billora Enterprises Pvt Ltd',
      },
    });

    const profile = await prisma.companyProfile.upsert({
      where: { organizationId: org.id },
      update: {},
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
        logoUrl: '/logo.png',
      },
    });
    console.log(`✅ Company Configured: ${profile.companyName}`);

    const sampleItems = [
      {
        name: 'Paracetamol 500mg (Strip of 10)',
        description: 'Analgesic & Antipyretic Tablets',
        hsn: '30049099',
        unit: 'strip',
        unitPrice: 45.0,
        stockQty: 500,
        gstRate: 12,
        itemType: 'PRODUCT' as const,
      },
      {
        name: 'Haircut & Styling (Unisex)',
        description: 'Professional haircut and styling session',
        hsn: '999711',
        unit: 'service',
        unitPrice: 450.0,
        stockQty: 999,
        gstRate: 18,
        itemType: 'SERVICE' as const,
      },
      {
        name: 'Butter Chicken + Naan Combo',
        description: 'Rich gravy with 2 butter naans',
        hsn: '996331',
        unit: 'plate',
        unitPrice: 320.0,
        stockQty: 100,
        gstRate: 5,
        itemType: 'PRODUCT' as const,
      },
      {
        name: 'Turning Job (per hour)',
        description: 'Precision lathe turning job',
        hsn: '9987',
        unit: 'hr',
        unitPrice: 500.0,
        stockQty: 200,
        gstRate: 18,
        itemType: 'SERVICE' as const,
      },
    ];

    for (const item of sampleItems) {
      const existing = await prisma.item.findFirst({
        where: { organizationId: org.id, name: item.name },
      });

      if (!existing) {
        await prisma.item.create({
          data: {
            organizationId: org.id,
            name: item.name,
            description: item.description,
            hsn: item.hsn,
            unit: item.unit,
            unitPrice: item.unitPrice,
            stockQty: item.stockQty,
            gstRate: item.gstRate,
            itemType: item.itemType,
          },
        });
      }
    }
    console.log(`✅ ${sampleItems.length} Sample Items Seeded Across Verticals`);

    const sampleCustomers = [
      {
        name: 'Apex Traders',
        phone: '9845012345',
        taxId: '29ABCDE1234F1Z8',
        partyType: 'CUSTOMER' as const,
        openingBalance: 12500.0,
        address: 'MG Road, Commercial Complex, Bengaluru',
      },
      {
        name: 'MedPlus Pharma Supplier',
        phone: '9845098765',
        taxId: '29XYZDE9876F1Z2',
        partyType: 'SUPPLIER' as const,
        openingBalance: -45000.0,
        address: 'Electronic City Phase 1, Bengaluru',
      },
    ];

    for (const cust of sampleCustomers) {
      const existing = await prisma.customer.findFirst({
        where: { organizationId: org.id, name: cust.name },
      });

      if (!existing) {
        await prisma.customer.create({
          data: {
            organizationId: org.id,
            name: cust.name,
            phone: cust.phone,
            taxId: cust.taxId,
            partyType: cust.partyType,
            openingBalance: cust.openingBalance,
            address: cust.address,
          },
        });
      }
    }
    console.log(`✅ ${sampleCustomers.length} Sample Customers/Suppliers Seeded`);

    console.log('🎉 Database Seeding Completed Successfully!');
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
