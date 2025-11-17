# OCHA POS Backend API Documentation

**Base URL:** `http://localhost:8080/api` (hoặc theo cấu hình `BACKEND_PORT`)

**Version:** 1.0.0

---

## 📋 Mục Lục

1. [Authentication & Users](#authentication--users)
2. [Products](#products)
3. [Categories](#categories)
4. [Orders](#orders)
5. [Stock Management](#stock-management)
6. [Dashboard](#dashboard)
7. [Health Check](#health-check)

---

## 🔐 Authentication & Users

### `POST /api/users/login`
Đăng nhập và nhận JWT token.

**Request Body:**
```json
{
  "email": "staff@ocha.com",
  "password": "staff123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "staff@ocha.com",
    "name": "Staff User",
    "role": "STAFF"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Invalid credentials

---

### `GET /api/users/me`
Lấy thông tin user hiện tại (yêu cầu authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "staff@ocha.com",
  "name": "Staff User",
  "role": "STAFF",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found

---

## 🛍️ Products

### `GET /api/products`
Lấy danh sách tất cả sản phẩm.

**Query Parameters:**
- `categoryId` (optional) - Lọc theo category
- `isActive` (optional) - Lọc theo trạng thái active

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Trà sữa truyền thống",
    "price": 38000,
    "description": "Mô tả sản phẩm",
    "image": "https://...",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "Trà sữa"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### `GET /api/products/:id`
Lấy thông tin chi tiết một sản phẩm.

**Response:**
```json
{
  "id": "uuid",
  "name": "Trà sữa truyền thống",
  "price": 38000,
  "description": "Mô tả sản phẩm",
  "image": "https://...",
  "categoryId": "uuid",
  "category": {
    "id": "uuid",
    "name": "Trà sữa"
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `POST /api/products`
Tạo sản phẩm mới.

**Request Body:**
```json
{
  "name": "Trà sữa truyền thống",
  "price": 38000,
  "description": "Mô tả sản phẩm",
  "image": "https://...",
  "categoryId": "uuid",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trà sữa truyền thống",
  "price": 38000,
  "description": "Mô tả sản phẩm",
  "image": "https://...",
  "categoryId": "uuid",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `500` - Server error

---

### `PATCH /api/products/:id`
Cập nhật thông tin sản phẩm (partial update).

**Request Body:**
```json
{
  "name": "Trà sữa truyền thống (Updated)",
  "price": 40000
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trà sữa truyền thống (Updated)",
  "price": 40000,
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Product not found
- `500` - Server error

---

### `DELETE /api/products/:id`
Xóa sản phẩm.

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Product not found
- `500` - Server error

---

## 📂 Categories

### `GET /api/categories`
Lấy danh sách tất cả categories.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Trà sữa",
    "description": "Mô tả category",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### `GET /api/categories/:id`
Lấy thông tin chi tiết một category.

**Response:**
```json
{
  "id": "uuid",
  "name": "Trà sữa",
  "description": "Mô tả category",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `POST /api/categories`
Tạo category mới.

**Request Body:**
```json
{
  "name": "Trà sữa",
  "description": "Mô tả category",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Trà sữa",
  "description": "Mô tả category",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `PATCH /api/categories/:id`
Cập nhật category (partial update).

**Request Body:**
```json
{
  "name": "Trà sữa (Updated)"
}
```

---

### `DELETE /api/categories/:id`
Xóa category.

**Response:**
```json
{
  "message": "Category deleted successfully"
}
```

---

## 🛒 Orders

### `POST /api/orders`
Tạo đơn hàng mới.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "price": 38000,
      "size": "M",
      "toppings": ["Trân châu", "Thạch"],
      "note": "Ít đá"
    }
  ],
  "customerName": "Nguyễn Văn A",
  "paymentMethod": "cash",
  "paymentStatus": "completed",
  "totalAmount": 76000
}
```

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20240101-001",
  "items": [...],
  "totalAmount": 76000,
  "status": "pending",
  "customerName": "Nguyễn Văn A",
  "paymentMethod": "cash",
  "paymentStatus": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `500` - Server error

**Socket.io Event:** Emits `order_created` event to all connected clients.

---

### `GET /api/orders`
Lấy danh sách tất cả đơn hàng.

**Query Parameters:**
- `status` (optional) - Lọc theo status: `pending`, `preparing`, `ready`, `completed`, `cancelled`
- `date` (optional) - Lọc theo ngày (YYYY-MM-DD)
- `limit` (optional) - Số lượng kết quả
- `offset` (optional) - Offset cho pagination

**Response:**
```json
[
  {
    "id": "uuid",
    "orderNumber": "ORD-20240101-001",
    "items": [...],
    "totalAmount": 76000,
    "status": "pending",
    "customerName": "Nguyễn Văn A",
    "paymentMethod": "cash",
    "paymentStatus": "completed",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### `GET /api/orders/today`
Lấy danh sách đơn hàng hôm nay.

**Response:** Tương tự `GET /api/orders`

---

### `GET /api/orders/date/:date`
Lấy danh sách đơn hàng theo ngày.

**URL Parameters:**
- `date` - Ngày theo format `YYYY-MM-DD`

**Response:** Tương tự `GET /api/orders`

---

### `GET /api/orders/:id`
Lấy thông tin chi tiết một đơn hàng.

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20240101-001",
  "items": [...],
  "totalAmount": 76000,
  "status": "pending",
  "customerName": "Nguyễn Văn A",
  "paymentMethod": "cash",
  "paymentStatus": "completed",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `PUT /api/orders/:id/status`
Cập nhật trạng thái đơn hàng.

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid Status Values:**
- `pending`
- `preparing`
- `ready`
- `completed`
- `cancelled`

**Response:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20240101-001",
  "status": "preparing",
  ...
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status
- `404` - Order not found
- `500` - Server error

**Socket.io Events:**
- Emits `order_updated` event
- Emits `order_status_changed` event with `{ orderId, status }`

---

## 📦 Stock Management

### Product Stock

#### `GET /api/stock/products`
Lấy danh sách tất cả product stocks.

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "currentStock": 50,
    "minStock": 10,
    "maxStock": 200,
    "unit": "cái",
    "lastUpdated": 1704067200000,
    "isActive": true,
    "product": {
      "id": "uuid",
      "name": "Trà sữa truyền thống",
      "image": "https://...",
      "category": {
        "id": "uuid",
        "name": "Trà sữa"
      }
    }
  }
]
```

---

#### `GET /api/stock/products/:id`
Lấy thông tin chi tiết một product stock.

**Response:** Tương tự item trong `GET /api/stock/products`

---

#### `POST /api/stock/products`
Tạo product stock mới.

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 50,
  "minStock": 10,
  "maxStock": 200,
  "unit": "cái",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "currentStock": 50,
  "minStock": 10,
  "maxStock": 200,
  "unit": "cái",
  "lastUpdated": 1704067200000,
  "isActive": true,
  "product": {...}
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error or product stock already exists
- `500` - Server error

---

#### `PUT /api/stock/products/:id`
Cập nhật product stock.

**Request Body:**
```json
{
  "quantity": 60,
  "minStock": 15,
  "maxStock": 250,
  "unit": "cái",
  "isActive": true
}
```

**Response:** Tương tự `POST /api/stock/products`

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Product stock not found
- `500` - Server error

---

#### `DELETE /api/stock/products/:id`
Xóa product stock.

**Response:**
```json
{
  "message": "Product stock deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Product stock not found
- `500` - Server error

---

### Ingredient Stock

#### `GET /api/stock/ingredients`
Lấy danh sách tất cả ingredient stocks.

**Response:**
```json
[
  {
    "id": "uuid",
    "ingredientId": "uuid",
    "currentStock": 1000,
    "minStock": 100,
    "maxStock": 5000,
    "unit": "ml",
    "lastUpdated": 1704067200000,
    "isActive": true,
    "ingredient": {
      "id": "uuid",
      "name": "Trân châu đen",
      "unit": "ml"
    }
  }
]
```

---

#### `GET /api/stock/ingredients/:id`
Lấy thông tin chi tiết một ingredient stock.

**Response:** Tương tự item trong `GET /api/stock/ingredients`

---

#### `POST /api/stock/ingredients`
Tạo ingredient và stock mới.

**Request Body:**
```json
{
  "name": "Trân châu đen",
  "unit": "ml",
  "quantity": 1000,
  "minStock": 100,
  "maxStock": 5000,
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "ingredientId": "uuid",
  "currentStock": 1000,
  "minStock": 100,
  "maxStock": 5000,
  "unit": "ml",
  "lastUpdated": 1704067200000,
  "isActive": true,
  "ingredient": {
    "id": "uuid",
    "name": "Trân châu đen",
    "unit": "ml"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error or ingredient name already exists
- `500` - Server error

---

#### `PUT /api/stock/ingredients/:id`
Cập nhật ingredient stock (số lượng, min/max stock, isActive).

**Request Body:**
```json
{
  "quantity": 1200,
  "minStock": 150,
  "maxStock": 6000,
  "isActive": true
}
```

**Response:** Tương tự `POST /api/stock/ingredients`

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `404` - Ingredient stock not found
- `500` - Server error

---

#### `DELETE /api/stock/ingredients/:id`
Xóa ingredient và stock của nó.

**Response:**
```json
{
  "message": "Ingredient and its stock deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Ingredient not found
- `500` - Server error

---

### Stock Transactions

#### `POST /api/stock/transactions`
Tạo stock transaction mới.

**Request Body:**
```json
{
  "productId": "uuid",  // Optional, phải có productId hoặc ingredientId
  "ingredientId": null,
  "type": "SALE",  // SALE, PURCHASE, ADJUSTMENT, RETURN
  "quantity": 5,
  "reason": "Bán hàng",
  "userId": "uuid"  // Optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "ingredientId": null,
  "type": "sale",
  "quantity": 5,
  "reason": "Bán hàng",
  "timestamp": 1704067200000,
  "userId": "uuid",
  "product": {
    "id": "uuid",
    "name": "Trà sữa truyền thống"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `500` - Server error

**Note:** Transaction sẽ tự động cập nhật stock quantity:
- `SALE`: Giảm stock
- `PURCHASE`, `ADJUSTMENT`, `RETURN`: Tăng stock

---

#### `GET /api/stock/transactions`
Lấy danh sách transactions.

**Query Parameters:**
- `productId` (optional) - Lọc theo product
- `ingredientId` (optional) - Lọc theo ingredient

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "type": "sale",
    "quantity": 5,
    "reason": "Bán hàng",
    "timestamp": 1704067200000,
    "product": {
      "id": "uuid",
      "name": "Trà sữa truyền thống"
    }
  }
]
```

---

#### `GET /api/stock/transactions/:id`
Lấy thông tin chi tiết một transaction.

**Response:** Tương tự item trong `GET /api/stock/transactions`

---

### Stock Alerts

#### `POST /api/stock/alerts`
Tạo stock alert mới.

**Request Body:**
```json
{
  "productId": "uuid",  // Optional, phải có productId hoặc ingredientId
  "ingredientId": null,
  "type": "LOW_STOCK",  // LOW_STOCK, OUT_OF_STOCK, OVERSTOCK
  "message": "Sản phẩm sắp hết hàng"
}
```

**Response:**
```json
{
  "id": "uuid",
  "productId": "uuid",
  "ingredientId": null,
  "type": "low_stock",
  "message": "Sản phẩm sắp hết hàng",
  "timestamp": 1704067200000,
  "isRead": false,
  "product": {
    "id": "uuid",
    "name": "Trà sữa truyền thống"
  }
}
```

---

#### `GET /api/stock/alerts`
Lấy danh sách alerts.

**Query Parameters:**
- `productId` (optional) - Lọc theo product
- `ingredientId` (optional) - Lọc theo ingredient
- `isRead` (optional) - Lọc theo trạng thái đã đọc: `true` hoặc `false`

**Response:**
```json
[
  {
    "id": "uuid",
    "productId": "uuid",
    "type": "low_stock",
    "message": "Sản phẩm sắp hết hàng",
    "timestamp": 1704067200000,
    "isRead": false,
    "product": {...}
  }
]
```

---

#### `GET /api/stock/alerts/:id`
Lấy thông tin chi tiết một alert.

**Response:** Tương tự item trong `GET /api/stock/alerts`

---

#### `PUT /api/stock/alerts/:id`
Cập nhật alert.

**Request Body:**
```json
{
  "isRead": true,
  "message": "Updated message"  // Optional
}
```

**Response:** Tương tự `POST /api/stock/alerts`

---

#### `PUT /api/stock/alerts/:id/read`
Đánh dấu alert là đã đọc.

**Response:**
```json
{
  "id": "uuid",
  "isRead": true,
  ...
}
```

---

#### `DELETE /api/stock/alerts/:id`
Xóa alert.

**Response:**
```json
{
  "message": "Stock alert deleted successfully"
}
```

---

## 📊 Dashboard

### `GET /api/dashboard/stats`
Lấy thống kê tổng quan dashboard.

**Response:**
```json
{
  "overview": {
    "totalProducts": 50,
    "totalIngredients": 20,
    "totalOrders": 1000,
    "todayOrders": 25,
    "todayRevenue": "950000",
    "totalRevenue": "38000000",
    "averageOrderValue": "38000"
  },
  "ordersByStatus": {
    "pending": 5,
    "preparing": 3,
    "ready": 2,
    "completed": 15,
    "cancelled": 0
  },
  "paymentStats": {
    "cash": {
      "count": 20,
      "total": "760000"
    },
    "card": {
      "count": 5,
      "total": "190000"
    }
  },
  "topProducts": [
    {
      "productId": "uuid",
      "productName": "Trà sữa truyền thống",
      "category": "Trà sữa",
      "quantitySold": 50,
      "revenue": "1900000"
    }
  ],
  "hourlyRevenue": [
    {
      "hour": 9,
      "revenue": "95000",
      "orderCount": 2
    }
  ],
  "lowStock": {
    "products": [
      {
        "id": "uuid",
        "productId": "uuid",
        "productName": "Trà sữa truyền thống",
        "quantity": "5",
        "minStock": "10"
      }
    ],
    "ingredients": [
      {
        "id": "uuid",
        "ingredientId": "uuid",
        "ingredientName": "Trân châu đen",
        "quantity": "50",
        "minStock": "100"
      }
    ]
  },
  "recentOrders": [
    {
      "id": "uuid",
      "orderNumber": "ORD-20240101-001",
      "status": "completed",
      "totalAmount": "76000",
      "createdAt": "2024-01-01T10:00:00.000Z",
      "itemCount": 2,
      "customerName": "Nguyễn Văn A",
      "paymentMethod": "cash",
      "paymentStatus": "completed",
      "products": [
        {
          "name": "Trà sữa truyền thống",
          "quantity": 2,
          "price": "38000"
        }
      ]
    }
  ]
}
```

---

### `GET /api/dashboard/daily-sales`
Lấy dữ liệu bán hàng theo ngày.

**Query Parameters:**
- `date` (optional) - Ngày theo format `YYYY-MM-DD` (mặc định: hôm nay)

**Response:**
```json
{
  "date": "2024-01-01",
  "totalRevenue": "950000",
  "totalOrders": 25,
  "orders": [
    {
      "id": "uuid",
      "orderNumber": "ORD-20240101-001",
      "timestamp": 1704067200000,
      "total": 76000,
      "items": 2,
      "customerName": "Nguyễn Văn A",
      "paymentMethod": "cash",
      "products": [
        {
          "name": "Trà sữa truyền thống",
          "quantity": 2,
          "price": 38000,
          "size": "M",
          "toppings": ["Trân châu"],
          "note": "Ít đá"
        }
      ]
    }
  ]
}
```

---

## ❤️ Health Check

### `GET /health`
Kiểm tra trạng thái server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### `GET /api`
Thông tin API.

**Response:**
```json
{
  "message": "OCHA POS Backend API",
  "version": "1.0.0",
  "endpoints": {
    "products": "/api/products",
    "categories": "/api/categories",
    "orders": "/api/orders",
    "stock": "/api/stock",
    "dashboard": "/api/dashboard",
    "health": "/health"
  },
  "documentation": "See API_ENDPOINTS.md for detailed API documentation"
}
```

---

## 🔌 Socket.io Events

Server phát các events sau qua Socket.io:

### `order_created`
Khi có đơn hàng mới được tạo.

**Payload:**
```json
{
  "id": "uuid",
  "orderNumber": "ORD-20240101-001",
  "status": "pending",
  ...
}
```

### `order_updated`
Khi đơn hàng được cập nhật.

**Payload:** Tương tự `order_created`

### `order_status_changed`
Khi trạng thái đơn hàng thay đổi.

**Payload:**
```json
{
  "orderId": "uuid",
  "status": "preparing"
}
```

### `display_update`
Cập nhật cho display screen (room: `display`).

### `stock_alert`
Cảnh báo tồn kho (room: `dashboard`).

### `dashboard_update`
Cập nhật dashboard (room: `dashboard`).

---

## 🔒 Authentication

Hầu hết các endpoints hiện tại là **public** (không yêu cầu authentication), ngoại trừ:
- `GET /api/users/me` - Yêu cầu JWT token

**Cách sử dụng JWT:**
```
Authorization: Bearer <token>
```

Token được lấy từ `POST /api/users/login`.

---

## 📝 Notes

1. **Rate Limiting:** Áp dụng trong production (100 requests / 15 phút / IP)
2. **CORS:** Chỉ cho phép requests từ `FRONTEND_URL` trong `.env`
3. **Error Format:** Tất cả errors trả về format:
   ```json
   {
     "error": "Error message",
     "details": [...]  // Optional, cho validation errors
   }
   ```
4. **Timestamps:** Sử dụng Unix timestamp (milliseconds) hoặc ISO 8601 string
5. **Decimal Values:** Giá trị tiền tệ trả về dưới dạng string (Decimal type từ Prisma)

---

**Last Updated:** 2024-01-01

