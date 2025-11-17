# OCHA POS

Hệ thống POS cho quán trà sữa/cà phê. Full-stack với React + TypeScript + Node.js + PostgreSQL.

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Socket.io cho real-time
- JWT auth, Zod validation

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router, Context API
- Socket.io client

## Quick Start

### Prerequisites
Trước khi bắt đầu, đảm bảo bạn đã cài đặt:
- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **npm** >= 8.0.0 (đi kèm với Node.js)
- **Git** ([Download](https://git-scm.com/))

### Installation & Setup

#### 1. Clone Repository
```bash
git clone https://github.com/lanprovn/Ocha-Pos-Project.git
cd Ocha-Pos-Project
```

#### 2. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn:
# - DATABASE_URL: Thông tin kết nối PostgreSQL
# - JWT_SECRET: Secret key tối thiểu 32 ký tự (generate random nếu cần)
```

**Cấu hình Database:**
```bash
# Tạo database PostgreSQL
createdb ocha_pos

# Hoặc dùng SQL:
# CREATE DATABASE ocha_pos;
```

**Generate Prisma Client & Run Migrations:**
```bash
# Generate Prisma Client
npm run prisma:generate

# Apply database migrations (tạo tables)
npx prisma migrate deploy

# (Optional) Seed dữ liệu mẫu
npm run prisma:seed
```

**Chạy Backend:**
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:8080`

#### 3. Setup Frontend

Mở terminal mới:

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env.local từ template
cp env.example .env.local

# File .env.local đã được cấu hình sẵn, chỉ cần kiểm tra:
# VITE_API_BASE_URL=http://localhost:8080/api
```

**Chạy Frontend:**
```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### First Time Setup Checklist

- [ ] Đã cài đặt Node.js >= 18 và PostgreSQL >= 14
- [ ] Đã clone repository về máy
- [ ] Đã tạo database PostgreSQL `ocha_pos`
- [ ] Đã copy `.env.example` → `.env` trong `backend/` và cấu hình
- [ ] Đã copy `env.example` → `.env.local` trong `frontend/`
- [ ] Đã chạy `npm install` trong cả `backend/` và `frontend/`
- [ ] Đã chạy `npm run prisma:generate` và `npx prisma migrate deploy`
- [ ] Backend đang chạy tại port 8080
- [ ] Frontend đang chạy tại port 3000

## Features

- **POS System**: Giao diện bán hàng với giỏ hàng, thanh toán
- **Stock Management**: Quản lý sản phẩm, nguyên liệu, cảnh báo hết hàng
- **Dashboard**: Thống kê doanh thu, top sản phẩm bán chạy
- **Payment**: VNPay, QR Code ngân hàng (VietQR API)
- **Real-time**: Socket.io cho đồng bộ đơn hàng giữa POS và Customer Display
- **Customer Display**: Giao diện công khai cho khách tự đặt hàng

## Project Structure

```
Ocha-Pos-Project/
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   └── prisma/       # Database schema & migrations
├── frontend/         # React app
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── ...
└── docs/             # Documentation
```

## Environment Variables

### Backend (.env)

File `.env` trong thư mục `backend/` (copy từ `.env.example`):

```env
# Bắt buộc
DATABASE_URL="postgresql://user:password@localhost:5432/ocha_pos?schema=public"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
PORT=8080
FRONTEND_URL="http://localhost:3000"

# Tùy chọn
NODE_ENV="development"
LOG_LEVEL="info"
BANK_CODE="VCB"
BANK_ACCOUNT_NUMBER="your_account_number"
```

**Lưu ý:**
- `DATABASE_URL`: Thay `user`, `password` bằng thông tin PostgreSQL của bạn
- `JWT_SECRET`: Tối thiểu 32 ký tự, có thể generate bằng: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Chi tiết: [docs/backend/ENV_FILE_SETUP.md](./docs/backend/ENV_FILE_SETUP.md)

### Frontend (.env.local)

File `.env.local` trong thư mục `frontend/` (copy từ `env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true
VITE_APP_NAME=Ocha Việt POS
```

**Lưu ý:** 
- Nếu backend chạy ở port khác, cập nhật `VITE_API_BASE_URL` tương ứng
- Sau khi sửa `.env.local`, cần restart dev server

Chi tiết: [docs/frontend/ENV_LOCAL_SETUP.md](./docs/frontend/ENV_LOCAL_SETUP.md)

## API

Base URL: `http://localhost:8080/api`

Hầu hết endpoints cần JWT token:
```
Authorization: Bearer <token>
```

Xem đầy đủ API docs: [docs/backend/API_ENDPOINTS.md](./docs/backend/API_ENDPOINTS.md)

## Test Accounts

**Staff:**
- Email: `staff@ocha.com`
- Password: `staff123`

**Admin:**
- Email: `admin@ocha.com`
- Password: `admin123`

## Troubleshooting

### Backend Issues

**❌ Lỗi: "Cannot connect to database"**
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: Services → PostgreSQL
# Linux/Mac: sudo systemctl status postgresql

# Kiểm tra DATABASE_URL trong .env
# Format: postgresql://username:password@localhost:5432/ocha_pos

# Test connection
psql -U postgres -d ocha_pos
```

**❌ Lỗi: "Prisma Client not generated"**
```bash
cd backend
npm run prisma:generate
```

**❌ Lỗi: "Migration failed"**
```bash
cd backend
npx prisma migrate reset  # Reset database (xóa dữ liệu)
npx prisma migrate deploy  # Apply lại migrations
```

### Frontend Issues

**❌ Lỗi: "Cannot connect to API" hoặc "Network Error"**
- ✅ Kiểm tra backend đang chạy tại `http://localhost:8080`
- ✅ Kiểm tra `VITE_API_BASE_URL` trong `.env.local` = `http://localhost:8080/api`
- ✅ Restart dev server sau khi sửa `.env.local`: `Ctrl+C` rồi `npm run dev`

**❌ Lỗi: "CORS error"**
- ✅ Kiểm tra `FRONTEND_URL` trong backend `.env` = `http://localhost:3000`
- ✅ Restart backend server

### Common Solutions

**Port đã được sử dụng:**
```bash
# Windows: Tìm process đang dùng port
netstat -ano | findstr :8080
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :8080
lsof -i :3000
```

**Dependencies lỗi:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

**Database connection timeout:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra firewall không block port 5432
- Kiểm tra `pg_hba.conf` cho phép local connections

Xem thêm troubleshooting: [docs/frontend/TROUBLESHOOTING.md](./docs/frontend/TROUBLESHOOTING.md)

## Documentation

Tất cả docs trong folder `docs/`:

- [Backend API](./docs/backend/API_ENDPOINTS.md)
- [Environment Setup](./docs/backend/ENV_FILE_SETUP.md)
- [Payment Integration](./docs/backend/PAYMENT_GATEWAY_INTEGRATION.md)
- [QR Code Setup](./docs/backend/QR_CODE_THAT_VIETQR_API.md)

## Development Notes

**Database:**
- Dùng Prisma Studio để xem data: `npx prisma studio`
- Migrations: `npm run prisma:migrate`
- Reset DB: `npm run prisma:migrate:reset`

**Code Style:**
- TypeScript strict mode
- ESLint cho code quality
- camelCase cho variables, PascalCase cho components

**Real-time:**
- Socket.io events được định nghĩa trong `backend/src/socket/`
- Frontend subscribe trong các hooks/services

## Security

- JWT tokens với expiration
- Password hashing với bcrypt
- Input validation với Zod
- CORS config
- .env files không commit lên Git

## License

MIT License

## Contact

- Email: lelanhoang1912@gmail.com
- Facebook: https://www.facebook.com/lankon1912
- Zalo: 0768562386
- GitHub: [@lanprovn](https://github.com/lanprovn)

---

Made by [lanprovn](https://github.com/lanprovn)
