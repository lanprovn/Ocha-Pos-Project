# 🔧 HƯỚNG DẪN KHỞI ĐỘNG BACKEND

## ❌ Vấn đề hiện tại
Backend server không chạy, dẫn đến lỗi `ERR_CONNECTION_REFUSED` khi frontend cố gắng kết nối.

## ✅ Giải pháp

### Cách 1: Sử dụng script tự động (Khuyến nghị)

1. **Mở PowerShell** trong thư mục root của project
2. **Chạy script:**
   ```powershell
   .\check-and-start-backend.ps1
   ```

Script sẽ tự động:
- ✅ Kiểm tra backend có đang chạy không
- ✅ Kiểm tra và tạo file .env nếu cần
- ✅ Cài đặt dependencies nếu chưa có
- ✅ Generate Prisma client
- ✅ Khởi động backend server

### Cách 2: Khởi động thủ công

#### Bước 1: Kiểm tra file .env
```powershell
cd backend
```

Nếu chưa có file `.env`, tạo từ `.env.example`:
```powershell
.\create-env.ps1
```

**QUAN TRỌNG:** Sau khi tạo file `.env`, bạn CẦN cập nhật các giá trị sau:
- `DATABASE_URL` - URL kết nối database PostgreSQL
- `JWT_SECRET` - Secret key cho JWT (ít nhất 32 ký tự)

#### Bước 2: Cài đặt dependencies (nếu chưa có)
```powershell
npm install
```

#### Bước 3: Generate Prisma Client
```powershell
npx prisma generate
```

#### Bước 4: Khởi động backend
```powershell
npm run dev
```

### Cách 3: Sử dụng script START_ALL.ps1 (Khởi động cả Backend và Frontend)

```powershell
.\START_ALL.ps1
```

## 🔍 Kiểm tra Backend đã chạy

Sau khi khởi động, kiểm tra:

1. **Health Check:**
   - Mở browser: http://localhost:8080/health
   - Nếu thấy JSON response với `status: "ok"` → Backend đã chạy ✅

2. **API Documentation:**
   - Mở browser: http://localhost:8080/api-docs
   - Nếu thấy Swagger UI → Backend đã chạy ✅

3. **Kiểm tra trong PowerShell:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing
   ```

## ⚠️ Lưu ý quan trọng

1. **Database phải chạy trước:**
   - Đảm bảo PostgreSQL đang chạy
   - Kiểm tra `DATABASE_URL` trong file `.env` đúng chưa

2. **Port 8080 phải trống:**
   - Nếu port 8080 đã được sử dụng, thay đổi `PORT` trong file `.env`

3. **File .env phải có đầy đủ:**
   - `DATABASE_URL`
   - `JWT_SECRET` (ít nhất 32 ký tự)
   - Các biến khác có thể dùng giá trị mặc định

## 🐛 Troubleshooting

### Lỗi: "Cannot find module"
```powershell
cd backend
npm install
```

### Lỗi: "Prisma Client not generated"
```powershell
cd backend
npx prisma generate
```

### Lỗi: "Database connection failed"
- Kiểm tra PostgreSQL có đang chạy không
- Kiểm tra `DATABASE_URL` trong `.env` đúng chưa
- Thử kết nối database bằng pgAdmin hoặc psql

### Lỗi: "Port 8080 already in use"
- Tìm process đang dùng port 8080:
  ```powershell
  netstat -ano | findstr :8080
  ```
- Hoặc thay đổi PORT trong file `.env`

## 📝 Sau khi backend chạy thành công

1. Backend sẽ chạy tại: **http://localhost:8080**
2. Frontend sẽ tự động kết nối được
3. Kiểm tra Console trong browser DevTools - không còn lỗi `ERR_CONNECTION_REFUSED`

## 🚀 Quick Start (Tất cả trong một)

```powershell
# Từ thư mục root
.\START_ALL.ps1
```

Script này sẽ tự động:
1. Tạo `.env.local` cho frontend
2. Khởi động backend
3. Đợi backend sẵn sàng
4. Khởi động frontend

