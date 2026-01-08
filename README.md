# 🍵 Hệ Thống POS OCHA

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

**Hệ thống Point of Sale (POS) hiện đại, đầy đủ tính năng dành cho quán cà phê và nhà hàng Việt Nam**

[Tính năng](#-tính-năng) • [Công nghệ](#-công-nghệ-sử-dụng) • [Cài đặt](#-cài-đặt) • [Sử dụng](#-sử-dụng) • [Tài liệu API](#-tài-liệu-api) • [Triển khai](#-triển-khai)

</div>

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [Tài liệu API](#-tài-liệu-api)
- [Kiểm thử](#-kiểm-thử)
- [Triển khai](#-triển-khai)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Hỗ trợ](#-hỗ-trợ)

---

## 🎯 Tổng quan

**Hệ Thống POS OCHA** là giải pháp Point of Sale toàn diện được xây dựng bằng các công nghệ web hiện đại. Hệ thống cung cấp đầy đủ các tính năng quản lý đơn hàng, kho hàng, khách hàng và báo cáo cho các quán cà phê và nhà hàng tại Việt Nam.

### Điểm nổi bật

- ✅ **Cập nhật thời gian thực** - Đồng bộ trạng thái đơn hàng trực tiếp bằng Socket.io
- ✅ **Quản lý kho hàng** - Tự động trừ tồn kho với hệ thống công thức
- ✅ **Báo cáo chi tiết** - Phân tích đầy đủ với xuất Excel
- ✅ **Chương trình khách hàng thân thiết** - Hệ thống điểm với các cấp độ thành viên
- ✅ **Hỗ trợ thanh toán đa dạng** - Tiền mặt, thẻ và QR code
- ✅ **Giao diện hiện đại** - Thiết kế responsive với Tailwind CSS

---

## ✨ Tính năng

### 🛒 Quản lý đơn hàng

- Tạo và quản lý đơn hàng với cập nhật trạng thái thời gian thực
- Hỗ trợ kích thước sản phẩm và topping
- Chức năng giữ/tiếp tục đơn hàng
- Theo dõi trạng thái đơn hàng: CREATING → PENDING → CONFIRMED → PREPARING → READY → COMPLETED
- Quản lý thông tin khách hàng và bàn
- Hiển thị đơn hàng cho bếp/bar với màn hình riêng

### 📦 Quản lý kho hàng

- Theo dõi tồn kho sản phẩm và nguyên liệu
- Tự động trừ tồn kho khi tạo đơn hàng
- Hệ thống kho hàng dựa trên công thức (BOM - Bill of Materials)
- Cảnh báo tồn kho thấp và hết hàng
- Lịch sử giao dịch kho
- Điều chỉnh tồn kho thủ công

### 📊 Báo cáo & Phân tích

- Báo cáo doanh thu (theo ngày/tuần/tháng/tùy chỉnh)
- Phân tích sản phẩm bán chạy
- Phân tích giờ cao điểm
- Thống kê phương thức thanh toán
- Xuất Excel với 9 sheet chi tiết
- Thống kê dashboard thời gian thực

### 👥 Quản lý khách hàng

- Cơ sở dữ liệu khách hàng với hồ sơ đầy đủ
- Hệ thống điểm tích lũy
- Cấp độ thành viên: Đồng → Bạc → Vàng → Bạch Kim
- Lịch sử đơn hàng khách hàng
- Tag và ghi chú khách hàng

### 💳 Xử lý thanh toán

- Thanh toán tiền mặt
- Thanh toán thẻ
- Thanh toán QR code (VNPay, MoMo, ZaloPay)
- Theo dõi trạng thái thanh toán

### 📺 Hiển thị đơn hàng

- Màn hình hiển thị đơn hàng thời gian thực
- Tự động cập nhật qua Socket.io
- Mã màu theo trạng thái đơn hàng
- Hoàn hảo cho màn hình bếp/bar

### 🔐 Bảo mật & Xác thực

- Xác thực dựa trên JWT
- Kiểm soát truy cập theo vai trò (ADMIN, STAFF, CUSTOMER)
- Mã hóa mật khẩu với bcrypt
- Xác thực đầu vào với Zod
- Giới hạn tốc độ (Rate limiting)
- Bảo vệ CORS

### 🎨 Quản lý Menu

- Quản lý sản phẩm và danh mục
- Hỗ trợ nhiều kích thước và topping
- Quản lý hình ảnh sản phẩm
- Đánh dấu sản phẩm phổ biến
- Quản lý giá và giảm giá

### 👨‍💼 Quản lý người dùng

- Quản lý tài khoản nhân viên và quản trị viên
- Phân quyền theo vai trò
- Kích hoạt/vô hiệu hóa tài khoản
- Đặt lại mật khẩu

---

## 🛠 Công nghệ sử dụng

### Backend

- **Runtime:** Node.js (>=20.0.0)
- **Framework:** Express.js
- **Ngôn ngữ:** TypeScript
- **ORM:** Prisma 5.0
- **Cơ sở dữ liệu:** PostgreSQL
- **Thời gian thực:** Socket.io
- **Xác thực:** JWT (jsonwebtoken)
- **Xác thực dữ liệu:** Zod
- **Upload file:** Multer + Cloudinary
- **Xuất Excel:** ExcelJS
- **Tài liệu API:** Swagger/OpenAPI
- **Ghi log:** Winston

### Frontend

- **Framework:** React 19
- **Ngôn ngữ:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** Headless UI, Flowbite React
- **Icons:** Heroicons, Lucide React
- **Quản lý state:** React Context API
- **HTTP Client:** Axios
- **Thời gian thực:** Socket.io Client
- **Định tuyến:** React Router v7
- **Thông báo:** React Hot Toast

### DevOps & Công cụ

- **Quản lý gói:** npm workspaces
- **Kiểm soát phiên bản:** Git
- **Triển khai:** Railway.app
- **Migration cơ sở dữ liệu:** Prisma Migrate
- **Kiểm thử:** Jest (Backend), Vitest (Frontend)

---

## 📦 Yêu cầu hệ thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** >= 20.0.0 ([Tải xuống](https://nodejs.org/))
- **npm** >= 10.0.0 (đi kèm với Node.js)
- **PostgreSQL** >= 14.0 ([Tải xuống](https://www.postgresql.org/download/))
- **Git** ([Tải xuống](https://git-scm.com/))

### Tùy chọn (cho production)

- **Tài khoản Cloudinary** (để lưu trữ hình ảnh)
- **Tài khoản Railway** (để triển khai)

---

## 🚀 Cài đặt

### 1. Clone Repository

```bash
git clone https://github.com/lanprovn/Ocha-Pos-Project.git
cd Ocha-Pos-Project
```

### 2. Cài đặt Dependencies

```bash
# Cài đặt tất cả dependencies (backend, frontend, shared-types)
npm install

# Hoặc cài đặt riêng lẻ
npm install --workspace=backend
npm install --workspace=frontend
```

### 3. Thiết lập Cơ sở dữ liệu

#### Tạo Database PostgreSQL

```bash
# Kết nối đến PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE ocha_pos;

# Thoát psql
\q
```

#### Chạy Migrations

```bash
# Tạo Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate

# Seed database với dữ liệu mẫu (tùy chọn)
npm run prisma:seed
```

### 4. Cấu hình Biến môi trường

> ⚠️ **CẢNH BÁO BẢO MẬT:** Không bao giờ commit file `.env` vào version control. File `.env` đã được thêm vào `.gitignore`. Các giá trị dưới đây chỉ là **ví dụ** - hãy thay thế bằng giá trị thực tế của bạn.

#### Cấu hình Backend

Tạo file `.env` trong thư mục `backend/`:

```bash
cd backend
cp .env.example .env  # Nếu có file .env.example
```

Chỉnh sửa `.env` với cấu hình **thực tế** của bạn (thay thế tất cả các giá trị placeholder):

```env
# Cấu hình Server
NODE_ENV=development
PORT=8080

# Cơ sở dữ liệu
# ⚠️ Thay thế bằng thông tin PostgreSQL thực tế của bạn
DATABASE_URL="postgresql://username:password@localhost:5432/ocha_pos?schema=public"

# Xác thực JWT
# ⚠️ Tạo một secret mạnh ngẫu nhiên (tối thiểu 32 ký tự)
# Bạn có thể tạo bằng: openssl rand -base64 32
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# Frontend URL (cho CORS)
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"

# Logging
LOG_LEVEL="info"

# Cloudinary (Tùy chọn - để lưu trữ hình ảnh)
# ⚠️ Thay thế bằng thông tin Cloudinary thực tế từ dashboard
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Bank QR Code (Tùy chọn)
# ⚠️ Thay thế bằng thông tin tài khoản ngân hàng thực tế
BANK_CODE="970422"
BANK_ACCOUNT_NUMBER="1234567890"
BANK_ACCOUNT_NAME="Your Name"
QR_TEMPLATE="print"
```

**Lưu ý bảo mật quan trọng:**
- 🔒 **Không bao giờ chia sẻ file `.env`** - Nó chứa thông tin đăng nhập nhạy cảm
- 🔒 **Sử dụng giá trị mạnh, duy nhất** cho `JWT_SECRET` (tạo bằng `openssl rand -base64 32`)
- 🔒 **Không bao giờ commit `.env`** - Đã có trong `.gitignore`
- 🔒 **Sử dụng giá trị khác nhau** cho môi trường development và production

#### Cấu hình Frontend

Tạo file `.env` trong thư mục `frontend/`:

```env
# API Base URL
# ⚠️ Thay thế bằng backend URL thực tế của bạn
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## ⚙️ Cấu hình

### Cấu hình Cơ sở dữ liệu

Schema cơ sở dữ liệu được định nghĩa trong `backend/prisma/schema.prisma`. Các model chính bao gồm:

- **Users** - Người dùng hệ thống (ADMIN, STAFF, CUSTOMER)
- **Products** - Mục menu với kích thước và topping
- **Categories** - Danh mục sản phẩm
- **Orders** - Quản lý đơn hàng
- **OrderItems** - Chi tiết đơn hàng
- **Stock** - Tồn kho sản phẩm
- **Ingredients** - Nguyên liệu công thức
- **ProductRecipes** - Bill of Materials (BOM)
- **Customers** - Cơ sở dữ liệu khách hàng
- **LoyaltyTransactions** - Lịch sử điểm

### Lệnh Prisma

```bash
# Tạo Prisma Client
npm run prisma:generate

# Tạo migration mới
npm run prisma:migrate

# Mở Prisma Studio (Giao diện Database)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

---

## 🔒 Bảo mật

### Bảo mật Biến môi trường

⚠️ **QUAN TRỌNG:** File `.env` chứa thông tin nhạy cảm và phải được bảo vệ:

1. **Không bao giờ commit file `.env`**
   - ✅ **Đã cấu hình:** File `.env` đã được thêm vào `.gitignore`
   - ✅ **Đã xác minh an toàn:** `.gitignore` của project đã loại trừ:
     - `.env`
     - `.env.local`
     - `.env.*.local`
   - ✅ Không bao giờ thêm `.env` vào git tracking thủ công
   - ✅ Sử dụng `.env.example` làm template (không có giá trị thực)
   - ✅ Kiểm tra kỹ trước khi commit: `git status` KHÔNG được hiển thị file `.env`

2. **Sử dụng secret mạnh**
   ```bash
   # Tạo JWT_SECRET mạnh (32+ ký tự)
   openssl rand -base64 32
   ```

3. **Giá trị khác nhau cho môi trường khác nhau**
   - Sử dụng `JWT_SECRET` khác nhau cho development và production
   - Sử dụng database URL khác nhau cho mỗi môi trường
   - Không bao giờ sử dụng thông tin đăng nhập production trong development

4. **Bảo vệ dữ liệu nhạy cảm**
   - 🔒 Mật khẩu database
   - 🔒 JWT secrets
   - 🔒 API keys (Cloudinary, payment gateways)
   - 🔒 Thông tin tài khoản ngân hàng

5. **Triển khai production**
   - Sử dụng quản lý biến môi trường an toàn của platform
   - Không bao giờ expose secrets trong logs hoặc thông báo lỗi
   - Xoay secrets thường xuyên
   - Sử dụng dịch vụ quản lý secret (AWS Secrets Manager, HashiCorp Vault, v.v.)

### Các biện pháp bảo mật bổ sung

- ✅ **Xác thực:** JWT tokens với thời gian hết hạn
- ✅ **Ủy quyền:** Kiểm soát truy cập dựa trên vai trò (RBAC)
- ✅ **Mã hóa mật khẩu:** bcrypt với salt rounds
- ✅ **Xác thực đầu vào:** Zod schemas cho tất cả đầu vào
- ✅ **Giới hạn tốc độ:** Ngăn chặn tấn công brute force
- ✅ **CORS:** Được cấu hình chỉ cho phép origins được phép
- ✅ **Security Headers:** Middleware Helmet.js
- ✅ **Bảo vệ SQL Injection:** Prisma ORM parameterized queries

---

## 💻 Sử dụng

### Chế độ Development

#### Khởi động cả Backend và Frontend

```bash
# Khởi động cả hai server đồng thời
npm run dev
```

#### Khởi động riêng lẻ

```bash
# Chỉ Backend (chạy trên http://localhost:8080)
npm run dev:backend

# Chỉ Frontend (chạy trên http://localhost:5173)
npm run dev:frontend
```

### Build Production

```bash
# Build cả backend và frontend
npm run build

# Build riêng lẻ
npm run build:backend
npm run build:frontend
```

### Khởi động Server Production

```bash
# Khởi động backend server
npm run start:backend

# Xem trước frontend (sau khi build)
npm run preview
```

### Các Script có sẵn

```bash
# Development
npm run dev              # Khởi động cả backend và frontend
npm run dev:backend      # Chỉ khởi động backend
npm run dev:frontend     # Chỉ khởi động frontend

# Build
npm run build            # Build tất cả workspaces
npm run build:backend    # Chỉ build backend
npm run build:frontend   # Chỉ build frontend

# Production
npm run start            # Khởi động backend server
npm run start:backend    # Khởi động backend server
npm run preview          # Xem trước frontend build

# Testing
npm run test             # Chạy tất cả tests
npm run test:backend      # Chạy backend tests
npm run test:frontend     # Chạy frontend tests

# Database
npm run prisma:generate  # Tạo Prisma Client
npm run prisma:migrate   # Chạy migrations
npm run prisma:studio    # Mở Prisma Studio
npm run prisma:seed      # Seed database

# Utilities
npm run lint             # Lint tất cả workspaces
npm run clean            # Xóa node_modules
```

---

## 📚 Tài liệu API

### Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://your-domain.com/api`

### Tài liệu API tương tác

Khi backend server đang chạy, truy cập:
- **Swagger UI:** `http://localhost:8080/api-docs`

### Các API Endpoint chính

#### Xác thực
```
POST   /api/users/register     # Đăng ký người dùng mới
POST   /api/users/login         # Đăng nhập
GET    /api/users/me             # Lấy thông tin người dùng hiện tại
```

#### Sản phẩm
```
GET    /api/products            # Lấy tất cả sản phẩm
GET    /api/products/:id        # Lấy sản phẩm theo ID
POST   /api/products            # Tạo sản phẩm (ADMIN/STAFF)
PUT    /api/products/:id        # Cập nhật sản phẩm (ADMIN/STAFF)
DELETE /api/products/:id        # Xóa sản phẩm (ADMIN)
```

#### Danh mục
```
GET    /api/categories          # Lấy tất cả danh mục
GET    /api/categories/:id      # Lấy danh mục theo ID
POST   /api/categories           # Tạo danh mục (ADMIN/STAFF)
PUT    /api/categories/:id       # Cập nhật danh mục (ADMIN/STAFF)
DELETE /api/categories/:id       # Xóa danh mục (ADMIN)
```

#### Đơn hàng
```
POST   /api/orders/draft         # Tạo/cập nhật đơn hàng nháp
POST   /api/orders              # Tạo đơn hàng mới
GET    /api/orders              # Lấy tất cả đơn hàng (có filter)
GET    /api/orders/:id          # Lấy đơn hàng theo ID
PATCH  /api/orders/:id/status   # Cập nhật trạng thái đơn hàng
GET    /api/orders/today        # Lấy đơn hàng hôm nay
GET    /api/orders/date/:date   # Lấy đơn hàng theo ngày
```

#### Quản lý kho
```
GET    /api/stock/products           # Lấy tồn kho sản phẩm
GET    /api/stock/products/:id      # Lấy tồn kho sản phẩm theo ID
PUT    /api/stock/products/:id      # Cập nhật tồn kho sản phẩm
GET    /api/stock/ingredients        # Lấy tồn kho nguyên liệu
GET    /api/stock/transactions       # Lấy lịch sử giao dịch kho
GET    /api/stock/alerts             # Lấy cảnh báo tồn kho
POST   /api/stock/adjust             # Điều chỉnh tồn kho thủ công
```

#### Báo cáo
```
GET    /api/reporting                # Lấy dữ liệu báo cáo
GET    /api/reporting/export         # Xuất báo cáo ra Excel
```

Query Parameters:
- `startDate` (bắt buộc): YYYY-MM-DD
- `endDate` (bắt buộc): YYYY-MM-DD
- `reportType` (tùy chọn): daily|weekly|monthly|custom

#### Dashboard
```
GET    /api/dashboard/stats          # Lấy thống kê dashboard
GET    /api/dashboard/daily-sales    # Lấy dữ liệu doanh thu hàng ngày
```

#### Thanh toán
```
POST   /api/payment                  # Tạo thanh toán
GET    /api/payment/callback         # Callback thanh toán
```

### Xác thực

Hầu hết các endpoint yêu cầu xác thực. Bao gồm JWT token trong header Authorization:

```bash
Authorization: Bearer <your-jwt-token>
```

### Ví dụ API Request

```bash
# Lấy tất cả sản phẩm
curl http://localhost:8080/api/products

# Tạo đơn hàng (với xác thực)
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "quantity": 2,
        "selectedSize": "M",
        "selectedToppings": ["topping-id"]
      }
    ],
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0123456789",
    "paymentMethod": "CASH"
  }'
```

---

## 🧪 Kiểm thử

### Backend Tests

```bash
# Chạy tất cả backend tests
npm run test:backend

# Chạy tests ở chế độ watch
npm run test:backend -- --watch

# Chạy tests với coverage
npm run test:backend -- --coverage
```

### Frontend Tests

```bash
# Chạy tất cả frontend tests
npm run test:frontend

# Chạy tests ở chế độ UI
npm run test:frontend -- --ui

# Chạy tests với coverage
npm run test:frontend -- --coverage
```

### Cấu trúc Test

```
backend/tests/
├── unit/              # Unit tests
│   ├── services/      # Service layer tests
│   └── utils/         # Utility function tests
└── integration/       # Integration tests

frontend/src/
└── [Component].test.tsx  # Component tests
```

---

## 🚢 Triển khai

### Triển khai Railway

Project này được cấu hình để triển khai trên Railway.app.

#### Triển khai Backend

1. Tạo một Railway project mới
2. Kết nối GitHub repository của bạn
3. Đặt root directory thành `backend`
4. Thêm biến môi trường (xem phần Cấu hình)
5. Railway sẽ tự động phát hiện và triển khai

#### Triển khai Frontend

1. Tạo một Railway service mới cho frontend
2. Đặt root directory thành `frontend`
3. Đặt build command: `npm run build`
4. Đặt start command: `npm run preview`
5. Thêm biến môi trường:
   - `VITE_API_BASE_URL`: Backend API URL của bạn

### Biến môi trường cho Production

> ⚠️ **BẢO MẬT:** Không bao giờ expose biến môi trường production trong code hoặc tài liệu. Sử dụng quản lý biến môi trường an toàn của platform triển khai.

Đảm bảo các biến này được đặt trong **cài đặt biến môi trường an toàn** của platform triển khai:

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string (sử dụng production database)
- `JWT_SECRET` - Secret key mạnh cho JWT (tối thiểu 32 ký tự, sử dụng khác với development)
- `FRONTEND_URL` - Production frontend URL cho CORS
- `NODE_ENV=production`
- `CLOUDINARY_*` - Production Cloudinary credentials (nếu sử dụng)

**Frontend:**
- `VITE_API_BASE_URL` - Production backend API URL

**Best Practices:**
- 🔒 Sử dụng `JWT_SECRET` khác nhau cho production
- 🔒 Sử dụng database URL cụ thể cho môi trường
- 🔒 Không bao giờ hardcode credentials trong code
- 🔒 Xoay secrets thường xuyên
- 🔒 Sử dụng công cụ quản lý secret (Railway Secrets, AWS Secrets Manager, v.v.)

### Migration Database trong Production

```bash
# Chạy migrations trong production
npm run prisma:migrate

# Tạo Prisma Client
npm run prisma:generate
```

---

## 📁 Cấu trúc dự án

```
ocha-pos-project/
├── backend/                    # Ứng dụng Backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/   # Xử lý request
│   │   │   ├── middlewares/   # Express middleware
│   │   │   └── routes/         # API routes
│   │   ├── services/          # Business logic
│   │   ├── core/
│   │   │   ├── app.ts         # Express app setup
│   │   │   ├── server.ts      # Server entry point
│   │   │   └── socket/        # Socket.io setup
│   │   ├── config/            # File cấu hình
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── tests/                # Test files
│   └── package.json
│
├── frontend/                  # Ứng dụng Frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── features/        # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── orders/      # Order management
│   │   │   ├── products/    # Product management
│   │   │   ├── stock/       # Stock management
│   │   │   ├── customers/   # Customer management
│   │   │   ├── users/       # User management
│   │   │   └── reporting/   # Reporting
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── router/          # Routing
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── shared-types/              # Shared TypeScript types
│   └── src/
│
├── package.json              # Root package.json (workspaces)
└── README.md                 # File này
```

---

## 🤝 Đóng góp

Đóng góp rất được hoan nghênh! Vui lòng làm theo các bước sau:

1. **Fork repository**
2. **Tạo feature branch**
   ```bash
   git checkout -b feature/ten-tinh-nang-cua-ban
   ```
3. **Thực hiện thay đổi**
4. **Commit thay đổi**
   ```bash
   git commit -m "Add: mô tả tính năng của bạn"
   ```
5. **Push lên branch**
   ```bash
   git push origin feature/ten-tinh-nang-cua-ban
   ```
6. **Mở Pull Request**

### Code Style

- Tuân theo TypeScript best practices
- Sử dụng tên biến và hàm có ý nghĩa
- Thêm comment cho logic phức tạp
- Viết tests cho tính năng mới
- Tuân theo cấu trúc code hiện có

---

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

---

## 💬 Hỗ trợ

Để được hỗ trợ, gửi email đến lanprovn@gmail.com hoặc mở issue trong GitHub repository.

### Liên kết hữu ích

- **Tài liệu API:** `http://localhost:8080/api-docs` (khi chạy local)
- **Prisma Studio:** Chạy `npm run prisma:studio` để mở giao diện database
- **GitHub Issues:** [Báo lỗi hoặc yêu cầu tính năng](https://github.com/lanprovn/Ocha-Pos-Project/issues)

---

## 🙏 Lời cảm ơn

- Được xây dựng với ❤️ bằng các công nghệ web hiện đại
- Được truyền cảm hứng từ nhu cầu hệ thống POS hiệu quả cho các quán cà phê và nhà hàng Việt Nam
- Cảm ơn tất cả các contributors mã nguồn mở mà các thư viện của họ đã làm cho dự án này có thể thực hiện được

---

<div align="center">

**Được tạo bởi ❤️ bởi [Lan Pro](mailto:lanprovn@gmail.com)**

⭐ Hãy star repo này nếu bạn thấy nó hữu ích!

</div>
