# 📅 TIMELINE PHÁT TRIỂN TÍNH NĂNG OCHA POS

## 🎯 TUẦN 1-2: PHASE 1 - CRITICAL FEATURES

### 📆 Ngày 1-3: Hoàn trả & Đổi hàng (Refund & Return)

#### Backend Tasks
- [ ] Tạo model `RefundTransaction` trong schema.prisma
- [ ] Tạo model `RefundItem` để track từng sản phẩm hoàn trả
- [ ] Tạo enum `RefundStatus` (PENDING, APPROVED, REJECTED, COMPLETED)
- [ ] Tạo enum `RefundReason` (DEFECTIVE, WRONG_ITEM, CUSTOMER_REQUEST, OTHER)
- [ ] Tạo service `refund.service.ts` với các method:
  - [ ] `createRefund()` - Tạo yêu cầu hoàn trả
  - [ ] `approveRefund()` - Duyệt hoàn trả
  - [ ] `rejectRefund()` - Từ chối hoàn trả
  - [ ] `processRefund()` - Xử lý hoàn tiền và cập nhật stock
  - [ ] `getRefundHistory()` - Lịch sử hoàn trả
- [ ] Tạo controller `refund.controller.ts`
- [ ] Tạo routes `/api/refunds`
- [ ] Tích hợp vào `order.service.ts`:
  - [ ] Method `refundOrder()` hoặc `refundOrderItems()`
  - [ ] Cập nhật stock khi hoàn trả
  - [ ] Trừ lại điểm tích lũy nếu đã tích điểm
  - [ ] Hoàn lại tiền (cash/transfer)
- [ ] Tạo error classes: `RefundNotFoundError`, `InvalidRefundError`
- [ ] Tạo migration cho refund tables
- [ ] Viết tests cho refund service

#### Frontend Tasks
- [ ] Tạo trang `AdminRefundManagementPage`
- [ ] Component `RefundRequestModal.tsx` - Form tạo yêu cầu hoàn trả
- [ ] Component `RefundList.tsx` - Danh sách yêu cầu hoàn trả
- [ ] Component `RefundDetailModal.tsx` - Chi tiết và xử lý hoàn trả
- [ ] Tích hợp vào `OrderDetailPage` - Nút "Hoàn trả" cho đơn đã thanh toán
- [ ] Service `refund.service.ts` - API calls
- [ ] Hook `useRefunds.ts`
- [ ] Validation form với Zod

#### Database Schemaa
model RefundTransaction {
  id              String        @id @default(uuid())
  orderId         String
  refundNumber    String        @unique
  status          RefundStatus  @default(PENDING)
  reason          RefundReason
  reasonNote      String?
  totalAmount     Decimal       @db.Decimal(10, 2)
  refundMethod    PaymentMethod?
  refundStatus    PaymentStatus @default(PENDING)
  approvedBy      String?
  approvedAt      DateTime?
  processedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  items           RefundItem[]
  order           Order         @relation(fields: [orderId], references: [id])
}

model RefundItem {
  id                  String            @id @default(uuid())
  refundTransactionId String
  orderItemId         String
  quantity            Int
  refundAmount        Decimal           @db.Decimal(10, 2)
  refundTransaction   RefundTransaction @relation(fields: [refundTransactionId], references: [id], onDelete: Cascade)
}---

### 📆 Ngày 4-7: Mã giảm giá (Promotion Codes) ✅ HOÀN THÀNH

#### Backend Tasks
- [x] Tạo model `PromotionCode` và `PromotionCodeUsage`
- [x] Tạo service `promotion.service.ts`
- [x] Tạo controller và routes
- [x] Tích hợp vào `order.service.ts`
- [x] Tạo migration

#### Frontend Tasks
- [ ] Tạo trang `AdminPromotionManagementPage`
- [ ] Component `PromotionCodeTable.tsx`
- [ ] Component `PromotionCodeFormModal.tsx`
- [ ] Component `PromotionCodeInput.tsx` trong CheckoutPage
- [ ] Service `promotion.service.ts`
- [ ] Hook `usePromotions.ts`
- [ ] Hiển thị promotion discount trong OrderSummary

