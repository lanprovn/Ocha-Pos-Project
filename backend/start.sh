#!/bin/sh
set -e

echo "🚀 Starting OCHA POS Backend..."

# Run Prisma migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client (just in case)
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Start the server
echo "✅ Starting server..."
node dist/server.js

