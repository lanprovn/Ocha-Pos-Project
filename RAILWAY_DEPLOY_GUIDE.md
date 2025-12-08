# 🚀 Hướng Dẫn Deploy OCHA POS lên Railway

## ⚡ QUICK START (5 phút)

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### Bước 2: Tạo Project trên Railway

1. **Login Railway**: https://railway.app
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository **`Ocha-Pos-Project`**
5. Railway sẽ tự động detect và tạo project

---

### Bước 3: Add PostgreSQL Database

1. Trong project vừa tạo, click **"+ New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Đợi PostgreSQL khởi động (khoảng 1-2 phút)
4. ✅ Railway tự động tạo biến `DATABASE_URL`

---

### Bước 4: Deploy Backend

1. Click **"+ New"** → **"GitHub Repo"**
2. Chọn lại repository **`Ocha-Pos-Project`**
3. Railway sẽ tự detect `backend/railway.json`

**Cấu hình Settings:**

**Settings → Root Directory:**
```
backend
```

**Settings → Variables → Add các biến sau:**

```
NODE_ENV=production
PORT=${{PORT}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=ocha-pos-super-secret-jwt-key-2024-minimum-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-url.railway.app
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
LOG_LEVEL=info
```

**Lưu ý:** 
- `${{Postgres.DATABASE_URL}}` - Railway tự động lấy từ PostgreSQL service
- `${{RAILWAY_PUBLIC_DOMAIN}}` - Railway tự động set URL của backend
- `FRONTEND_URL` - Sẽ update sau khi có Frontend URL

4. Railway sẽ tự động deploy
5. ⏳ Đợi deploy xong (5-10 phút lần đầu)
6. ✅ Copy **Public URL** của Backend (ví dụ: `https://ocha-pos-backend.up.railway.app`)

---

### Bước 5: Deploy Frontend

1. Click **"+ New"** → **"GitHub Repo"**
2. Chọn lại repository **`Ocha-Pos-Project`**
3. Railway sẽ tự detect `frontend/railway.json`

**Cấu hình Settings:**

**Settings → Root Directory:**
```
frontend
```

**Settings → Variables → Add:**

```
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

**Lưu ý:** Thay `your-backend-url` bằng URL Backend vừa copy ở Bước 4

4. Railway sẽ tự động deploy
5. ⏳ Đợi deploy xong (5-10 phút lần đầu)
6. ✅ Copy **Public URL** của Frontend

---

### Bước 6: Update URLs (QUAN TRỌNG!)

**Backend Service → Settings → Variables:**

1. Update `FRONTEND_URL` = URL của Frontend (vừa copy ở Bước 5)
2. Update `BACKEND_URL` = URL của Backend (hoặc giữ `${{RAILWAY_PUBLIC_DOMAIN}}`)

**Frontend Service → Settings → Variables:**

1. Update `VITE_API_BASE_URL` = `https://your-backend-url.railway.app/api`

**Redeploy cả 2 services:**

1. Vào Backend Service → **Deployments** → Click **"Redeploy"**
2. Vào Frontend Service → **Deployments** → Click **"Redeploy"**

---

### Bước 7: Seed Database (Optional - Khuyến nghị)

**Cách 1: Dùng Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project (chọn project vừa tạo)
railway link

# Run seed
railway run --service backend npm run prisma:seed
```

**Cách 2: Dùng Railway Dashboard**

1. Vào Backend Service → **Deployments**
2. Click vào deployment mới nhất
3. Click **"View Logs"**
4. Hoặc dùng **"Shell"** tab để chạy command:
   ```bash
   npm run prisma:seed
   ```

---

## ✅ Checklist Deploy

- [ ] Đã push code lên GitHub
- [ ] Đã tạo Railway project
- [ ] Đã add PostgreSQL database
- [ ] Đã deploy Backend service
- [ ] Đã deploy Frontend service
- [ ] Đã config environment variables
- [ ] Đã update URLs trong env vars
- [ ] Đã redeploy cả 2 services
- [ ] Đã seed database (optional)
- [ ] Đã test health check: `https://backend-url/health`
- [ ] Đã test frontend: `https://frontend-url`

---

## 🧪 Test Sau Khi Deploy

### 1. Health Check
```
https://your-backend-url.railway.app/health
```
Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

### 2. API Documentation
```
https://your-backend-url.railway.app/api-docs
```

### 3. Frontend
```
https://your-frontend-url.railway.app
```

### 4. Test Login
- **Staff**: `staff@ocha.com` / `staff123`
- **Admin**: `admin@ocha.com` / `admin123`

---

## 🔧 Troubleshooting

### Backend không start

**Kiểm tra:**
1. Logs trong Railway dashboard → Backend Service → Deployments → View Logs
2. `DATABASE_URL` đã được set chưa
3. Migrations có chạy thành công không (xem logs)

**Fix:**
- Kiểm tra PostgreSQL service đang running
- Kiểm tra `DATABASE_URL` format đúng
- Redeploy Backend service

### Frontend không kết nối Backend

**Kiểm tra:**
1. `VITE_API_BASE_URL` đúng chưa
2. Backend đang chạy chưa (test `/health`)
3. CORS trong Backend (kiểm tra `FRONTEND_URL`)

**Fix:**
- Update `VITE_API_BASE_URL` = `https://backend-url/api`
- Update `FRONTEND_URL` trong Backend = Frontend URL
- Redeploy cả 2 services

### Database connection failed

**Kiểm tra:**
1. PostgreSQL service đang running
2. `DATABASE_URL` format đúng
3. Migrations đã chạy chưa

**Fix:**
- Kiểm tra PostgreSQL service status
- Redeploy Backend để chạy migrations
- Xem logs để biết lỗi cụ thể

### Build failed

**Kiểm tra:**
1. Logs trong Railway dashboard
2. Dependencies có đầy đủ không
3. Build command đúng chưa

**Fix:**
- Kiểm tra `package.json` có đầy đủ dependencies
- Kiểm tra `railway.json` build command đúng
- Redeploy service

---

## 📝 Environment Variables Reference

### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | ✅ | Environment | `production` |
| `PORT` | ✅ | Server port | `${{PORT}}` (Railway auto) |
| `DATABASE_URL` | ✅ | PostgreSQL URL | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | ✅ | JWT secret (min 32 chars) | `your-secret-key...` |
| `JWT_EXPIRES_IN` | ❌ | JWT expiry | `7d` |
| `FRONTEND_URL` | ✅ | Frontend URL | `https://frontend.railway.app` |
| `BACKEND_URL` | ✅ | Backend URL | `${{RAILWAY_PUBLIC_DOMAIN}}` |
| `LOG_LEVEL` | ❌ | Log level | `info` |

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | ✅ | Backend API URL | `https://backend.railway.app/api` |

---

## 🎯 Tips

1. **JWT_SECRET**: Đổi thành secret key mạnh (tối thiểu 32 ký tự)
2. **URLs**: Cập nhật sau khi có Public URLs từ Railway
3. **Database**: Migrations tự động chạy trong start command
4. **Build time**: Lần đầu có thể mất 5-10 phút
5. **Free tier**: Railway có free tier, nhưng có giới hạn
6. **Custom domain**: Có thể thêm custom domain trong Settings

---

## 🆘 Cần Giúp Đỡ?

Nếu gặp vấn đề:
1. Kiểm tra logs trong Railway dashboard
2. Kiểm tra environment variables
3. Test health check endpoint
4. Redeploy services

**Good luck với báo cáo ngày mai! 🎉**

