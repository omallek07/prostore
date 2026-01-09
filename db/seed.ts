import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({
  connectionString,
});

import sampleData from './sample-data';

async function main() {
  const prisma = new PrismaClient({ adapter });

  console.log('Seeding database with sample data...');
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: sampleData.products,
  });
  console.log('Database has been seeded successfully.');
}

main();
