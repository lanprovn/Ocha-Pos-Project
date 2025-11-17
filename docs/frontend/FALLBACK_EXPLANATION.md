# 🔄 Giải thích: Tại sao tắt backend nhưng dữ liệu vẫn hiện?

## 💡 Nguyên nhân

Frontend có **cơ chế fallback tự động** về mock data khi:
- Backend không chạy
- API lỗi
- Network error
- Timeout

Đây là **tính năng bảo vệ** để frontend vẫn hoạt động được ngay cả khi backend có vấn đề.

---

## 🔍 Cách hoạt động

### Khi Backend đang chạy:
```
Frontend → Gọi API → Backend → Database → Trả về data thật
```

### Khi Backend tắt:
```
Frontend → Gọi API → ❌ Lỗi → Tự động fallback → Mock data (products.json)
```

---

## 📋 Code trong ProductContext.tsx

```typescript
try {
  if (USE_API) {
    // Thử gọi API
    const [apiProducts, apiCategories] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
    ]);
    // ... transform và set data
  }
} catch (error) {
  // ⚠️ Nếu API lỗi → Tự động fallback về mock data
  console.error('Error loading products:', error);
  console.warn('Falling back to mock data...');
  // Load từ products.json
  const mockProducts = productsData.products.map(...);
  setProducts(mockProducts);
}
```

---

## 🧪 Cách kiểm tra

### 1. Mở Console (F12)
Tìm log:
```
Error loading products: ...
Falling back to mock data...
```

**Nếu thấy log này:**
- ✅ Frontend đã phát hiện backend tắt
- ✅ Đang dùng mock data từ `products.json`

### 2. Mở Network Tab (F12)
- Reload trang (F5)
- Tìm request `products` (xhr)
- Xem status:
  - ❌ **Failed** hoặc **CORS error** → Backend tắt, đã fallback
  - ✅ **200 OK** → Backend đang chạy

### 3. So sánh dữ liệu
**Mock data (products.json):**
- Có 53 products
- Có đầy đủ images, prices
- Có categories, restaurants

**Backend data:**
- Cũng có 53 products (sau khi seed)
- Nhưng format có thể hơi khác (UUID thay vì số)

---

## 🎯 Tại sao thiết kế như vậy?

### Ưu điểm:
1. ✅ Frontend vẫn hoạt động khi backend có vấn đề
2. ✅ Developer có thể test frontend độc lập
3. ✅ User experience tốt hơn (không bị lỗi trắng)

### Nhược điểm:
1. ⚠️ Có thể gây nhầm lẫn (không biết đang dùng data nào)
2. ⚠️ Data có thể không sync với database

---

## 🔧 Cách tắt fallback (nếu muốn)

### Cách 1: Tắt API hoàn toàn
Sửa `frontend/.env.local`:
```env
VITE_USE_API=false
```

→ Frontend sẽ luôn dùng mock data, không gọi API.

### Cách 2: Bỏ fallback (không khuyên dùng)
Sửa `frontend/src/context/ProductContext.tsx`:
```typescript
} catch (error) {
  // Bỏ phần fallback
  console.error('Error loading products:', error);
  // Không load mock data
  setProducts([]);
  setCategories([]);
}
```

→ Nếu API lỗi, frontend sẽ trống (không tốt cho UX).

---

## ✅ Kết luận

**Dữ liệu vẫn hiện khi tắt backend là BÌNH THƯỜNG!**

- ✅ Frontend đang dùng mock data từ `products.json`
- ✅ Đây là tính năng bảo vệ, không phải bug
- ✅ Khi bật lại backend, frontend sẽ tự động dùng data thật

---

## 🧪 Test thực tế

### Test 1: Backend tắt
1. Tắt backend
2. Reload frontend
3. Console sẽ có: "Falling back to mock data..."
4. Dữ liệu vẫn hiện (từ mock)

### Test 2: Backend bật
1. Bật backend
2. Reload frontend
3. Console sẽ có: "Loading products from API..."
4. Dữ liệu từ backend (có thể khác mock một chút)

---

**Đây là tính năng, không phải bug! 🎉**

