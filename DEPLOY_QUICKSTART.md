# ⚡ Hướng Dẫn Deploy Nhanh - OCHA POS

Hướng dẫn deploy nhanh nhất cho người mới bắt đầu.

## 🎯 Option Nhanh Nhất: Railway + Vercel

### Bước 1: Deploy Backend + Database trên Railway (5 phút)

1. **Đăng ký Railway**
   - Vào https://railway.app
   - Đăng nhập bằng GitHub

2. **Tạo Database**
   - Click "New Project"
   - Chọn "Provision PostgreSQL"
   - Đợi database được tạo
   - Vào tab "Variables" → Copy `DATABASE_URL`

3. **Deploy Backend**
   - Trong cùng project, click "New" → "GitHub Repo"
   - Chọn repository của bạn
   - Chọn thư mục `backend`
   - Railway tự động detect Node.js
   - Thêm Environment Variables:
     ```
     NODE_ENV=production
     DATABASE_URL=<paste_database_url_ở_bước_2>
     JWT_SECRET=<tạo_random_string_32_ký_tự>
     FRONTEND_URL=https://your-app.vercel.app (sẽ cập nhật sau)
     BACKEND_URL=<sẽ_có_sau_khi_deploy>
     ```
   - Railway sẽ tự động build và deploy
   - Copy URL backend (ví dụ: `https://ocha-pos-backend.railway.app`)

4. **Chạy Migrations**
   - Vào tab "Deployments" → Click vào deployment mới nhất
   - Vào tab "Logs" → Tìm dòng "prisma migrate deploy"
   - Nếu không thấy, vào tab "Settings" → "Deploy" → Thêm vào Start Command:
     ```
     npm run start:prod
     ```

### Bước 2: Deploy Frontend trên Vercel (3 phút)

1. **Đăng ký Vercel**
   - Vào https://vercel.com
   - Đăng nhập bằng GitHub

2. **Deploy Frontend**
   - Click "Add New Project"
   - Import repository GitHub
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (tự động)
   - **Output Directory**: `dist` (tự động)
   - Thêm Environment Variable:
     ```
     VITE_API_URL=<backend_url_từ_railway>
     ```
   - Click "Deploy"
   - Copy URL frontend (ví dụ: `https://ocha-pos.vercel.app`)

3. **Cập nhật Backend CORS**
   - Quay lại Railway backend
   - Vào "Variables"
   - Cập nhật `FRONTEND_URL` = URL Vercel của bạn

### Bước 3: Test

1. Mở frontend URL
2. Đăng nhập với:
   - Email: `admin@ocha.com`
   - Password: `admin123`

## ✅ Xong! 

Bạn đã deploy thành công! 🎉

---

## 🔧 Nếu Gặp Lỗi

### Backend không chạy được
- Kiểm tra logs trong Railway
- Đảm bảo `DATABASE_URL` đúng format
- Kiểm tra migrations đã chạy chưa

### Frontend không kết nối được Backend
- Kiểm tra `VITE_API_URL` trong Vercel
- Kiểm tra CORS settings trong backend
- Xem console browser để biết lỗi cụ thể

### Database connection error
- Kiểm tra `DATABASE_URL` có đúng không
- Đảm bảo database đã được tạo
- Chạy migrations: `npx prisma migrate deploy`

---

## 📚 Xem Hướng Dẫn Chi Tiết

Xem file `DEPLOY.md` để biết thêm các options khác và troubleshooting chi tiết.

