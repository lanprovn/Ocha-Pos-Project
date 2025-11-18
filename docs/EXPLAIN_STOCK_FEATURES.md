# 📚 GIẢI THÍCH 2 CHỨC NĂNG CẦN BỔ SUNG

## 1️⃣ EMIT SOCKET.IO EVENT KHI STOCK THAY ĐỔI

### 🎯 Mục đích
Khi stock (tồn kho) thay đổi, hệ thống cần thông báo ngay lập tức cho tất cả các trang frontend đang mở để cập nhật UI mà không cần refresh.

### 📊 Tình huống hiện tại

**VẤN ĐỀ:**
```
[Backend] Stock được cập nhật từ transaction
    │
    │ ❌ KHÔNG có socket.io event
    │
    ▼
[Database] Stock.quantity đã thay đổi
    │
    │ Frontend không biết!
    │
    ▼
[Frontend] Vẫn hiển thị số cũ
    │
    │ User phải refresh trang thủ công
    │
    ▼
[Frontend] Mới thấy số mới
```

**VÍ DỤ:**
1. Nhân viên A tạo đơn hàng → Stock giảm từ 100 → 95
2. Nhân viên B đang mở trang Stock Management
3. Nhân viên B vẫn thấy stock = 100 (số cũ)
4. Nhân viên B phải refresh trang mới thấy 95

### ✅ Giải pháp: Emit Socket.io Event

**SAU KHI BỔ SUNG:**
```
[Backend] Stock được cập nhật từ transaction
    │
    │ ✅ Emit socket.io event: stock_updated
    │
    ▼
[Socket.io Server] Broadcast event
    │
    │ Gửi đến tất cả clients đang subscribe
    │
    ├──→ [Stock Management Page] Nhận event → Auto reload
    ├──→ [Dashboard Page] Nhận event → Update stats
    └──→ [POS Page] Nhận event → Update product availability
    │
    ▼
[Frontend] UI tự động cập nhật (không cần refresh)
```

### 🔧 Cách hoạt động

**1. Backend - Khi stock thay đổi:**
```typescript
// backend/src/services/stock.service.ts

private async updateProductStockFromTransaction(...) {
  // ... Update stock trong database ...
  
  await prisma.stock.update({
    where: { id: stock.id },
    data: {
      quantity: newQuantity,
      lastUpdated: new Date(),
    },
  });
  
  // ✅ BỔ SUNG: Emit socket.io event
  emitStockUpdated({
    type: 'product',
    productId: productId,
    stockId: stock.id,
    oldQuantity: stock.quantity,
    newQuantity: newQuantity,
  });
}
```

**2. Socket.io Server:**
```typescript
// backend/src/socket/socket.io.ts

export function emitStockUpdated(data: {
  type: 'product' | 'ingredient',
  productId?: string,
  ingredientId?: string,
  stockId: string,
  oldQuantity: number,
  newQuantity: number,
}): void {
  if (io) {
    // Gửi đến room 'dashboard' và 'stock'
    io.to('dashboard').emit('stock_updated', data);
    io.to('stock').emit('stock_updated', data);
  }
}
```

**3. Frontend - Listen event:**
```typescript
// frontend/src/pages/StockManagementPage/hooks/useStockManagement.ts

useEffect(() => {
  const socket = getSocket();
  
  socket?.on('stock_updated', (data) => {
    // ✅ Tự động reload stock data
    loadData(false); // Không show loading spinner
    console.log('Stock updated:', data);
  });
  
  return () => {
    socket?.off('stock_updated');
  };
}, [loadData]);
```

### 💡 Lợi ích

1. **Real-time Updates**: Tất cả trang tự động cập nhật khi stock thay đổi
2. **Không cần refresh**: User không phải refresh trang thủ công
3. **Đồng bộ dữ liệu**: Tất cả nhân viên thấy cùng một số liệu
4. **Trải nghiệm tốt hơn**: UI responsive và cập nhật ngay lập tức

### 📍 Vị trí cần sửa

- `backend/src/services/stock.service.ts`
  - `updateProductStockFromTransaction()` - Dòng 508-535
  - `updateIngredientStockFromTransaction()` - Dòng 537-564

---

## 2️⃣ TỰ ĐỘNG TẠO STOCK ALERT KHI STOCK THẤP

### 🎯 Mục đích
Khi stock giảm xuống dưới mức tối thiểu (minStock), hệ thống tự động tạo cảnh báo để nhân viên/quản lý biết và nhập hàng kịp thời.

### 📊 Tình huống hiện tại

**VẤN ĐỀ:**
```
[Order Completed] → Stock giảm từ 15 → 5
    │
    │ ❌ KHÔNG tự động check và tạo alert
    │
    ▼
[Database] Stock.quantity = 5, minStock = 10
    │
    │ Stock đã thấp nhưng không có cảnh báo!
    │
    ▼
[Nhân viên] Không biết stock thấp
    │
    │ Phải vào Stock Management để check thủ công
    │
    ▼
[Quá muộn] Hết hàng mới biết → Mất khách hàng
```

**VÍ DỤ:**
1. Trà sữa có minStock = 10 (tối thiểu 10 ly)
2. Có đơn hàng bán 6 ly → Stock giảm từ 15 → 9
3. Stock = 9 < minStock = 10 → **CẦN CẢNH BÁO**
4. Nhưng hệ thống không tự động tạo alert
5. Nhân viên không biết → Tiếp tục bán → Hết hàng

### ✅ Giải pháp: Auto Stock Alert

