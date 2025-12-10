# Railway Setup Guide for Monorepo

## Vấn đề

Railway đang build từ thư mục `backend`, nhưng `shared-types` ở cùng cấp với `backend` trong monorepo. Khi Railway build từ `backend` folder, nó không thể tìm thấy `../shared-types`.

## Giải pháp

### Cách 1: Configure Railway để deploy từ root (Khuyến nghị)

1. Vào Railway Dashboard → Service "Ocha-Pos-Project" → Settings
2. Tìm "Root Directory" hoặc "Source"
3. Đặt thành `.` (root) hoặc để trống
4. Nếu có option "Monorepo", bật và chọn `backend` làm service path

### Cách 2: Sử dụng Railway Monorepo Support

1. Railway Dashboard → Project Settings
2. Tìm "Monorepo" settings
3. Configure để Railway biết cấu trúc monorepo:
   - Root: `.` (root của repo)
   - Backend service path: `backend`
   - Frontend service path: `frontend`

### Cách 3: Build từ root với buildCommand

Nếu Railway deploy từ root, build command trong `backend/railway.json` sẽ hoạt động:
```json
{
  "buildCommand": "cd backend && npm install && npm run build"
}
```

Nhưng cần build shared-types trước:
```json
{
  "buildCommand": "cd shared-types && npm install && npm run build && cd ../backend && npm install && npm run build"
}
```

## Kiểm tra

Sau khi config:
1. Railway sẽ build từ root của monorepo
2. Build command sẽ tìm thấy `shared-types` folder
3. Build sẽ thành công

## Lưu ý

- Railway có thể tự động detect monorepo nếu có `package.json` ở root với workspaces
- Đảm bảo root `package.json` có workspaces config đúng
- Nếu vẫn lỗi, có thể cần manual config Root Directory trong Railway Settings

