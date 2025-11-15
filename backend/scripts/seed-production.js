// Production seed script - can be run after migrations
const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Starting database seed...');

try {
  // Run seed using ts-node (works in Railway)
  const seedPath = path.join(__dirname, '../prisma/seed.ts');
  execSync(`npx ts-node ${seedPath}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  console.log('✅ Database seed completed successfully');
} catch (error) {
  console.error('❌ Seed failed:', error.message);
  // Don't exit with error code - migrations might have already seeded
  console.log('⚠️  Continuing anyway...');
}