---

### 📆 Ngày 8-10: Quản lý ca làm việc (Shift Management) ✅ HOÀN THÀNH

#### Backend Tasks
- [x] Tạo model `Shift`
- [x] Tạo service `shift.service.ts`
- [x] Tạo controller và routes
- [x] Tạo migration

#### Frontend Tasks
- [ ] Tạo trang `AdminShiftManagementPage`
- [ ] Component `CurrentShiftCard.tsx` - Hiển thị ca đang mở
- [ ] Component `ShiftList.tsx` - Danh sách ca đã đóng
- [ ] Component `OpenShiftModal.tsx` - Modal mở ca
- [ ] Component `CloseShiftModal.tsx` - Modal đóng ca
- [ ] Component `ShiftSummaryModal.tsx` - Thống kê chi tiết
- [ ] Widget `CurrentShiftWidget.tsx` trên Dashboard
- [ ] Service `shift.service.ts`
- [ ] Hook `useShifts.ts`

---

### 📆 Ngày 11-15: Quản lý nhà cung cấp (Supplier Management) ✅ HOÀN THÀNH

#### Backend Tasks
- [x] Tạo model `Supplier` trong schema.prisma
- [x] Tạo model `PurchaseOrder` và `PurchaseOrderItem`
- [x] Tạo enum `PurchaseOrderStatus` (DRAFT, SENT, RECEIVED, PAID, CANCELLED)
- [x] Tạo service `supplier.service.ts`:
  - [x] `createSupplier()` - Tạo nhà cung cấp
  - [x] `updateSupplier()` - Cập nhật thông tin
  - [x] `getAllSuppliers()` - Danh sách nhà cung cấp
  - [x] `getSupplierById()` - Chi tiết nhà cung cấp
- [x] Tạo service `purchase-order.service.ts`:
  - [x] `createPurchaseOrder()` - Tạo đơn nhập hàng
  - [x] `updatePurchaseOrder()` - Cập nhật đơn
  - [x] `receivePurchaseOrder()` - Nhận hàng và cập nhật stock
  - [x] `getPurchaseOrders()` - Danh sách đơn nhập
  - [x] `markAsPaid()` - Đánh dấu đã thanh toán
  - [x] `cancel()` - Hủy đơn nhập
- [x] Tạo controller `supplier.controller.ts` và `purchase-order.controller.ts`
- [x] Tạo routes `/api/suppliers` và `/api/purchase-orders`
- [x] Tích hợp với `stock.service.ts`:
  - [x] Cập nhật tồn kho khi nhận hàng
  - [x] Tạo stock transaction khi nhận hàng
- [x] Tạo error classes: `SupplierNotFoundError`, `PurchaseOrderNotFoundError`, `InvalidPurchaseOrderStatusError`
- [x] Tạo migration (đã sync schema)
- [ ] Viết tests

#### Frontend Tasks
- [x] Tạo trang `AdminSupplierManagementPage`
- [x] Component `SupplierTable.tsx`
- [x] Component `SupplierFormModal.tsx`
- [x] Service `supplier.service.ts` và `purchase-order.service.ts`
- [x] Hooks `useSuppliers.ts` và `usePurchaseOrders.ts`
- [ ] Component `PurchaseOrderTable.tsx` (có thể thêm sau)
- [ ] Component `PurchaseOrderFormModal.tsx` (có thể thêm sau)
- [ ] Component `ReceivePurchaseOrderModal.tsx` (có thể thêm sau)

#### Database Schema
model Supplier {
  id              String          @id @default(uuid())
  name            String
  contactName     String?
  phone           String?
  email           String?
  address         String?
  taxCode         String?
  notes           String?
  isActive        Boolean         @default(true)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  purchaseOrders  PurchaseOrder[]
}

