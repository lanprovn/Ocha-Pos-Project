# 🚀 Hướng dẫn Deploy OCHA POS lên Railway

## ✅ Các file đã được tạo sẵn

- ✅ `backend/Dockerfile` - Build image cho backend
- ✅ `frontend/Dockerfile` - Build image cho frontend  
- ✅ `frontend/nginx.conf` - Cấu hình nginx cho frontend
- ✅ `.dockerignore` - Loại trừ files không cần thiết khi build Docker
- ✅ `backend/railway.json` - Cấu hình Railway cho backend
- ✅ `frontend/railway.json` - Cấu hình Railway cho frontend
- ✅ `backend/start.sh` - Script khởi động backend với migrations
- ✅ `backend/env.example.railway` - Ví dụ environment variables cho backend
- ✅ `frontend/env.example.railway` - Ví dụ environment variables cho frontend

## 📋 Checklist trước khi deploy

- [ ] Code đã được push lên GitHub/GitLab
- [ ] Đã có tài khoản Railway (https://railway.app)
- [ ] Đã chuẩn bị JWT_SECRET (chuỗi ngẫu nhiên dài ít nhất 32 ký tự)
- [ ] Đã có tài khoản Cloudinary (khuyến nghị cho production)

## 🗄️ Bước 1: Tạo PostgreSQL Database trên Railway

1. Đăng nhập vào Railway: https://railway.app
2. Tạo **New Project** (hoặc chọn project có sẵn)
3. Trong project, click **New** → **Database** → **Add PostgreSQL**
4. Railway sẽ tự động tạo database và cung cấp `DATABASE_URL`
5. **Lưu ý**: `DATABASE_URL` sẽ được tự động thêm vào environment variables của các service khác khi bạn kết nối

## 🔧 Bước 2: Deploy Backend Service

### 2.1. Tạo Backend Service

1. Trong project Railway, click **New** → **GitHub Repo** (hoặc **Empty Service**)
2. Nếu chọn GitHub Repo:
   - Chọn repository của bạn
   - Railway sẽ tự động detect Dockerfile
3. Nếu chọn Empty Service:
   - Click vào service → **Settings**
   - Chọn **Source** → **Connect GitHub Repo**
   - Chọn repository của bạn

### 2.2. Cấu hình Backend Service

1. Vào **Settings** của Backend service
2. Đặt **Root Directory** = `backend`
3. Railway sẽ tự động detect `backend/Dockerfile`
4. Hoặc trong **Deploy** tab, chọn:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `backend/Dockerfile`

### 2.3. Kết nối Database với Backend

1. Vào Backend service → **Variables** tab
2. Click **New Variable** → **Reference** 
3. Chọn PostgreSQL service → chọn `DATABASE_URL`
4. Railway sẽ tự động thêm `DATABASE_URL` vào environment variables

### 2.4. Thiết lập Environment Variables cho Backend

Vào Backend service → **Variables** tab, thêm các biến sau:

```env
NODE_ENV=production
PORT=8080
JWT_SECRET=<tạo_một_chuỗi_ngẫu_nhiên_dài_ít_nhất_32_ký_tự>
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
FRONTEND_URL=<sẽ_cập_nhật_sau_khi_deploy_frontend>
BACKEND_URL=<sẽ_cập_nhật_sau_khi_deploy_backend>
```

**Lưu ý quan trọng về JWT_SECRET:**
- Tạo một chuỗi ngẫu nhiên mạnh, ít nhất 32 ký tự
- Có thể dùng lệnh: `openssl rand -base64 32` hoặc tạo online
- **KHÔNG BAO GIỜ** commit JWT_SECRET vào Git!

**Cloudinary (Optional nhưng khuyến nghị):**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2.5. Deploy Backend

1. Railway sẽ tự động build và deploy khi bạn push code lên GitHub
2. Hoặc click **Deploy** để trigger build thủ công
3. Xem logs trong **Deployments** tab để theo dõi quá trình build
4. Prisma migrations sẽ tự động chạy khi container start (theo Dockerfile CMD)

### 2.6. Lấy Domain của Backend

1. Sau khi deploy thành công, vào **Settings** → **Networking**
2. Click **Generate Domain** để tạo public domain
3. Copy domain này (ví dụ: `your-backend-app.railway.app`)
4. Domain này sẽ được dùng cho `BACKEND_URL` và `VITE_API_BASE_URL`

## 🎨 Bước 3: Deploy Frontend Service

### 3.1. Tạo Frontend Service

1. Trong cùng project, click **New** → **GitHub Repo** (hoặc **Empty Service**)
2. Chọn cùng repository nhưng sẽ cấu hình khác

### 3.2. Cấu hình Frontend Service

1. Vào **Settings** của Frontend service
2. Đặt **Root Directory** = `frontend`
3. Railway sẽ tự động detect `frontend/Dockerfile`
4. Hoặc trong **Deploy** tab, chọn:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `frontend/Dockerfile`

### 3.3. Thiết lập Environment Variables cho Frontend

Vào Frontend service → **Variables** tab, thêm:

```env
VITE_API_BASE_URL=https://your-backend-app.railway.app/api
VITE_USE_API=true
VITE_APP_NAME=Ocha Việt POS
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

**Lưu ý**: Thay `your-backend-app.railway.app` bằng domain thực tế của Backend service bạn đã lấy ở bước 2.6

### 3.4. Deploy Frontend

1. Railway sẽ tự động build và deploy khi bạn push code
2. Hoặc click **Deploy** để trigger build thủ công
3. Xem logs trong **Deployments** tab

### 3.5. Lấy Domain của Frontend

1. Sau khi deploy thành công, vào **Settings** → **Networking**
2. Click **Generate Domain** để tạo public domain
3. Copy domain này (ví dụ: `your-frontend-app.railway.app`)

## 🔄 Bước 4: Cập nhật CORS và URLs

### 4.1. Cập nhật Backend Environment Variables

1. Vào Backend service → **Variables**
2. Cập nhật:
   - `FRONTEND_URL` = domain của Frontend (ví dụ: `https://your-frontend-app.railway.app`)
   - `BACKEND_URL` = domain của Backend (ví dụ: `https://your-backend-app.railway.app`)
3. Railway sẽ tự động redeploy khi bạn thay đổi environment variables

### 4.2. Kiểm tra CORS

Backend đã được cấu hình để chấp nhận requests từ `FRONTEND_URL`. Đảm bảo domain Frontend đã được thêm vào.

## 🌱 Bước 5: Seed Database (Tùy chọn)

Nếu bạn muốn seed database với dữ liệu mẫu:

1. Vào Backend service → **Deployments** → chọn deployment mới nhất
2. Click **View Logs**
3. Hoặc dùng Railway CLI:
   ```bash
   railway login
   railway link
   railway run --service backend npm run prisma:seed
   ```

## ✅ Bước 6: Kiểm tra Deployment

### 6.1. Kiểm tra Backend

1. Mở trình duyệt và truy cập: `https://your-backend-app.railway.app/health`
2. Bạn sẽ thấy response:
   ```json
   {
     "status": "ok",
     "timestamp": "...",
     "database": "connected"
   }
   ```
3. Kiểm tra API docs: `https://your-backend-app.railway.app/api-docs`

### 6.2. Kiểm tra Frontend

1. Mở trình duyệt và truy cập domain của Frontend
2. Ứng dụng sẽ tự động kết nối với Backend API
3. Kiểm tra Console (F12) để đảm bảo không có lỗi CORS

## 🔍 Troubleshooting

### Backend không start được

1. Kiểm tra logs trong **Deployments** tab
2. Đảm bảo `DATABASE_URL` đã được kết nối đúng
3. Đảm bảo `JWT_SECRET` đã được set và đủ dài (≥32 ký tự)
4. Kiểm tra Prisma migrations có chạy thành công không

### Frontend không kết nối được Backend

1. Kiểm tra `VITE_API_BASE_URL` có đúng domain của Backend không
2. Kiểm tra CORS: `FRONTEND_URL` trong Backend có đúng domain Frontend không
3. Kiểm tra Console (F12) để xem lỗi cụ thể

### Database connection errors

1. Đảm bảo PostgreSQL service đã được tạo và running
2. Kiểm tra `DATABASE_URL` trong Backend Variables
3. Kiểm tra Prisma migrations đã chạy thành công

### Build errors

1. Kiểm tra logs trong **Deployments** tab
2. Đảm bảo tất cả dependencies đã được cài đặt đúng
3. Kiểm tra Dockerfile có đúng path không

## 📝 Environment Variables Summary

### Backend (Required)
- `DATABASE_URL` - Tự động từ PostgreSQL service
- `JWT_SECRET` - Bắt buộc, ít nhất 32 ký tự
- `FRONTEND_URL` - Domain của Frontend
- `BACKEND_URL` - Domain của Backend

### Backend (Optional)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `BANK_CODE`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_NAME`

### Frontend (Required)
- `VITE_API_BASE_URL` - URL của Backend API (phải có `/api` ở cuối)

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước trên, ứng dụng của bạn sẽ chạy trên Railway!

**Lưu ý**: Railway có free tier với giới hạn nhất định. Nếu bạn cần nhiều tài nguyên hơn, có thể upgrade plan.

## 📚 Tài liệu tham khảo

- Railway Docs: https://docs.railway.app
- Prisma Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/

