# 🔧 Environment Variables Setup

## 📋 Backend Environment Variables

Thêm các biến sau vào file `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ocha_pos?schema=public"

# Server
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# VNPay Payment Gateway
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/callback

# Bank QR Code (for QR payment method)
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=your_bank_account_number
BANK_ACCOUNT_NAME=OCHA POS
```

## 🔑 Lấy VNPay Credentials

### 1. Đăng ký tài khoản VNPay

1. Truy cập: https://sandbox.vnpayment.vn/
2. Đăng ký tài khoản sandbox (miễn phí)
3. Đăng nhập và vào **"Thông tin kết nối"**

### 2. Lấy thông tin

- **TMN Code:** Mã website của bạn (ví dụ: `2QXUI4J4`)
- **Secret Key:** Mã bảo mật (ví dụ: `RAOCTRKJWYICXQZQZQZQZQZQZQZQZQZ`)

### 3. Cấu hình Return URL

Trong VNPay dashboard, cấu hình:
- **Return URL:** `http://localhost:3000/payment/callback` (development)
- **Return URL:** `https://yourdomain.com/payment/callback` (production)

## 🚀 Production Setup

Khi deploy lên production:

1. **Cập nhật VNPay URL:**
   ```env
   VNPAY_URL=https://www.vnpayment.vn/paymentv2/vpcpay.html
   ```

2. **Cập nhật Return URL:**
   ```env
   VNPAY_RETURN_URL=https://yourdomain.com/payment/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Đăng ký tài khoản production:**
   - Liên hệ VNPay để đăng ký tài khoản production
   - Lấy TMN Code và Secret Key mới cho production
   - Cập nhật vào `.env`

## 🔒 Security Notes

- **KHÔNG** commit file `.env` vào Git
- Sử dụng `.env.example` để document các biến cần thiết
- JWT_SECRET phải là chuỗi ngẫu nhiên, dài, và bảo mật
- VNPay Secret Key phải được bảo mật tuyệt đối

## ✅ Test với Sandbox

Sau khi cấu hình xong:

1. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test payment flow:
   - Tạo order với payment method = 'card' hoặc 'qr'
   - Hệ thống sẽ redirect đến VNPay sandbox
   - Sử dụng thẻ test từ VNPay để thanh toán
   - Verify callback hoạt động đúng

## 📚 Tài Liệu VNPay

- **Sandbox:** https://sandbox.vnpayment.vn/apis/
- **Documentation:** https://sandbox.vnpayment.vn/apis/docs/
- **Test Cards:** Xem trong VNPay dashboard

---

**Last Updated:** 2024-01-01

