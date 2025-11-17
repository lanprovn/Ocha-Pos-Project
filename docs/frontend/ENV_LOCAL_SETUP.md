# Frontend Environment Setup

Cấu hình file `.env.local` cho frontend.

## Tạo file

```bash
cd frontend
cp env.example .env.local
```

## Cấu hình

Mở `.env.local` và thêm:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_API=true
```

## Giải thích

- `VITE_API_BASE_URL`: URL của backend API
- `VITE_USE_API`: `true` để dùng API thật, `false` để dùng mock data

## Lưu ý

- File `.env.local` đã được gitignore, không commit
- Tất cả biến `VITE_*` sẽ được expose ra client code
- **Không** đặt secrets/API keys trong frontend env
- Sau khi sửa `.env.local`, cần restart dev server

## Production

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_USE_API=true
```
