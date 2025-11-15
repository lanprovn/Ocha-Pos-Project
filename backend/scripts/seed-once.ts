// Seed script that only runs if database is empty
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Check if users already exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('✅ Database already seeded. Skipping seed.');
      return;
    }

    console.log('🌱 Database is empty. Starting seed...');
    
    // Run the main seed script
    const { execSync } = require('child_process');
    const path = require('path');
    const seedPath = path.join(__dirname, '../prisma/seed.ts');
    
    execSync(`npx ts-node ${seedPath}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    console.log('✅ Seed completed successfully');
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    // Don't exit with error - allow server to start anyway
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

