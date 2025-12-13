# Use Node.js 20 LTS
FROM node:20-alpine

# Install bash for scripts
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and migrations
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and config
COPY src ./src/
COPY tsconfig.json ./

# Copy scripts directory
COPY scripts ./scripts/

# Make setup script executable
RUN chmod +x scripts/setup-db.sh

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start application (will run migrations and seed)
CMD ["npm", "run", "start:prod"]

