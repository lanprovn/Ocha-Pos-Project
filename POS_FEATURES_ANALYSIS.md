# 📋 PHÂN TÍCH TÍNH NĂNG POS THEO 4 GIAI ĐOẠN

## 🎯 TỔNG QUAN

Báo cáo này phân tích các tính năng trọng điểm của hệ thống POS theo 4 giai đoạn làm việc của nhân viên.

---

## 1️⃣ GIAI ĐOẠN ĐẦU CA (START SHIFT)

### ✅ 1.1. Điểm danh (Timekeeping) - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Backend đã có model `ShiftCheckIn` với các trường:
  - `checkInTime`: Thời gian check-in
  - `checkOutTime`: Thời gian check-out
  - `shiftId`: Liên kết với ca làm việc
  - `userId`: Liên kết với nhân viên
  - `notes`: Ghi chú

**Tính năng đã có:**
- ✅ API Check-in: `POST /api/shifts/checkin`
- ✅ API Check-out: `POST /api/shifts/checkout`
- ✅ Service: `ShiftService.checkIn()` và `ShiftService.checkOut()`
- ✅ Frontend: Có hooks `useStaffShift()` với functions `checkIn()` và `checkOut()`
- ✅ UI Components: `ShiftCheckInModal` và `ShiftCheckOutModal`
- ✅ Tính lương: Có `PayrollService` tính lương dựa trên `ShiftCheckIn` records

**Vị trí code:**
- Backend: `backend/src/services/shift.service.ts` (lines 379-490)
- Frontend: `frontend/src/features/shifts/hooks/useStaffShift.ts` (lines 92-147)
- Schema: `backend/prisma/schema.prisma` (model ShiftCheckIn, lines 451-467)

**Kết luận:** ✅ **ĐÃ CÓ ĐẦY ĐỦ** - Tính năng điểm danh đã được triển khai hoàn chỉnh.

---

### ❌ 1.2. Nhận tiền đầu ca (Cash Opening) - **CHƯA CÓ**

**Hiện trạng:**
- ❌ Không có model/quản lý tiền mặt đầu ca
- ❌ Không có API để nhập số tiền đầu ca
- ❌ Không có UI để nhân viên đếm và xác nhận tiền đầu ca

**Cần bổ sung:**

**Database:**
```prisma
model CashOpening {
  id            String   @id @default(uuid())
  shiftCheckInId String  // Liên kết với check-in
  userId        String
  openingAmount Decimal  @db.Decimal(10, 2)  // Số tiền đầu ca
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  shiftCheckIn  ShiftCheckIn @relation(fields: [shiftCheckInId], references: [id])
  user          User         @relation(fields: [userId], references: [id])
  
  @@unique([shiftCheckInId])
  @@index([userId])
  @@index([createdAt])
  @@map("cash_openings")
}
```

**Backend:**
- Service: `CashService.createOpening()` - Tạo bản ghi tiền đầu ca
- Controller: `POST /api/cash/opening` - API để nhập tiền đầu ca
- Validation: Kiểm tra chỉ cho phép 1 lần mở ca cho mỗi check-in

**Frontend:**
- Component: `CashOpeningModal` - Modal để nhập tiền đầu ca
- Hook: `useCashOpening()` - Quản lý state và API calls
- UI: Hiển thị trong quá trình check-in hoặc sau khi check-in

**Lý do:** Cần thiết để quản lý tiền mặt và đối chiếu cuối ca.

---

## 2️⃣ GIAI ĐOẠN BÁN HÀNG (ORDERING & OPERATION)

### ✅ 2.1. Tạo đơn - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Tạo đơn hàng với đầy đủ thông tin
- ✅ Chọn món từ danh sách sản phẩm
- ✅ Chọn Topping: Có field `selectedToppings` trong `OrderItem`
- ✅ Chọn Size: Có field `selectedSize` trong `OrderItem`
- ✅ Ghi chú cho bếp: Có field `note` trong `OrderItem` và `notes` trong `Order`

**Tính năng đã có:**
- ✅ API: `POST /api/orders` - Tạo đơn hàng
- ✅ Service: `OrderService.create()` - Xử lý logic tạo đơn
- ✅ Frontend: `CheckoutPage` với form đầy đủ
- ✅ Schema: `OrderItem` có `selectedSize`, `selectedToppings`, `note`

