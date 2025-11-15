# 🚀 Hướng Dẫn Deploy OCHA POS - Nền Tảng Miễn Phí

Tài liệu này hướng dẫn deploy dự án OCHA POS lên các nền tảng miễn phí.

## 📋 Tổng Quan Kiến Trúc Deploy

Dự án OCHA POS bao gồm:
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Real-time**: Socket.io

## 🎯 Các Nền Tảng Miễn Phí Đề Xuất

### Option 1: Railway (Khuyến Nghị) ⭐
**Ưu điểm**: Dễ dùng, hỗ trợ cả backend và database, free tier tốt

#### Backend + Database trên Railway

1. **Đăng ký Railway**
   - Truy cập: https://railway.app
   - Đăng nhập bằng GitHub

2. **Tạo Database PostgreSQL**
   - Click "New Project" → "Provision PostgreSQL"
   - Copy connection string từ tab "Variables"

3. **Deploy Backend**
   - Click "New" → "Deploy from GitHub repo"
   - Chọn repository của bạn
   - Chọn thư mục `backend`
   - Thêm các biến môi trường:
     ```
     NODE_ENV=production
     PORT=8080
     DATABASE_URL=<connection_string_từ_postgres>
     JWT_SECRET=<tạo_random_string_32_ký_tự_trở_lên>
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=<url_frontend_sẽ_deploy>
     BACKEND_URL=<url_backend_từ_railway>
     LOG_LEVEL=info
     ```
   - Railway sẽ tự động detect Node.js và chạy `npm start`
   - Cần tạo file `railway.json` hoặc cập nhật `package.json`:
     ```json
     {
       "scripts": {
         "build": "npm run prisma:generate && tsc",
         "start": "npm run prisma:migrate deploy && node dist/server.js"
       }
     }
     ```

4. **Chạy Prisma Migrations**
   - Railway có thể chạy migrations tự động nếu bạn thêm vào start script
   - Hoặc dùng Railway CLI: `railway run npm run prisma:migrate deploy`

#### Frontend trên Vercel

1. **Đăng ký Vercel**
   - Truy cập: https://vercel.com
   - Đăng nhập bằng GitHub

2. **Deploy Frontend**
   - Click "Add New Project"
   - Import repository GitHub
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Thêm biến môi trường:
     ```
     VITE_API_URL=<url_backend_từ_railway>
     ```

**Giới hạn Free Tier Railway:**
- $5 credit/tháng (đủ cho dự án nhỏ)
- Database: 1GB storage
- Bandwidth: 100GB/tháng

---

### Option 2: Render (Tốt cho Production)

#### Backend trên Render

1. **Đăng ký Render**
   - Truy cập: https://render.com
   - Đăng nhập bằng GitHub

2. **Tạo PostgreSQL Database**
   - Dashboard → "New +" → "PostgreSQL"
   - Chọn Free plan
   - Copy Internal Database URL

