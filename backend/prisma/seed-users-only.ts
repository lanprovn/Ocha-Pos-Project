// Simple seed script that only creates users (no products/categories needed)
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting user seed...\n');

  // Check if users already exist
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`✅ Database already has ${existingUsers} user(s). Skipping user seed.`);
    return;
  }

  // Create Users (Staff và Admin)
  console.log('👤 Creating users...');
  const staffPassword = await hashPassword('staff123');
  const adminPassword = await hashPassword('admin123');

  const staff = await prisma.user.create({
    data: {
      email: 'staff@ocha.com',
      password: staffPassword,
      name: 'Nhân Viên',
      role: 'STAFF',
      isActive: true,
    },
  });
  console.log(`  ✅ Created staff: ${staff.email} (password: staff123)`);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ocha.com',
      password: adminPassword,
      name: 'Quản Trị Viên',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`  ✅ Created admin: ${admin.email} (password: admin123)`);
  console.log('✅ User seed completed!\n');
  
  console.log('🔐 Login credentials:');
  console.log('   - Staff: staff@ocha.com / staff123');
  console.log('   - Admin: admin@ocha.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