**Vị trí code:**
- Backend: `backend/src/services/order.service.ts` (lines 528-780)
- Frontend: `frontend/src/features/orders/CheckoutPage/`
- Schema: `backend/prisma/schema.prisma` (OrderItem model)

**Kết luận:** ✅ **ĐÃ CÓ ĐẦY ĐỦ** - Tính năng tạo đơn đã hoàn chỉnh.

---

### ⚠️ 2.2. Quản lý bàn (Table Management) - **CÓ PHẦN**

**Hiện trạng:**
- ✅ Có field `customerTable` trong model `Order`
- ✅ Có thể nhập tên bàn khi tạo đơn
- ❌ Không có UI quản lý bàn (xem trạng thái bàn, gán bàn, chuyển bàn)
- ❌ Không có model `Table` riêng

**Tính năng đã có:**
- ✅ Field trong database: `Order.customerTable` (String?)
- ✅ Frontend: Có input field trong checkout form
- ✅ Backend: Lưu và hiển thị thông tin bàn trong order

**Cần bổ sung (nếu cần quản lý bàn chuyên nghiệp):**

**Database:**
```prisma
model Table {
  id          String   @id @default(uuid())
  name        String   @unique  // "Bàn 1", "Bàn 2", etc.
  capacity    Int      @default(4)  // Số chỗ ngồi
  status      TableStatus @default(AVAILABLE)  // AVAILABLE, OCCUPIED, RESERVED
  location    String?  // Vị trí bàn (tầng, khu vực)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  orders      Order[]
  
  @@map("tables")
}

enum TableStatus {
  AVAILABLE  // Trống
  OCCUPIED   // Đang phục vụ
  RESERVED   // Đã đặt trước
  CLEANING   // Đang dọn dẹp
}
```

**Backend:**
- Service: `TableService` - Quản lý trạng thái bàn
- API: `GET /api/tables` - Lấy danh sách bàn và trạng thái
- API: `PUT /api/tables/:id/status` - Cập nhật trạng thái bàn

**Frontend:**
- Component: `TableManagementView` - Hiển thị layout bàn
- Component: `TableStatusCard` - Card hiển thị từng bàn
- Real-time: Cập nhật trạng thái bàn qua Socket.io

**Kết luận:** ⚠️ **CÓ PHẦN** - Có thể lưu thông tin bàn nhưng chưa có quản lý bàn chuyên nghiệp.

---

### ❌ 2.3. Gửi bếp (Kitchen Ticket Printing) - **CHƯA CÓ**

**Hiện trạng:**
- ❌ Không có tính năng in phiếu chế biến
- ❌ Không có API để gửi đơn đến bếp
- ❌ Không có component in phiếu bếp

**Cần bổ sung:**

**Backend:**
- Service: `KitchenService.sendToKitchen()` - Xử lý gửi đơn đến bếp
- API: `POST /api/orders/:id/send-to-kitchen` - Gửi đơn đến bếp
- Socket Event: `order_sent_to_kitchen` - Real-time notification cho bếp

**Frontend:**
- Component: `KitchenTicketPrinter` - Component in phiếu chế biến
- Button: "Gửi bếp" trong OrderDisplayPage
- Auto-print: Tự động in khi order status = CONFIRMED hoặc PREPARING

**Template phiếu bếp:**
- Mã đơn hàng
- Thời gian
- Danh sách món (tên, số lượng)
- Size, Topping của từng món
- Ghi chú đặc biệt (ít ngọt, không hành, etc.)
- Bàn (nếu có)

**Kết luận:** ❌ **CHƯA CÓ** - Cần bổ sung tính năng in phiếu chế biến.

---

### ✅ 2.4. Theo dõi trạng thái - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Có hệ thống trạng thái đơn hàng đầy đủ
- ✅ Có thể cập nhật trạng thái đơn hàng
- ✅ Real-time sync qua Socket.io

**Tính năng đã có:**
- ✅ Order Status: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `COMPLETED`, `CANCELLED`
- ✅ API: `PUT /api/orders/:id/status` - Cập nhật trạng thái
- ✅ Service: `OrderService.updateStatus()` - Xử lý logic cập nhật
- ✅ Frontend: `OrderDisplayPage` hiển thị đơn theo trạng thái
- ✅ Socket Events: `order_updated`, `order_status_changed` - Real-time updates
- ✅ UI: Các section phân loại đơn theo trạng thái

**Vị trí code:**
- Backend: `backend/src/services/order.service.ts` (lines 1042-1167)
- Frontend: `frontend/src/features/orders/OrderDisplayPage/`
- Types: `backend/src/core/types/common.types.ts` (OrderStatus enum)

