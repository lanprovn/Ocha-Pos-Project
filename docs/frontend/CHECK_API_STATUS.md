# 🔍 Cách Kiểm Tra Frontend Đang Dùng Backend Hay Mock Data

## 📋 Cách 1: Kiểm Tra Console (F12)

### Bước 1: Mở DevTools
- Nhấn `F12` hoặc `Right-click → Inspect`
- Vào tab **Console**

### Bước 2: Tìm log
Tìm dòng này:
```
Loading products from API...
```

**Nếu có log này:**
- ✅ Frontend đang gọi API (Backend)
- ✅ Hoặc đã gọi xong và load thành công

**Nếu KHÔNG có log này:**
- ⚠️ Frontend đang dùng mock data
- ⚠️ Hoặc API đã load từ trước (check Network tab)

---

## 📋 Cách 2: Kiểm Tra Network Tab (Chính xác nhất)

### Bước 1: Mở DevTools
- Nhấn `F12`
- Vào tab **Network**

### Bước 2: Reload trang
- Nhấn `F5` hoặc `Ctrl+R` để reload

### Bước 3: Tìm request
Tìm request có tên:
```
products
```
hoặc
```
api/products
```

**Nếu thấy request này:**
- ✅ **Status 200** → Đang dùng Backend (thành công)
- ❌ **Status 404/500** → Backend lỗi, đã fallback về mock data
- ❌ **Status (failed)** → Backend không kết nối được, đã fallback về mock data

**Nếu KHÔNG thấy request này:**
- ⚠️ Frontend đang dùng mock data (không gọi API)

---

## 📋 Cách 3: Kiểm Tra File .env.local

### Bước 1: Mở file
```
frontend/.env.local
```

### Bước 2: Xem giá trị
Tìm dòng:
```
VITE_USE_API=true
```

**Nếu `VITE_USE_API=true`:**
- ✅ Frontend sẽ gọi API (nếu backend chạy)
- ⚠️ Nếu backend không chạy → tự động fallback về mock data

**Nếu `VITE_USE_API=false`:**
- ⚠️ Frontend đang dùng mock data (không gọi API)

**Nếu file không tồn tại:**
- ⚠️ Frontend sẽ dùng mock data (mặc định)

---

## 📋 Cách 4: Kiểm Tra Backend

### Test Backend trực tiếp:
Mở browser và truy cập:
```
http://localhost:8080/api/products
```

**Nếu thấy danh sách products (JSON):**
- ✅ Backend đang chạy và có data
- ✅ Frontend có thể gọi API

**Nếu thấy lỗi hoặc không có response:**
- ❌ Backend chưa chạy hoặc lỗi
- ⚠️ Frontend sẽ fallback về mock data

---

## 🎯 Tóm Tắt

| Dấu hiệu | Kết luận |
|----------|----------|
| Console có "Loading products from API..." | ✅ Đang gọi API |
| Network tab có request `/api/products` status 200 | ✅ Đang dùng Backend |
| Network tab KHÔNG có request `/api/products` | ⚠️ Đang dùng Mock Data |
| `.env.local` có `VITE_USE_API=true` | ✅ Cấu hình để dùng API |
| `.env.local` có `VITE_USE_API=false` | ⚠️ Cấu hình để dùng Mock Data |
| Backend không chạy | ⚠️ Frontend tự động fallback về Mock Data |

---

## 💡 Lưu ý

- Frontend **tự động fallback** về mock data nếu API lỗi
- Có thể vừa có API request vừa có mock data (nếu API trả về rỗng)
- Kiểm tra **Network tab** là cách chính xác nhất

---

**Cách nhanh nhất: Mở Network tab (F12) → Reload trang → Tìm request `/api/products`**

