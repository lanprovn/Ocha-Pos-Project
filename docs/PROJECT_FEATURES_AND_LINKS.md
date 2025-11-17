# 📋 Danh Sách Đầy Đủ Các Chức Năng & Link Localhost

## 🌐 Base URLs

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api`
- **Backend Health**: `http://localhost:8080/health`

---

## 🔐 Authentication & Access

### 1. **Login Page** 🔓 (Public)
- **Link**: `http://localhost:3000/login`
- **Chức năng**:
  - Đăng nhập cho Staff và Admin
  - Chọn vai trò (STAFF/ADMIN)
  - JWT Authentication
- **Credentials**:
  - Staff: `staff@ocha.com` / `staff123`
  - Admin: `admin@ocha.com` / `admin123`
- **Backend API**: `POST /api/users/login`

---

## 🏠 POS System (Staff Interface)

### 2. **Home - POS System** 🛒 (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/`
- **Chức năng**:
  - Hiển thị danh sách sản phẩm theo category
  - Lọc sản phẩm theo category
  - Tìm kiếm sản phẩm
  - Thêm sản phẩm vào giỏ hàng
  - Xem giỏ hàng (sidebar)
  - Real-time sync với Order Display
- **Backend APIs**:
  - `GET /api/products` - Danh sách sản phẩm
  - `GET /api/categories` - Danh mục
  - `POST /api/orders/draft` - Tạo draft order (real-time)

### 3. **Product Detail Page** 📦 (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/product/:id`
- **Ví dụ**: `http://localhost:3000/product/5cd6fed9-5b04-4ab0-aa1f-e45f2ce5c0af`
- **Chức năng**:
  - Xem chi tiết sản phẩm
  - Chọn size (nếu có)
  - Chọn toppings (nếu có)
  - Chọn số lượng
  - Thêm ghi chú
  - Tính giá tổng (bao gồm VAT 10%)
  - Thêm vào giỏ hàng
- **Backend API**: `GET /api/products/:id`

### 4. **Checkout Page** ⚠️ (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/checkout`
- **Chức năng**:
  - Xem tóm tắt đơn hàng
  - Nhập thông tin khách hàng (tên, số điện thoại, bàn)
  - Chọn phương thức thanh toán:
    - 💵 Tiền mặt (Cash)
    - 💳 Thẻ ngân hàng (Card) - VNPay
    - 📱 Quét mã QR - VietQR
  - Tính VAT 10%
  - Hoàn tất đơn hàng
- **Backend APIs**:
  - `POST /api/orders` - Tạo order ✅
  - `POST /api/payment/create` - Tạo payment URL (Card) ✅
  - `POST /api/qr/generate` - Tạo QR code (QR) ✅
  - `PUT /api/orders/:id/status` - Cập nhật status ✅
- **⚠️ Vấn đề**: `saveOrderToDailySales()` đang lưu vào `localStorage` thay vì backend
- **Backend API có sẵn**: `GET /api/dashboard/daily-sales?date=YYYY-MM-DD` ✅
- **Cần fix**: Update frontend để không lưu vào localStorage, dùng backend API

### 5. **Order Success Page** ⚠️ (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/order-success`
- **Chức năng**:
  - Hiển thị thông báo thanh toán thành công
  - Hiển thị thông tin đơn hàng
  - Nút "Tạo đơn mới" - Quay về POS
  - Nút "Xem Dashboard" - Xem thống kê
- **Backend API**: `GET /api/orders/:id` ✅ (API có sẵn)
- **⚠️ Vấn đề**: Frontend đang load từ `localStorage` thay vì gọi API
- **Cần fix**: Update frontend để dùng `GET /api/orders/:id` thay vì localStorage

---

## 📊 Management Pages

### 6. **Dashboard - Thống Kê Doanh Thu** 📈 (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/dashboard`
- **Chức năng**:
  - Tổng quan doanh thu (hôm nay, tổng cộng)
  - Số lượng đơn hàng
  - Giá trị đơn hàng trung bình
  - Biểu đồ doanh thu theo giờ
  - Top 10 sản phẩm bán chạy
  - Thống kê thanh toán (Cash/Card/QR)
  - Cảnh báo tồn kho (sản phẩm & nguyên liệu)
  - Đơn hàng gần đây
  - So sánh hôm nay vs hôm qua
- **Backend APIs**:
  - `GET /api/dashboard/stats` - Thống kê tổng quan
  - `GET /api/dashboard/daily-sales?date=YYYY-MM-DD` - Doanh thu theo ngày
  - `GET /api/stock/alerts` - Cảnh báo tồn kho

