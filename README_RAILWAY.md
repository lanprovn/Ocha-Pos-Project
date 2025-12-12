# 🚂 Sẵn sàng Deploy lên Railway!

Tất cả các file cần thiết đã được tạo sẵn. Bạn có thể bắt đầu deploy ngay bây giờ!

## 📦 Các file đã được tạo

### Dockerfiles
- ✅ `backend/Dockerfile` - Build backend với Node.js + Prisma
- ✅ `frontend/Dockerfile` - Build frontend với Vite + Nginx

### Cấu hình
- ✅ `frontend/nginx.conf` - Cấu hình Nginx cho SPA routing
- ✅ `.dockerignore` - Loại trừ files không cần thiết
- ✅ `backend/railway.json` - Cấu hình Railway cho backend
- ✅ `frontend/railway.json` - Cấu hình Railway cho frontend

### Scripts & Examples
- ✅ `backend/start.sh` - Script khởi động với migrations
- ✅ `backend/env.example.railway` - Ví dụ env vars cho backend
- ✅ `frontend/env.example.railway` - Ví dụ env vars cho frontend

### Tài liệu
- ✅ `RAILWAY_DEPLOY.md` - Hướng dẫn chi tiết từng bước
- ✅ `DEPLOY_CHECKLIST.md` - Checklist nhanh để deploy
- ✅ `README_RAILWAY.md` - File này

## 🚀 Bắt đầu deploy

### Bước nhanh:

1. **Đăng nhập Railway**: https://railway.app
2. **Tạo Project mới** → **New** → **Database** → **Add PostgreSQL**
3. **Deploy Backend**: 
   - **New** → **GitHub Repo** → Chọn repo
   - **Settings** → Root Directory = `backend`
   - Thêm environment variables (xem `backend/env.example.railway`)
   - Reference PostgreSQL → `DATABASE_URL`
4. **Deploy Frontend**:
   - **New** → **GitHub Repo** → Chọn repo  
   - **Settings** → Root Directory = `frontend`
   - Thêm environment variables (xem `frontend/env.example.railway`)
5. **Cập nhật CORS**: Cập nhật `FRONTEND_URL` và `BACKEND_URL` trong Backend

### Xem hướng dẫn chi tiết:
- 📖 **`RAILWAY_DEPLOY.md`** - Hướng dẫn đầy đủ từng bước
- ✅ **`DEPLOY_CHECKLIST.md`** - Checklist nhanh để theo dõi

## ⚠️ Lưu ý quan trọng

1. **JWT_SECRET**: Phải tạo một chuỗi ngẫu nhiên dài ít nhất 32 ký tự
2. **DATABASE_URL**: Railway tự động cung cấp khi bạn Reference PostgreSQL service
3. **Prisma Migrations**: Tự động chạy khi container start
4. **CORS**: Đảm bảo `FRONTEND_URL` trong Backend đúng với domain Frontend

## 🔑 Tạo JWT_SECRET

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Hoặc online:** https://www.random.org/strings/

## 📝 Environment Variables cần thiết

### Backend (Required)
- `DATABASE_URL` - Tự động từ PostgreSQL
- `JWT_SECRET` - Bắt buộc, ≥32 ký tự
- `FRONTEND_URL` - Domain của Frontend
- `BACKEND_URL` - Domain của Backend

### Frontend (Required)  
- `VITE_API_BASE_URL` - URL Backend API (có `/api` ở cuối)

Xem chi tiết trong `backend/env.example.railway` và `frontend/env.example.railway`

## ✅ Sau khi deploy

1. Kiểm tra Backend: `https://your-backend.railway.app/health`
2. Kiểm tra Frontend: `https://your-frontend.railway.app`
3. Kiểm tra API Docs: `https://your-backend.railway.app/api-docs`

## 🆘 Nếu gặp vấn đề

1. Xem logs trong **Deployments** tab trên Railway
2. Kiểm tra tất cả environment variables đã được set
3. Đảm bảo `DATABASE_URL` đã được Reference đúng
4. Xem troubleshooting trong `RAILWAY_DEPLOY.md`

---

**Chúc bạn deploy thành công! 🎉**