**Kết luận:** ✅ **ĐÃ CÓ ĐẦY ĐỦ** - Hệ thống theo dõi trạng thái hoàn chỉnh.

---

## 3️⃣ GIAI ĐOẠN THANH TOÁN (PAYMENT)

### ✅ 3.1. Tính tiền - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Tính tổng tiền tự động
- ✅ Áp dụng khuyến mãi (Voucher/Promotion)
- ✅ Tính VAT (10%)
- ✅ Áp dụng giảm giá theo membership level
- ✅ Áp dụng điểm tích lũy (Loyalty Points)

**Tính năng đã có:**
- ✅ Promotion System: Model `Promotion`, `PromotionUsage`
- ✅ Service: `PromotionService.validateAndApply()` - Validate và áp dụng voucher
- ✅ Frontend: `PromotionCodeInput` component - Nhập mã khuyến mãi
- ✅ Loyalty System: Tích điểm và đổi điểm
- ✅ Calculation: Tính toán đầy đủ (subtotal, discount, VAT, final total)

**Vị trí code:**
- Backend: `backend/src/services/promotion.service.ts` (lines 360-506)
- Frontend: `frontend/src/features/orders/CheckoutPage/components/PromotionCodeInput.tsx`
- Schema: `backend/prisma/schema.prisma` (Promotion, PromotionUsage models)

**Kết luận:** ✅ **ĐÃ CÓ ĐẦY ĐỦ** - Hệ thống tính tiền và khuyến mãi hoàn chỉnh.

---

### ✅ 3.2. Thu tiền - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Thanh toán bằng Tiền mặt (CASH)
- ✅ Thanh toán bằng Chuyển khoản (QR Code)
- ✅ Thanh toán bằng Thẻ (CARD/VNPAY)
- ✅ Xử lý payment callback

**Tính năng đã có:**
- ✅ Payment Methods: `CASH`, `CARD`, `QR`
- ✅ Payment Status: `PENDING`, `SUCCESS`, `FAILED`
- ✅ Service: `PaymentService.createPayment()` - Tạo payment URL (VNPAY)
- ✅ Service: `QRService.generateQR()` - Tạo QR code thanh toán
- ✅ Controller: `PaymentController.handleCallback()` - Xử lý callback
- ✅ Frontend: Payment method selection trong checkout
- ✅ QR Modal: Hiển thị QR code và verify payment

**Vị trí code:**
- Backend: `backend/src/services/payment.service.ts`, `backend/src/services/qr.service.ts`
- Backend: `backend/src/api/controllers/payment.controller.ts`, `backend/src/api/controllers/qr.controller.ts`
- Frontend: `frontend/src/features/orders/CheckoutPage/hooks/useCheckout.ts` (lines 380-425)

**Kết luận:** ✅ **ĐÃ CÓ ĐẦY ĐỦ** - Hệ thống thanh toán đa phương thức hoàn chỉnh.

---

### ✅ 3.3. In hóa đơn - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Có component in hóa đơn
- ✅ Template hóa đơn đầy đủ thông tin
- ✅ Hỗ trợ in cho cả tiền mặt và chuyển khoản

**Tính năng đã có:**
- ✅ Component: `PrintReceiptButton` - Button in hóa đơn
- ✅ Template: HTML template với đầy đủ thông tin:
  - Header: Tên cửa hàng, địa chỉ, hotline
  - Order info: Mã đơn, ngày giờ, bàn
  - Items: Danh sách món, số lượng, giá
  - Summary: Tổng tiền, VAT, giảm giá
  - Payment: Phương thức thanh toán, tiền thừa (nếu có)
  - Footer: Lời cảm ơn
- ✅ Format: Hỗ trợ in 80mm (thermal printer)
- ✅ Vietnamese: Số tiền bằng chữ

**Vị trí code:**
- Frontend: `frontend/src/features/orders/OrderDisplayPage/components/PrintReceiptButton.tsx` (lines 62-452)

**Cần cải thiện:**
- ⚠️ Chưa tự động in sau thanh toán (cần click button)
- ⚠️ Chưa có cấu hình mẫu hóa đơn (logo, header/footer tùy chỉnh)

**Kết luận:** ✅ **ĐÃ CÓ** - Tính năng in hóa đơn đã có, có thể cải thiện thêm.

---

## 4️⃣ GIAI ĐOẠN KẾT CA (END SHIFT)

