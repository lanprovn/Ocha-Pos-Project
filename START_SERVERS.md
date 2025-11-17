# 🚀 Hướng Dẫn Khởi Động Servers

## 📋 Tổng Quan

Project này có 2 servers riêng biệt:
- **Backend**: Chạy trên port `8080`
- **Frontend**: Chạy trên port `3000`

---

## 🔧 Cách Khởi Động

### Option 1: Chạy từng server riêng (Khuyến nghị)

#### 1. Khởi động Backend Server

Mở terminal thứ nhất:

```powershell
cd backend
npm run dev
```

Bạn sẽ thấy:
```
✅ Database connected
🚀 Server is running on http://localhost:8080
📁 API Base URL: http://localhost:8080/api
🔌 Socket.io is ready on http://localhost:8080
```

#### 2. Khởi động Frontend Server

Mở terminal thứ hai:

```powershell
cd frontend
npm run dev
```

Bạn sẽ thấy:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

### Option 2: Chạy cả 2 servers cùng lúc (PowerShell)

Tạo file `start-all.ps1` trong thư mục root:

```powershell
# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

Sau đó chạy:
```powershell
.\start-all.ps1
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Luôn chạy Backend trước Frontend**
   - Backend phải chạy trước để frontend có thể kết nối
   - Nếu frontend chạy trước, bạn sẽ thấy lỗi `ERR_CONNECTION_REFUSED`

2. **Kiểm tra Database**
   - Đảm bảo PostgreSQL đang chạy
   - Kiểm tra file `.env` trong `backend/` có đúng không

3. **Kiểm tra Ports**
   - Backend: Port `8080` phải trống
   - Frontend: Port `3000` phải trống
   - Nếu port bị chiếm, đổi port trong config

---

## 🔍 Kiểm Tra Servers Đã Chạy

### Backend
- Mở browser: `http://localhost:8080/health`
- Kết quả: `{"status":"ok","timestamp":"..."}`

### Frontend
- Mở browser: `http://localhost:3000`
- Kết quả: Trang login hoặc POS system

---

## 🐛 Troubleshooting

### Lỗi: `ERR_CONNECTION_REFUSED`
- **Nguyên nhân**: Backend chưa chạy hoặc đã tắt
- **Giải pháp**: Khởi động lại backend server

### Lỗi: `Database connection failed`
- **Nguyên nhân**: PostgreSQL chưa chạy hoặc DATABASE_URL sai
- **Giải pháp**: 
  1. Kiểm tra PostgreSQL service đang chạy
  2. Kiểm tra file `backend/.env` có đúng `DATABASE_URL` không

### Lỗi: `Port already in use`
- **Nguyên nhân**: Port đã bị process khác sử dụng
- **Giải pháp**: 
  1. Tìm process đang dùng port: `netstat -ano | findstr :8080`
  2. Kill process: `taskkill /PID <PID> /F`
  3. Hoặc đổi port trong config

---

## 📝 Quick Commands

```powershell
# Backend only
cd backend
npm run dev

# Frontend only
cd frontend
npm run dev

# Build Backend (production)
cd backend
npm run build
npm start

# Build Frontend (production)
cd frontend
npm run build
npm run preview
```

---

## ✅ Checklist Trước Khi Chạy

- [ ] PostgreSQL đang chạy
- [ ] File `backend/.env` đã được tạo và cấu hình đúng
- [ ] File `frontend/.env.local` đã được tạo (nếu cần)
- [ ] Đã chạy `npm install` trong cả `backend/` và `frontend/`
- [ ] Đã chạy `npm run prisma:generate` trong `backend/` (nếu cần)
- [ ] Đã chạy `npm run prisma:migrate` trong `backend/` (nếu cần)

---

## 🎯 Sau Khi Khởi Động Thành Công

1. **Backend**: `http://localhost:8080/health` ✅
2. **Frontend**: `http://localhost:3000` ✅
3. **Login**: 
   - Staff: `staff@ocha.com` / `staff123`
   - Admin: `admin@ocha.com` / `admin123`

---

**Lưu ý**: Không chạy `npm run dev` ở thư mục root vì không có `package.json` ở đó!

