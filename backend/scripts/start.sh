#!/bin/sh
set -e

echo "📦 Environment check..."
echo "PORT: ${PORT:-8080}"
echo "NODE_ENV: ${NODE_ENV:-production}"
echo "DATABASE_URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only

echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed or already up to date, continuing..."
fi

echo "🔄 Generating Prisma Client..."
npx prisma generate || {
  echo "❌ Failed to generate Prisma Client"
  exit 1
}

echo "✅ Starting server on port ${PORT:-8080}..."
exec node dist/server.js