### ❌ 4.1. Tổng kết tiền mặt - **CHƯA CÓ**

**Hiện trạng:**
- ❌ Không có tính năng tính tổng tiền mặt đáng lẽ phải có
- ❌ Không có báo cáo tiền mặt trong ca

**Cần bổ sung:**

**Backend:**
- Service: `CashService.calculateExpectedCash()` - Tính tiền mặt dự kiến:
  ```typescript
  // Logic:
  // 1. Lấy số tiền đầu ca (CashOpening)
  // 2. Cộng tất cả đơn hàng thanh toán bằng CASH trong ca
  // 3. Trừ các đơn hoàn trả (nếu có)
  // 4. = Số tiền mặt đáng lẽ phải có
  ```
- API: `GET /api/cash/shift-summary/:checkInId` - Lấy tổng kết tiền mặt ca

**Frontend:**
- Component: `CashSummaryModal` - Hiển thị:
  - Tiền đầu ca
  - Tổng tiền mặt thu được
  - Tổng tiền hoàn trả
  - **Số tiền đáng lẽ phải có**

**Kết luận:** ❌ **CHƯA CÓ** - Cần bổ sung tính năng tổng kết tiền mặt.

---

### ❌ 4.2. Đếm tiền thật - **CHƯA CÓ**

**Hiện trạng:**
- ❌ Không có tính năng nhập số tiền thực tế đếm được
- ❌ Không có form để nhân viên nhập tiền thật

**Cần bổ sung:**

**Database:**
```prisma
model CashClosing {
  id            String   @id @default(uuid())
  shiftCheckInId String  // Liên kết với check-in
  userId        String
  expectedAmount Decimal @db.Decimal(10, 2)  // Số tiền đáng lẽ phải có
  actualAmount   Decimal @db.Decimal(10, 2)   // Số tiền thực tế đếm được
  difference     Decimal @db.Decimal(10, 2)   // Chênh lệch (actual - expected)
  notes          String?  // Lý do chênh lệch
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  shiftCheckIn  ShiftCheckIn @relation(fields: [shiftCheckInId], references: [id])
  user          User         @relation(fields: [userId], references: [id])
  
  @@unique([shiftCheckInId])
  @@index([userId])
  @@index([createdAt])
  @@map("cash_closings")
}
```

**Backend:**
- Service: `CashService.createClosing()` - Tạo bản ghi đếm tiền cuối ca
- API: `POST /api/cash/closing` - API để nhập tiền thật
- Validation: 
  - Chỉ cho phép 1 lần đóng ca cho mỗi check-in
  - Phải có check-in và cash opening trước đó

**Frontend:**
- Component: `CashClosingModal` - Modal để nhập tiền thật:
  - Hiển thị số tiền đáng lẽ phải có (tự động tính)
  - Input để nhập số tiền thực tế
  - Tự động tính chênh lệch
  - Nếu chênh lệch, yêu cầu nhập lý do

**Kết luận:** ❌ **CHƯA CÓ** - Cần bổ sung tính năng đếm tiền cuối ca.

---

### ❌ 4.3. Giải trình chênh lệch - **CHƯA CÓ**

**Hiện trạng:**
- ❌ Không có tính năng ghi chú lý do chênh lệch tiền mặt

**Cần bổ sung:**
- ✅ Đã bao gồm trong `CashClosing` model (field `notes`)
- ✅ UI: Textarea trong `CashClosingModal` để nhập lý do
- ✅ Validation: Bắt buộc nhập lý do nếu chênh lệch > 0
- ✅ Lưu lịch sử: Lưu tất cả các lý do chênh lệch để báo cáo

**Kết luận:** ❌ **CHƯA CÓ** - Sẽ được bổ sung cùng với tính năng đếm tiền cuối ca.

---

### ✅ 4.4. Check-out - **ĐÃ CÓ**

**Hiện trạng:**
- ✅ Có tính năng check-out ca làm việc
- ✅ Lưu thời gian check-out
- ✅ Tính thời gian làm việc

**Tính năng đã có:**
- ✅ API: `POST /api/shifts/checkout` - Check-out ca
- ✅ Service: `ShiftService.checkOut()` - Xử lý logic check-out
- ✅ Frontend: `ShiftCheckOutModal` - Modal check-out
- ✅ Hook: `useStaffShift().checkOut()` - Function check-out
- ✅ Validation: Phải có check-in trước đó

