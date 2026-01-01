# 🍎 Hướng Dẫn Setup Trên MacBook

## ✅ Đã Push Lên GitHub

Tất cả code, database migrations, và file cấu hình đã được push lên GitHub repository:
- **Repository:** https://github.com/lanprovn/Ocha-Pos-Project.git
- **Branch:** main
- **Commit:** 1a6b051

## 📋 Các File Đã Được Push

### Backend
- ✅ Tất cả source code TypeScript
- ✅ Database migrations (Prisma)
- ✅ `.env.example` với tất cả biến môi trường cần thiết
- ✅ Package.json và dependencies

### Frontend
- ✅ Tất cả source code React/TypeScript
- ✅ `env.example` với cấu hình API
- ✅ Package.json và dependencies

### Database
- ✅ Prisma schema (`backend/prisma/schema.prisma`)
- ✅ Tất cả migrations trong `backend/prisma/migrations/`
- ✅ Seed data files

## 🚀 Các Bước Setup Trên MacBook

### 1. Clone Repository

```bash
git clone https://github.com/lanprovn/Ocha-Pos-Project.git
cd Ocha-Pos-Project
```

### 2. Cài Đặt Dependencies

```bash
# Cài đặt tất cả dependencies (backend, frontend, shared-types)
npm install
```

### 3. Setup Database PostgreSQL

#### Cài đặt PostgreSQL (nếu chưa có)

```bash
# Sử dụng Homebrew
brew install postgresql@15
brew services start postgresql@15

# Hoặc sử dụng Postgres.app từ https://postgresapp.com/
```

#### Tạo Database

```bash
# Kết nối PostgreSQL
psql postgres

# Tạo database
CREATE DATABASE ocha_pos;

# Thoát
\q
```

### 4. Cấu Hình Environment Variables

#### Backend Environment

```bash
cd backend
cp .env.example .env
```

Chỉnh sửa file `backend/.env` với thông tin thực tế của bạn:

```env
# Server Configuration
NODE_ENV=development
PORT=8080

# Database Configuration
# Thay đổi username, password, và database name theo cài đặt của bạn
DATABASE_URL="postgresql://username:password@localhost:5432/ocha_pos?schema=public"

# JWT Authentication
# Tạo secret key mạnh (tối thiểu 32 ký tự)
# Có thể tạo bằng: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# Frontend & Backend URLs
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"

# Logging
LOG_LEVEL="info"

# Cloudinary (Optional - nếu không có sẽ dùng local storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Bank QR Code (Optional - cho thanh toán QR Việt Nam)
BANK_CODE="970422"
BANK_ACCOUNT_NUMBER="1234567890"
BANK_ACCOUNT_NAME="Your Name"
QR_TEMPLATE="print"
```

#### Frontend Environment

```bash
cd ../frontend
cp env.example .env
```

File `frontend/.env` đã có sẵn cấu hình mặc định, chỉ cần kiểm tra lại:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true
VITE_APP_NAME=Ocha Việt POS
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 5. Setup Database Schema

```bash
# Quay về thư mục gốc
cd ..

# Generate Prisma Client
npm run prisma:generate

# Chạy migrations để tạo tables
npm run prisma:migrate

# Seed database với dữ liệu mẫu (optional)
npm run prisma:seed
```

### 6. Chạy Ứng Dụng

#### Development Mode (Cả Backend và Frontend)

```bash
npm run dev
```

Hoặc chạy riêng lẻ:

```bash
# Backend only (http://localhost:8080)
npm run dev:backend

# Frontend only (http://localhost:5173)
npm run dev:frontend
```

### 7. Kiểm Tra Ứng Dụng

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080/api
- **API Documentation:** http://localhost:8080/api-docs
- **Prisma Studio:** `npm run prisma:studio` (để xem database)

## 📝 Lưu Ý Quan Trọng

### Database
- ⚠️ **Không có file database .db hoặc .sqlite** - Dự án sử dụng PostgreSQL
- ✅ Tất cả migrations đã được push lên GitHub
- ✅ Chỉ cần chạy `npm run prisma:migrate` để tạo schema

### Environment Variables
- ⚠️ **File `.env` KHÔNG được commit** - Chỉ có `.env.example`
- ✅ Bạn cần tạo file `.env` từ `.env.example` và điền thông tin thực tế
- ✅ **KHÔNG** commit file `.env` lên GitHub (đã có trong .gitignore)

### Dependencies
- ✅ Tất cả `package.json` và `package-lock.json` đã được push
- ✅ Chạy `npm install` sẽ tự động cài đặt tất cả dependencies

## 🔧 Troubleshooting

### Lỗi Database Connection

```bash
# Kiểm tra PostgreSQL đang chạy
brew services list

# Khởi động lại PostgreSQL
brew services restart postgresql@15

# Kiểm tra connection string trong .env
# Đảm bảo username, password, và database name đúng
```

### Lỗi Port Đã Được Sử Dụng

```bash
# Kiểm tra port đang được sử dụng
lsof -i :8080  # Backend
lsof -i :5173  # Frontend

# Hoặc thay đổi PORT trong .env
```

### Lỗi Prisma Client

```bash
# Regenerate Prisma Client
npm run prisma:generate
```

## 📚 Tài Liệu Tham Khảo

- **README.md** - Hướng dẫn chi tiết về dự án
- **API Documentation** - http://localhost:8080/api-docs (khi chạy backend)
- **Prisma Studio** - `npm run prisma:studio` để quản lý database

## ✅ Checklist Setup

- [ ] Clone repository từ GitHub
- [ ] Cài đặt Node.js (>=20.0.0) và npm (>=10.0.0)
- [ ] Cài đặt PostgreSQL
- [ ] Tạo database `ocha_pos`
- [ ] Tạo file `backend/.env` từ `backend/.env.example`
- [ ] Tạo file `frontend/.env` từ `frontend/env.example`
- [ ] Chạy `npm install`
- [ ] Chạy `npm run prisma:generate`
- [ ] Chạy `npm run prisma:migrate`
- [ ] Chạy `npm run dev`
- [ ] Kiểm tra ứng dụng hoạt động

---

**Chúc bạn setup thành công trên MacBook! 🎉**

