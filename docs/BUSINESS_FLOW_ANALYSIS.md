# Phân Tích Nghiệp Vụ - Luồng Liên Kết 4 Trang

## 📋 Nghiệp Vụ Thực Tế POS System

### 1. **POS System** (`/`) - Màn Hình Nhân Viên Order
**Chức năng:**
- Nhân viên chọn sản phẩm từ menu
- Thêm vào giỏ hàng (cart)
- Xem tổng tiền, VAT
- Click "Thanh toán" → đi đến Checkout

**Liên kết cần có:**
- ✅ Button "Thanh toán" → `/checkout` (đã có)
- ➕ Quick link đến `/orders` để xem đơn hàng đang xử lý
- ➕ Notification badge hiển thị số đơn hàng mới

### 2. **Checkout** (`/checkout`) - Trang Thanh Toán
**Chức năng:**
- Nhập thông tin khách hàng (name, phone, table)
- Chọn phương thức thanh toán (Cash/Card/QR)
- Xác nhận đơn hàng
- Sau khi thanh toán thành công → tạo order với status PENDING/CONFIRMED

**Liên kết cần có:**
- ✅ Sau thanh toán → `/order-success` (đã có)
- ➕ Từ Order Success → có option "Xem đơn hàng" → `/orders`
- ➕ Button "Quay lại POS" → `/`
- ➕ Nếu thanh toán thất bại → có option "Thử lại" hoặc "Quay lại POS"

### 3. **Orders** (`/orders`) - Màn Hình Hiển Thị Đơn Hàng
**Chức năng:**
- Hiển thị tất cả đơn hàng hôm nay (real-time)
- Phân loại theo status: CREATING, PENDING, CONFIRMED, PREPARING, READY, COMPLETED
- Nhân viên có thể update status của đơn hàng
- Xem chi tiết đơn hàng

**Liên kết cần có:**
- ➕ Button "Tạo đơn mới" → `/` (POS System)
- ➕ Click vào đơn hàng CREATING → có thể "Tiếp tục thanh toán" → `/checkout` (với cart đã có)
- ➕ Click vào đơn hàng PENDING → có thể "Xem chi tiết" hoặc "Update status"
- ➕ Navigation bar với links: POS, Orders, Dashboard
- ➕ Filter/Search để tìm đơn hàng

### 4. **Customer** (`/customer`) - Màn Hình Khách Tự Order
**Chức năng:**
- Khách hàng tự chọn sản phẩm
- Thêm vào giỏ hàng
- Click "Thanh toán" → đi đến Checkout
- Sau khi thanh toán → có thể track order status

**Liên kết cần có:**
- ✅ Button "Thanh toán" → `/checkout` (đã có)
- ➕ Sau thanh toán → có option "Theo dõi đơn hàng" → `/customer/order-tracking`
- ➕ Link "Lịch sử đơn hàng" → `/customer/order-history` (nếu có)
- ➕ Notification khi đơn hàng sẵn sàng

## 🔄 Luồng Nghiệp Vụ Chuẩn

### Luồng 1: Nhân Viên Order (Staff Flow)
```
POS System (/)
  ↓ [Chọn sản phẩm, thêm vào cart]
  ↓ [Click "Thanh toán"]
Checkout (/checkout)
  ↓ [Nhập thông tin, chọn payment method]
  ↓ [Click "Hoàn tất đơn hàng"]
Order Success (/order-success)
  ↓ [Click "Xem đơn hàng"]
Orders (/orders) ← Đơn hàng xuất hiện real-time
  ↓ [Nhân viên update status: CONFIRMED → PREPARING → READY → COMPLETED]
  ↓ [Click "Tạo đơn mới"]
POS System (/) ← Quay lại để tạo đơn mới
```

### Luồng 2: Khách Tự Order (Customer Flow)
```
Customer (/customer)
  ↓ [Chọn sản phẩm, thêm vào cart]
  ↓ [Click "Thanh toán"]
Checkout (/checkout)
  ↓ [Nhập phone + table, chọn QR payment]
  ↓ [Click "Hoàn tất đơn hàng"]
Order Success (/order-success)
  ↓ [Click "Theo dõi đơn hàng"]
Order Tracking (/customer/order-tracking)
  ↓ [Xem real-time status updates]
  ↓ [Khi READY → notification]
  ↓ [Click "Đặt đơn mới"]
Customer (/) ← Quay lại để đặt đơn mới
```

### Luồng 3: Quản Lý Đơn Hàng (Order Management Flow)
```
Orders (/orders)
  ↓ [Xem tất cả đơn hàng hôm nay]
  ↓ [Click vào đơn hàng CREATING]
  ↓ [Có option "Tiếp tục thanh toán"]
Checkout (/checkout) ← Với cart đã có sẵn
  ↓ [Hoàn tất thanh toán]
Orders (/orders) ← Đơn hàng update status
```

## 🎯 Các Tính Năng Cần Bổ Sung

### 1. Navigation Bar/Header
- **POS System**: Links đến Orders, Dashboard
- **Checkout**: Breadcrumb: POS → Checkout, Button "Quay lại"
- **Orders**: Links đến POS, Dashboard, Button "Tạo đơn mới"
- **Customer**: Links đến Order Tracking, Order History

### 2. Quick Actions trên OrderCard
- **CREATING**: "Tiếp tục thanh toán" → `/checkout`
- **PENDING**: "Xác nhận" → Update status to CONFIRMED
- **CONFIRMED**: "Bắt đầu chuẩn bị" → Update status to PREPARING
- **PREPARING**: "Sẵn sàng" → Update status to READY
- **READY**: "Hoàn thành" → Update status to COMPLETED
- **COMPLETED**: "Xem chi tiết" → Modal hoặc detail page

### 3. Deep Linking
- Từ Orders page → Click order → Có thể navigate đến Checkout với order data
- Từ Order Success → Click order number → Navigate đến Orders page và highlight order đó

### 4. Real-time Notifications
- Khi có đơn hàng mới → Notification trên POS System
- Khi đơn hàng sẵn sàng → Notification cho khách hàng (nếu đang ở Customer page)

### 5. Cart Persistence
- Nếu đang ở Checkout và navigate đi → Cart vẫn được giữ
- Nếu đang ở Orders và click "Tiếp tục thanh toán" → Load cart từ draft order

