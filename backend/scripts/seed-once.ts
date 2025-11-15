// Seed script that only runs if database is empty
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as path from 'path';

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Use process.stdout.write to ensure output is flushed immediately
    process.stdout.write('🔍 Checking if database needs seeding...\n');
    
    // Check if users already exist
    const userCount = await prisma.user.count();
    
    process.stdout.write(`📊 Found ${userCount} user(s) in database\n`);
    
    if (userCount > 0) {
      process.stdout.write(`✅ Database already has ${userCount} user(s). Skipping seed.\n`);
      return;
    }

    process.stdout.write('🌱 Database is empty. Starting seed...\n');
    
    // Use simplified seed script that only creates users (no frontend files needed)
    const seedPath = path.join(__dirname, '../prisma/seed-users-only.ts');
    
    process.stdout.write(`📝 Running user seed script: ${seedPath}\n`);
    
    execSync(`npx ts-node ${seedPath}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: process.env,
    });
    
    process.stdout.write('✅ Seed completed successfully\n');
  } catch (error: any) {
    process.stderr.write(`❌ Seed failed: ${error.message}\n`);
    if (error.stack) {
      process.stderr.write(`Stack: ${error.stack}\n`);
    }
    // Don't exit with error - allow server to start anyway
    process.stdout.write('⚠️  Continuing server startup despite seed failure...\n');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed().catch((error) => {
  console.error('Fatal error in checkAndSeed:', error);
  process.exit(0); // Exit with success to allow server to start
});

