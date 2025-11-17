# Troubleshooting

Các vấn đề thường gặp và cách xử lý.

## Frontend trang trắng

**Kiểm tra:**
1. Mở Browser Console (F12) xem có lỗi không
2. Kiểm tra backend đang chạy: `curl http://localhost:8080/health`
3. Kiểm tra `.env.local` có đúng VITE_API_BASE_URL không

**Giải pháp nhanh:**
- Tắt API tạm thời: Set `VITE_USE_API=false` trong `.env.local`
- Restart dev server

## API không kết nối được

**Lỗi "Failed to fetch" hoặc "Network Error":**
- Backend chưa chạy → Start backend: `cd backend && npm run dev`
- CORS issue → Kiểm tra FRONTEND_URL trong backend/.env
- Port sai → Kiểm tra VITE_API_BASE_URL trong frontend/.env.local

**Lỗi CORS:**
- Đảm bảo backend/.env có `FRONTEND_URL=http://localhost:3000`
- Restart backend sau khi sửa .env

## Socket.io không hoạt động

- Kiểm tra cả backend và frontend đều đang chạy
- Kiểm tra CORS config trong backend
- Xem console có lỗi WebSocket không

## Build errors

**TypeScript errors:**
- Chạy `npm run build` để xem lỗi chi tiết
- Fix type errors trước khi deploy

**Module not found:**
- Xóa `node_modules` và `package-lock.json`
- Chạy lại `npm install`

## Database connection failed

**Backend không kết nối được DB:**
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra DATABASE_URL trong backend/.env đúng format
- Test connection: `psql -U postgres -d ocha_pos`

## Payment không hoạt động

**VNPay:**
- Kiểm tra credentials trong backend/.env
- Test với sandbox trước
- Kiểm tra return URL đúng

**QR Code:**
- Kiểm tra BANK_CODE, BANK_ACCOUNT_NUMBER trong backend/.env
- Test với VietQR API trước

## Vẫn không giải quyết được?

1. Xem logs chi tiết trong terminal
2. Kiểm tra lại các file .env
3. Restart cả backend và frontend
4. Clear browser cache
5. Tạo issue trên GitHub với logs và error messages
