import { prisma } from './prisma';
import sampleData from './sample-data';

async function main() {
  console.log('Seeding database with sample data...');
  await prisma.product.deleteMany();
  await prisma.product.createMany({
    data: sampleData.products,
  });
  console.log('Database has been seeded successfully.');
}

main();
