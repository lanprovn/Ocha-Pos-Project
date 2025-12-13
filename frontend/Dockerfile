# Frontend Dockerfile for Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (Railway sẽ inject qua env var)
# Vite chỉ đọc env vars ở build time, cần set cả ARG và ENV
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Debug: Show build args
RUN echo "Building with VITE_API_BASE_URL=${VITE_API_BASE_URL}"

# Build application (Vite sẽ inject VITE_API_BASE_URL vào code)
RUN npm run build

# Verify build output
RUN ls -la dist/ || (echo "ERROR: dist directory not found!" && exit 1)
RUN ls -la dist/index.html || (echo "ERROR: index.html not found in dist!" && exit 1)
RUN echo "Build verification: dist directory contains:" && ls -la dist/

# Production stage with nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files were copied
RUN ls -la /usr/share/nginx/html/ || (echo "ERROR: nginx html directory is empty!" && exit 1)
RUN echo "Nginx html directory contains:" && ls -la /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

