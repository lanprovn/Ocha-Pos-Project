# 📱 QR Code Payment Setup Guide

Hướng dẫn cấu hình thanh toán qua QR Code ngân hàng (VietQR format).

## 🎯 Tổng Quan

Hệ thống hỗ trợ thanh toán qua QR Code ngân hàng sử dụng format **VietQR** - chuẩn QR code thanh toán của Việt Nam.

## ⚙️ Cấu Hình

### 1. Thêm biến môi trường

Thêm vào file `backend/.env`:

```env
# Bank QR Code Configuration
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=OCHA POS
```

### 2. Giải thích các biến

- **BANK_CODE**: Mã ngân hàng (ví dụ: `VCB` = Vietcombank, `TCB` = Techcombank, `VPB` = VPBank)
- **BANK_ACCOUNT_NUMBER**: Số tài khoản ngân hàng của bạn
- **BANK_ACCOUNT_NAME**: Tên chủ tài khoản (sẽ hiển thị trên QR code)

### 3. Danh sách mã ngân hàng phổ biến

| Mã | Ngân hàng |
|---|---|
| VCB | Vietcombank |
| TCB | Techcombank |
| VPB | VPBank |
| ACB | ACB |
| TPB | TPBank |
| MBB | MBBank |
| VIB | VIB |
| STB | Sacombank |
| HDB | HDBank |
| MSB | Maritime Bank |

## 📱 Cách Hoạt Động

### Flow thanh toán:

1. **Khách hàng chọn "QR Code ngân hàng"** trên checkout page
2. **Hệ thống tạo đơn hàng** với `paymentStatus = PENDING`
3. **Backend generate QR code** theo format VietQR:
   ```
   https://vietqr.net/{BANK_CODE}/{ACCOUNT_NUMBER}?amount={AMOUNT}&addInfo={DESCRIPTION}
   ```
4. **Frontend hiển thị QR modal** với:
   - QR code để quét
   - Thông tin tài khoản ngân hàng
   - Số tiền và mã đơn hàng
5. **Khách hàng quét QR** bằng app ngân hàng và chuyển khoản
6. **Nhân viên nhấn "Đã thanh toán"** để xác nhận
7. **Hệ thống cập nhật** `paymentStatus = SUCCESS` và `orderStatus = CONFIRMED`

## 🔧 API Endpoints

### 1. Generate QR Code

```http
POST /api/payment/qr/generate
Content-Type: application/json

{
  "orderId": "uuid-of-order"
}
```

**Response:**
```json
{
  "qrUrl": "https://vietqr.net/VCB/1234567890?amount=100000&addInfo=Thanh%20toan%20don%20hang%20ORD001",
  "qrData": {
    "bankCode": "VCB",
    "accountNumber": "1234567890",
    "accountName": "OCHA POS",
    "amount": 100000,
    "description": "Thanh toan don hang ORD001",
    "orderNumber": "ORD001"
  },
  "orderId": "uuid",
  "orderNumber": "ORD001",
  "totalAmount": 100000
}
```

### 2. Verify Payment (Manual)

```http
POST /api/payment/qr/verify
Content-Type: application/json

{
  "orderId": "uuid-of-order"
}
```

**Response:**
```json
{
  "message": "Payment verified successfully",
  "order": {
    "id": "uuid",
    "orderNumber": "ORD001",
    "paymentStatus": "SUCCESS",
    "paymentDate": "2024-01-01T10:00:00Z"
  }
}
```

## 🎨 Frontend Components

### QRPaymentModal

Component hiển thị QR code và thông tin thanh toán:

- **QR Code**: Hiển thị bằng `qrcode.react`
- **Thông tin ngân hàng**: Bank code, số tài khoản, tên tài khoản
- **Thông tin đơn hàng**: Mã đơn, số tiền
- **Countdown timer**: 5 phút (có thể tùy chỉnh)
- **Nút xác nhận**: "Đã thanh toán" để verify payment

## 🔐 Security & Best Practices

### 1. Manual Verification

Hiện tại hệ thống sử dụng **manual verification** (nhân viên nhấn nút sau khi khách chuyển khoản). Trong tương lai có thể tích hợp:

- **Webhook từ ngân hàng**: Tự động verify khi có chuyển khoản
- **API từ ngân hàng**: Query transaction status
- **VietQR API**: Sử dụng VietQR API để verify tự động

### 2. QR Code Expiry

QR code có thời gian hết hạn (mặc định 5 phút). Sau khi hết hạn, cần tạo QR code mới.

### 3. Order Status

- **PENDING**: Đơn hàng chưa thanh toán
- **SUCCESS**: Đã thanh toán (sau khi verify)
- **FAILED**: Thanh toán thất bại (nếu có timeout hoặc cancel)

## 🧪 Testing

### Test với tài khoản thật:

1. Cấu hình `.env` với thông tin tài khoản thật
2. Tạo đơn hàng test với số tiền nhỏ
3. Quét QR code bằng app ngân hàng
4. Chuyển khoản test
5. Verify payment trong hệ thống
6. Kiểm tra order status đã update chưa

### Test với tài khoản sandbox:

Một số ngân hàng có sandbox environment để test. Tham khảo tài liệu của từng ngân hàng.

## 📚 Tài Liệu Tham Khảo

- **VietQR Format**: https://vietqr.net/
- **VietQR API**: https://www.vietqr.io/
- **QR Code Standard**: ISO/IEC 18004

## 🚀 Production Checklist

- [ ] Cấu hình đúng `BANK_CODE`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_NAME`
- [ ] Test với số tiền nhỏ trước
- [ ] Có quy trình xử lý khi verify thất bại
- [ ] Có backup plan nếu QR code không hoạt động
- [ ] Training cho nhân viên cách verify payment
- [ ] Có log để audit payment verification

---

**Last Updated:** 2024-01-01

