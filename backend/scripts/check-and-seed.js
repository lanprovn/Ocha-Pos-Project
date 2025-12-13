const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    // Check if users table has any data
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('🌱 Database is empty, running seed...');
      // Run seed script
      const { execSync } = require('child_process');
      execSync('npm run prisma:seed', { stdio: 'inherit' });
      console.log('✅ Seed completed successfully');
    } else {
      console.log(`✅ Database already has ${userCount} user(s), skipping seed`);
    }
  } catch (error) {
    console.error('❌ Error checking/seeding database:', error.message);
    // Don't exit with error - let server start anyway
    console.log('⚠️  Continuing server start despite seed check error...');
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();

