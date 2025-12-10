# Railway Root Directory Setup Guide

## Giải pháp khi Root Directory là `backend` và `frontend`

Khi bạn đặt Railway Root Directory là `backend` hoặc `frontend`, Railway sẽ clone toàn bộ repo nhưng chỉ build từ thư mục được chỉ định. 

### Cách hoạt động:

1. **Railway clone toàn bộ repo** vào container
2. **Railway chỉ build từ root directory** được chỉ định (ví dụ: `backend`)
3. **Script copy-shared-types.js** sẽ copy `../shared-types` vào `backend/shared-types` hoặc `frontend/shared-types`
4. **Build command** sẽ build shared-types từ thư mục đã copy, sau đó build backend/frontend

### Cấu trúc sau khi copy:

```
backend/
├── shared-types/          (được copy từ ../shared-types)
│   ├── dist/
│   ├── src/
│   └── package.json
├── src/
├── package.json           (sử dụng file:./shared-types)
└── railway.json
```

### Build Process:

1. `node scripts/copy-shared-types.js` - Copy shared-types vào backend/frontend
2. `cd shared-types && npm install && npm run build` - Build shared-types
3. `cd .. && npm install && npm run build` - Build backend/frontend

### Lưu ý:

- Script copy sẽ tự động kiểm tra nếu `../shared-types` tồn tại
- Nếu không tìm thấy, script sẽ báo lỗi
- `shared-types/dist` được commit vào git để đảm bảo có sẵn khi cần

