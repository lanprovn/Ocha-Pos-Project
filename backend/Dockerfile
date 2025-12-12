# Backend Dockerfile
# Railway sẽ build từ root project với Root Directory = backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files (từ root project)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install root dependencies (nếu có)
RUN if [ -f "package.json" ]; then npm ci --only=production --ignore-scripts; fi

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema
COPY backend/prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build application
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/backend/node_modules ./backend/node_modules

# Copy source code
COPY backend ./backend
COPY package*.json ./

# Build TypeScript
WORKDIR /app/backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy necessary files
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/backend/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads/images && chown -R nodejs:nodejs uploads

USER nodejs

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start command - run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