model PurchaseOrder {
  id              String              @id @default(uuid())
  orderNumber     String              @unique
  supplierId      String
  status          PurchaseOrderStatus @default(DRAFT)
  totalAmount     Decimal             @db.Decimal(10, 2)
  receivedAt      DateTime?
  paidAt          DateTime?
  notes            String?
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  items            PurchaseOrderItem[]
  supplier        Supplier            @relation(fields: [supplierId], references: [id])
}---

### 📆 Ngày 16-20: Quản lý chi phí (Expense Management) ✅ HOÀN THÀNH

#### Backend Tasks
- [x] Tạo model `Expense` và `ExpenseCategory`
- [x] Tạo enum `ExpenseType` (FIXED, VARIABLE, ONE_TIME)
- [x] Tạo service `expense.service.ts`:
  - [x] `createExpense()` - Tạo chi phí
  - [x] `updateExpense()` - Cập nhật chi phí
  - [x] `deleteExpense()` - Xóa chi phí
  - [x] `getExpenses()` - Danh sách chi phí với filters
  - [x] `getExpenseSummary()` - Tổng hợp chi phí theo kỳ
  - [x] `getProfitLossReport()` - Báo cáo P&L
  - [x] CRUD cho ExpenseCategory
- [x] Tạo controller `expense.controller.ts`
- [x] Tạo routes `/api/expenses`
- [x] Tích hợp với `reporting.service.ts`:
  - [x] Báo cáo P&L với doanh thu và chi phí
  - [x] So sánh chi phí vs doanh thu
- [x] Tạo error classes: `ExpenseNotFoundError`, `ExpenseCategoryNotFoundError`
- [x] Tạo migration (đã sync schema)
- [ ] Viết tests

#### Frontend Tasks
- [x] Tạo trang `AdminExpenseManagementPage`
- [x] Component `ExpenseTable.tsx`
- [x] Component `ExpenseFormModal.tsx`
- [x] Component `ExpenseFilters.tsx`
- [x] Component `ProfitLossReport.tsx` - Báo cáo P&L
- [x] Service `expense.service.ts`
- [x] Hook `useExpenses.ts` và `useExpenseCategories.ts`
- [ ] Tích hợp vào `ReportingPage` - Tab mới "Tài chính" (có thể thêm sau)

#### Database Schemasma
model ExpenseCategory {
  id          String     @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  expenses    Expense[]
}

model Expense {
  id              String          @id @default(uuid())
  categoryId      String
  amount          Decimal         @db.Decimal(10, 2)
  description     String
  expenseDate     DateTime
  type            ExpenseType
  receiptUrl      String?
  notes           String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  category        ExpenseCategory @relation(fields: [categoryId], references: [id])
}---

## 🎯 TUẦN 3-4: PHASE 2 - HIGH PRIORITY

### 📆 Ngày 21-25: Hoàn thiện quản lý bàn (Table Management)

