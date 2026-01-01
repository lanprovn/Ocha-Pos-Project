# 📋 Giải Thích Lỗi API và Quy Trình Hoạt Động

## 🔴 Lỗi 403 (Forbidden) - Customer API

### **Nguyên Nhân:**

1. **Backend yêu cầu ADMIN role:**
   - Route `/api/customers` và `/api/customers/statistics` chỉ cho phép ADMIN
   - Code: `requireRole('ADMIN')` trong `customer.routes.ts`

2. **Frontend có check nhưng vẫn gọi API:**
   - Có thể user đang đăng nhập với role **STAFF** thay vì **ADMIN**
   - Hoặc có race condition: component mount trước khi user data load xong

### **Quy Trình Hoạt Động:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER TRUY CẬP /admin/customers                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: AdminCustomerManagementPage mount              │
│    - useAuth() hook lấy user từ AuthContext                │
│    - useEffect chạy khi component mount                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FRONTEND: Check user.role === 'ADMIN'                    │
│    - Nếu không phải ADMIN → return (nhưng có thể đã gọi API)│
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND: Gọi customerService.getAll()                  │
│    - api.service.ts lấy token từ localStorage               │
│    - Thêm header: Authorization: Bearer <token>             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND: Middleware authenticate()                       │
│    - Verify JWT token                                       │
│    - Extract user info (userId, email, role)                │
│    - Attach vào req.user                                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND: Middleware requireRole('ADMIN')                 │
│    - Check req.user.role === 'ADMIN'                        │
│    - Nếu không → Trả 403 Forbidden                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. FRONTEND: Nhận 403 → Show error toast                    │
│    "Bạn không có quyền truy cập. Vui lòng đăng nhập lại..."│
└─────────────────────────────────────────────────────────────┘
```

### **Cách Fix:**

**Option 1: Đảm bảo đăng nhập với ADMIN account**
- Email: `admin@ocha.com`
- Password: `admin123`

**Option 2: Cải thiện frontend check (đã có sẵn)**
- Code đã check `user.role !== 'ADMIN'` trước khi gọi API
- Nếu vẫn lỗi → có thể user chưa load xong

**Option 3: Thêm ProtectedRoute**
- Route `/admin/customers` đã có `ProtectedRoute requiredRole="ADMIN"`
- Đảm bảo chỉ ADMIN mới vào được trang này

---

## 🟡 Lỗi 404 (Not Found) - Shift Current

### **Nguyên Nhân:**

**Đây KHÔNG phải lỗi!** Đây là behavior bình thường khi:
- Chưa có ca làm việc nào được mở
- Tất cả ca làm việc đã được đóng

### **Quy Trình Hoạt Động:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND: AdminShiftManagementPage mount                 │
│    - useShifts() hook tự động load                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND: Gọi shiftService.getCurrentOpen()              │
│    - GET /api/shifts/current                                │
│    - Token được tự động thêm vào header                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND: shiftService.getCurrentOpenShift()              │
│    - Query database: WHERE status = 'OPEN'                  │
│    - Nếu không tìm thấy → return null                      │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND: Controller check                                │
│    - Nếu shift === null → Trả 404                           │
│    - Response: { error: "Không có ca làm việc đang mở" }   │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND: Service catch 404                              │
│    - Return null (không throw error)                        │
│    - setCurrentShift(null)                                  │
│    - UI hiển thị: "Chưa có ca làm việc đang mở"             │
└─────────────────────────────────────────────────────────────┘
```

### **Cách Sử Dụng:**

1. **Mở ca làm việc mới:**
   - Click "Mở Ca Mới" button
   - Nhập tiền mở ca
   - Submit → Ca được tạo với status = 'OPEN'

2. **Đóng ca làm việc:**
   - Click "Đóng Ca" button
   - Nhập tiền đóng ca
   - Submit → Ca được cập nhật với status = 'CLOSED'

3. **Xem ca hiện tại:**
   - Nếu có ca đang mở → Hiển thị alert banner ở đầu trang
   - Nếu không có → 404 là bình thường, không cần lo lắng

---

## 🔗 Kết Nối Giữa Các Components

### **Customer Management Flow:**

```
AdminCustomerManagementPage
    ↓
useAuth() → AuthContext → localStorage token
    ↓
customerService.getAll() → api.service.ts
    ↓
axios → Backend API
    ↓
authenticate middleware → verifyToken()
    ↓
requireRole('ADMIN') → Check role
    ↓
customerController.getAll() → customerService.getAll()
    ↓
Prisma → Database (customers table)
```

### **Shift Management Flow:**

```
AdminShiftManagementPage
    ↓
useShifts() hook
    ↓
shiftService.getCurrentOpen() → api.service.ts
    ↓
axios → Backend API
    ↓
authenticate middleware → verifyToken()
    ↓
requireRole('ADMIN', 'STAFF') → Check role
    ↓
shiftController.getCurrentOpen() → shiftService.getCurrentOpenShift()
    ↓
Prisma → Database (shifts table WHERE status = 'OPEN')
```

---

## 🛠️ Đã Fix:

1. ✅ **Shift 404 Error:** 
   - Không còn log error khi không có ca mở
   - Service return null thay vì throw error

2. ✅ **API Error Logging:**
   - Không log 404 và 403 errors (đã được handle)

---

## 📝 Lưu Ý:

1. **403 Error:** Đảm bảo đăng nhập với ADMIN account
2. **404 Shift:** Đây là behavior bình thường, không phải lỗi
3. **Token:** Token được lưu trong localStorage, tự động thêm vào mọi API request
4. **Role Check:** Backend luôn verify role từ JWT token, không tin tưởng frontend



