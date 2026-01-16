import { prisma } from './prisma';
import sampleData from './sample-data';

async function main() {
  console.log('Seeding database with sample data...');

  await prisma.product.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: sampleData.users,
  });

  await prisma.product.createMany({
    data: sampleData.products,
  });
  console.log('Database has been seeded successfully.');
}

main();
