// Seed script that only runs if database is empty
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    console.log('🔍 Checking if database needs seeding...');
    
    // Check if users already exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} user(s). Skipping seed.`);
      return;
    }

    console.log('🌱 Database is empty. Starting seed...');
    
    // Run the main seed script
    const seedPath = path.join(__dirname, '../prisma/seed.ts');
    
    console.log(`📝 Running seed script: ${seedPath}`);
    
    execSync(`npx ts-node ${seedPath}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: process.env,
    });
    
    console.log('✅ Seed completed successfully');
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    // Don't exit with error - allow server to start anyway
    console.log('⚠️  Continuing server startup despite seed failure...');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed().catch((error) => {
  console.error('Fatal error in checkAndSeed:', error);
  process.exit(0); // Exit with success to allow server to start
});

