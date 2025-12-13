# Hướng dẫn Deploy Ocha-POS lên Railway

## 📋 Yêu cầu trước khi deploy

1. ✅ Code đã được push lên GitHub
2. ✅ Có tài khoản Railway (https://railway.app)
3. ✅ Đã chuẩn bị JWT_SECRET (ít nhất 32 ký tự)

---

## 🚀 Bước 1: Tạo Project trên Railway

1. Đăng nhập vào Railway: https://railway.app
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository của bạn
5. Railway sẽ tự động detect và tạo service đầu tiên

---

## 🗄️ Bước 2: Tạo PostgreSQL Database

1. Trong project vừa tạo, click **"New"**
2. Chọn **"Database"** → **"Add PostgreSQL"**
3. Railway sẽ tự động tạo database và cung cấp biến môi trường `DATABASE_URL`

**Lưu ý:** Copy `DATABASE_URL` để dùng cho backend sau này (hoặc Railway sẽ tự động inject)

---

## 🔧 Bước 3: Deploy Backend

### 3.1. Tạo Backend Service

1. Trong project, click **"New"** → **"GitHub Repo"**
2. Chọn lại repository của bạn
3. Railway sẽ hỏi **"Configure Service"**:
   - **Root Directory:** Chọn `backend`
   - **Build Command:** (để trống, Dockerfile sẽ tự build)
   - **Start Command:** `npm run start`

**QUAN TRỌNG - Nếu gặp lỗi "No workspaces found":**

Railway đang build từ root directory thay vì từ `backend`. Cần kiểm tra và sửa:

1. Vào **Settings** → **Service** (hoặc **General**)
2. Kiểm tra **Root Directory** phải là `backend` (KHÔNG phải để trống hoặc `/`)
3. Nếu Root Directory sai, sửa lại thành `backend` và Save
4. Vào **Settings** → **Build**
5. **Bắt buộc** chọn **"Dockerfile"** làm builder (KHÔNG dùng Nixpacks hoặc Auto-detect)
6. Đảm bảo **Dockerfile Path** là `Dockerfile` (hoặc để trống)
7. **Xóa** Build Command nếu có (để Dockerfile tự build)
8. Save và Redeploy

### 3.2. Cấu hình Environment Variables

Vào **Settings** → **Variables**, thêm các biến sau:

```
NODE_ENV=production
PORT=8080
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<your-secret-key-at-least-32-characters>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.railway.app
BACKEND_URL=https://your-backend-domain.railway.app
LOG_LEVEL=info
```

**Lưu ý:**
- `DATABASE_URL` sẽ tự động được Railway inject từ PostgreSQL service
- `FRONTEND_URL` và `BACKEND_URL` sẽ được cập nhật sau khi deploy xong
- `JWT_SECRET` nên là một chuỗi ngẫu nhiên dài (có thể dùng: `openssl rand -base64 32`)

### 3.3. Chạy Database Migrations

Sau khi backend deploy xong, cần chạy migrations:

**Cách 1: Dùng Railway CLI (Khuyến nghị)**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Chọn backend service
cd backend

# Run migrations
railway run npx prisma migrate deploy
railway run npx prisma generate
```

**Cách 2: Dùng Railway Dashboard**

1. Vào Backend service → **Deployments** → chọn deployment mới nhất
2. Mở tab **Logs**
3. Hoặc vào **Settings** → **Deploy** → thêm vào **Start Command**:
   ```
   npx prisma migrate deploy && npx prisma generate && npm run start
   ```

### 3.4. Lấy Backend URL

Sau khi deploy xong:
1. Vào Backend service → **Settings** → **Networking**
2. Click **"Generate Domain"** (nếu chưa có)
3. Copy URL (ví dụ: `https://your-backend.railway.app`)

---

## 🎨 Bước 4: Deploy Frontend

### 4.1. Tạo Frontend Service

1. Trong project, click **"New"** → **"GitHub Repo"**
2. Chọn lại repository của bạn
3. Railway sẽ hỏi **"Configure Service"**:
   - **Root Directory:** Chọn `frontend`
   - **Build Command:** (để trống, Dockerfile sẽ tự build)
   - **Start Command:** (PHẢI để trống hoặc xóa hẳn - Dockerfile đã có CMD để chạy nginx)

**QUAN TRỌNG - Nếu gặp lỗi "No workspaces found" hoặc "Missing script: start":**

Railway đang build từ root directory hoặc có Start Command sai. Cần kiểm tra và sửa:

1. Vào **Settings** → **Service** (hoặc **General**)
2. Kiểm tra **Root Directory** phải là `frontend` (KHÔNG phải để trống hoặc `/`)
3. Nếu Root Directory sai, sửa lại thành `frontend` và Save
4. Vào **Settings** → **Deploy** (hoặc **Build**)
5. **QUAN TRỌNG:** Xóa hoặc để trống **Start Command** (Frontend dùng nginx, KHÔNG dùng npm start)
6. Vào **Settings** → **Build**
7. **Bắt buộc** chọn **"Dockerfile"** làm builder (KHÔNG dùng Nixpacks hoặc Auto-detect)
8. Đảm bảo **Dockerfile Path** là `Dockerfile` (hoặc để trống)
9. **Xóa** Build Command nếu có (để Dockerfile tự build)
10. Save và Redeploy

### 4.2. Cấu hình Environment Variables (QUAN TRỌNG!)

Vào **Settings** → **Variables**, thêm:

```
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

**Lưu ý:** 
- Thay `your-backend-domain.railway.app` bằng URL backend thực tế từ bước 3.4
- URL phải có `/api` ở cuối
- Ví dụ: `https://ocha-pos-backend-production.up.railway.app/api`

### 4.3. Cấu hình Build Arguments (BẮT BUỘC!)

**Vite chỉ inject env vars ở build time, không phải runtime!** Cần set build arg:

1. Vào **Settings** → **Build**
2. Tìm phần **"Build Arguments"**, **"Docker Build Args"**, hoặc **"Environment Variables"**
3. Thêm build argument:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
   ```

**Lưu ý:** 
- Railway có thể tự động inject env vars có prefix `VITE_` vào build, nhưng để chắc chắn, nên set cả Environment Variables và Build Arguments
- Sau khi set, **PHẢI Redeploy** để rebuild với URL mới
- Nếu không set build arg, frontend sẽ dùng giá trị mặc định `http://localhost:8080/api`

### 4.4. Lấy Frontend URL

Sau khi deploy xong:
1. Vào Frontend service → **Settings** → **Networking**
2. Click **"Generate Domain"** (nếu chưa có)
3. Copy URL (ví dụ: `https://your-frontend.railway.app`)

---

## 🔄 Bước 5: Cập nhật URLs

Sau khi có cả 2 URLs, cần cập nhật lại:

### 5.1. Cập nhật Backend Environment Variables

Vào Backend service → **Settings** → **Variables**, cập nhật:
```
FRONTEND_URL=https://your-frontend-domain.railway.app
BACKEND_URL=https://your-backend-domain.railway.app
```

### 5.2. Cập nhật Frontend Environment Variables

Vào Frontend service → **Settings** → **Variables**, cập nhật:
```
VITE_API_BASE_URL=https://your-backend-domain.railway.app/api
```

Sau đó **redeploy** frontend để build lại với URL mới.

---

## ☁️ Bước 6: Cấu hình Cloudinary (Tùy chọn)

Nếu bạn sử dụng Cloudinary để lưu ảnh, thêm vào Backend Variables:

```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🌐 Bước 7: Cấu hình Custom Domain (Tùy chọn)

### 7.1. Backend Custom Domain

1. Vào Backend service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Nhập domain của bạn (ví dụ: `api.yourdomain.com`)
4. Thêm CNAME record trong DNS provider trỏ đến Railway domain

### 7.2. Frontend Custom Domain

1. Vào Frontend service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Nhập domain của bạn (ví dụ: `yourdomain.com`)
4. Thêm CNAME record trong DNS provider trỏ đến Railway domain

Sau khi setup domain, cập nhật lại các URLs trong Environment Variables.

---

## ✅ Checklist sau khi deploy

- [ ] Backend đã deploy thành công
- [ ] Database migrations đã chạy
- [ ] Frontend đã deploy thành công
- [ ] Backend URL đã được cập nhật trong Frontend env vars
- [ ] Frontend URL đã được cập nhật trong Backend env vars
- [ ] Có thể truy cập frontend và thấy giao diện
- [ ] API calls từ frontend hoạt động
- [ ] Socket.io connection hoạt động (nếu có)

---

## 🐛 Troubleshooting

### Backend không start được

1. Kiểm tra logs: Vào service → **Deployments** → **Logs**
2. Kiểm tra `DATABASE_URL` có đúng không
3. Kiểm tra `JWT_SECRET` có đủ 32 ký tự không
4. Kiểm tra migrations đã chạy chưa

### Frontend không kết nối được Backend (kết nối đến localhost:8080)

**Nguyên nhân:** `VITE_API_BASE_URL` không được inject vào build, frontend đang dùng giá trị mặc định.

**Cách sửa:**
1. Vào Frontend service → **Settings** → **Variables**
2. Kiểm tra `VITE_API_BASE_URL` có đúng URL backend không (phải có `/api` ở cuối)
3. Vào **Settings** → **Build** → Kiểm tra Build Arguments có `VITE_API_BASE_URL` không
4. **QUAN TRỌNG:** Sau khi sửa env vars, **PHẢI Redeploy** để rebuild với URL mới
5. Kiểm tra CORS settings trong backend (đảm bảo `FRONTEND_URL` đúng)
6. Kiểm tra backend có đang chạy không

**Lưu ý:** Vite chỉ inject env vars ở build time. Nếu không rebuild sau khi sửa env vars, frontend vẫn dùng URL cũ.

### Database connection error

1. Kiểm tra `DATABASE_URL` format
2. Kiểm tra PostgreSQL service có đang chạy không
3. Kiểm tra migrations đã chạy chưa

### Build failed

1. Kiểm tra logs để xem lỗi cụ thể
2. Kiểm tra Node version (cần >= 20.0.0)
3. Kiểm tra Dockerfile có đúng không
4. **Nếu thấy lỗi "No workspaces found" hoặc "npm run build --workspace=...":**
   
   **Đây là lỗi phổ biến nhất!** Railway đang build từ root directory thay vì từ `backend`/`frontend`.
   
   **Cách sửa:**
   - Vào **Settings** → **Service** → Kiểm tra **Root Directory** phải là `backend` hoặc `frontend`
   - Vào **Settings** → **Build** → **Bắt buộc** chọn **"Dockerfile"** (KHÔNG dùng Nixpacks)
   - Xóa Build Command nếu có
   - Save và Redeploy
   
   **Nếu vẫn lỗi:** Có thể Railway đang cache cấu hình cũ. Thử:
   - Xóa service và tạo lại
   - Hoặc vào **Settings** → **Build** → Clear cache (nếu có)

5. **Nếu thấy lỗi "Missing script: start" (đặc biệt với Frontend):**
   
   **Nguyên nhân:** Railway đang cố chạy `npm run start` nhưng Frontend không có script này (Frontend dùng nginx).
   
   **Cách sửa:**
   - Vào Frontend service → **Settings** → **Deploy** (hoặc **Build**)
   - Tìm **Start Command** và **XÓA HẲN** hoặc để trống
   - Frontend Dockerfile đã có CMD để chạy nginx, không cần Start Command
   - Save và Redeploy

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra logs trong Railway Dashboard
2. Kiểm tra Environment Variables
3. Thử redeploy service

---

## 🎉 Hoàn thành!

Sau khi hoàn thành tất cả các bước, bạn sẽ có:
- ✅ Backend API chạy trên Railway
- ✅ Frontend chạy trên Railway
- ✅ PostgreSQL database trên Railway
- ✅ Tất cả đã được kết nối và hoạt động

Chúc bạn deploy thành công! 🚀