#### Backend Tasks
- [ ] Tạo model `Table` trong schema.prisma
- [ ] Tạo enum `TableStatus` (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- [ ] Tạo service `table.service.ts`:
  - [ ] `createTable()` - Tạo bàn mới
  - [ ] `updateTable()` - Cập nhật thông tin bàn
  - [ ] `assignOrderToTable()` - Gán đơn hàng vào bàn
  - [ ] `transferTable()` - Chuyển bàn
  - [ ] `mergeTables()` - Gộp bàn
  - [ ] `getTableStatus()` - Lấy trạng thái bàn
- [ ] Tích hợp vào `order.service.ts`:
  - [ ] Validate bàn khi tạo đơn
  - [ ] Cập nhật trạng thái bàn
- [ ] Tạo controller `table.controller.ts`
- [ ] Tạo routes `/api/tables`
- [ ] Tạo migration
- [ ] Viết tests

#### Frontend Tasks
- [ ] Tạo trang `AdminTableManagementPage`
- [ ] Component `TableFloorPlan.tsx` - Sơ đồ bàn trực quan
- [ ] Component `TableCard.tsx` - Card hiển thị từng bàn
- [ ] Component `TableFormModal.tsx` - Form tạo/sửa bàn
- [ ] Component `TransferTableModal.tsx` - Modal chuyển bàn
- [ ] Component `MergeTableModal.tsx` - Modal gộp bàn
- [ ] Tích hợp vào CheckoutPage - Chọn bàn từ dropdown
- [ ] Service `table.service.ts`
- [ ] Hook `useTables.ts`

#### Database Schema
model Table {
  id              String       @id @default(uuid())
  tableNumber     String       @unique
  name            String?
  capacity        Int          @default(4)
  status          TableStatus  @default(AVAILABLE)
  currentOrderId  String?
  location        String?
  notes           String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
}
---

### 📆 Ngày 26-28: Chia hóa đơn (Split Bill)

#### Backend Tasks
- [ ] Tạo model `SplitBill` và `SplitBillItem`
- [ ] Tạo service `split-bill.service.ts`:
  - [ ] `splitBill()` - Chia hóa đơn
  - [ ] `getSplitBills()` - Lấy danh sách phần đã chia
  - [ ] `paySplitBill()` - Thanh toán từng phần
- [ ] Tích hợp vào `order.service.ts`:
  - [ ] Method `splitOrder()` - Chia đơn thành nhiều phần
  - [ ] Tracking thanh toán từng phần
- [ ] Tạo controller `split-bill.controller.ts`
- [ ] Tạo routes `/api/split-bills`
- [ ] Tạo migration
- [ ] Viết tests

#### Frontend Tasks
- [ ] Component `SplitBillModal.tsx` trong OrderDetailPage
- [ ] Component `SplitBillList.tsx` - Danh sách phần đã chia
- [ ] Component `PaySplitBillModal.tsx` - Thanh toán từng phần
- [ ] Hiển thị trạng thái chia hóa đơn trong OrderDetail
- [ ] Service `split-bill.service.ts`
- [ ] Hook `useSplitBills.ts`

---

### 📆 Ngày 29-32: Sửa đơn hàng (Order Modification)

#### Backend Tasks
- [ ] Tạo model `OrderModification` để track lịch sử sửa đổi
- [ ] Tạo service `order-modification.service.ts`:
  - [ ] `addOrderItem()` - Thêm sản phẩm vào đơn
  - [ ] `removeOrderItem()` - Xóa sản phẩm khỏi đơn
  - [ ] `updateOrderItem()` - Cập nhật số lượng/size/topping
  - [ ] `getModificationHistory()` - Lịch sử sửa đổi
- [ ] Tích hợp vào `order.service.ts`:
  - [ ] Validate đơn có thể sửa (chưa thanh toán)
  - [ ] Tính lại tổng tiền tự động
  - [ ] Cập nhật stock khi sửa đơn
- [ ] Tạo controller methods trong `order.controller.ts`
- [ ] Tạo routes `/api/orders/:id/items` (POST, PUT, DELETE)
- [ ] Tạo migration
- [ ] Viết tests

#### Frontend Tasks
- [ ] Component `OrderModificationModal.tsx` trong OrderDetailPage
- [ ] Component `AddItemToOrder.tsx` - Thêm sản phẩm
- [ ] Component `EditOrderItem.tsx` - Sửa sản phẩm trong đơn
- [ ] Component `OrderModificationHistory.tsx` - Lịch sử sửa đổi
- [ ] Tích hợp vào OrderDetailPage - Nút "Sửa đơn"
- [ ] Service methods trong `order.service.ts`
- [ ] Hook `useOrderModification.ts`

---

### 📆 Ngày 33-36: Quản lý thuế VAT

#### Backend Tasks
- [ ] Tạo model `TaxConfig` để cấu hình thuế
- [ ] Tạo service `tax.service.ts`:
  - [ ] `getTaxConfig()` - Lấy cấu hình thuế
  - [ ] `updateTaxConfig()` - Cập nhật cấu hình
  - [ ] `calculateTax()` - Tính thuế cho đơn hàng
  - [ ] `generateTaxInvoice()` - Tạo hóa đơn đỏ
- [ ] Tích hợp vào `order.service.ts`:
  - [ ] Tính thuế VAT tự động khi tạo đơn
  - [ ] Lưu thuế vào order
- [ ] Tạo controller `tax.controller.ts`
- [ ] Tạo routes `/api/tax`
- [ ] Tạo migration
- [ ] Viết tests

#### Frontend Tasks
- [ ] Trang `AdminTaxManagementPage` - Cấu hình thuế
- [ ] Component `TaxConfigForm.tsx`
- [ ] Component `TaxInvoiceModal.tsx` - Xem/in hóa đơn đỏ
- [ ] Hiển thị thuế trong OrderSummary và OrderDetail
- [ ] Service `tax.service.ts`
- [ ] Hook `useTax.ts`

#### Database Schema
model TaxConfig {
  id              String   @id @default(uuid())
  taxRate         Decimal  @db.Decimal(5, 2)
  taxName         String   @default("VAT")
  isActive        Boolean  @default(true)
  effectiveDate   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}---

## 🎯 TUẦN 5+: PHASE 3 - MEDIUM PRIORITY

### 📋 Tính năng Medium Priority (Làm theo nhu cầu)

- [ ] **Combo/Bundle sản phẩm**
  - Model `ProductBundle` và `BundleItem`
  - Service và controller
  - Frontend: Tạo combo, hiển thị trên menu

- [ ] **Quản lý lô hàng & hạn sử dụng**
  - Model `Batch` và `BatchTracking`
  - Service quản lý lô hàng
  - Frontend: Nhập lô, cảnh báo hết hạn

- [ ] **Kiểm kê kho định kỳ**
  - Model `Stocktaking` và `StocktakingItem`
  - Service kiểm kê
  - Frontend: Tạo phiếu kiểm kê, so sánh số lượng

- [ ] **Thẻ quà tặng**
  - Model `GiftCard`
  - Service quản lý thẻ
  - Frontend: Phát hành thẻ, sử dụng khi thanh toán

- [ ] **Đặt chỗ trước (Reservation)**
  - Model `Reservation`
  - Service đặt chỗ
  - Frontend: Form đặt bàn, lịch đặt chỗ

- [ ] **Đánh giá khách hàng**
  - Model `Review` và `Rating`
  - Service reviews
  - Frontend: Form đánh giá, hiển thị reviews

---

## 📊 TỔNG KẾT TIẾN ĐỘ

### ✅ Đã hoàn thành
- [x] Mã giảm giá (Backend) - Ngày 4-7
- [x] Quản lý ca làm việc (Backend) - Ngày 8-10

### 🔄 Đang làm
- [ ] Hoàn trả & đổi hàng - Ngày 1-3

### ✅ Đã hoàn thành
- [x] Mã giảm giá (Backend) - Ngày 4-7
- [x] Quản lý ca làm việc (Backend) - Ngày 8-10
- [x] Quản lý nhà cung cấp (Backend + Frontend) - Ngày 11-15
- [x] Quản lý chi phí (Backend + Frontend) - Ngày 16-20

### ⏳ Chưa bắt đầu
- [ ] Hoàn thiện quản lý bàn - Ngày 21-25
- [ ] Chia hóa đơn - Ngày 26-28
- [ ] Sửa đơn hàng - Ngày 29-32
- [ ] Quản lý thuế VAT - Ngày 33-36

---

## 📝 GHI CHÚ

- Mỗi tính năng cần có: Database Schema → Service → Controller → Routes → Frontend
- Ưu tiên test backend trước khi làm frontend
- Follow đúng pattern hiện tại của project
- Tất cả API cần có Swagger documentation
- Frontend cần có validation và error handling