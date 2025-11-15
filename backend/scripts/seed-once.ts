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
    const productCount = await prisma.product.count();
    
    process.stdout.write(`📊 Found ${userCount} user(s) and ${productCount} product(s) in database\n`);
    
    if (userCount > 0 && productCount > 0) {
      process.stdout.write(`✅ Database already seeded. Skipping seed.\n`);
      return;
    }

    if (userCount === 0) {
      // No users - run full seed (includes users)
      process.stdout.write('🌱 Database is empty. Starting full seed...\n');
      const seedPath = path.join(__dirname, '../prisma/seed.ts');
      process.stdout.write(`📝 Running full seed script: ${seedPath}\n`);
      
      execSync(`npx ts-node ${seedPath}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env,
      });
    } else if (productCount === 0) {
      // Has users but no products - seed products only
      process.stdout.write('🌱 Database has users but no products. Seeding products...\n');
      const seedProductsPath = path.join(__dirname, '../prisma/seed-products.ts');
      process.stdout.write(`📝 Running products seed script: ${seedProductsPath}\n`);
      
      execSync(`npx ts-node ${seedProductsPath}`, {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env,
      });
    }
    
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