### 7. **Stock Management - Quản Lý Kho** 📦 (Protected: Admin only)
- **Link**: `http://localhost:3000/stock-management`
- **Chức năng**:
  - **Tab Tồn Kho (Stocks)**:
    - Xem danh sách sản phẩm và tồn kho
    - Thêm sản phẩm mới
    - Sửa thông tin sản phẩm
    - Xóa sản phẩm
    - Nhập hàng (tăng tồn kho)
    - Điều chỉnh tồn kho
    - Quản lý công thức (recipes) cho sản phẩm
  - **Tab Giao Dịch (Transactions)**:
    - Xem lịch sử nhập/xuất kho
    - Lọc theo sản phẩm/nguyên liệu
    - Xem chi tiết giao dịch
  - **Tab Cảnh Báo (Alerts)**:
    - Cảnh báo sắp hết hàng
    - Cảnh báo hết hàng
    - Đánh dấu đã đọc
  - **Tab Nguyên Liệu (Ingredients)**:
    - Xem danh sách nguyên liệu
    - Thêm nguyên liệu mới
    - Sửa thông tin nguyên liệu
    - Xóa nguyên liệu
    - Nhập nguyên liệu
    - Điều chỉnh tồn kho nguyên liệu
- **Backend APIs**:
  - `GET /api/stock/products` - Danh sách sản phẩm
  - `GET /api/stock/ingredients` - Danh sách nguyên liệu
  - `GET /api/stock/transactions` - Lịch sử giao dịch
  - `GET /api/stock/alerts` - Cảnh báo
  - `POST /api/products` - Tạo sản phẩm
  - `PUT /api/products/:id` - Cập nhật sản phẩm
  - `DELETE /api/products/:id` - Xóa sản phẩm
  - `POST /api/stock/ingredients` - Tạo nguyên liệu
  - `PUT /api/stock/ingredients/:id` - Cập nhật nguyên liệu
  - `POST /api/stock/transactions` - Tạo giao dịch
  - `GET /api/recipes/product/:productId` - Công thức sản phẩm
  - `POST /api/recipes` - Tạo công thức
  - `DELETE /api/recipes/:id` - Xóa công thức

### 8. **Order Display - Hiển Thị Đơn Hàng Real-time** 📋 (Protected: Staff/Admin)
- **Link**: `http://localhost:3000/orders`
- **Chức năng**:
  - Hiển thị tất cả đơn hàng hôm nay (real-time)
  - Phân loại theo trạng thái:
    - 🟡 Đang tạo (CREATING) - Draft orders từ POS
    - 🔵 Đã xác nhận (CONFIRMED)
    - 🟢 Đang chuẩn bị (PREPARING)
    - 🟣 Sẵn sàng (READY)
    - ✅ Hoàn thành (COMPLETED)
    - ❌ Đã hủy (CANCELLED)
  - Hiển thị thông tin chi tiết:
    - Số đơn hàng
    - Tên khách hàng
    - Danh sách sản phẩm
    - Tổng tiền (bao gồm VAT 10%)
    - Thời gian cập nhật
  - Auto-scroll đến đơn hàng mới hoàn thành
  - Real-time updates qua Socket.io
- **Backend APIs**:
  - `GET /api/orders/today` - Đơn hàng hôm nay
  - Socket.io events: `order_created`, `order_updated`, `order_status_changed`

---

## 👥 Customer Display

### 9. **Customer Display - Màn Hình Khách Hàng** 🖥️ (Public)
- **Link**: `http://localhost:3000/customer`
- **Chức năng**:
  - Hiển thị menu sản phẩm cho khách hàng
  - Lọc theo category
  - Tìm kiếm sản phẩm
  - Xem chi tiết sản phẩm
  - Thêm vào giỏ hàng
  - Xem giỏ hàng
  - Real-time sync với POS system
- **Backend APIs**:
  - `GET /api/products` - Danh sách sản phẩm
  - `GET /api/categories` - Danh mục
  - `POST /api/orders/draft` - Tạo draft order (real-time)

---

## 💳 Payment Callback

### 10. **Payment Callback Page** 🔄 (Public)
- **Link**: `http://localhost:3000/payment/callback`
- **Chức năng**:
  - Xử lý callback từ VNPay sau khi thanh toán
  - Xác minh giao dịch
  - Cập nhật trạng thái đơn hàng
  - Redirect về Order Success Page
- **Backend API**: `GET /api/payment/callback`

---

## 🔧 Backend APIs Overview

### Products & Categories
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm
- `GET /api/categories` - Danh sách danh mục
- `POST /api/categories` - Tạo danh mục
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Orders
- `GET /api/orders` - Danh sách đơn hàng (có filter)
- `GET /api/orders/today` - Đơn hàng hôm nay
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/orders/draft` - Tạo/cập nhật draft order
- `PUT /api/orders/:id` - Cập nhật đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái

### Stock Management
- `GET /api/stock/products` - Tồn kho sản phẩm
- `GET /api/stock/ingredients` - Tồn kho nguyên liệu
- `GET /api/stock/transactions` - Lịch sử giao dịch
- `GET /api/stock/alerts` - Cảnh báo tồn kho
- `POST /api/stock/transactions` - Tạo giao dịch
- `POST /api/stock/ingredients` - Tạo nguyên liệu
- `PUT /api/stock/ingredients/:id` - Cập nhật nguyên liệu

### Recipes
- `GET /api/recipes/product/:productId` - Công thức sản phẩm
- `GET /api/recipes/ingredient/:ingredientId` - Sản phẩm dùng nguyên liệu
- `GET /api/recipes/:id` - Chi tiết công thức
- `POST /api/recipes` - Tạo công thức
- `PUT /api/recipes/:id` - Cập nhật công thức
- `DELETE /api/recipes/:id` - Xóa công thức

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/daily-sales?date=YYYY-MM-DD` - Doanh thu theo ngày

