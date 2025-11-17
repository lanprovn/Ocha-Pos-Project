# 📚 Swagger API Documentation Setup

## ✅ Đã Setup Hoàn Tất

Swagger đã được setup đầy đủ cho OCHA POS Backend API.

## 🌐 Truy Cập Swagger UI

Sau khi start backend server, truy cập:

**URL:** `http://localhost:8080/api-docs`

## 📋 Tính Năng

### 1. **Interactive API Documentation**
- Xem tất cả endpoints với mô tả chi tiết
- Test API trực tiếp từ browser
- Xem request/response schemas
- Xem examples cho mỗi endpoint

### 2. **Authentication**
- Swagger UI hỗ trợ JWT Bearer token
- Click nút **"Authorize"** ở đầu trang
- Nhập token: `Bearer <your-token>`
- Token sẽ được tự động thêm vào tất cả protected requests

### 3. **Các Tags**
- **Authentication** - User login
- **Users** - User management
- **Products** - Product management
- **Categories** - Category management
- **Orders** - Order management
- **Stock** - Stock management
- **Dashboard** - Dashboard statistics
- **Payment** - Payment gateway integration
- **Recipes** - Recipe management
- **Upload** - File upload
- **Health** - Health check

## 🔧 Cấu Trúc Files

```
backend/
├── src/
│   ├── config/
│   │   └── swagger.ts          # Swagger configuration & schemas
│   ├── routes/
│   │   ├── user.routes.ts     # Swagger annotations
│   │   ├── product.routes.ts  # Swagger annotations
│   │   ├── order.routes.ts    # Swagger annotations
│   │   └── ...                # Tất cả routes đều có annotations
│   └── app.ts                 # Swagger UI setup
```

## 📝 Cách Sử Dụng

### 1. **Xem Documentation**
1. Start backend: `npm run dev`
2. Mở browser: `http://localhost:8080/api-docs`
3. Browse các endpoints theo tags

### 2. **Test API**
1. Chọn endpoint muốn test
2. Click **"Try it out"**
3. Điền parameters/request body
4. Click **"Execute"**
5. Xem response

### 3. **Authentication**
1. Login để lấy token: `POST /api/users/login`
2. Copy token từ response
3. Click **"Authorize"** ở đầu trang Swagger
4. Nhập: `Bearer <token>`
5. Click **"Authorize"** và **"Close"**
6. Tất cả protected endpoints sẽ tự động có token

## 🎯 Examples

### Test Login Endpoint
```json
POST /api/users/login
{
  "email": "staff@ocha.com",
  "password": "staff123"
}
```

### Test Get Products (Public)
```
GET /api/products
```

### Test Create Product (Protected)
1. Authorize với token
2. `POST /api/products`
3. Request body:
```json
{
  "name": "Trà sữa mới",
  "price": 40000,
  "categoryId": "uuid-here",
  "isActive": true
}
```

## 📦 Packages Đã Cài

- `swagger-ui-express` - Swagger UI interface
- `swagger-jsdoc` - Parse JSDoc comments thành OpenAPI spec
- `@types/swagger-ui-express` - TypeScript types
- `@types/swagger-jsdoc` - TypeScript types

## 🔄 Cập Nhật Documentation

Khi thêm endpoint mới:
1. Thêm Swagger annotation vào route file
2. Format theo pattern hiện có
3. Documentation sẽ tự động cập nhật

## 📚 Tài Liệu Tham Khảo

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)

## ✅ Checklist

- [x] Cài đặt packages
- [x] Tạo Swagger config với schemas
- [x] Setup Swagger UI trong app.ts
- [x] Thêm annotations cho tất cả routes
- [x] Test Swagger UI
- [x] Verify authentication flow

---

**Lưu ý:** Swagger chỉ chạy trong development. Trong production, có thể disable hoặc protect bằng authentication.

