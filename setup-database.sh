#!/bin/bash

# Script tự động tạo database cho OCHA POS
# Chạy: bash setup-database.sh

echo "🗄️  SETUP DATABASE CHO OCHA POS"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="ocha_pos"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "📌 Cấu hình Database:"
echo "   - Database Name: $DB_NAME"
echo "   - User: $DB_USER"
echo "   - Host: $DB_HOST"
echo "   - Port: $DB_PORT"
echo ""

# Check if PostgreSQL is running
echo "🔍 Kiểm tra PostgreSQL..."
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL chưa chạy!${NC}"
    echo "   Vui lòng start PostgreSQL trước:"
    echo "   brew services start postgresql@16"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL đang chạy${NC}"
echo ""

# Prompt for password
echo "🔐 Nhập password PostgreSQL:"
read -s DB_PASSWORD
echo ""

# Test connection
echo "🔌 Kiểm tra kết nối..."
export PGPASSWORD=$DB_PASSWORD
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}❌ Không thể kết nối! Kiểm tra lại username/password${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Kết nối thành công${NC}"
echo ""

# Check if database exists
echo "🔍 Kiểm tra database..."
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' đã tồn tại!${NC}"
    echo "   Bạn muốn:"
    echo "   1) Giữ lại database hiện tại"
    echo "   2) Xóa và tạo lại (MẤT DỮ LIỆU!)"
    echo ""
    read -p "Chọn (1/2): " choice
    
    if [ "$choice" = "2" ]; then
        echo "🗑️  Đang xóa database..."
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
        echo -e "${GREEN}✅ Đã xóa database${NC}"
    else
        echo -e "${GREEN}✅ Giữ lại database hiện tại${NC}"
        echo ""
        echo "Tiếp tục với bước 2: Tạo file .env"
        exit 0
    fi
fi

# Create database
echo "🔨 Tạo database mới..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
echo -e "${GREEN}✅ Database '$DB_NAME' đã được tạo!${NC}"
echo ""

# Create .env file
echo "📝 Tạo file .env..."
cat > backend/.env << EOF
# Environment
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"

# JWT Authentication
JWT_SECRET="ocha-pos-secret-key-change-this-in-production-$(date +%s)"
JWT_EXPIRES_IN=7d

# Frontend & Backend URLs
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8080"

# Logging
LOG_LEVEL=info

# Bank QR Code Configuration (Optional)
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=0768562386
BANK_ACCOUNT_NAME=LE HOANG NGOC LAN
QR_TEMPLATE=print
EOF

echo -e "${GREEN}✅ File .env đã được tạo!${NC}"
echo ""

# Summary
echo "════════════════════════════════════"
echo -e "${GREEN}🎉 SETUP THÀNH CÔNG!${NC}"
echo "════════════════════════════════════"
echo ""
echo "📌 Thông tin Database:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Host: $DB_HOST:$DB_PORT"
echo ""
echo "📌 File đã tạo:"
echo "   ✅ backend/.env"
echo ""
echo "🚀 Bước tiếp theo:"
echo "   1. Chạy migrations:"
echo "      cd backend"
echo "      npm run prisma:migrate"
echo ""
echo "   2. Seed data mẫu:"
echo "      npm run prisma:seed"
echo ""
echo "   3. Chạy backend:"
echo "      npm run dev"
echo ""

unset PGPASSWORD
