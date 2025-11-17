# Các Chức Năng Chưa Có Backend

## 📋 Tổng Quan

Danh sách các tính năng frontend đang sử dụng mock data hoặc localStorage nhưng chưa có backend API tương ứng.

---

## 🔴 Chức Năng Chưa Có Backend

### 1. **Restaurants Management** ⭐ (Ưu tiên thấp)
- **Frontend**: `ProductContext.tsx` - Load từ `products.json` (mock data)
- **Mô tả**: Quản lý thông tin nhà hàng (tên, hình ảnh, rating, delivery time, delivery fee)
- **Backend cần**:
  - Model `Restaurant` trong Prisma schema
  - API endpoints: `GET /api/restaurants`, `POST /api/restaurants`, `PUT /api/restaurants/:id`, `DELETE /api/restaurants/:id`
  - Service: `restaurant.service.ts`
  - Controller: `restaurant.controller.ts`
  - Routes: `restaurant.routes.ts`

### 2. **Discount Items Management** ⭐ (Ưu tiên thấp)
- **Frontend**: `ProductContext.tsx` - Load từ `products.json` (mock data)
- **Mô tả**: Quản lý các chương trình khuyến mãi, giảm giá
- **Backend cần**:
  - Model `DiscountItem` trong Prisma schema
  - API endpoints: `GET /api/discounts`, `POST /api/discounts`, `PUT /api/discounts/:id`, `DELETE /api/discounts/:id`
  - Service: `discount.service.ts`
  - Controller: `discount.controller.ts`
  - Routes: `discount.routes.ts`

### 3. **Order Success Page - Load từ Backend** ⭐⭐ (Ưu tiên trung bình)
- **Frontend**: `OrderSuccessPage/utils/orderSuccessUtils.ts` - Load từ `localStorage`
- **Mô tả**: Trang hiển thị thông tin đơn hàng sau khi thanh toán thành công
- **Vấn đề**: Đang load từ `localStorage` thay vì từ backend order API
- **Backend cần**:
  - Sử dụng API có sẵn: `GET /api/orders/:id` (đã có)
  - Frontend cần update để gọi API thay vì localStorage

### 4. **Daily Sales - Hoàn toàn Backend** ⭐⭐⭐ (Ưu tiên cao)
- **Frontend**: 
  - `CheckoutPage/utils/checkoutUtils.ts` - Lưu vào `localStorage`
  - `OrderSuccessPage/utils/orderSuccessUtils.ts` - Load từ `localStorage`
- **Mô tả**: Thống kê doanh thu theo ngày
- **Vấn đề**: Backend có API `/api/dashboard/daily-sales` nhưng frontend vẫn dùng localStorage
- **Backend cần**:
  - API đã có: `GET /api/dashboard/daily-sales?date=YYYY-MM-DD`
  - Frontend cần update để:
    - Không lưu vào localStorage nữa
    - Load từ backend API
    - Tự động sync khi order completed

### 5. **Advanced Analytics & Reports** ⭐⭐ (Ưu tiên trung bình)
- **Frontend**: Chưa có page riêng, nhưng có thể cần
- **Mô tả**: Báo cáo chi tiết, phân tích xu hướng, export Excel/PDF
- **Backend cần**:
  - API endpoints:
    - `GET /api/analytics/revenue?startDate=&endDate=` - Doanh thu theo khoảng thời gian
    - `GET /api/analytics/products?startDate=&endDate=` - Top products theo khoảng thời gian
    - `GET /api/analytics/categories?startDate=&endDate=` - Doanh thu theo category
    - `GET /api/analytics/customers?startDate=&endDate=` - Thống kê khách hàng
    - `GET /api/analytics/export?type=excel|pdf&startDate=&endDate=` - Export báo cáo
  - Service: `analytics.service.ts`
  - Controller: `analytics.controller.ts`
  - Routes: `analytics.routes.ts`

### 6. **Customer Management** ⭐⭐ (Ưu tiên trung bình)
- **Frontend**: Chỉ có form nhập thông tin trong checkout
- **Mô tả**: Quản lý thông tin khách hàng, lịch sử mua hàng, điểm tích lũy
- **Backend cần**:
  - Model `Customer` trong Prisma schema
  - API endpoints:
    - `GET /api/customers` - Danh sách khách hàng
    - `GET /api/customers/:id` - Chi tiết khách hàng
    - `GET /api/customers/:id/orders` - Lịch sử đơn hàng của khách hàng
    - `POST /api/customers` - Tạo khách hàng mới
    - `PUT /api/customers/:id` - Cập nhật thông tin
  - Service: `customer.service.ts`
  - Controller: `customer.controller.ts`
  - Routes: `customer.routes.ts`