### Payment
- `POST /api/payment/create` - Tạo payment URL (VNPay)
- `GET /api/payment/callback` - Callback từ VNPay
- `POST /api/qr/generate` - Tạo QR code (VietQR)
- `POST /api/qr/verify` - Xác minh thanh toán QR

### Authentication
- `POST /api/users/login` - Đăng nhập
- `GET /api/users/me` - Thông tin user hiện tại

### Health Check
- `GET /health` - Kiểm tra backend status

---

## 🔄 Real-time Features (Socket.io)

- **Order Updates**: `order_created`, `order_updated`, `order_status_changed`
- **Stock Updates**: `dashboard_update`, `stock_alert`
- **Auto Ingredient Deduction**: Tự động trừ nguyên liệu khi order completed

---

## 📱 Tính Năng Đặc Biệt

### 1. **Real-time Order Sync**
- POS system và Customer Display sync real-time
- Order Display Page hiển thị draft orders ngay lập tức
- Socket.io cho instant updates

### 2. **Auto Ingredient Deduction**
- Khi order completed → Tự động trừ nguyên liệu theo recipe
- Tạo transaction tự động
- Cập nhật tồn kho real-time

### 3. **VAT Calculation**
- Tự động tính VAT 10% cho tất cả đơn hàng
- Hiển thị rõ ràng: Tạm tính, VAT, Tổng cộng

### 4. **Draft Orders**
- Tự động tạo draft order khi thêm vào giỏ hàng
- Xóa draft order khi hoàn thành hoặc hủy
- Real-time sync giữa các tab/window

### 5. **Payment Gateway Integration**
- VNPay (Card payment)
- VietQR (QR code payment)
- Cash payment

---

## 🎯 Quick Access Links

| Chức Năng | Link | Quyền Truy Cập |
|-----------|------|----------------|
| Login | `http://localhost:3000/login` | Public |
| POS System | `http://localhost:3000/` | Staff/Admin |
| Product Detail | `http://localhost:3000/product/:id` | Staff/Admin |
| Checkout | `http://localhost:3000/checkout` | Staff/Admin |
| Order Success | `http://localhost:3000/order-success` | Staff/Admin |
| Dashboard | `http://localhost:3000/dashboard` | Staff/Admin |
| Stock Management | `http://localhost:3000/stock-management` | Admin only |
| Order Display | `http://localhost:3000/orders` | Staff/Admin |
| Customer Display | `http://localhost:3000/customer` | Public |
| Payment Callback | `http://localhost:3000/payment/callback` | Public |

---

---

## ⚠️ Chức Năng Chưa Hoàn Chỉnh Backend

### 1. **Order Success Page** ⚠️
- **Vấn đề**: Đang load từ `localStorage` thay vì backend API
- **Backend API có sẵn**: `GET /api/orders/:id` ✅
- **Cần fix**: Update `OrderSuccessPage` để gọi API thay vì localStorage

### 2. **Daily Sales trong Checkout** ⚠️
- **Vấn đề**: `saveOrderToDailySales()` đang lưu vào `localStorage`
- **Backend API có sẵn**: `GET /api/dashboard/daily-sales?date=YYYY-MM-DD` ✅
- **Cần fix**: 
  - Không lưu vào localStorage nữa
  - Backend tự động tính daily sales từ orders
  - Frontend chỉ cần gọi API để load

### 3. **Image Upload** ⚠️
- **Vấn đề**: Chỉ nhập URL, chưa có upload file
- **Cần**: Backend API upload hình ảnh
- **Backend cần**: `POST /api/upload/image`, `DELETE /api/upload/image/:filename`

### 4. **Restaurants & Discount Items** ⚠️
- **Vấn đề**: Frontend có mock data nhưng không có backend
- **Vị trí**: `ProductContext.tsx` - Load từ `products.json`
- **Cần**: Backend API cho Restaurants và Discount Items (hoặc có thể bỏ qua nếu không cần)

---

## 📝 Notes

- Tất cả các trang (trừ Login, Customer Display, Payment Callback) đều yêu cầu authentication
- Stock Management chỉ dành cho Admin
- Real-time updates hoạt động qua Socket.io
- Backend chạy trên port 8080
- Frontend chạy trên port 3000

---

## 🚀 Cách Khởi Động Servers

### ⚠️ QUAN TRỌNG: Không chạy `npm run dev` ở thư mục root!

Project này có cấu trúc riêng cho `frontend/` và `backend/`. Bạn cần chạy từng server riêng:

#### 1. Khởi động Backend (Terminal 1)
```powershell
cd backend
npm run dev
```

#### 2. Khởi động Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```

**Lưu ý**: Luôn chạy Backend trước Frontend để tránh lỗi `ERR_CONNECTION_REFUSED`.

Xem chi tiết trong file `START_SERVERS.md` ở thư mục root.
- ⚠️ = Chức năng có backend API nhưng frontend chưa dùng đầy đủ hoặc chưa có backend

