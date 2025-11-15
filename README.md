# OCHA POS

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🇻🇳 Tiếng Việt

### Giới thiệu

**OCHA POS** là hệ thống quản lý bán hàng (Point of Sale) hiện đại, được thiết kế đặc biệt cho các quán cà phê và nhà hàng tại Việt Nam. Hệ thống được xây dựng với mục tiêu tối ưu hiệu suất, độ tin cậy cao và phù hợp với quy trình vận hành thực tế.

OCHA POS là giải pháp quản lý nhà hàng toàn diện, cho phép nhân viên nhận đơn trên máy tính bảng, bếp nhận đơn tức thì, quản lý theo dõi báo cáo doanh số real-time, và mọi thứ được đồng bộ tự động.

### Tính năng chính

#### 🛒 Quản lý bán hàng
- **Quản lý sản phẩm** - Danh mục đầy đủ với phân loại, biến thể, size và topping
- **Xử lý đơn hàng** - Tạo, chỉnh sửa và theo dõi đơn hàng với cập nhật real-time
- **Màn hình hiển thị bếp** - Bảng đơn hàng trực tiếp cho nhân viên bếp
- **Thanh toán** - Tiền mặt và QR Code (tích hợp VietinBank)
- **In hóa đơn** - Tạo và in hóa đơn ngay lập tức

#### 📊 Phân tích kinh doanh
- **Dashboard Analytics** - Doanh số, doanh thu và chỉ số hiệu suất real-time
- **Báo cáo doanh thu** - Tổng hợp theo ngày, tuần, tháng với xuất Excel
- **Lịch sử đơn hàng** - Theo dõi đơn hàng đầy đủ với tìm kiếm và lọc
- **Hiệu suất sản phẩm** - Theo dõi sản phẩm bán chạy và chậm

#### 📦 Quản lý kho và vận hành
- **Quản lý tồn kho** - Theo dõi tồn kho sản phẩm và nguyên liệu
- **Cảnh báo tồn kho thấp** - Thông báo tự động khi hàng sắp hết
- **Quản lý công thức** - Liên kết sản phẩm với nguyên liệu để theo dõi chi phí
- **Quản lý người dùng** - Phân quyền theo vai trò (Admin, Nhân viên, Khách hàng)

#### ⚡ Tính năng kỹ thuật
- **Cập nhật real-time** - Đồng bộ trực tiếp với Socket.io
- **Hỗ trợ offline** - Hoạt động ngay cả khi mất kết nối
- **Đa thiết bị** - Sử dụng trên máy tính bảng, điện thoại hoặc máy tính
- **Tài liệu API** - Tài liệu Swagger/OpenAPI đầy đủ
- **Type Safety** - TypeScript đầy đủ

### Công nghệ sử dụng

#### Frontend
- **React 19** - Framework UI hiện đại
- **TypeScript** - Phát triển type-safe
- **Tailwind CSS** - Styling utility-first
- **Vite** - Build tool siêu nhanh
- **Socket.io Client** - Giao tiếp real-time
- **React Router** - Định tuyến phía client

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Code backend type-safe
- **PostgreSQL** - Cơ sở dữ liệu quan hệ
- **Prisma** - ORM hiện đại với type generation
- **Socket.io** - Server real-time
- **JWT** - Xác thực
- **Swagger** - Tài liệu API

### Cài đặt nhanh

#### Yêu cầu hệ thống
- Node.js 18+ và npm
- PostgreSQL 14+
- Git

#### Cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/lanprovn/Ocha-Pos-Project.git
   cd Ocha-Pos-Project
   ```

2. **Thiết lập backend**
   ```bash
   cd backend
   npm install
   
   # Tạo file .env (hoặc dùng script create-env.ps1)
   cp .env.example .env
   # Chỉnh sửa .env với thông tin database của bạn
   
   # Generate Prisma Client
   npm run prisma:generate
   
   # Chạy migrations
   npm run prisma:migrate
   
   # Seed database (tùy chọn)
   npm run prisma:seed
   
   # Khởi động server backend
   npm run dev
   ```

3. **Thiết lập frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Khởi động development server
   npm run dev
   ```

