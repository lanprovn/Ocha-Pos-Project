# 💳 Hướng Dẫn Cập Nhật Thông Tin QR Code Ngân Hàng

## 📝 Bước 1: Mở file `.env`

Mở file `backend/.env` trong editor của bạn.

## 🔧 Bước 2: Thêm/Cập nhật 3 biến sau

Thêm hoặc cập nhật các dòng sau vào cuối file `.env`:

```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG
# ============================================
BANK_CODE=VCB
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=OCHA POS
```

## 📋 Bước 3: Điền thông tin của bạn

### 1. **BANK_CODE** - Mã ngân hàng

Thay `VCB` bằng mã ngân hàng của bạn. Dưới đây là danh sách mã ngân hàng phổ biến:

| Mã | Tên Ngân Hàng |
|---|---|
| **VCB** | Vietcombank |
| **TCB** | Techcombank |
| **VPB** | VPBank |
| **ACB** | ACB |
| **TPB** | TPBank |
| **MBB** | MBBank |
| **VIB** | VIB |
| **STB** | Sacombank |
| **HDB** | HDBank |
| **MSB** | Maritime Bank |
| **OCB** | OCB |
| **SCB** | SCB (Sài Gòn) |
| **BID** | BIDV |
| **CTG** | VietinBank |
| **VBA** | Agribank |

**Ví dụ:** Nếu bạn dùng Vietcombank → `BANK_CODE=VCB`

### 2. **BANK_ACCOUNT_NUMBER** - Số tài khoản

Thay `1234567890` bằng **số tài khoản ngân hàng thật** của bạn.

**Ví dụ:**
```env
BANK_ACCOUNT_NUMBER=9876543210
```

⚠️ **Lưu ý:** 
- Nhập đúng số tài khoản (không có dấu cách, dấu gạch ngang)
- Đây là thông tin nhạy cảm, không chia sẻ file `.env`

### 3. **BANK_ACCOUNT_NAME** - Tên chủ tài khoản

Thay `OCHA POS` bằng **tên chủ tài khoản** (tên sẽ hiển thị khi khách quét QR).

**Ví dụ:**
```env
BANK_ACCOUNT_NAME=NGUYEN VAN A
```
hoặc
```env
BANK_ACCOUNT_NAME=CONG TY TNHH OCHA
```

## ✅ Bước 4: Lưu file và Restart Backend

1. **Lưu file** `.env`
2. **Restart backend server:**
   - Nếu đang chạy, nhấn `Ctrl + C` để dừng
   - Chạy lại: `npm run dev` trong thư mục `backend`

## 🧪 Bước 5: Kiểm tra

1. Mở ứng dụng frontend
2. Tạo một đơn hàng test
3. Chọn phương thức thanh toán **"QR Code ngân hàng"**
4. Kiểm tra QR code hiển thị đúng:
   - ✅ Mã ngân hàng đúng
   - ✅ Số tài khoản đúng
   - ✅ Tên tài khoản đúng
   - ✅ Số tiền đúng

## 📱 Ví dụ hoàn chỉnh

### Ví dụ 1: Techcombank
```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG
# ============================================
BANK_CODE=TCB
BANK_ACCOUNT_NUMBER=1234567890123
BANK_ACCOUNT_NAME=NGUYEN VAN A
```

### Ví dụ 2: VietinBank (CTG)
```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG - VIETINBANK
# ============================================
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=NGUYEN VAN A
```

## ❓ Câu hỏi thường gặp

### Q: Làm sao biết mã ngân hàng của tôi?
**A:** 
- Xem trên thẻ ATM hoặc sổ tiết kiệm
- Hoặc tra cứu trên Google: "mã ngân hàng [tên ngân hàng]"
- Hoặc hỏi nhân viên ngân hàng

### Q: Tôi có thể dùng nhiều tài khoản không?
**A:** Hiện tại hệ thống chỉ hỗ trợ 1 tài khoản. Nếu cần nhiều tài khoản, cần phát triển thêm tính năng.

### Q: QR code có an toàn không?
**A:** 
- QR code chỉ chứa thông tin công khai (số tài khoản, tên)
- Không chứa mật khẩu hay thông tin nhạy cảm
- Khách hàng vẫn cần xác nhận trước khi chuyển khoản

### Q: Sau khi cập nhật, QR code cũ còn dùng được không?
**A:** 
- QR code cũ vẫn dùng được (vì đã được tạo với thông tin cũ)
- Chỉ QR code mới tạo sau khi cập nhật mới dùng thông tin mới

## 🔒 Bảo mật

⚠️ **QUAN TRỌNG:**
- File `.env` chứa thông tin nhạy cảm
- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** chia sẻ file `.env` với người khác
- File `.env` đã được thêm vào `.gitignore` để bảo vệ

---

**Sau khi cập nhật xong, restart backend và test lại nhé!** 🚀

