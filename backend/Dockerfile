# Backend Dockerfile for Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma (required for database connections)
# Alpine already has OpenSSL, but we install libssl3 for compatibility
RUN apk add --no-cache openssl libssl3

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy start script from builder
COPY --from=builder /app/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Create uploads directory
RUN mkdir -p uploads/images

# Expose port (Railway sẽ tự động set PORT env var)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server with automatic migrations
CMD ["./scripts/start.sh"]

