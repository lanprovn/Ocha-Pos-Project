#!/bin/sh

echo "📦 Environment check..."
echo "PORT: ${PORT:-8080}"
echo "NODE_ENV: ${NODE_ENV:-production}"
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL: ${DATABASE_URL:0:30}..." # Show first 30 chars only
else
  echo "❌ DATABASE_URL is not set!"
  exit 1
fi

echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed or already up to date, continuing..."
fi

echo "🔄 Generating Prisma Client..."
if npx prisma generate; then
  echo "✅ Prisma Client generated successfully"
else
  echo "❌ Failed to generate Prisma Client"
  exit 1
fi

echo "✅ Starting server on port ${PORT:-8080}..."
exec node dist/server.js

