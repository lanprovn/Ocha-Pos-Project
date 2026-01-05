const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Check if users table has any data
    console.log('🔍 Checking database for existing users...');
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('🌱 Database is empty, running seed...');
      // Run seed script - use npx to ensure ts-node is available
      const seedScriptPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
      execSync(`npx ts-node ${seedScriptPath}`, { 
        stdio: 'inherit',
        cwd: path.join(__dirname, '..'),
        env: process.env
      });
      console.log('✅ Seed completed successfully');
    } else {
      console.log(`✅ Database already has ${userCount} user(s), skipping seed`);
    }
  } catch (error) {
    console.error('❌ Error checking/seeding database:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    // Don't exit with error - let server start anyway
    console.log('⚠️  Continuing server start despite seed check error...');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