4. **Truy cập ứng dụng**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Docs: http://localhost:8080/api-docs

#### Thông tin đăng nhập mặc định
- **Admin**: `admin@ocha.com` / `admin123`
- **Nhân viên**: `staff@ocha.com` / `staff123`

### Cấu trúc dự án

```
Ocha-Pos-Project/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Xử lý request
│   │   ├── services/       # Logic nghiệp vụ
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   ├── jobs/           # Background jobs
│   │   ├── utils/          # Utilities
│   │   └── config/         # Database, env
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Unit & integration tests
│
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API clients
│   │   ├── context/        # State management
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
│
└── docs/                   # Documentation
```

### API Overview

Backend cung cấp RESTful API được tổ chức theo các module:

- **`/api/auth`** - Xác thực (đăng nhập, thông tin user hiện tại)
- **`/api/users`** - Quản lý người dùng (chỉ Admin)
- **`/api/products`** - Danh mục sản phẩm
- **`/api/categories`** - Danh mục sản phẩm
- **`/api/orders`** - Quản lý đơn hàng
- **`/api/dashboard`** - Phân tích và thống kê
- **`/api/reports`** - Báo cáo doanh thu và xuất file
- **`/api/stock`** - Quản lý tồn kho
- **`/api/payment`** - Xử lý thanh toán
- **`/api/recipes`** - Quản lý công thức
- **`/api/upload`** - Upload file

Tài liệu API đầy đủ có sẵn tại `/api-docs` khi backend đang chạy.

### Scripts phát triển

#### Backend Scripts
```bash
npm run dev          # Khởi động development server với hot reload
npm run dev:clean    # Kill port conflicts và khởi động server
npm run build        # Build cho production
npm run start        # Chạy production build
npm test             # Chạy tests
npm run prisma:studio # Mở Prisma Studio (database GUI)
```

#### Frontend Scripts
```bash
npm run dev          # Khởi động development server
npm run build        # Build cho production
npm run preview      # Preview production build
npm test             # Chạy tests
```

### Kiến trúc

Hệ thống tuân theo pattern clean architecture:

- **Controllers** xử lý HTTP requests và responses
- **Services** chứa business logic
- **Routes** định nghĩa API endpoints
- **Middleware** xử lý cross-cutting concerns (auth, validation)
- **Prisma** quản lý database access với type safety

Tính năng real-time sử dụng Socket.io để cập nhật tức thì trên tất cả clients đã kết nối. Frontend sử dụng React Context cho state management, giữ components đơn giản và dễ bảo trì.

### Bảo mật

- Xác thực dựa trên JWT với lưu trữ token an toàn
- Kiểm soát truy cập dựa trên vai trò (Admin, Nhân viên, Khách hàng)
- Mã hóa mật khẩu với bcrypt
- Sanitization input để ngăn chặn XSS attacks
- Bảo vệ CORS
- Rate limiting trên API endpoints
- Helmet.js cho HTTP headers an toàn

### Database

Hệ thống sử dụng PostgreSQL với Prisma ORM. Schema bao gồm:

- Users và authentication
- Products và categories
- Orders và order items
- Stock và inventory
- Recipes và ingredients
- Payment records

Migrations được bao gồm trong repository để dễ dàng thiết lập. Sử dụng `npm run prisma:migrate` để áp dụng.

### Đóng góp

Đây là dự án private, nhưng nếu bạn có quyền truy cập và muốn đóng góp:

1. Tạo feature branch
2. Thực hiện thay đổi
3. Viết hoặc cập nhật tests
4. Đảm bảo tất cả tests pass
5. Submit pull request

### License

MIT License - xem file LICENSE để biết chi tiết

### Hỗ trợ

Đối với issues, câu hỏi hoặc yêu cầu tính năng, vui lòng mở issue trên GitHub.

---

## 🇬🇧 English

### Introduction

**OCHA POS** is a modern Point of Sale (POS) system designed specifically for Vietnamese cafes and restaurants. Built with performance optimization, high reliability, and real-world operational workflows in mind.

OCHA POS is a comprehensive restaurant management solution that allows staff to take orders on tablets, kitchen receives orders instantly, managers track real-time sales reports, and everything syncs automatically.

### Key Features

