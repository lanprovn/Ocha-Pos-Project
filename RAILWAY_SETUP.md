# Railway Setup Guide for Monorepo

## ⚠️ VẤN ĐỀ QUAN TRỌNG

Railway đang build từ thư mục `backend`, nhưng `shared-types` ở cùng cấp với `backend` trong monorepo. Khi Railway build từ `backend` folder, nó không thể tìm thấy `../shared-types`.

## ✅ GIẢI PHÁP BẮT BUỘC

### Bước 1: Configure Railway Root Directory (BẮT BUỘC)

1. Vào **Railway Dashboard** → Service **"Ocha-Pos-Project"** → **Settings**
2. Tìm **"Root Directory"** hoặc **"Source"** hoặc **"Working Directory"**
3. **Đặt thành `.` (root)** hoặc **để trống** (nếu đang là `backend`, phải đổi)
4. **Lưu settings**

### Bước 2: Verify Configuration

Sau khi config:
- Railway sẽ build từ **root của monorepo**
- Build command sẽ tìm thấy `shared-types` folder
- Build sẽ thành công

### Bước 3: Nếu không có option Root Directory

Nếu Railway không có option Root Directory:
1. **Disconnect** service khỏi GitHub repo (nếu đã connect)
2. **Reconnect** và chọn **root của repo** (không chọn `backend` folder)
3. Railway sẽ tự động detect monorepo từ root `package.json`

## 📋 Cấu trúc Monorepo

```
ocha-pos-project/
├── package.json          (root với workspaces)
├── railway.json          (root config - optional)
├── backend/
│   ├── railway.json      (backend config)
│   └── package.json
├── frontend/
│   ├── railway.json      (frontend config)
│   └── package.json
└── shared-types/
    └── package.json
```

## 🔧 Build Commands

### Backend (từ root):
```bash
cd shared-types && npm install && npm run build && cd ../backend && npm install && npm run build
```

### Frontend (từ root):
```bash
cd shared-types && npm install && npm run build && cd ../frontend && npm install && npm run build
```

## ⚡ Quick Fix

Nếu Railway vẫn build từ `backend` folder:
1. **Delete** service trên Railway
2. **Create new service** và connect với GitHub repo
3. **Chọn root của repo** (không chọn subfolder)
4. Railway sẽ tự động detect và build đúng

## 📝 Lưu ý

- Railway có thể tự động detect monorepo nếu có `package.json` ở root với workspaces
- Đảm bảo root `package.json` có workspaces config đúng: `["backend", "frontend", "shared-types"]`
- Nếu vẫn lỗi, có thể cần manual config Root Directory trong Railway Settings

