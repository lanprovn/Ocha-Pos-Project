# 🚀 Hướng Dẫn Deploy Chi Tiết - Railway + Netlify

## 📋 Mục Lục

1. [Chuẩn Bị Trước Khi Deploy](#chuẩn-bị-trước-khi-deploy)
2. [Bước 1: Deploy Backend trên Railway](#bước-1-deploy-backend-trên-railway)
3. [Bước 2: Deploy Frontend trên Netlify](#bước-2-deploy-frontend-trên-netlify)
4. [Bước 3: Cấu Hình CORS và Environment Variables](#bước-3-cấu-hình-cors-và-environment-variables)
5. [Bước 4: Kiểm Tra và Test](#bước-4-kiểm-tra-và-test)
6. [Troubleshooting](#troubleshooting)

---

## ✅ Chuẩn Bị Trước Khi Deploy

### Checklist Chuẩn Bị

- [ ] Đã commit và push code lên GitHub
- [ ] Đã test build local thành công:
  - [ ] Backend: `cd backend && npm run build` ✅
  - [ ] Frontend: `cd frontend && npm run build` ✅
- [ ] Đã chuẩn bị JWT_SECRET (32+ ký tự)
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Railway (hoặc sẵn sàng đăng ký)
- [ ] Đã có tài khoản Netlify (hoặc sẵn sàng đăng ký)

### Tạo JWT_SECRET

Nếu chưa có JWT_SECRET, tạo một chuỗi ngẫu nhiên 32+ ký tự:

**Cách 1: Online Generator**
- Vào: https://randomkeygen.com/
- Copy một "CodeIgniter Encryption Keys" (64 ký tự)

**Cách 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Ví dụ JWT_SECRET:**
```
ochaPosSecretKey2024RandomString12345678901234567890
```

---

## 🚂 Bước 1: Deploy Backend trên Railway

### 1.1. Đăng Ký Railway (Nếu Chưa Có)

1. Truy cập: https://railway.app
2. Click **"Start a New Project"**
3. Chọn **"Login with GitHub"**
4. Authorize Railway để truy cập GitHub repositories

### 1.2. Tạo PostgreSQL Database

1. Trong Railway Dashboard, click **"New Project"**
2. Chọn **"Provision PostgreSQL"**
3. Railway tự động tạo database
4. Click vào PostgreSQL service → Tab **"Variables"**
5. Copy giá trị của `DATABASE_URL` (sẽ dùng ở bước sau)

**📝 Lưu ý:** 
- Database URL có dạng: `postgresql://postgres:password@host:5432/railway`
- **KHÔNG** share URL này công khai!

### 1.3. Deploy Backend Service

1. Trong cùng Project, click **"New"** → **"GitHub Repo"**
2. Chọn repository: `lanprovn/Ocha-Pos-Project`
3. Railway sẽ hỏi **"Configure Service"**:
   - **Root Directory:** Chọn `backend` (quan trọng!)
   - Click **"Deploy"**

### 1.4. Cấu Hình Environment Variables

1. Click vào Backend service vừa tạo
2. Vào tab **"Variables"**
3. Click **"New Variable"** và thêm từng biến sau:

#### Biến Bắt Buộc:

| Variable Name | Value | Ghi Chú |
|--------------|-------|---------|
| `NODE_ENV` | `production` | Môi trường production |
| `DATABASE_URL` | `<paste_database_url>` | URL từ PostgreSQL service (bước 1.2) |
| `JWT_SECRET` | `<your_jwt_secret>` | Chuỗi 32+ ký tự đã chuẩn bị |
| `JWT_EXPIRES_IN` | `7d` | Token hết hạn sau 7 ngày |
| `FRONTEND_URL` | `https://your-app.netlify.app` | **Tạm thời**, sẽ cập nhật sau |
| `BACKEND_URL` | `<sẽ_có_sau_khi_deploy>` | **Tạm thời**, sẽ cập nhật sau |
| `LOG_LEVEL` | `info` | Mức độ log |

#### Hướng Dẫn Thêm Từng Biến:

**Biến 1: NODE_ENV**
```
Variable Name: NODE_ENV
Value: production
```

**Biến 2: DATABASE_URL**
```
Variable Name: DATABASE_URL
Value: postgresql://postgres:xxxxx@xxxxx.railway.app:5432/railway
```
*(Paste URL từ PostgreSQL service)*

**Biến 3: JWT_SECRET**
```
Variable Name: JWT_SECRET
Value: ochaPosSecretKey2024RandomString12345678901234567890
```
*(Dùng JWT_SECRET bạn đã tạo)*

**Biến 4: JWT_EXPIRES_IN**
```
Variable Name: JWT_EXPIRES_IN
Value: 7d
```

**Biến 5: FRONTEND_URL** (Tạm thời)
```
Variable Name: FRONTEND_URL
Value: https://placeholder.netlify.app
```
*(Sẽ cập nhật sau khi deploy frontend)*

**Biến 6: BACKEND_URL** (Tạm thời)
```
Variable Name: BACKEND_URL
Value: https://placeholder.railway.app
```
*(Sẽ cập nhật sau khi deploy backend)*

**Biến 7: LOG_LEVEL**
```
Variable Name: LOG_LEVEL
Value: info
```

### 1.5. Kiểm Tra Deploy Logs

1. Vào tab **"Deployments"** hoặc **"Logs"**
2. Đợi Railway build và deploy (2-5 phút)
3. Kiểm tra logs để đảm bảo:
   - ✅ `npm install` thành công
   - ✅ `npm run build` thành công
   - ✅ `Prisma migrations` chạy thành công
   - ✅ `Seed check` chạy thành công
   - ✅ `Server is running on port XXXX`

### 1.6. Lấy Backend URL

1. Vào tab **"Settings"** của Backend service
2. Tìm phần **"Domains"**
3. Railway tự động tạo domain: `https://your-service-name.up.railway.app`
4. **Copy URL này** (ví dụ: `https://ocha-pos-backend.up.railway.app`)

### 1.7. Cập Nhật BACKEND_URL

1. Vào tab **"Variables"** của Backend service
2. Tìm biến `BACKEND_URL`
3. Click **"Edit"** → Cập nhật giá trị = URL vừa copy
4. Railway tự động redeploy

---

## 🌐 Bước 2: Deploy Frontend trên Netlify

### 2.1. Đăng Ký Netlify (Nếu Chưa Có)

1. Truy cập: https://netlify.com
2. Click **"Sign up"**
3. Chọn **"Sign up with GitHub"**
4. Authorize Netlify để truy cập GitHub repositories

### 2.2. Deploy Frontend

1. Trong Netlify Dashboard, click **"Add new site"** → **"Import an existing project"**
2. Chọn **"GitHub"** → Chọn repository: `lanprovn/Ocha-Pos-Project`
3. Cấu hình Build Settings:

#### Build Settings:

| Field | Value |
|-------|-------|
| **Base directory** | `frontend` |
| **Build command** | `npm run build` |
| **Publish directory** | `frontend/dist` |

**Hoặc Netlify tự động detect:**
- Nếu Netlify tự động detect, kiểm tra:
  - Base directory = `frontend` ✅
  - Build command = `npm run build` ✅
  - Publish directory = `frontend/dist` ✅

4. Click **"Show advanced"** → **"New variable"**

#### Environment Variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://your-backend.railway.app` |

**📝 Lưu ý:**
- Thay `your-backend.railway.app` bằng Backend URL từ Railway (Bước 1.6)
- **KHÔNG** thêm `/api` ở cuối!
- Ví dụ: `https://ocha-pos-backend.up.railway.app`

5. Click **"Deploy site"**

### 2.3. Kiểm Tra Deploy Logs

1. Vào tab **"Deploys"**
2. Click vào deployment đang chạy
3. Xem logs để đảm bảo:
   - ✅ `npm install` thành công
   - ✅ `npm run build` thành công
   - ✅ Build output: `frontend/dist`

### 2.4. Lấy Frontend URL

1. Sau khi deploy xong, Netlify tự động tạo URL
2. URL có dạng: `https://random-name-123456.netlify.app`
3. Hoặc vào **"Site settings"** → **"Change site name"** để đặt tên custom
4. **Copy URL này** (ví dụ: `https://ocha-pos.netlify.app`)

---

## 🔗 Bước 3: Cấu Hình CORS và Environment Variables

### 3.1. Cập Nhật FRONTEND_URL trong Railway

1. Vào Railway Dashboard → Backend service
2. Tab **"Variables"**
3. Tìm biến `FRONTEND_URL`
4. Click **"Edit"** → Cập nhật = Frontend URL từ Netlify (Bước 2.4)
5. Railway tự động redeploy

**Ví dụ:**
```
FRONTEND_URL = https://ocha-pos.netlify.app
```

### 3.2. Kiểm Tra CORS

1. Đợi Railway redeploy xong (1-2 phút)
2. Vào Railway → Backend service → Tab **"Logs"**
3. Kiểm tra không có lỗi CORS

---

## ✅ Bước 4: Kiểm Tra và Test

### 4.1. Test Backend Health

1. Mở trình duyệt, truy cập:
   ```
   https://your-backend.railway.app/health
   ```
2. Kết quả mong đợi:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

### 4.2. Test Frontend

1. Mở trình duyệt, truy cập Frontend URL từ Netlify
2. Kiểm tra:
   - ✅ Trang load được
   - ✅ Không có lỗi console (F12 → Console)
   - ✅ Có thể vào trang Login

### 4.3. Test Login

1. Vào trang Login
2. Thử đăng nhập với:
   - **Email:** `staff@ocha.com`
   - **Password:** `staff123`
3. Kết quả mong đợi:
   - ✅ Đăng nhập thành công
   - ✅ Redirect đến Dashboard
   - ✅ Không có lỗi Network trong Console

### 4.4. Test Socket.io (Real-time)

1. Sau khi đăng nhập, mở Console (F12)
2. Kiểm tra log:
   - ✅ `Socket.io connected: xxxxx`
   - ❌ Không có lỗi `Socket.io connection error`

---

## 🐛 Troubleshooting

### Lỗi 1: Backend Build Failed

**Triệu chứng:**
```
Error: Cannot find module 'winston'
```

**Giải pháp:**
1. Kiểm tra `backend/package.json` có `winston` trong `dependencies`
2. Commit và push lại code
3. Railway sẽ tự động rebuild

---

### Lỗi 2: Database Connection Failed

**Triệu chứng:**
```
Error: Can't reach database server
```

**Giải pháp:**
1. Kiểm tra `DATABASE_URL` trong Railway Variables:
   - ✅ Đúng format: `postgresql://...`
   - ✅ Copy từ PostgreSQL service (không tự tạo)
2. Kiểm tra PostgreSQL service đang chạy:
   - Vào PostgreSQL service → Tab "Logs"
   - Không có lỗi

---

### Lỗi 3: Frontend Build Failed

**Triệu chứng:**
```
TypeScript error: Type 'X' is not assignable to type 'Y'
```

**Giải pháp:**
1. Test build local trước:
   ```bash
   cd frontend
   npm run build
   ```
2. Fix lỗi TypeScript local
3. Commit và push lại code
4. Netlify sẽ tự động rebuild

---

### Lỗi 4: CORS Error

**Triệu chứng:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trong Railway:
   - ✅ Đúng URL từ Netlify
   - ✅ Không có trailing slash: `https://app.netlify.app` (không phải `https://app.netlify.app/`)
2. Kiểm tra `VITE_API_URL` trong Netlify:
   - ✅ Đúng URL từ Railway
   - ✅ Không có `/api` ở cuối
3. Đợi Railway redeploy (1-2 phút)
4. Hard refresh frontend (Ctrl+Shift+R)

---

### Lỗi 5: "Invalid email or password"

**Triệu chứng:**
- Đăng nhập với `staff@ocha.com` / `staff123` nhưng báo lỗi

**Giải pháp:**
1. Kiểm tra Railway Logs:
   - Tìm log: `📊 Found X user(s) and Y product(s) in database`
   - Nếu `X = 0`: Database chưa được seed
2. Đợi seed script chạy:
   - Railway tự động seed khi deploy lần đầu
   - Kiểm tra logs: `✅ Seed completed successfully`
3. Nếu vẫn không có users:
   - Vào Railway → Backend service → Tab "Deployments"
   - Click "Redeploy" để chạy lại seed

---

### Lỗi 6: Socket.io Connection Failed

**Triệu chứng:**
```
Socket.io connection error: xhr poll error
```

**Giải pháp:**
1. Kiểm tra Backend URL trong `VITE_API_URL`:
   - ✅ Đúng URL từ Railway
   - ✅ Có `https://` ở đầu
2. Kiểm tra Backend đang chạy:
   - Vào Railway → Backend service → Tab "Logs"
   - Tìm log: `Socket.io initialized successfully`
3. Kiểm tra CORS đã đúng chưa (xem Lỗi 4)

---

### Lỗi 7: Frontend Không Load

**Triệu chứng:**
- Trang trắng hoặc 404

**Giải pháp:**
1. Kiểm tra Netlify Build Logs:
   - ✅ Build thành công
   - ✅ Publish directory = `frontend/dist`
2. Kiểm tra file `index.html`:
   - Vào Netlify → Site → Tab "Deploys"
   - Click vào deployment → Xem "Published files"
   - Phải có `index.html` trong `frontend/dist`

---

## 📝 Checklist Cuối Cùng

Sau khi deploy xong, kiểm tra:

### Backend (Railway)
- [ ] Health endpoint hoạt động: `https://backend.railway.app/health`
- [ ] Database connected
- [ ] Migrations chạy thành công
- [ ] Seed script chạy thành công (có users và products)
- [ ] Server logs không có lỗi

### Frontend (Netlify)
- [ ] Build thành công
- [ ] Trang load được
- [ ] Không có lỗi Console
- [ ] Có thể đăng nhập
- [ ] Socket.io connected

### Integration
- [ ] Frontend kết nối được Backend (không có CORS error)
- [ ] Login thành công
- [ ] Socket.io real-time hoạt động
- [ ] Products hiển thị được

---

## 🎉 Hoàn Thành!

Nếu tất cả checklist đều ✅, bạn đã deploy thành công!

**URLs của bạn:**
- **Frontend:** `https://your-app.netlify.app`
- **Backend:** `https://your-backend.railway.app`
- **Health Check:** `https://your-backend.railway.app/health`

**Tài khoản đăng nhập:**
- **Staff:** `staff@ocha.com` / `staff123`
- **Admin:** `admin@ocha.com` / `admin123`

---

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app
- Netlify Docs: https://docs.netlify.com
- Prisma Migrate: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

**Chúc bạn deploy thành công! 🚀**