#### 🛒 Sales Management
- **Product Management** - Full catalog with categories, variants, sizes, and toppings
- **Order Processing** - Create, modify, and track orders with real-time updates
- **Kitchen Display** - Live order board for kitchen staff
- **Payment Processing** - Cash and QR Code payments (VietinBank integration)
- **Receipt Printing** - Generate and print receipts instantly

#### 📊 Business Intelligence
- **Dashboard Analytics** - Real-time sales, revenue, and performance metrics
- **Revenue Reports** - Daily, weekly, monthly summaries with Excel export
- **Order History** - Complete order tracking with search and filters
- **Product Performance** - Track bestsellers and slow movers

#### 📦 Inventory & Operations
- **Stock Management** - Track product and ingredient inventory
- **Low Stock Alerts** - Automatic notifications when items run low
- **Recipe Management** - Link products to ingredients for cost tracking
- **User Management** - Role-based access (Admin, Staff, Customer)

#### ⚡ Technical Features
- **Real-time Updates** - Socket.io powered live synchronization
- **Offline Support** - Works even when connection is spotty
- **Multi-device** - Use on tablets, phones, or desktop
- **API Documentation** - Complete Swagger/OpenAPI docs
- **Type Safety** - Full TypeScript coverage

### Tech Stack

#### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend code
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM with type generation
- **Socket.io** - Real-time server
- **JWT** - Authentication
- **Swagger** - API documentation

### Quick Start

#### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lanprovn/Ocha-Pos-Project.git
   cd Ocha-Pos-Project
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file (or use create-env.ps1 script)
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   
   # Start backend server
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - API Docs: http://localhost:8080/api-docs

#### Default Credentials
- **Admin**: `admin@ocha.com` / `admin123`
- **Staff**: `staff@ocha.com` / `staff123`

### Project Structure

```
Ocha-Pos-Project/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   ├── jobs/           # Background jobs
│   │   ├── utils/          # Utilities
│   │   └── config/         # Database, env
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Unit & integration tests
│
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API clients
│   │   ├── context/        # State management
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets
│
└── docs/                   # Documentation
```

### API Overview

The backend exposes a RESTful API organized into logical modules:

- **`/api/auth`** - Authentication (login, current user)
- **`/api/users`** - User management (Admin only)
- **`/api/products`** - Product catalog
- **`/api/categories`** - Product categories
- **`/api/orders`** - Order management
- **`/api/dashboard`** - Analytics and stats
- **`/api/reports`** - Revenue reports and exports
- **`/api/stock`** - Inventory management
- **`/api/payment`** - Payment processing
- **`/api/recipes`** - Recipe management
- **`/api/upload`** - File uploads

Full API documentation is available at `/api-docs` when the backend is running.

### Development Scripts

#### Backend Scripts
```bash
npm run dev          # Start development server with hot reload
npm run dev:clean    # Kill port conflicts and start server
npm run build        # Build for production
npm run start        # Run production build
npm test             # Run tests
npm run prisma:studio # Open Prisma Studio (database GUI)
```

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

### Architecture

The system follows a clean architecture pattern:

- **Controllers** handle HTTP requests and responses
- **Services** contain business logic
- **Routes** define API endpoints
- **Middleware** handles cross-cutting concerns (auth, validation)
- **Prisma** manages database access with type safety

Real-time features use Socket.io for instant updates across all connected clients. The frontend uses React Context for state management, keeping components simple and maintainable.

### Security

- JWT-based authentication with secure token storage
- Role-based access control (Admin, Staff, Customer)
- Password hashing with bcrypt
- Input sanitization to prevent XSS attacks
- CORS protection
- Rate limiting on API endpoints
- Helmet.js for secure HTTP headers

### Database

The system uses PostgreSQL with Prisma ORM. The schema includes:

- Users and authentication
- Products and categories
- Orders and order items
- Stock and inventory
- Recipes and ingredients
- Payment records

Migrations are included in the repository for easy setup. Use `npm run prisma:migrate` to apply them.

### Contributing

This is a private project, but if you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Write or update tests
4. Ensure all tests pass
5. Submit a pull request

### License

MIT License - see LICENSE file for details

### Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for Vietnamese businesses**
