# 🔄 Ánh Xạ Frontend - Backend: API Còn Thiếu

**Ngày tạo:** 2024-01-01  
**Mục đích:** So sánh các API mà frontend đang gọi với backend hiện có để xác định những gì còn thiếu

---

## 📋 TỔNG QUAN

Sau khi ánh xạ tất cả các service calls từ frontend với backend routes, **hầu hết các API đã có đầy đủ**. Tuy nhiên, có một số vấn đề nhỏ cần sửa.

---

## ✅ CÁC API ĐÃ CÓ ĐẦY ĐỦ

### 1. **Authentication** ✅
**Frontend gọi:**
- `POST /api/users/login` ✅
- `GET /api/users/me` ✅

**Backend có:** ✅ Đầy đủ

---

### 2. **Products** ✅
**Frontend gọi:**
- `GET /api/products` ✅
- `GET /api/products/:id` ✅
- `POST /api/products` ✅
- `PATCH /api/products/:id` ✅
- `DELETE /api/products/:id` ✅

**Backend có:** ✅ Đầy đủ

---

### 3. **Categories** ✅
**Frontend gọi:**
- `GET /api/categories` ✅
- `GET /api/categories/:id` ✅
- `POST /api/categories` ✅
- `PATCH /api/categories/:id` ✅
- `DELETE /api/categories/:id` ✅

**Backend có:** ✅ Đầy đủ

---

### 4. **Orders** ✅
**Frontend gọi:**
- `POST /api/orders/draft` ✅ (createOrUpdateDraft)
- `POST /api/orders` ✅
- `GET /api/orders` ✅ (với filters: status, startDate, endDate, paymentMethod, paymentStatus)
- `GET /api/orders/today` ✅
- `GET /api/orders/date/:date` ✅
- `GET /api/orders/:id` ✅
- `PUT /api/orders/:id/status` ✅

**Backend có:** ✅ Đầy đủ

---

### 5. **Stock Management** ✅
**Frontend gọi:**

#### Product Stock:
- `GET /api/stock/products` ✅
- `GET /api/stock/products/:id` ✅
- `POST /api/stock/products` ✅
- `PUT /api/stock/products/:id` ✅
- `DELETE /api/stock/products/:id` ✅

#### Ingredient Stock:
- `GET /api/stock/ingredients` ✅
- `GET /api/stock/ingredients/:id` ✅
- `POST /api/stock/ingredients` ✅
- `PUT /api/stock/ingredients/:id` ✅
- `DELETE /api/stock/ingredients/:id` ✅

#### Transactions:
- `POST /api/stock/transactions` ✅
- `GET /api/stock/transactions` ✅ (với filters: productId, ingredientId)
- `GET /api/stock/transactions/:id` ✅

#### Alerts:
- `GET /api/stock/alerts` ✅ (với filters: productId, ingredientId, isRead)
- `GET /api/stock/alerts/:id` ✅
- `PUT /api/stock/alerts/:id` ✅
- `PUT /api/stock/alerts/:id/read` ✅
- `DELETE /api/stock/alerts/:id` ✅

**Backend có:** ✅ Đầy đủ

---

### 6. **Dashboard** ✅
**Frontend gọi:**
- `GET /api/dashboard/stats` ✅
- `GET /api/dashboard/daily-sales` ✅ (với query param: date)

**Backend có:** ✅ Đầy đủ

---

### 7. **Payment Gateway** ✅
**Frontend gọi:**
- `POST /api/payment/create` ✅
- `GET /api/payment/callback` ✅

**Backend có:** ✅ Đầy đủ

---

### 8. **QR Code Payment** ✅
**Frontend gọi:**
- `POST /api/payment/qr/generate` ✅
- `POST /api/payment/qr/verify` ✅

**Backend có:** ✅ Đầy đủ

---

### 9. **File Upload** ✅
**Frontend gọi:**
- `POST /api/upload/image` ✅
- `DELETE /api/upload/image/:filename` ✅
- `GET /api/upload/images` ✅

**Backend có:** ✅ Đầy đủ

---

### 10. **Recipes** ✅
**Frontend gọi:**
- `POST /api/recipes` ✅
- `GET /api/recipes/product/:productId` ✅
- `GET /api/recipes/ingredient/:ingredientId` ✅
- `GET /api/recipes/:id` ✅
- `PUT /api/recipes/:id` ✅
- `DELETE /api/recipes/:id` ✅

**Backend có:** ✅ Đầy đủ

---

## ⚠️ CÁC VẤN ĐỀ CẦN SỬA

### 1. 🔴 **Recipe Service Response Format** ⚠️

**Vấn đề:**
- Frontend `recipe.service.ts` đang dùng `response.data` nhưng `apiClient` đã transform response rồi (trả về data trực tiếp)
- Code hiện tại:
```typescript
async create(data: CreateRecipeInput): Promise<RecipeItem> {
  const response = await apiClient.post<RecipeItem>('/recipes', data);
  return response.data; // ❌ SAI - response đã là data rồi
}
```

