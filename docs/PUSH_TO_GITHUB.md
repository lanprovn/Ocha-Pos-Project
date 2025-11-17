# 🚀 Hướng Dẫn Push Project Lên GitHub

## ✅ Đã Cấu Hình

- ✅ Remote URL đã được cập nhật: `https://github.com/lanprovn/Ocha-Pos-Project.git`
- ✅ File `.gitignore` đã có (đảm bảo `.env` không bị commit)

## 📋 Các Bước Push Lên GitHub

### Bước 1: Kiểm Tra Remote

```bash
git remote -v
```

Kết quả mong đợi:
```
origin  https://github.com/lanprovn/Ocha-Pos-Project.git (fetch)
origin  https://github.com/lanprovn/Ocha-Pos-Project.git (push)
```

### Bước 2: Thêm Tất Cả File Mới

```bash
git add .
```

### Bước 3: Commit Các Thay Đổi

```bash
git commit -m "Initial commit: OCHA POS Project with full features"
```

Hoặc commit message chi tiết hơn:
```bash
git commit -m "feat: Complete OCHA POS Project

- Backend: Express + TypeScript + Prisma + PostgreSQL
- Frontend: React + Vite + TypeScript
- Features:
  - Authentication & Authorization
  - POS System with real-time updates
  - Stock Management (Products & Ingredients)
  - Order Management
  - Dashboard with analytics
  - Payment Gateway (VNPay + Bank QR Code)
  - Socket.io for real-time communication
  - Full CRUD operations
"
```

### Bước 4: Push Lên GitHub

```bash
git push -u origin main
```

Nếu branch của bạn là `master`:
```bash
git push -u origin master
```

## ⚠️ Lưu Ý Quan Trọng

### 1. File `.env` KHÔNG Được Commit

File `.env` đã được thêm vào `.gitignore`, nhưng hãy kiểm tra lại:

```bash
git status
```

Đảm bảo không thấy file `.env` trong danh sách file sẽ được commit.

### 2. Tạo File `.env.example`

Nên tạo file `.env.example` để hướng dẫn người khác cấu hình:

```bash
# Backend .env.example
cp backend/.env backend/.env.example
# Sau đó xóa các giá trị nhạy cảm trong .env.example
```

### 3. Kiểm Tra File Nhạy Cảm

Trước khi push, đảm bảo các file sau KHÔNG được commit:
- ✅ `.env` (đã có trong .gitignore)
- ✅ `.env.local` (đã có trong .gitignore)
- ✅ `node_modules/` (đã có trong .gitignore)
- ✅ Database files (đã có trong .gitignore)

## 🔍 Kiểm Tra Trước Khi Push

```bash
# Xem các file sẽ được commit
git status

# Xem các thay đổi
git diff

# Kiểm tra .env có bị commit không
git ls-files | grep .env
```

Nếu thấy `.env` trong kết quả, cần xóa khỏi git:
```bash
git rm --cached backend/.env
git rm --cached frontend/.env.local
```

## 📝 Sau Khi Push

1. Kiểm tra trên GitHub: https://github.com/lanprovn/Ocha-Pos-Project
2. Đảm bảo tất cả file đã được push
3. Kiểm tra file `.env` KHÔNG có trong repository

## 🎉 Hoàn Tất

Sau khi push thành công, project của bạn sẽ có trên GitHub!

---

**Lưu ý:** Nếu gặp lỗi authentication, bạn có thể cần:
- Tạo Personal Access Token trên GitHub
- Hoặc sử dụng SSH key thay vì HTTPS

