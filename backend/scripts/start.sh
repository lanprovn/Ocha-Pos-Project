#!/bin/sh

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

echo "✅ Starting server..."
exec node dist/server.js