### 7. **Notifications System** ⭐ (Ưu tiên thấp)
- **Frontend**: Chưa có
- **Mô tả**: Hệ thống thông báo cho staff/admin (order mới, stock alert, etc.)
- **Backend cần**:
  - Model `Notification` trong Prisma schema
  - API endpoints:
    - `GET /api/notifications` - Danh sách thông báo
    - `POST /api/notifications/:id/read` - Đánh dấu đã đọc
    - `DELETE /api/notifications/:id` - Xóa thông báo
  - Socket.io events: `notification_new`
  - Service: `notification.service.ts`
  - Controller: `notification.controller.ts`
  - Routes: `notification.routes.ts`

### 8. **Settings/Configuration Management** ⭐⭐ (Ưu tiên trung bình)
- **Frontend**: Chưa có
- **Mô tả**: Quản lý cấu hình hệ thống (VAT rate, currency, business hours, etc.)
- **Backend cần**:
  - Model `Setting` trong Prisma schema
  - API endpoints:
    - `GET /api/settings` - Lấy tất cả settings
    - `GET /api/settings/:key` - Lấy setting theo key
    - `PUT /api/settings/:key` - Cập nhật setting
  - Service: `setting.service.ts`
  - Controller: `setting.controller.ts`
  - Routes: `setting.routes.ts`

### 9. **Image Upload Service** ⭐⭐⭐ (Ưu tiên cao)
- **Frontend**: Chỉ nhập URL, chưa có upload
- **Mô tả**: Upload và quản lý hình ảnh sản phẩm, category, etc.
- **Backend cần**:
  - API endpoints:
    - `POST /api/upload/image` - Upload hình ảnh
    - `DELETE /api/upload/image/:filename` - Xóa hình ảnh
  - Middleware: `multer` để xử lý file upload
  - Storage: Local hoặc cloud (AWS S3, Cloudinary)
  - Controller: `upload.controller.ts`
  - Routes: `upload.routes.ts`

### 10. **Recipe Validation & Ingredient Availability Check** ⭐⭐ (Ưu tiên trung bình)
- **Frontend**: Chưa có
- **Mô tả**: Kiểm tra xem có đủ nguyên liệu để làm sản phẩm trước khi bán
- **Backend cần**:
  - API endpoint: `GET /api/recipes/:productId/check-availability` - Kiểm tra nguyên liệu
  - Logic trong `recipe.service.ts`:
    - Tính số lượng nguyên liệu cần
    - So sánh với tồn kho hiện tại
    - Trả về danh sách nguyên liệu thiếu
  - Cảnh báo khi không đủ nguyên liệu

---

## ✅ Chức Năng Đã Có Backend (Hoàn chỉnh)

1. ✅ **Products Management** - CRUD đầy đủ
2. ✅ **Categories Management** - CRUD đầy đủ
3. ✅ **Orders Management** - CRUD + status updates + draft orders
4. ✅ **Stock Management** - Products & Ingredients stocks
5. ✅ **Stock Transactions** - Lịch sử nhập/xuất
6. ✅ **Stock Alerts** - Cảnh báo tồn kho
7. ✅ **Ingredients Management** - CRUD đầy đủ
8. ✅ **Recipes Management** - CRUD đầy đủ
9. ✅ **Dashboard Stats** - Thống kê tổng quan
10. ✅ **Daily Sales** - API có sẵn (frontend chưa dùng)
11. ✅ **Payment Gateway** - VNPay + QR Code
12. ✅ **User Authentication** - Login, JWT
13. ✅ **Real-time Updates** - Socket.io cho orders, stock, dashboard

---

## 📊 Ưu Tiên Triển Khai

### 🔴 Ưu tiên cao (Cần làm ngay)
1. **Daily Sales - Hoàn toàn Backend** - Frontend đang dùng localStorage
2. **Image Upload Service** - Cần thiết cho production

### 🟡 Ưu tiên trung bình (Nên làm)
3. **Order Success Page - Load từ Backend** - Cải thiện UX
4. **Advanced Analytics & Reports** - Hữu ích cho quản lý
5. **Customer Management** - Quan trọng cho CRM
6. **Settings/Configuration** - Cần thiết cho production
7. **Recipe Validation** - Đảm bảo chất lượng dịch vụ

### 🟢 Ưu tiên thấp (Có thể làm sau)
8. **Restaurants Management** - Không quan trọng lắm
9. **Discount Items Management** - Có thể dùng discount field trong Product
10. **Notifications System** - Nice to have

---

## 📝 Ghi Chú

- Các tính năng đánh dấu ⭐⭐⭐ là quan trọng nhất
- Các tính năng đánh dấu ⭐⭐ là nên có
- Các tính năng đánh dấu ⭐ là optional

