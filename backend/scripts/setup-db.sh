#!/bin/sh
set -e

echo "🔧 Starting database setup..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Run migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed!"
  exit 1
fi

# Run seed (optional - skip if fails)
echo "🌱 Running database seed..."
npx ts-node prisma/seed.ts || echo "⚠️  Seed skipped (may already exist)"

echo "✅ Database setup completed!"