3. **Deploy Backend**
   - Dashboard → "New +" → "Web Service"
   - Connect GitHub repository
   - Settings:
     - **Name**: ocha-pos-backend
     - **Environment**: Node
     - **Build Command**: `cd backend && npm install && npm run prisma:generate && npm run build`
     - **Start Command**: `cd backend && npm run prisma:migrate deploy && npm start`
     - **Root Directory**: `backend`
   - Thêm Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     DATABASE_URL=<internal_database_url>
     JWT_SECRET=<random_32_char_string>
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=<frontend_url>
     BACKEND_URL=<render_backend_url>
     ```

#### Frontend trên Render

1. **Deploy Frontend**
   - Dashboard → "New +" → "Static Site"
   - Connect GitHub repository
   - Settings:
     - **Build Command**: `cd frontend && npm install && npm run build`
     - **Publish Directory**: `frontend/dist`
   - Thêm Environment Variable:
     ```
     VITE_API_URL=<backend_url>
     ```

**Giới hạn Free Tier Render:**
- Backend: Sleep sau 15 phút không dùng (wake up ~30s)
- Database: 90 ngày free trial, sau đó $7/tháng
- Static Site: Unlimited

---

### Option 3: Supabase + Vercel (Tốt nhất cho Database)

#### Database trên Supabase

1. **Đăng ký Supabase**
   - Truy cập: https://supabase.com
   - Tạo project mới
   - Copy connection string từ Settings → Database

2. **Setup Database**
   - Dùng Supabase SQL Editor hoặc Prisma Migrate
   - Connection string format:
     ```
     postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
     ```

#### Backend trên Railway/Render

- Deploy như Option 1 hoặc 2
- Dùng Supabase connection string cho `DATABASE_URL`

#### Frontend trên Vercel

- Deploy như Option 1

**Giới hạn Free Tier Supabase:**
- Database: 500MB storage
- Bandwidth: 2GB/tháng
- API requests: 50,000/tháng

---

### Option 4: Fly.io (Tốt cho Backend)

#### Backend trên Fly.io

1. **Cài đặt Fly CLI**
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Đăng nhập**
   ```bash
   fly auth login
   ```

3. **Tạo Fly App**
   ```bash
   cd backend
   fly launch
   ```

4. **Tạo PostgreSQL Database**
   ```bash
   fly postgres create --name ocha-pos-db
   fly postgres attach --app ocha-pos-backend ocha-pos-db
   ```

5. **Cấu hình**
   - Tạo file `fly.toml` trong `backend/`:
     ```toml
     app = "ocha-pos-backend"
     primary_region = "sin" # Singapore gần VN nhất
     
     [build]
       builder = "paketobuildpacks/builder:base"
     
     [env]
       NODE_ENV = "production"
       PORT = "8080"
     
     [[services]]
       internal_port = 8080
       protocol = "tcp"
     
       [[services.ports]]
         handlers = ["http"]
         port = 80
     
       [[services.ports]]
         handlers = ["tls", "http"]
         port = 443
     ```

6. **Deploy**
   ```bash
   fly deploy
   ```

#### Frontend trên Vercel
- Như Option 1

**Giới hạn Free Tier Fly.io:**
- 3 shared-cpu-1x VMs
- 3GB persistent volumes
- 160GB outbound data transfer

---

## 📝 Checklist Trước Khi Deploy

### Backend

- [ ] Tạo file `.env` với tất cả biến môi trường cần thiết
- [ ] Đảm bảo `package.json` có script `build` và `start`
- [ ] Test build local: `npm run build && npm start`
- [ ] Kiểm tra Prisma migrations đã được commit
- [ ] Cập nhật CORS settings để cho phép frontend URL
- [ ] Tạo JWT_SECRET ngẫu nhiên (32+ ký tự)

### Frontend

- [ ] Tạo file `.env` với `VITE_API_URL`
- [ ] Test build local: `npm run build`
- [ ] Kiểm tra `vite.config.ts` có cấu hình đúng
- [ ] Cập nhật API base URL trong code nếu cần

### Database

- [ ] Backup database local (nếu có data quan trọng)
- [ ] Chạy migrations trên database mới
- [ ] Seed database nếu cần (optional)

---

## 🔧 Cấu Hình Chi Tiết

### Backend - Railway/Render

Tạo file `backend/railway.json` hoặc cập nhật `package.json`:

```json
{
  "scripts": {
    "build": "npm run prisma:generate && tsc",
    "start": "npm run prisma:migrate deploy && node dist/server.js",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:generate": "prisma generate"
  }
}
```

### Backend - Environment Variables

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
BACKEND_URL=https://your-backend.railway.app
LOG_LEVEL=info
```

### Frontend - Environment Variables

Tạo file `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend.railway.app
```

Cập nhật `frontend/src/config/api.ts` nếu cần:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

---

## 🐛 Troubleshooting

### Backend không kết nối được Database

1. Kiểm tra `DATABASE_URL` đúng format
2. Kiểm tra database đã được tạo và migrations đã chạy
3. Kiểm tra firewall/network settings của database provider

### Frontend không kết nối được Backend

1. Kiểm tra CORS settings trong backend
2. Kiểm tra `VITE_API_URL` trong frontend
3. Kiểm tra backend URL có đúng không

### Prisma Migrations không chạy

1. Đảm bảo `prisma/migrations` folder đã được commit
2. Chạy manual: `npx prisma migrate deploy`
3. Kiểm tra database connection string

### Socket.io không hoạt động

1. Kiểm tra WebSocket support trên hosting platform
2. Cập nhật Socket.io client URL trong frontend
3. Kiểm tra CORS settings cho WebSocket

---

## 💰 So Sánh Các Nền Tảng

| Nền Tảng | Backend | Frontend | Database | Free Tier | Độ Khó |
|----------|---------|----------|----------|-----------|--------|
| **Railway** | ✅ | ❌ | ✅ | $5 credit/tháng | ⭐⭐ |
| **Render** | ✅ | ✅ | ✅* | Sleep sau 15ph | ⭐⭐⭐ |
| **Vercel** | ❌ | ✅ | ❌ | Unlimited | ⭐ |
| **Supabase** | ❌ | ❌ | ✅ | 500MB DB | ⭐⭐ |
| **Fly.io** | ✅ | ❌ | ✅ | 3 VMs | ⭐⭐⭐⭐ |

*Render database free 90 ngày đầu

---

## 🎯 Khuyến Nghị Cho Dự Án Này

**Option Tốt Nhất**: Railway (Backend + DB) + Vercel (Frontend)
- Dễ setup nhất
- Free tier đủ dùng cho dự án nhỏ
- Performance tốt
- Hỗ trợ tốt

**Option Tiết Kiệm**: Supabase (DB) + Render (Backend) + Vercel (Frontend)
- Database free lâu dài hơn
- Backend có thể sleep nhưng wake up nhanh

**Option Nâng Cao**: Fly.io (Backend + DB) + Vercel (Frontend)
- Performance tốt nhất
- Không sleep
- Phù hợp production

---

## 📚 Tài Liệu Tham Khảo

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Fly.io Docs: https://fly.io/docs

---

## 🆘 Hỗ Trợ

Nếu gặp vấn đề khi deploy, hãy:
1. Kiểm tra logs trên platform
2. Test build local trước
3. Kiểm tra environment variables
4. Xem troubleshooting section ở trên

**Chúc bạn deploy thành công! 🎉**