**SAU KHI BỔ SUNG:**
```
[Order Completed] → Stock giảm từ 15 → 9
    │
    │ ✅ Check: 9 < minStock (10)?
    │
    ▼
[Backend] Tạo StockAlert tự động
    │
    │ Alert {
    │   type: 'LOW_STOCK',
    │   productId: 'xxx',
    │   message: 'Trà sữa còn 9, dưới mức tối thiểu 10'
    │ }
    │
    ▼
[Socket.io] Emit stock_alert event
    │
    ├──→ [Stock Alerts Panel] Hiển thị cảnh báo đỏ
    ├──→ [Dashboard] Hiển thị số alert chưa đọc
    └──→ [Stock Management] Highlight sản phẩm thiếu hàng
    │
    ▼
[Nhân viên] Thấy cảnh báo ngay → Nhập hàng kịp thời
```

### 🔧 Cách hoạt động

**1. Backend - Check và tạo alert:**
```typescript
// backend/src/services/stock.service.ts

private async updateProductStockFromTransaction(...) {
  // ... Update stock ...
  
  const updatedStock = await prisma.stock.update({
    where: { id: stock.id },
    data: {
      quantity: newQuantity,
      lastUpdated: new Date(),
    },
    include: {
      product: true,
    },
  });
  
  // ✅ BỔ SUNG: Check và tạo alert nếu cần
  await this.checkAndCreateStockAlert({
    type: 'product',
    stockId: updatedStock.id,
    productId: productId,
    currentQuantity: newQuantity,
    minStock: updatedStock.minStock,
    productName: updatedStock.product?.name,
  });
}

private async checkAndCreateStockAlert(data: {
  type: 'product' | 'ingredient',
  stockId: string,
  productId?: string,
  ingredientId?: string,
  currentQuantity: number,
  minStock: number,
  productName?: string,
  ingredientName?: string,
}) {
  // Check nếu stock thấp
  if (data.currentQuantity <= data.minStock) {
    const alertType = data.currentQuantity === 0 
      ? 'OUT_OF_STOCK' 
      : 'LOW_STOCK';
    
    const message = data.currentQuantity === 0
      ? `${data.productName || data.ingredientName} đã hết hàng!`
      : `${data.productName || data.ingredientName} còn ${data.currentQuantity} ${data.type === 'product' ? 'sản phẩm' : 'nguyên liệu'}, dưới mức tối thiểu ${data.minStock}`;
    
    // Tạo alert
    const alert = await this.createAlert({
      productId: data.productId || null,
      ingredientId: data.ingredientId || null,
      type: alertType,
      message: message,
    });
    
    // Emit socket.io event
    emitStockAlert(alert);
  }
}
```

**2. Frontend - Hiển thị alert:**
```typescript
// frontend/src/components/features/stock/alerts/StockAlertsPanel.tsx

useEffect(() => {
  const socket = getSocket();
  
  socket?.on('stock_alert', (alert) => {
    // ✅ Tự động reload alerts và hiển thị
    loadAlerts();
    
    // Hiển thị notification
    toast.error(alert.message, {
      duration: 5000,
      icon: '⚠️',
    });
  });
  
  return () => {
    socket?.off('stock_alert');
  };
}, [loadAlerts]);
```

### 💡 Lợi ích

1. **Cảnh báo tự động**: Không cần check thủ công
2. **Phòng ngừa hết hàng**: Nhập hàng kịp thời trước khi hết
3. **Thông báo real-time**: Nhân viên biết ngay khi stock thấp
4. **Quản lý tốt hơn**: Dashboard hiển thị số lượng alerts chưa đọc

### 📍 Vị trí cần sửa

- `backend/src/services/stock.service.ts`
  - `updateProductStockFromTransaction()` - Thêm check alert sau khi update
  - `updateIngredientStockFromTransaction()` - Thêm check alert sau khi update
  - Thêm method mới: `checkAndCreateStockAlert()`

---

## 🔄 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC KHI BỔ SUNG

```
Order Completed
    │
    ▼
Stock giảm (Database updated)
    │
    │ ❌ Không có event
    │ ❌ Không có alert
    │
    ▼
Frontend không biết
    │
    │ User phải:
    │ - Refresh trang thủ công
    │ - Check stock thủ công
    │ - Tự phát hiện stock thấp
    │
    ▼
Mất thời gian → Có thể hết hàng
```

### ✅ SAU KHI BỔ SUNG

```
Order Completed
    │
    ▼
Stock giảm (Database updated)
    │
    │ ✅ Emit stock_updated event
    │ ✅ Check và tạo alert nếu cần
    │ ✅ Emit stock_alert event
    │
    ▼
Socket.io Broadcast
    │
    ├──→ Stock Management: Auto reload
    ├──→ Dashboard: Update stats
    ├──→ Stock Alerts Panel: Hiển thị cảnh báo
    └──→ POS Page: Update availability
    │
    ▼
Tất cả trang tự động cập nhật
Nhân viên thấy cảnh báo ngay
Nhập hàng kịp thời → Không hết hàng
```

---

## 📋 TÓM TẮT

### Chức năng 1: Emit Socket.io Event
- **Vấn đề**: Frontend không biết khi stock thay đổi
- **Giải pháp**: Emit `stock_updated` event sau mỗi lần update stock
- **Lợi ích**: Real-time updates, không cần refresh

### Chức năng 2: Auto Stock Alert
- **Vấn đề**: Không tự động cảnh báo khi stock thấp
- **Giải pháp**: Check và tạo alert sau khi update stock
- **Lợi ích**: Phòng ngừa hết hàng, quản lý tốt hơn

---

**Last Updated:** 2025-11-18


