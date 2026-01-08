# 💳 HƯỚNG DẪN CẤU HÌNH QR PAYMENT - VIETINBANK

## 📋 THÔNG TIN TÀI KHOẢN

- **Ngân hàng:** VietinBank (CTG)
- **Số tài khoản:** 0768562386
- **Tên tài khoản:** LE HOANG NGOC LAN

---

## ⚙️ CẤU HÌNH ENVIRONMENT VARIABLES

Thêm các biến sau vào file `backend/.env`:

```env
# ===== VietinBank QR Payment Configuration =====
# Mã ngân hàng: CTG (VietinBank)
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=0768562386
BANK_ACCOUNT_NAME=LE HOANG NGOC LAN

# Template QR code: 
# - 'print' (có logo và thông tin đầy đủ - khuyên dùng)
# - 'compact2' (compact với logo)
# - 'compact' (compact không logo)
# - 'qr_only' (chỉ QR code)
QR_TEMPLATE=print
```

---

## ✅ KIỂM TRA CẤU HÌNH

1. **Khởi động backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Kiểm tra logs:**
   Khi tạo QR code, backend sẽ log thông tin cấu hình:
   ```
   Bank config check {
     BANK_CODE: 'CTG',
     BANK_ACCOUNT_NUMBER: '***configured***',
     BANK_ACCOUNT_NAME: 'LE HOANG NGOC LAN',
     accountNumberLength: 10
   }
   ```

3. **Test QR code:**
   - Tạo đơn hàng và chọn thanh toán QR
   - QR code sẽ hiển thị với thông tin:
     - Ngân hàng: VietinBank
     - Số tài khoản: 0768562386
     - Tên: LE HOANG NGOC LAN
     - Nội dung: `ORD-123456 198000d` (mã đơn + số tiền)

---

## 📱 CÁCH SỬ DỤNG

### Khi khách hàng quét QR:

1. Mở app ngân hàng (VietinBank hoặc bất kỳ app nào hỗ trợ VietQR)
2. Quét QR code
3. App sẽ tự động điền:
   - Số tài khoản: `0768562386`
   - Tên người nhận: `LE HOANG NGOC LAN`
   - Số tiền: (tự động từ QR)
   - Nội dung chuyển khoản: `ORD-123456 198000d`

### Sau khi chuyển khoản:

1. Khách hàng nhấn nút **"Đã thanh toán"** trong QR Modal
2. Hoặc nhân viên verify từ admin panel
3. Hệ thống sẽ cập nhật trạng thái đơn hàng thành **SUCCESS**

---

## 🔍 FORMAT NỘI DUNG CHUYỂN KHOẢN

**Format:** `{MÃ_ĐƠN} {SỐ_TIỀN}d`

**Ví dụ:**
- `ORD-123456 198000d`
- `ORD-789012 500000d`

**Lưu ý:**
- Mã đơn hàng sẽ hiển thị rõ ràng trên máy khách
- Số tiền được format với "d" ở cuối (ví dụ: 198000d)
- Tối đa 100 ký tự

---

## 🛠️ TROUBLESHOOTING

### QR code không hiển thị:
- ✅ Kiểm tra `BANK_ACCOUNT_NUMBER` đúng chưa (không có khoảng trắng)
- ✅ Kiểm tra `BANK_CODE=CTG` (VietinBank)
- ✅ Restart backend sau khi đổi `.env`

### Nội dung không hiện mã đơn:
- ✅ Kiểm tra `orderNumber` có được truyền vào không
- ✅ Xem logs backend khi generate QR

### App ngân hàng không nhận diện:
- ✅ Đảm bảo dùng VietQR API (đã có trong code)
- ✅ Kiểm tra format URL có đúng không

---

## 📚 TÀI LIỆU THAM KHẢO

- VietQR API: https://vietqr.net/
- VietQR Image API: https://img.vietqr.io/

---

## ✅ CHECKLIST

- [ ] Đã cấu hình `BANK_CODE=CTG`
- [ ] Đã cấu hình `BANK_ACCOUNT_NUMBER=0768562386`
- [ ] Đã cấu hình `BANK_ACCOUNT_NAME=LE HOANG NGOC LAN`
- [ ] Đã cấu hình `QR_TEMPLATE=print`
- [ ] Đã restart backend
- [ ] Đã test tạo QR code thành công
- [ ] Đã test quét QR bằng app ngân hàng
- [ ] Đã verify mã đơn hàng hiển thị đúng trong nội dung chuyển khoản
