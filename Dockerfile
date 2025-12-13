# Use Node.js 20 LTS
FROM node:20-alpine

# Install bash for scripts
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install

# Copy Prisma schema and migrations
COPY backend/prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy backend source code and config
COPY backend/src ./src/
COPY backend/tsconfig.json ./

# Copy scripts directory
COPY backend/scripts ./scripts/

# Make setup script executable
RUN chmod +x scripts/setup-db.sh

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start application (will run migrations and seed)
CMD ["npm", "run", "start:prod"]

