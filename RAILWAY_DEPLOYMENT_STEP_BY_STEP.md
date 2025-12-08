# 🚀 Hướng Dẫn Deploy OCHA POS lên Railway - Chi Tiết Từng Bước

> **Tài liệu này hướng dẫn chi tiết từng bước để deploy project OCHA POS lên Railway Platform. Mỗi bước đều được giải thích rõ ràng với mục đích và cách thực hiện.**

---

## 📋 Mục Lục

1. [Chuẩn Bị Trước Khi Deploy](#1-chuẩn-bị-trước-khi-deploy)
2. [Bước 1: Chuẩn Bị Code và GitHub](#bước-1-chuẩn-bị-code-và-github)
3. [Bước 2: Tạo Tài Khoản Railway](#bước-2-tạo-tài-khoản-railway)
4. [Bước 3: Tạo Project trên Railway](#bước-3-tạo-project-trên-railway)
5. [Bước 4: Tạo PostgreSQL Database](#bước-4-tạo-postgresql-database)
6. [Bước 5: Deploy Backend Service](#bước-5-deploy-backend-service)
7. [Bước 6: Deploy Frontend Service](#bước-6-deploy-frontend-service)
8. [Bước 7: Cấu Hình Environment Variables](#bước-7-cấu-hình-environment-variables)
8. [Bước 8: Seed Database (Khuyến Nghị)](#bước-8-seed-database-khuyến-nghị)
9. [Bước 9: Kiểm Tra và Test](#bước-9-kiểm-tra-và-test)
10. [Troubleshooting Chi Tiết](#troubleshooting-chi-tiết)

---

## 1. Chuẩn Bị Trước Khi Deploy

### 1.1. Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn có:

- ✅ **GitHub Account**: Để push code lên repository
- ✅ **Railway Account**: Sẽ tạo trong bước tiếp theo (miễn phí)
- ✅ **Node.js**: Đã cài đặt trên máy local (để test và chạy commands)
- ✅ **Git**: Đã cài đặt và cấu hình

### 1.2. Kiểm Tra Project Structure

Đảm bảo project của bạn có cấu trúc như sau:

```
Ocha-Pos-Project/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

### 1.3. Tạo Railway Configuration Files (Nếu Chưa Có)

Railway sẽ tự động detect và deploy dựa trên các file cấu hình. Nếu chưa có, bạn cần tạo:

#### Backend: `backend/railway.json`

Tạo file này trong thư mục `backend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run prisma:generate && npx prisma migrate deploy && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Giải thích:**
- `buildCommand`: Lệnh để build project (cài dependencies và compile TypeScript)
- `startCommand`: Lệnh để start server sau khi build
  - `npm run prisma:generate`: Generate Prisma Client
  - `npx prisma migrate deploy`: Chạy database migrations
  - `npm start`: Start server

#### Frontend: `frontend/railway.json`

Tạo file này trong thư mục `frontend/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Giải thích:**
- `buildCommand`: Build React app thành static files
- `startCommand`: Serve static files đã build (Vite preview server)

---

## Bước 1: Chuẩn Bị Code và GitHub

### 1.1. Kiểm Tra Code Trước Khi Push

Trước khi push code lên GitHub, đảm bảo:

1. **Code đã được test và chạy được ở local**
   ```bash
   # Test backend
   cd backend
   npm install
   npm run build
   npm start
   
   # Test frontend (terminal khác)
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

2. **Đã commit tất cả thay đổi**
   ```bash
   git status  # Kiểm tra files chưa commit
   git add .
   git commit -m "Prepare for Railway deployment"
   ```

3. **Đã tạo các file railway.json** (nếu chưa có)
   - `backend/railway.json`
   - `frontend/railway.json`

### 1.2. Push Code Lên GitHub

**Mục đích:** Railway cần code trên GitHub để deploy tự động.

**Các bước:**

1. **Kiểm tra remote repository:**
   ```bash
   git remote -v
   ```
   
   Nếu chưa có remote, thêm GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```

2. **Push code lên GitHub:**
   ```bash
   git push origin main
   # Hoặc git push origin master (tùy branch chính của bạn)
   ```

3. **Xác nhận:** Vào GitHub và kiểm tra code đã được push thành công.

**Lưu ý quan trọng:**
- ✅ Đảm bảo `.env` và `.env.local` đã được thêm vào `.gitignore` (không commit secrets)
- ✅ Đảm bảo `node_modules` đã được thêm vào `.gitignore`
- ✅ Kiểm tra các file nhạy cảm khác không bị commit

---

## Bước 2: Tạo Tài Khoản Railway

### 2.1. Truy Cập Railway Website

1. Mở trình duyệt và vào: **https://railway.app**
2. Click vào nút **"Start a New Project"** hoặc **"Login"**

### 2.2. Đăng Ký/Đăng Nhập

**Có 2 cách:**

**Cách 1: Đăng nhập bằng GitHub (Khuyến nghị)**
- Click **"Login with GitHub"**
- Authorize Railway truy cập GitHub của bạn
- Railway sẽ tự động link với GitHub account

**Cách 2: Đăng ký bằng Email**
- Click **"Sign Up"**
- Nhập email và password
- Xác nhận email qua link trong inbox
- Sau đó có thể link GitHub account trong Settings

**Lý do nên dùng GitHub:**
- Railway có thể tự động detect repositories
- Deploy tự động khi push code
- Dễ quản lý và tích hợp

### 2.3. Xác Nhận Tài Khoản

Sau khi đăng nhập, bạn sẽ thấy Railway Dashboard. Đây là nơi quản lý tất cả projects của bạn.

---

## Bước 3: Tạo Project trên Railway

### 3.1. Tạo New Project

**Mục đích:** Tạo một project container để chứa các services (Backend, Frontend, Database).

**Các bước:**

1. **Trong Railway Dashboard, click nút "+ New Project"**
   - Nút này thường ở góc trên bên phải hoặc giữa màn hình

2. **Chọn "Deploy from GitHub repo"**
   - Railway sẽ hiển thị danh sách repositories từ GitHub của bạn

3. **Chọn repository `Ocha-Pos-Project`** (hoặc tên repo của bạn)
   - Nếu không thấy repo, click **"Configure GitHub App"** để cấp quyền

4. **Railway sẽ tự động:**
   - Tạo project mới
   - Detect cấu trúc project
   - Bắt đầu quá trình deploy (nhưng chưa hoàn chỉnh, cần config thêm)

### 3.2. Đặt Tên Project (Optional)

Railway sẽ tự động đặt tên project. Bạn có thể đổi tên:
- Click vào tên project ở trên cùng
- Nhập tên mới (ví dụ: "OCHA POS Production")
- Press Enter để save

**Lưu ý:** Tên project chỉ để quản lý, không ảnh hưởng đến URL.

---

## Bước 4: Tạo PostgreSQL Database

### 4.1. Tại Sao Cần Database Service?

**Mục đích:** 
- Backend cần PostgreSQL để lưu trữ dữ liệu
- Railway cung cấp managed PostgreSQL (không cần tự setup)
- Railway tự động tạo `DATABASE_URL` và inject vào services

### 4.2. Thêm PostgreSQL Service

**Các bước chi tiết:**

1. **Trong project vừa tạo, click nút "+ New"**
   - Nút này ở góc trên bên phải của project dashboard

2. **Chọn "Database"**
   - Railway sẽ hiển thị các loại database có sẵn

3. **Chọn "Add PostgreSQL"**
   - Railway sẽ bắt đầu tạo PostgreSQL instance

4. **Đợi PostgreSQL khởi động**
   - Thời gian: Khoảng 1-2 phút
   - Bạn sẽ thấy status chuyển từ "Provisioning" → "Active"
   - Khi status là "Active", PostgreSQL đã sẵn sàng

### 4.3. Kiểm Tra PostgreSQL Service

Sau khi PostgreSQL đã active:

1. **Click vào PostgreSQL service** trong project dashboard
2. **Xem thông tin:**
   - **Status**: Phải là "Active"
   - **Variables**: Railway tự động tạo `DATABASE_URL`
   - **Data**: Có thể xem database size, connections, etc.

### 4.4. Lưu Ý Quan Trọng

- ✅ **DATABASE_URL tự động**: Railway tự động tạo và quản lý `DATABASE_URL`
- ✅ **Format**: `DATABASE_URL` có format: `postgresql://user:password@host:port/database`
- ✅ **Không cần copy**: Railway sẽ tự động inject vào các services khác
- ⚠️ **Backup**: Railway tự động backup database, nhưng bạn có thể export thủ công nếu cần

---

## Bước 5: Deploy Backend Service

### 5.1. Tại Sao Cần Deploy Backend Trước?

**Mục đích:**
- Backend cung cấp API cho Frontend
- Frontend cần Backend URL để kết nối
- Backend cần Database để chạy migrations

### 5.2. Thêm Backend Service

**Các bước chi tiết:**

1. **Trong project dashboard, click "+ New"**

2. **Chọn "GitHub Repo"**
   - Railway sẽ hiển thị lại danh sách repositories

3. **Chọn lại repository `Ocha-Pos-Project`**
   - Railway sẽ tự động detect và tạo service mới

4. **Railway sẽ tự động detect `backend/railway.json`**
   - Nếu không detect, bạn cần config thủ công (xem phần dưới)

### 5.3. Cấu Hình Root Directory

**Mục đích:** Railway cần biết service này deploy từ thư mục nào trong repo.

**Các bước:**

1. **Click vào Backend service vừa tạo**

2. **Vào tab "Settings"** (ở menu trên cùng)

3. **Tìm phần "Root Directory"**

4. **Nhập:** `backend`
   - Đây là thư mục chứa code backend trong repo

5. **Click "Save"** hoặc Railway tự động save

**Giải thích:**
- Root Directory = `backend` nghĩa là Railway sẽ chạy commands trong thư mục `backend/`
- Railway sẽ tìm `package.json`, `railway.json` trong thư mục này

### 5.4. Cấu Hình Environment Variables

**Mục đích:** Backend cần các biến môi trường để chạy đúng.

**Các bước chi tiết:**

1. **Vẫn trong Settings của Backend service**

2. **Scroll xuống phần "Variables"**

3. **Click "New Variable"** để thêm từng biến

4. **Thêm các biến sau (copy từng dòng):**

   ```
   NODE_ENV=production
   ```

   ```
   PORT=${{PORT}}
   ```
   **Giải thích:** `${{PORT}}` là Railway variable tự động, Railway sẽ tự set port

   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   ```
   **Giải thích:** 
   - `${{Postgres.DATABASE_URL}}` là reference đến PostgreSQL service
   - Railway tự động lấy DATABASE_URL từ PostgreSQL service
   - `Postgres` là tên service PostgreSQL (nếu bạn đổi tên, cần đổi tên này)

   ```
   JWT_SECRET=ocha-pos-super-secret-jwt-key-2024-minimum-32-chars
   ```
   **Lưu ý:** Đổi thành secret key mạnh hơn (tối thiểu 32 ký tự)
   - Có thể generate bằng: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

   ```
   JWT_EXPIRES_IN=7d
   ```

   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```
   **Lưu ý:** Tạm thời để placeholder, sẽ update sau khi có Frontend URL

   ```
   BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   ```
   **Giải thích:** Railway tự động set URL của backend service

   ```
   LOG_LEVEL=info
   ```

5. **Sau khi thêm xong, Railway sẽ tự động:**
   - Save các variables
   - Trigger deploy mới với variables mới

### 5.5. Kiểm Tra Deploy Process

**Các bước:**

1. **Vào tab "Deployments"** của Backend service

2. **Xem quá trình deploy:**
   - **Status**: "Building" → "Deploying" → "Active"
   - **Logs**: Click vào deployment để xem logs chi tiết

3. **Đợi deploy hoàn thành:**
   - Lần đầu có thể mất 5-10 phút
   - Xem logs để theo dõi progress

4. **Kiểm tra logs:**
   - Tìm dòng: `"Server is running on http://0.0.0.0:PORT"`
   - Tìm dòng: `"Database connected successfully"`
   - Nếu có lỗi, xem phần Troubleshooting

### 5.6. Lấy Backend Public URL

**Mục đích:** Cần URL này để config Frontend và update Backend variables.

**Các bước:**

1. **Vào tab "Settings"** của Backend service

2. **Tìm phần "Networking"** hoặc **"Public Domain"**

3. **Click "Generate Domain"** (nếu chưa có)

4. **Copy Public URL:**
   - Format: `https://your-backend-service-name.up.railway.app`
   - Ví dụ: `https://ocha-pos-backend.up.railway.app`

5. **Lưu URL này lại** để dùng ở các bước sau

**Lưu ý:**
- URL này sẽ được dùng để config `VITE_API_BASE_URL` trong Frontend
- URL này sẽ được dùng để update `BACKEND_URL` trong Backend (nếu cần)

---

## Bước 6: Deploy Frontend Service

### 6.1. Tại Sao Cần Deploy Frontend Sau Backend?

**Mục đích:**
- Frontend cần Backend URL để kết nối API
- Đã có Backend URL từ bước trước
- Frontend là static site, deploy nhanh hơn

### 6.2. Thêm Frontend Service

**Các bước chi tiết:**

1. **Trong project dashboard, click "+ New"**

2. **Chọn "GitHub Repo"**

3. **Chọn lại repository `Ocha-Pos-Project`**

4. **Railway sẽ tự động detect và tạo service mới**

### 6.3. Cấu Hình Root Directory

**Các bước:**

1. **Click vào Frontend service vừa tạo**

2. **Vào tab "Settings"**

3. **Tìm phần "Root Directory"**

4. **Nhập:** `frontend`

5. **Save**

### 6.4. Cấu Hình Environment Variables

**Các bước:**

1. **Vào tab "Settings" → "Variables"**

2. **Thêm biến:**

   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   ```
   **Lưu ý:** 
   - Thay `your-backend-url` bằng Backend URL đã copy ở Bước 5.6
   - Ví dụ: `https://ocha-pos-backend.up.railway.app/api`
   - **QUAN TRỌNG:** Phải có `/api` ở cuối

3. **Save**

**Giải thích:**
- `VITE_API_BASE_URL` là biến môi trường mà Vite sử dụng
- Frontend sẽ dùng biến này để gọi API
- Phải có `/api` vì backend API base path là `/api`

### 6.5. Kiểm Tra Deploy Process

**Các bước:**

1. **Vào tab "Deployments"**

2. **Xem quá trình deploy:**
   - Frontend build nhanh hơn Backend (2-5 phút)
   - Xem logs để theo dõi

3. **Kiểm tra logs:**
   - Tìm: `"build completed"`
   - Tìm: `"Local: http://localhost:4173"` (Vite preview server)

### 6.6. Lấy Frontend Public URL

**Các bước:**

1. **Vào tab "Settings" → "Networking"**

2. **Click "Generate Domain"** (nếu chưa có)

3. **Copy Public URL:**
   - Format: `https://your-frontend-service-name.up.railway.app`
   - Ví dụ: `https://ocha-pos-frontend.up.railway.app`

4. **Lưu URL này lại**

---

## Bước 7: Cấu Hình Environment Variables

### 7.1. Tại Sao Cần Update Variables?

**Mục đích:**
- Backend cần Frontend URL để config CORS
- Frontend cần đúng Backend URL để kết nối API
- Đảm bảo các services giao tiếp đúng với nhau

### 7.2. Update Backend Variables

**Các bước:**

1. **Vào Backend service → Settings → Variables**

2. **Tìm biến `FRONTEND_URL`**

3. **Click vào biến để edit**

4. **Update giá trị:**
   ```
   FRONTEND_URL=https://your-frontend-url.railway.app
   ```
   - Thay `your-frontend-url` bằng Frontend URL đã copy ở Bước 6.6
   - Ví dụ: `https://ocha-pos-frontend.up.railway.app`

5. **Save**

6. **Kiểm tra `BACKEND_URL`:**
   - Nếu đã là `${{RAILWAY_PUBLIC_DOMAIN}}`, giữ nguyên
   - Hoặc có thể set cụ thể: `https://your-backend-url.railway.app`

### 7.3. Update Frontend Variables

**Các bước:**

1. **Vào Frontend service → Settings → Variables**

2. **Kiểm tra `VITE_API_BASE_URL`:**
   - Đảm bảo đúng Backend URL với `/api`
   - Ví dụ: `https://ocha-pos-backend.up.railway.app/api`

3. **Nếu chưa đúng, update lại**

### 7.4. Redeploy Services

**Mục đích:** Các services cần redeploy để áp dụng variables mới.

**Các bước:**

1. **Backend Service:**
   - Vào tab "Deployments"
   - Click nút "Redeploy" (hoặc "Deploy Latest")
   - Đợi deploy hoàn thành

2. **Frontend Service:**
   - Vào tab "Deployments"
   - Click nút "Redeploy"
   - Đợi deploy hoàn thành

**Lưu ý:**
- Redeploy sẽ không mất dữ liệu database
- Redeploy chỉ rebuild và restart services
- Thời gian: 2-5 phút mỗi service

---

## Bước 8: Seed Database (Khuyến Nghị)

### 8.1. Tại Sao Cần Seed Database?

**Mục đích:**
- Tạo dữ liệu mẫu để test ứng dụng
- Tạo user admin và staff để đăng nhập
- Tạo categories, products mẫu

### 8.2. Cách 1: Dùng Railway CLI (Khuyến Nghị)

**Các bước:**

1. **Cài đặt Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```
   Hoặc dùng npx (không cần install global):
   ```bash
   npx @railway/cli
   ```

2. **Login Railway:**
   ```bash
   railway login
   ```
   - Sẽ mở browser để login
   - Authorize Railway CLI

3. **Link project:**
   ```bash
   railway link
   ```
   - Railway sẽ hiển thị danh sách projects
   - Chọn project vừa tạo (OCHA POS)

4. **Link service:**
   ```bash
   railway link --service backend
   ```
   - Chọn Backend service

5. **Run seed command:**
   ```bash
   railway run --service backend npm run prisma:seed
   ```
   Hoặc nếu dùng npx:
   ```bash
   npx railway run --service backend npm run prisma:seed
   ```

6. **Xem kết quả:**
   - Nếu thành công, sẽ thấy: `"Database seeded successfully"`
   - Nếu lỗi, xem logs để debug

### 8.3. Cách 2: Dùng Railway Dashboard

**Các bước:**

1. **Vào Backend service → tab "Deployments"**

2. **Click vào deployment mới nhất**

3. **Vào tab "Shell"** (hoặc "Terminal")

4. **Chạy command:**
   ```bash
   npm run prisma:seed
   ```

5. **Xem kết quả trong terminal**

**Lưu ý:**
- Shell có thể không có sẵn trong một số plans
- Nếu không có Shell, dùng Railway CLI (Cách 1)

### 8.4. Kiểm Tra Seed Thành Công

**Các cách kiểm tra:**

1. **Test login với account mẫu:**
   - Staff: `staff@ocha.com` / `staff123`
   - Admin: `admin@ocha.com` / `admin123`

2. **Kiểm tra database:**
   - Dùng Railway PostgreSQL service → tab "Data"
   - Hoặc dùng Prisma Studio (nếu có access)

---

## Bước 9: Kiểm Tra và Test

### 9.1. Test Backend Health Check

**Mục đích:** Kiểm tra Backend đang chạy và kết nối database thành công.

**Các bước:**

1. **Mở browser hoặc dùng curl/Postman**

2. **Truy cập:**
   ```
   https://your-backend-url.railway.app/health
   ```
   - Thay `your-backend-url` bằng Backend URL của bạn

3. **Kết quả mong đợi:**
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "database": "connected"
   }
   ```

4. **Nếu lỗi:**
   - Xem logs trong Railway Dashboard
   - Kiểm tra `DATABASE_URL` đã đúng chưa
   - Xem phần Troubleshooting

### 9.2. Test API Documentation

**Mục đích:** Kiểm tra Swagger/API docs có hoạt động không.

**Các bước:**

1. **Truy cập:**
   ```
   https://your-backend-url.railway.app/api-docs
   ```

2. **Kiểm tra:**
   - Swagger UI hiển thị đúng
   - Có thể xem các endpoints
   - Có thể test API từ Swagger UI

### 9.3. Test Frontend

**Mục đích:** Kiểm tra Frontend load và kết nối Backend thành công.

**Các bước:**

1. **Truy cập Frontend URL:**
   ```
   https://your-frontend-url.railway.app
   ```

2. **Kiểm tra:**
   - Frontend load thành công
   - Không có lỗi console (F12 → Console)
   - Có thể navigate giữa các pages

3. **Test Login:**
   - Vào trang Login
   - Đăng nhập với:
     - Staff: `staff@ocha.com` / `staff123`
     - Admin: `admin@ocha.com` / `admin123`
   - Kiểm tra login thành công

4. **Test API Calls:**
   - Sau khi login, kiểm tra các chức năng:
     - Load products
     - Load categories
     - Tạo order
     - Xem dashboard

### 9.4. Test CORS và API Connection

**Mục đích:** Đảm bảo Frontend có thể gọi API từ Backend.

**Các bước:**

1. **Mở Browser DevTools (F12)**

2. **Vào tab "Network"**

3. **Thực hiện một action trong Frontend** (ví dụ: load products)

4. **Kiểm tra requests:**
   - Request URL phải là: `https://your-backend-url.railway.app/api/...`
   - Status code phải là `200` hoặc `201`
   - Không có CORS errors

5. **Nếu có CORS error:**
   - Kiểm tra `FRONTEND_URL` trong Backend variables
   - Đảm bảo đúng Frontend URL
   - Redeploy Backend

### 9.5. Checklist Cuối Cùng

Đánh dấu các mục sau:

- [ ] Backend health check trả về `{"status": "ok", "database": "connected"}`
- [ ] API docs (`/api-docs`) load thành công
- [ ] Frontend load thành công, không có lỗi console
- [ ] Có thể đăng nhập với account mẫu
- [ ] Có thể load products/categories từ API
- [ ] CORS không có lỗi
- [ ] Database đã được seed (có dữ liệu mẫu)

---

## Troubleshooting Chi Tiết

### 🔴 Backend Không Start

**Triệu chứng:**
- Backend service status là "Failed" hoặc "Crash"
- Logs hiển thị lỗi

**Các bước debug:**

1. **Xem logs chi tiết:**
   - Vào Backend service → Deployments → Click deployment mới nhất → View Logs
   - Tìm dòng có `ERROR` hoặc `Failed`

2. **Kiểm tra DATABASE_URL:**
   - Vào Settings → Variables
   - Kiểm tra `DATABASE_URL` có giá trị không
   - Format phải đúng: `postgresql://user:password@host:port/database`

3. **Kiểm tra PostgreSQL service:**
   - Vào PostgreSQL service
   - Status phải là "Active"
   - Nếu không active, đợi hoặc restart

4. **Kiểm tra migrations:**
   - Xem logs có dòng: `"Running migrations..."`
   - Nếu migration fail, xem lỗi cụ thể
   - Có thể cần fix schema hoặc reset database

5. **Kiểm tra PORT:**
   - Đảm bảo `PORT=${{PORT}}` trong variables
   - Railway tự động set port, không cần hardcode

**Giải pháp:**

```bash
# Nếu DATABASE_URL sai:
# Update trong Settings → Variables
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Nếu PostgreSQL không active:
# Restart PostgreSQL service trong Railway Dashboard

# Nếu migration fail:
# Có thể cần reset database (mất dữ liệu):
# Dùng Railway CLI:
railway run --service backend npx prisma migrate reset
```

---

### 🔴 Frontend Không Kết Nối Backend

**Triệu chứng:**
- Frontend load nhưng không load được data
- Console có lỗi: `Network Error` hoặc `CORS Error`
- API calls trả về `404` hoặc `500`

**Các bước debug:**

1. **Kiểm tra VITE_API_BASE_URL:**
   - Vào Frontend service → Settings → Variables
   - Kiểm tra `VITE_API_BASE_URL` đúng chưa
   - Format: `https://your-backend-url.railway.app/api`
   - **QUAN TRỌNG:** Phải có `/api` ở cuối

2. **Kiểm tra Backend đang chạy:**
   - Test health check: `https://your-backend-url.railway.app/health`
   - Nếu không response, Backend chưa start

3. **Kiểm tra CORS:**
   - Xem Console trong Browser DevTools
   - Nếu có CORS error, kiểm tra `FRONTEND_URL` trong Backend

4. **Kiểm tra Network requests:**
   - Mở DevTools → Network tab
   - Xem request URL có đúng không
   - Xem response status code

**Giải pháp:**

```bash
# Update VITE_API_BASE_URL:
# Vào Frontend Settings → Variables
VITE_API_BASE_URL=https://your-backend-url.railway.app/api

# Update FRONTEND_URL trong Backend:
# Vào Backend Settings → Variables
FRONTEND_URL=https://your-frontend-url.railway.app

# Redeploy cả 2 services sau khi update
```

---

### 🔴 Database Connection Failed

**Triệu chứng:**
- Backend logs: `"Cannot connect to database"`
- Health check trả về: `"database": "disconnected"`

**Các bước debug:**

1. **Kiểm tra PostgreSQL service:**
   - Status phải là "Active"
   - Nếu không, đợi hoặc restart

2. **Kiểm tra DATABASE_URL:**
   - Format: `postgresql://user:password@host:port/database`
   - Đảm bảo không có khoảng trắng thừa
   - Đảm bảo dùng `${{Postgres.DATABASE_URL}}` (không hardcode)

3. **Kiểm tra migrations:**
   - Xem logs có chạy migrations không
   - Nếu migration fail, database có thể chưa được setup

**Giải pháp:**

```bash
# Nếu PostgreSQL không active:
# Restart PostgreSQL service trong Railway Dashboard

# Nếu DATABASE_URL sai:
# Update trong Backend Settings → Variables
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Nếu migrations chưa chạy:
# Redeploy Backend service (sẽ tự động chạy migrations)
```

---

### 🔴 Build Failed

**Triệu chứng:**
- Deploy status là "Failed"
- Logs hiển thị: `"Build failed"` hoặc `"npm install failed"`

**Các bước debug:**

1. **Xem logs chi tiết:**
   - Tìm dòng có `ERROR` hoặc `Failed`
   - Xem lỗi cụ thể (dependency error, syntax error, etc.)

2. **Kiểm tra package.json:**
   - Đảm bảo có đầy đủ dependencies
   - Kiểm tra Node.js version compatibility

3. **Kiểm tra railway.json:**
   - Build command đúng chưa
   - Start command đúng chưa

**Giải pháp:**

```bash
# Nếu dependency error:
# Kiểm tra package.json có đầy đủ dependencies
# Có thể cần update package.json và push lại

# Nếu build command sai:
# Kiểm tra railway.json
# Backend: "npm install && npm run build"
# Frontend: "npm install && npm run build"

# Nếu Node.js version không compatible:
# Railway tự động detect, nhưng có thể cần specify trong package.json:
# "engines": { "node": ">=18.0.0" }
```

---

### 🔴 Environment Variables Không Áp Dụng

**Triệu chứng:**
- Đã set variables nhưng app vẫn dùng giá trị cũ
- Variables không được inject vào app

**Giải pháp:**

1. **Redeploy service:**
   - Variables chỉ áp dụng khi redeploy
   - Vào Deployments → Redeploy

2. **Kiểm tra format:**
   - Không có khoảng trắng thừa
   - Không có quotes không cần thiết
   - Railway variables: `${{ServiceName.VARIABLE_NAME}}`

3. **Kiểm tra variable names:**
   - Backend: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, etc.
   - Frontend: `VITE_API_BASE_URL` (phải có prefix `VITE_`)

---

### 🔴 Port Already in Use

**Triệu chứng:**
- Backend không start
- Logs: `"Port XXXX is already in use"`

**Giải pháp:**

- Railway tự động quản lý ports
- Đảm bảo dùng `PORT=${{PORT}}` trong variables
- Không hardcode port number

---

### 🔴 Prisma Client Not Generated

**Triệu chứng:**
- Backend logs: `"Cannot find module '@prisma/client'"`
- Migration chạy nhưng Prisma Client chưa generate

**Giải pháp:**

```bash
# Đảm bảo startCommand trong railway.json có:
"npm run prisma:generate && npx prisma migrate deploy && npm start"

# Hoặc trong package.json có postinstall:
"postinstall": "prisma generate"
```

---

## 📝 Tổng Kết

Sau khi hoàn thành tất cả các bước:

✅ **Backend đã deploy và chạy thành công**
- Health check: `https://your-backend-url.railway.app/health`
- API docs: `https://your-backend-url.railway.app/api-docs`

✅ **Frontend đã deploy và chạy thành công**
- URL: `https://your-frontend-url.railway.app`
- Kết nối Backend thành công

✅ **Database đã được setup**
- PostgreSQL đang chạy
- Migrations đã chạy
- Data đã được seed (nếu có)

✅ **Các services giao tiếp đúng**
- CORS đã config đúng
- API calls thành công
- Real-time features hoạt động (nếu có)

---

## 🎯 Tips và Best Practices

1. **Backup Database:**
   - Railway tự động backup, nhưng nên export thủ công định kỳ
   - Dùng Railway CLI: `railway run --service postgres pg_dump > backup.sql`

2. **Monitor Logs:**
   - Thường xuyên check logs để phát hiện lỗi sớm
   - Railway có log retention, nhưng nên export logs quan trọng

3. **Environment Variables:**
   - Không commit `.env` files lên Git
   - Dùng Railway variables cho production
   - Giữ secrets an toàn

4. **Custom Domain:**
   - Có thể thêm custom domain trong Settings → Networking
   - Cần config DNS records

5. **Scaling:**
   - Railway tự động scale, nhưng có thể config manual
   - Monitor usage để tránh vượt free tier

6. **Cost Management:**
   - Free tier có giới hạn
   - Monitor usage trong Railway Dashboard
   - Upgrade plan nếu cần

---

## 🆘 Cần Giúp Đỡ?

Nếu gặp vấn đề không giải quyết được:

1. **Kiểm tra logs chi tiết** trong Railway Dashboard
2. **Kiểm tra environment variables** đã đúng chưa
3. **Test health check endpoints** để isolate vấn đề
4. **Xem Railway Documentation**: https://docs.railway.app
5. **Railway Discord Community**: https://discord.gg/railway

---

**Chúc bạn deploy thành công! 🎉**

*Tài liệu này được tạo để hỗ trợ deploy project OCHA POS lên Railway Platform. Nếu có câu hỏi hoặc cần hỗ trợ thêm, vui lòng liên hệ.*

