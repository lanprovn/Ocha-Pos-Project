# OCHA POS Backend API

## 📋 Tổng quan

Backend API cho hệ thống OCHA POS (Point of Sale) - hệ thống quản lý bán hàng cho quán trà sữa.

## 🛠️ Công nghệ sử dụng

- **Runtime:** Node.js với TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL với Prisma ORM
- **Authentication:** JWT (JSON Web Token)
- **Real-time:** Socket.io
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting, Input Sanitization
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration files
│   │   ├── database.ts        # Prisma client
│   │   ├── env.ts             # Environment variables
│   │   └── swagger.ts         # Swagger documentation config
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── order.controller.ts
│   │   ├── product.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── reports.controller.ts
│   │   └── ...
│   ├── services/              # Business logic
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   ├── product.service.ts
│   │   └── ...
│   ├── routes/                # API routes
│   │   ├── auth.routes.ts
│   │   ├── order.routes.ts
│   │   ├── product.routes.ts
│   │   └── ...
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── sanitize.middleware.ts
│   ├── utils/                 # Utility functions
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── errorHandler.ts
│   ├── socket/                # Socket.io setup
│   │   └── socket.io.ts
│   └── types/                 # TypeScript types
│       ├── order.types.ts
│       └── ...
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Seed data
├── uploads/                   # Uploaded files
├── logs/                      # Log files
└── tests/                     # Test files
```

## 🚀 Cài đặt và chạy

### Yêu cầu

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

```bash
cd backend
npm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/`:

```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/ocha_pos
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8080
LOG_LEVEL=info
```

Hoặc chạy script tự động:

```bash
# Windows PowerShell
.\create-env.ps1

# Windows CMD
create-env.bat
```

### Bước 3: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### Bước 4: Chạy server

```bash
# Development mode (với nodemon)
npm run dev

# Hoặc chạy clean (tự động kill port cũ)
npm run dev:clean

# Production mode
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:8080`

## 📚 API Documentation

### Swagger UI

Sau khi chạy server, truy cập Swagger UI tại:
```
http://localhost:8080/api-docs
```

### Health Check

Kiểm tra trạng thái server:
```
GET http://localhost:8080/health
```

## 🔌 API Endpoints chính

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Orders (`/api/orders`)
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Lấy tất cả đơn hàng (có filter)
- `GET /api/orders/:id` - Lấy đơn hàng theo ID
- `GET /api/orders/queries/today` - Lấy đơn hàng hôm nay
- `GET /api/orders/queries/date/:date` - Lấy đơn hàng theo ngày
- `GET /api/orders/queries/history` - Lấy lịch sử đơn hàng (phân trang)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng
- `POST /api/orders/:id/refund` - Hoàn tiền đơn hàng
- `GET /api/orders/:id/receipt` - Lấy dữ liệu hóa đơn

### Products (`/api/products`)
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/:id` - Lấy sản phẩm theo ID
- `POST /api/products` - Tạo sản phẩm mới (ADMIN)
- `PUT /api/products/:id` - Cập nhật sản phẩm (ADMIN)
- `DELETE /api/products/:id` - Xóa sản phẩm (ADMIN)

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/daily-sales` - Doanh số theo ngày

### Reports (`/api/reports`)
- `GET /api/reports/revenue` - Tổng hợp doanh thu (ngày/tuần/tháng)
- `GET /api/reports/orders/export` - Xuất đơn hàng ra CSV

### Users (`/api/users`)
- `GET /api/users` - Lấy tất cả users (ADMIN)
- `POST /api/users` - Tạo user mới (ADMIN)
- `PUT /api/users/:id` - Cập nhật user (ADMIN)
- `DELETE /api/users/:id` - Xóa user (ADMIN)

## 🗄️ Database Schema

### Các bảng chính:

- **User** - Người dùng (Admin, Staff)
- **Category** - Danh mục sản phẩm
- **Product** - Sản phẩm
- **Order** - Đơn hàng
- **OrderItem** - Chi tiết đơn hàng
- **Stock** - Tồn kho nguyên liệu
- **Recipe** - Công thức sản phẩm
- **Ingredient** - Nguyên liệu

Xem chi tiết schema tại: `prisma/schema.prisma`

### Xem Database với Prisma Studio

```bash
npm run prisma:studio
```

Truy cập: `http://localhost:5555`

## 🔐 Authentication

API sử dụng JWT Bearer Token:

1. Đăng nhập qua `POST /api/auth/login` để nhận token
2. Gửi token trong header: `Authorization: Bearer <token>`
3. Token có thời hạn 7 ngày (mặc định)

### Roles:
- **ADMIN** - Quyền quản trị viên
- **STAFF** - Quyền nhân viên
- **CUSTOMER** - Quyền khách hàng

## 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy unit tests
npm run test:unit

# Chạy integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

## 📝 Logging

Logs được lưu trong thư mục `logs/`:
- `combined.log` - Tất cả logs
- `error.log` - Chỉ errors
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🔒 Security Features

- **Helmet** - Bảo vệ HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Giới hạn số request
- **Input Sanitization** - Làm sạch input để chống XSS
- **JWT Authentication** - Xác thực người dùng
- **Role-based Access Control** - Phân quyền theo vai trò
- **Password Hashing** - Mã hóa mật khẩu với bcrypt

## 📦 Scripts

```bash
npm run dev              # Chạy development server
npm run dev:clean        # Chạy dev và tự động kill port cũ
npm run build            # Build TypeScript
npm start                # Chạy production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Chạy migrations
npm run prisma:studio    # Mở Prisma Studio
npm run prisma:seed      # Seed database
npm test                 # Chạy tests
```

## 🐛 Troubleshooting

### Port đã được sử dụng (EADDRINUSE)

```bash
# Windows PowerShell
.\scripts\kill-port.ps1

# Hoặc sử dụng
npm run dev:clean
```

### Database connection error

- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo PostgreSQL đang chạy
- Kiểm tra credentials

### Module not found

```bash
npm install
npm run prisma:generate
```

## 📞 Liên hệ

- **Author:** Lan Pro
- **Email:** lanprovn@gmail.com

## 📄 License

MIT License

