# ✅ Checklist Deploy - Railway + Netlify

## 📋 Trước Khi Deploy

### Chuẩn Bị Code
- [ ] Code đã được commit và push lên GitHub
- [ ] Test build backend local: `cd backend && npm run build` ✅
- [ ] Test build frontend local: `cd frontend && npm run build` ✅
- [ ] Không có lỗi TypeScript
- [ ] Không có lỗi linter

### Chuẩn Bị Tài Khoản
- [ ] Đã có tài khoản GitHub
- [ ] Đã có tài khoản Railway (hoặc sẵn sàng đăng ký)
- [ ] Đã có tài khoản Netlify (hoặc sẵn sàng đăng ký)

### Chuẩn Bị JWT_SECRET
- [ ] Đã tạo JWT_SECRET (32+ ký tự)
- [ ] Đã lưu JWT_SECRET ở nơi an toàn

---

## 🚂 Railway - Backend Deployment

### Tạo Database
- [ ] Đăng nhập Railway
- [ ] Tạo Project mới
- [ ] Provision PostgreSQL
- [ ] Copy `DATABASE_URL` từ PostgreSQL Variables

### Deploy Backend
- [ ] New → GitHub Repo → Chọn `lanprovn/Ocha-Pos-Project`
- [ ] Root Directory = `backend` ✅
- [ ] Railway tự động detect `railway.json`

### Environment Variables (Railway)
- [ ] `NODE_ENV` = `production`
- [ ] `DATABASE_URL` = `<paste_from_postgres>`
- [ ] `JWT_SECRET` = `<your_32_char_secret>`
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `FRONTEND_URL` = `https://placeholder.netlify.app` (tạm thời)
- [ ] `BACKEND_URL` = `https://placeholder.railway.app` (tạm thời)
- [ ] `LOG_LEVEL` = `info`

### Kiểm Tra Deploy Logs
- [ ] `npm install` thành công
- [ ] `npm run build` thành công
- [ ] `Prisma migrations` chạy thành công
- [ ] `Seed check` chạy thành công
- [ ] `Server is running on port XXXX`
- [ ] Không có lỗi

### Lấy Backend URL
- [ ] Vào Settings → Domains
- [ ] Copy Backend URL (ví dụ: `https://ocha-pos-backend.up.railway.app`)
- [ ] Cập nhật `BACKEND_URL` trong Variables

---

## 🌐 Netlify - Frontend Deployment

### Deploy Frontend
- [ ] Đăng nhập Netlify
- [ ] Add new site → Import from GitHub
- [ ] Chọn repository: `lanprovn/Ocha-Pos-Project`
- [ ] Base directory = `frontend` ✅
- [ ] Build command = `npm run build` ✅
- [ ] Publish directory = `frontend/dist` ✅

### Environment Variables (Netlify)
- [ ] `VITE_API_URL` = `<backend_url_from_railway>`
  - Ví dụ: `https://ocha-pos-backend.up.railway.app`
  - **KHÔNG** thêm `/api` ở cuối!

### Kiểm Tra Deploy Logs
- [ ] `npm install` thành công
- [ ] `npm run build` thành công
- [ ] Build output = `frontend/dist`
- [ ] Không có lỗi

### Lấy Frontend URL
- [ ] Copy Frontend URL từ Netlify
- [ ] Ví dụ: `https://ocha-pos.netlify.app`

---

## 🔗 Cấu Hình CORS

### Cập Nhật FRONTEND_URL
- [ ] Vào Railway → Backend → Variables
- [ ] Cập nhật `FRONTEND_URL` = Frontend URL từ Netlify
- [ ] Railway tự động redeploy
- [ ] Đợi redeploy xong (1-2 phút)

---

## ✅ Kiểm Tra Cuối Cùng

### Backend Health Check
- [ ] Truy cập: `https://backend.railway.app/health`
- [ ] Kết quả: `{"status":"ok","timestamp":"..."}` ✅

### Frontend Load
- [ ] Truy cập Frontend URL
- [ ] Trang load được ✅
- [ ] Không có lỗi Console (F12) ✅

### Login Test
- [ ] Vào trang Login
- [ ] Email: `staff@ocha.com`
- [ ] Password: `staff123`
- [ ] Đăng nhập thành công ✅
- [ ] Redirect đến Dashboard ✅

### Socket.io Test
- [ ] Mở Console (F12)
- [ ] Log: `Socket.io connected: xxxxx` ✅
- [ ] Không có lỗi connection ✅

### Products Test
- [ ] Vào trang Products
- [ ] Products hiển thị được ✅
- [ ] Không có lỗi Network ✅

---

## 🎉 Hoàn Thành!

Nếu tất cả đều ✅, bạn đã deploy thành công!

**URLs:**
- Frontend: `https://your-app.netlify.app`
- Backend: `https://your-backend.railway.app`

**Tài khoản:**
- Staff: `staff@ocha.com` / `staff123`
- Admin: `admin@ocha.com` / `admin123`

---

## 🐛 Nếu Có Lỗi

Xem phần **Troubleshooting** trong [`DEPLOY_STEP_BY_STEP.md`](./DEPLOY_STEP_BY_STEP.md)

