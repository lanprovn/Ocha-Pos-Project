# Use Node.js 20 LTS
FROM node:20-alpine

# Install bash for scripts
RUN apk add --no-cache bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema and migrations FIRST (before npm install runs postinstall)
COPY prisma ./prisma/

# Install dependencies (postinstall will run prisma generate)
RUN npm install

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

