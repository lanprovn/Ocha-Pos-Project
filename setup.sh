#!/bin/bash

# Script tự động cài đặt OCHA POS Project trên macOS

set -e

echo "🍵 OCHA POS Project - Setup Script"
echo "=================================="
echo ""

# Màu sắc
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kiểm tra Node.js
echo -e "${YELLOW}📦 Kiểm tra Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js >= 20.0.0${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"

# Kiểm tra npm
echo -e "${YELLOW}📦 Kiểm tra npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm chưa được cài đặt${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"

# Kiểm tra PostgreSQL
echo -e "${YELLOW}🗄️  Kiểm tra PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL chưa được cài đặt. Vui lòng cài đặt PostgreSQL >= 14.0${NC}"
    exit 1
fi
PSQL_VERSION=$(psql --version)
echo -e "${GREEN}✅ PostgreSQL: $PSQL_VERSION${NC}"

# Khởi động PostgreSQL
echo -e "${YELLOW}🚀 Khởi động PostgreSQL...${NC}"
if brew services list | grep -q "postgresql@14.*started"; then
    echo -e "${GREEN}✅ PostgreSQL đã đang chạy${NC}"
else
    echo "Đang khởi động PostgreSQL..."
    brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Không thể khởi động PostgreSQL tự động. Vui lòng chạy thủ công:${NC}"
        echo "   brew services start postgresql@14"
    }
    sleep 3
fi

# Tạo database
echo -e "${YELLOW}🗄️  Tạo database...${NC}"
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw ocha_pos; then
    echo -e "${GREEN}✅ Database 'ocha_pos' đã tồn tại${NC}"
else
    psql -U postgres -c "CREATE DATABASE ocha_pos;" 2>/dev/null && \
        echo -e "${GREEN}✅ Đã tạo database 'ocha_pos'${NC}" || {
        echo -e "${RED}❌ Không thể tạo database. Kiểm tra lại PostgreSQL và quyền truy cập${NC}"
        exit 1
    }
fi

# Cài đặt dependencies
echo -e "${YELLOW}📦 Cài đặt dependencies...${NC}"
echo "Đang cài đặt root dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  Có thể cần chạy lại: npm install${NC}"

echo "Đang cài đặt backend dependencies..."
cd backend
npm install --legacy-peer-deps 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  Có thể cần chạy lại: npm install${NC}"
cd ..

echo "Đang cài đặt frontend dependencies..."
cd frontend
npm install --legacy-peer-deps 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  Frontend dependencies đã được cài đặt${NC}"
cd ..

# Tạo file .env nếu chưa có
echo -e "${YELLOW}⚙️  Kiểm tra file .env...${NC}"

if [ ! -f backend/.env ]; then
    echo "Tạo file backend/.env..."
    cat > backend/.env << 'ENVEOF'
# Server Configuration
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ocha_pos?schema=public"

# JWT Authentication
JWT_SECRET="EdJuQV2IprjhJP0ImALgvGlP/xIWtM/Eaxeg3BsHFqw="
JWT_EXPIRES_IN="7d"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"

# Logging
LOG_LEVEL="info"

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Bank QR Code (Optional)
BANK_CODE=""
BANK_ACCOUNT_NUMBER=""
BANK_ACCOUNT_NAME=""
QR_TEMPLATE="print"
ENVEOF
    echo -e "${GREEN}✅ Đã tạo backend/.env${NC}"
else
    echo -e "${GREEN}✅ File backend/.env đã tồn tại${NC}"
fi

if [ ! -f frontend/.env ]; then
    echo "Tạo file frontend/.env..."
    cat > frontend/.env << 'ENVEOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true

# App Configuration
VITE_APP_NAME=Ocha Việt POS
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
ENVEOF
    echo -e "${GREEN}✅ Đã tạo frontend/.env${NC}"
else
    echo -e "${GREEN}✅ File frontend/.env đã tồn tại${NC}"
fi

# Chạy Prisma
echo -e "${YELLOW}🔧 Thiết lập Prisma...${NC}"
cd backend
npm run prisma:generate 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  Cần chạy: npm run prisma:generate${NC}"
npm run prisma:migrate 2>&1 | tail -5 || echo -e "${YELLOW}⚠️  Cần chạy: npm run prisma:migrate${NC}"
cd ..

echo ""
echo -e "${GREEN}✅ Hoàn thành cài đặt!${NC}"
echo ""
echo "📝 Các bước tiếp theo:"
echo "   1. Kiểm tra lại file backend/.env và thay đổi DATABASE_URL nếu cần"
echo "   2. Chạy project: npm run dev"
echo "   3. Backend: http://localhost:8080"
echo "   4. Frontend: http://localhost:5173"
echo "   5. API Docs: http://localhost:8080/api-docs"
echo ""


