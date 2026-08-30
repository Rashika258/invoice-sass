import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create sample company
  const company = await prisma.company.upsert({
    where: { name: 'Sri Manjunatha Engineering Works' },
    update: {},
    create: {
      name: 'Sri Manjunatha Engineering Works',
      gstin: '29AEZPC6364C1Z5',
      state: 'Karnataka',
      code: '29',
      address: '# 11/1, 1st Cross, 2nd Main, Ramachandrapuram, Bengaluru - 560 021',
      phone: '94486 73532, 73537 56924',
      logoUrl: '/logo.png',
    },
  });

  // Sample items
  await prisma.item.upsert({
    where: { name: 'Turning Job (per hour)' },
    update: {},
    create: {
      name: 'Turning Job (per hour)',
      description: 'Precision turning job per hour',
      hsn: '9987',
      unit: 'hr',
      rate: 500,
    },
  });

  await prisma.item.upsert({
    where: { name: 'Milling Job (per hour)' },
    update: {},
    create: {
      name: 'Milling Job (per hour)',
      description: 'Precision milling job per hour',
      hsn: '9987',
      unit: 'hr',
      rate: 600,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
