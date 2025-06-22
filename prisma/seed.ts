import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Hash the default password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create default admin user
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@nexus.com' },
    update: {},
    create: {
      email: 'admin@nexus.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  console.log('Default admin user created:', admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed successfully');
  })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });