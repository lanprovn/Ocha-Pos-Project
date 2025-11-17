# 🔗 Hướng dẫn Kết nối Frontend với Backend

## ✅ Đã hoàn thành

### 1. API Service Layer
- ✅ `src/config/api.ts` - Cấu hình API endpoints
- ✅ `src/services/api.service.ts` - Axios client với interceptors
- ✅ `src/services/product.service.ts` - Product & Category services

### 2. ProductContext Integration
- ✅ Cập nhật `ProductContext` để gọi API thay vì mock data
- ✅ Tự động fallback về mock data nếu API lỗi
- ✅ Transform data từ backend format sang frontend format

### 3. Environment Configuration
- ✅ `.env.local` - Cấu hình API base URL

---

## 🚀 Cách sử dụng

### Bước 1: Đảm bảo Backend đang chạy

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:8080`

### Bước 2: Cấu hình Frontend

File `.env.local` đã được tạo với:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true
```

Nếu muốn dùng mock data (tắt API):
```env
VITE_USE_API=false
```

### Bước 3: Khởi động Frontend

```bash
cd frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:3000` (hoặc port khác nếu 3000 bận)

---

## 🔍 Kiểm tra kết nối

### 1. Mở Browser Console

Khi load trang, bạn sẽ thấy:
```
Loading products from API...
```

Nếu thành công:
- Products sẽ được load từ backend
- Categories sẽ được load từ backend

Nếu lỗi:
- Sẽ tự động fallback về mock data
- Console sẽ hiển thị error message

### 2. Test API trực tiếp

Mở browser và truy cập:
```
http://localhost:8080/api/products
http://localhost:8080/api/categories
```

### 3. Kiểm tra Network Tab

Mở DevTools (F12) → Network tab:
- Xem request đến `http://localhost:8080/api/products`
- Kiểm tra response status (200 = OK)

---

## 🐛 Troubleshooting

### Lỗi: "Network error"
**Nguyên nhân:** Backend chưa chạy hoặc CORS issue

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:8080/health`
2. Kiểm tra CORS config trong `backend/src/app.ts`
3. Kiểm tra `VITE_API_BASE_URL` trong `.env.local`

### Lỗi: "CORS policy"
**Nguyên nhân:** Backend chưa cho phép frontend origin

**Giải pháp:**
- Backend đã config CORS cho `http://localhost:3000` và `http://localhost:5173`
- Nếu frontend chạy port khác, cập nhật `FRONTEND_URL` trong `backend/.env`

### Lỗi: "404 Not Found"
**Nguyên nhân:** API endpoint không đúng

**Giải pháp:**
- Kiểm tra `VITE_API_BASE_URL` trong `.env.local`
- Đảm bảo backend routes đúng: `/api/products`, `/api/categories`

### Fallback về Mock Data
**Nguyên nhân:** API lỗi hoặc backend chưa chạy

**Giải pháp:**
- Kiểm tra backend logs
- Kiểm tra database đã seed chưa: `npm run prisma:seed`
- Kiểm tra network connection

---

## 📊 Data Flow

```
Frontend (React)
  ↓
ProductContext.loadProducts()
  ↓
productService.getAll() / categoryService.getAll()
  ↓
apiClient (Axios)
  ↓
Backend API (Express)
  ↓
Prisma → PostgreSQL
  ↓
Response (JSON)
  ↓
Transform to Frontend Format
  ↓
Update State (setProducts, setCategories)
```

---

## 🔄 Chuyển đổi giữa API và Mock Data

### Dùng API (Mặc định)
```env
VITE_USE_API=true
```

### Dùng Mock Data
```env
VITE_USE_API=false
```

Hoặc comment trong `ProductContext.tsx`:
```typescript
const USE_API = false; // Dùng mock data
```

---

## 📝 Next Steps

### 1. Cập nhật các pages khác
- Orders page → Gọi API orders
- Dashboard page → Gọi API dashboard stats
- Stock page → Gọi API stock

### 2. Thêm Error Handling
- Toast notifications cho errors
- Retry logic
- Loading states

### 3. Thêm Authentication (nếu cần)
- Login/Register
- JWT token storage
- Protected routes

---

## ✅ Checklist

- [x] API service layer đã tạo
- [x] ProductContext đã cập nhật
- [x] Environment config đã setup
- [x] Error handling với fallback
- [ ] Test với backend thực tế
- [ ] Cập nhật các pages khác
- [ ] Thêm loading states
- [ ] Thêm error notifications

---

**Chúc bạn kết nối thành công! 🎉**