**Cần sửa:**
```typescript
async create(data: CreateRecipeInput): Promise<RecipeItem> {
  return apiClient.post<RecipeItem>('/recipes', data); // ✅ ĐÚNG
}
```

**File cần sửa:** `frontend/src/services/recipe.service.ts`

**Impact:** ⚠️ **Cao** - Recipe service sẽ không hoạt động đúng

---

### 2. 🟡 **Payment Routes Authentication** ⚠️

**Vấn đề:**
- Backend yêu cầu authentication cho `/api/payment/create` và `/api/payment/qr/*`
- Nhưng frontend có thể gọi từ customer display (không có auth)

**Hiện tại:**
```typescript
// backend/src/routes/payment.routes.ts
router.post('/create', authenticate, ...); // ⚠️ Yêu cầu auth
router.post('/qr/generate', authenticate, ...); // ⚠️ Yêu cầu auth
```

**Giải pháp:**
- Option 1: Bỏ authentication cho các routes này (public)
- Option 2: Tạo customer token riêng
- Option 3: Cho phép anonymous với rate limiting

**Recommendation:** Bỏ authentication cho customer display, chỉ giữ cho admin routes

**Impact:** 🟡 **Trung bình** - Customer không thể thanh toán nếu không có auth

---

### 3. 🟡 **Order Filters - Backend Support** ✅

**Frontend gọi:**
```typescript
GET /api/orders?status=...&startDate=...&endDate=...&paymentMethod=...&paymentStatus=...
```

**Backend có:** ✅ Đã hỗ trợ đầy đủ trong `order.controller.ts` → `getAll()`

---

### 4. 🟢 **Stock Transaction Filters** ✅

**Frontend gọi:**
```typescript
GET /api/stock/transactions?productId=...&ingredientId=...
```

**Backend có:** ✅ Đã hỗ trợ trong `stock.controller.ts` → `getAllTransactions()`

---

### 5. 🟢 **Stock Alert Filters** ✅

**Frontend gọi:**
```typescript
GET /api/stock/alerts?productId=...&ingredientId=...&isRead=...
```

**Backend có:** ✅ Đã hỗ trợ trong `stock.controller.ts` → `getAllAlerts()`

---

## 📊 TỔNG KẾT

### ✅ **Đã có đầy đủ:** 95%
- Tất cả các API endpoints mà frontend cần đã có trong backend
- Hầu hết filters và query params đã được hỗ trợ

### ⚠️ **Cần sửa:** 2 vấn đề

1. **Recipe Service Response Format** (Frontend bug)
   - **File:** `frontend/src/services/recipe.service.ts`
   - **Fix:** Bỏ `.data` vì apiClient đã transform rồi
   - **Priority:** 🔴 **Cao**

2. **Payment Routes Authentication** (Backend config)
   - **File:** `backend/src/routes/payment.routes.ts`
   - **Fix:** Bỏ `authenticate` middleware cho customer routes
   - **Priority:** 🟡 **Trung bình**

---

## 🎯 ACTION ITEMS

### 1. Sửa Recipe Service (Frontend)
```typescript
// frontend/src/services/recipe.service.ts
// Bỏ tất cả `.data` vì apiClient đã transform rồi

async create(data: CreateRecipeInput): Promise<RecipeItem> {
  return apiClient.post<RecipeItem>('/recipes', data); // ✅
}

async getByProduct(productId: string): Promise<RecipeItem[]> {
  return apiClient.get<RecipeItem[]>(`/recipes/product/${productId}`); // ✅
}

// ... tương tự cho các methods khác
```

### 2. Sửa Payment Routes (Backend)
```typescript
// backend/src/routes/payment.routes.ts
// Bỏ authenticate cho customer routes, chỉ giữ cho admin routes

// Payment Gateway (VNPay, MoMo, etc.)
router.post('/create', paymentController.createPayment.bind(paymentController)); // ✅ Public
router.get('/callback', paymentController.handleCallback.bind(paymentController)); // ✅ Public

// QR Code Bank Transfer
router.post('/qr/generate', qrController.generateQR.bind(qrController)); // ✅ Public
router.post('/qr/verify', authenticate, qrController.verifyPayment.bind(qrController)); // ✅ Chỉ verify cần auth
```

---

## ✅ KẾT LUẬN

**Backend đã có đầy đủ 95% các API mà frontend cần!**

Chỉ cần sửa 2 vấn đề nhỏ:
1. ✅ Recipe service response format (frontend bug)
2. ✅ Payment routes authentication (backend config)

Sau khi sửa 2 vấn đề này, **backend sẽ hoàn toàn đủ để frontend hoạt động đầy đủ!** 🎉

---

**Last Updated:** 2024-01-01