**Vị trí code:**
- Backend: `backend/src/services/shift.service.ts` (lines 441-490)
- Frontend: `frontend/src/features/shifts/components/ShiftCheckOutModal.tsx`

**Cần cải thiện:**
- ⚠️ Nên yêu cầu đếm tiền cuối ca trước khi cho phép check-out
- ⚠️ Nên hiển thị thống kê ca (doanh thu, số đơn) trong modal check-out

**Kết luận:** ✅ **ĐÃ CÓ** - Tính năng check-out đã có, có thể cải thiện workflow.

---

## 📊 TỔNG KẾT

### ✅ CÁC TÍNH NĂNG ĐÃ CÓ (7/11):
1. ✅ **Điểm danh (Timekeeping)** - Hoàn chỉnh
2. ✅ **Tạo đơn** - Hoàn chỉnh (có topping, size, ghi chú)
3. ⚠️ **Quản lý bàn** - Có phần (có field nhưng chưa có UI quản lý)
4. ✅ **Theo dõi trạng thái** - Hoàn chỉnh
5. ✅ **Tính tiền** - Hoàn chỉnh (có voucher, promotion)
6. ✅ **Thu tiền** - Hoàn chỉnh (CASH, CARD, QR)
7. ✅ **In hóa đơn** - Có (có thể cải thiện)
8. ✅ **Check-out** - Có (có thể cải thiện)

### ❌ CÁC TÍNH NĂNG CHƯA CÓ (4/11):
1. ❌ **Nhận tiền đầu ca (Cash Opening)** - Cần bổ sung
2. ❌ **Gửi bếp (Kitchen Ticket Printing)** - Cần bổ sung
3. ❌ **Tổng kết tiền mặt** - Cần bổ sung
4. ❌ **Đếm tiền thật & Giải trình** - Cần bổ sung

---

## 🎯 ĐỀ XUẤT ƯU TIÊN

### **Phase 1 - CRITICAL (Làm ngay):**
1. **Nhận tiền đầu ca (Cash Opening)**
   - Database: Model `CashOpening`
   - Backend: Service + API
   - Frontend: Modal nhập tiền đầu ca
   - **Lý do:** Cần thiết để quản lý tiền mặt và đối chiếu cuối ca

2. **Tổng kết & Đếm tiền cuối ca (Cash Closing)**
   - Database: Model `CashClosing`
   - Backend: Service tính tiền dự kiến + API đếm tiền thật
   - Frontend: Modal tổng kết và nhập tiền thật
   - **Lý do:** Yêu cầu bắt buộc để chốt ca và quản lý tiền mặt

### **Phase 2 - HIGH PRIORITY (1-2 tuần):**
3. **Gửi bếp (Kitchen Ticket Printing)**
   - Backend: API gửi đơn đến bếp
   - Frontend: Component in phiếu chế biến
   - **Lý do:** Cần thiết cho quy trình làm việc của bếp

4. **Cải thiện Quản lý bàn (nếu cần)**
   - Database: Model `Table` với trạng thái
   - Backend: Service quản lý bàn
   - Frontend: UI quản lý bàn (layout, trạng thái)
   - **Lý do:** Nếu là nhà hàng/cafe thì cần thiết

### **Phase 3 - MEDIUM PRIORITY (Tùy chọn):**
5. **Cải thiện In hóa đơn**
   - Tự động in sau thanh toán
   - Cấu hình mẫu hóa đơn (logo, header/footer)

6. **Cải thiện Check-out**
   - Yêu cầu đếm tiền trước khi check-out
   - Hiển thị thống kê ca trong modal check-out

---

## 📝 KẾT LUẬN

Hệ thống hiện tại đã có **7/11 tính năng trọng điểm** (63.6%), trong đó:
- ✅ **Đầy đủ và hoàn chỉnh:** Điểm danh, Tạo đơn, Theo dõi trạng thái, Tính tiền, Thu tiền
- ⚠️ **Có nhưng cần cải thiện:** Quản lý bàn, In hóa đơn, Check-out
- ❌ **Chưa có:** Nhận tiền đầu ca, Gửi bếp, Tổng kết & Đếm tiền cuối ca

**Các tính năng cần bổ sung ngay:**
1. Quản lý tiền mặt đầu ca/cuối ca (Cash Opening/Closing)
2. In phiếu chế biến cho bếp

Sau khi bổ sung các tính năng này, hệ thống sẽ đáp ứng đầy đủ quy trình làm việc của nhân viên POS.

