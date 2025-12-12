# ✅ Checklist Deploy Railway - Quick Reference

## 📦 Files đã được tạo

- [x] `backend/Dockerfile`
- [x] `frontend/Dockerfile`
- [x] `frontend/nginx.conf`
- [x] `.dockerignore`
- [x] `backend/railway.json`
- [x] `frontend/railway.json`
- [x] `backend/start.sh`
- [x] `backend/env.example.railway`
- [x] `frontend/env.example.railway`
- [x] `RAILWAY_DEPLOY.md` (hướng dẫn chi tiết)

## 🚀 Các bước deploy nhanh

### 1. Tạo Database
- [ ] Login Railway → New Project
- [ ] New → Database → Add PostgreSQL
- [ ] Copy `DATABASE_URL` (Railway tự động cung cấp)

### 2. Deploy Backend
- [ ] New → GitHub Repo → Chọn repo
- [ ] Settings → Root Directory = `backend`
- [ ] Variables → Thêm:
  - `NODE_ENV=production`
  - `PORT=8080`
  - `JWT_SECRET=<tạo_chuỗi_32_ký_tự_trở_lên>`
  - `JWT_EXPIRES_IN=7d`
  - `LOG_LEVEL=info`
- [ ] Variables → Reference → Chọn PostgreSQL → `DATABASE_URL`
- [ ] Settings → Networking → Generate Domain
- [ ] Copy Backend domain: `https://xxx.railway.app`

### 3. Deploy Frontend
- [ ] New → GitHub Repo → Chọn repo
- [ ] Settings → Root Directory = `frontend`
- [ ] Variables → Thêm:
  - `VITE_API_BASE_URL=https://xxx.railway.app/api` (domain backend ở trên)
  - `VITE_USE_API=true`
  - `VITE_APP_NAME=Ocha Việt POS`
  - `VITE_APP_VERSION=1.0.0`
  - `VITE_APP_ENV=production`
- [ ] Settings → Networking → Generate Domain
- [ ] Copy Frontend domain: `https://yyy.railway.app`

### 4. Cập nhật CORS
- [ ] Backend → Variables → Cập nhật:
  - `FRONTEND_URL=https://yyy.railway.app` (domain frontend)
  - `BACKEND_URL=https://xxx.railway.app` (domain backend)

### 5. Kiểm tra
- [ ] Backend health: `https://xxx.railway.app/health`
- [ ] Frontend: `https://yyy.railway.app`
- [ ] Kiểm tra Console (F12) không có lỗi

## 🔑 Tạo JWT_SECRET

Chạy một trong các lệnh sau để tạo JWT_SECRET:

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online:**
- https://www.random.org/strings/
- Chọn: 32 characters, alphanumeric

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Lưu ý quan trọng

1. ✅ `DATABASE_URL` được Railway tự động thêm khi bạn Reference PostgreSQL service
2. ✅ Prisma migrations tự động chạy khi container start (theo Dockerfile)
3. ✅ CORS đã được cấu hình để chấp nhận `FRONTEND_URL`
4. ✅ Frontend build với `VITE_API_BASE_URL` được embed vào code
5. ⚠️ JWT_SECRET phải dài ít nhất 32 ký tự
6. ⚠️ Đừng commit `.env` files vào Git

## 🆘 Nếu gặp lỗi

1. Kiểm tra logs trong **Deployments** tab
2. Đảm bảo tất cả environment variables đã được set
3. Kiểm tra `DATABASE_URL` đã được Reference đúng
4. Xem chi tiết trong `RAILWAY_DEPLOY.md`

