# ⚡ Deploy Quick Reference - Railway + Netlify

## 🎯 Tóm Tắt Nhanh

### Railway (Backend)
1. New Project → Provision PostgreSQL → Copy `DATABASE_URL`
2. New → GitHub Repo → Root: `backend`
3. Variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<from_postgres>`
   - `JWT_SECRET=<32_chars>`
   - `FRONTEND_URL=<netlify_url>` (cập nhật sau)
   - `BACKEND_URL=<railway_url>` (cập nhật sau)
4. Copy Backend URL → Cập nhật `BACKEND_URL`

### Netlify (Frontend)
1. Add site → GitHub → Root: `frontend`
2. Build: `npm run build`
3. Publish: `frontend/dist`
4. Variable: `VITE_API_URL=<railway_backend_url>`
5. Copy Frontend URL → Cập nhật `FRONTEND_URL` trong Railway

---

## 📝 Environment Variables

### Railway Backend
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-32-char-secret-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-app.netlify.app
BACKEND_URL=https://your-backend.up.railway.app
LOG_LEVEL=info
```

### Netlify Frontend
```env
VITE_API_URL=https://your-backend.up.railway.app
```

**⚠️ Lưu ý:** 
- `VITE_API_URL` **KHÔNG** có `/api` ở cuối
- Frontend tự động thêm `/api` trong code

---

## 🔍 Quick Checks

### Backend Health
```
https://your-backend.up.railway.app/health
```
Expected: `{"status":"ok"}`

### Login Credentials
- Staff: `staff@ocha.com` / `staff123`
- Admin: `admin@ocha.com` / `admin123`

---

## 🐛 Common Issues

| Lỗi | Giải Pháp |
|-----|-----------|
| CORS Error | Kiểm tra `FRONTEND_URL` trong Railway = URL Netlify |
| Build Failed | Test build local trước: `npm run build` |
| Database Error | Kiểm tra `DATABASE_URL` từ PostgreSQL service |
| Login Failed | Đợi seed script chạy (kiểm tra Railway logs) |
| Socket.io Error | Kiểm tra `VITE_API_URL` đúng Backend URL |

---

## 📚 Full Guides

- **Chi tiết từng bước:** [`DEPLOY_STEP_BY_STEP.md`](./DEPLOY_STEP_BY_STEP.md)
- **Checklist:** [`DEPLOY_CHECKLIST.md`](./DEPLOY_CHECKLIST.md)
- **So sánh platforms:** [`DEPLOY_RECOMMENDATION.md`](./DEPLOY_RECOMMENDATION.md)

---

**🚀 Bắt đầu deploy ngay:** Mở [`DEPLOY_STEP_BY_STEP.md`](./DEPLOY_STEP_BY_STEP.md)

