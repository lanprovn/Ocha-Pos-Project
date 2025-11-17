# 🏦 Hướng Dẫn Cấu Hình QR Code VietinBank

## 📋 Thông Tin VietinBank

- **Tên đầy đủ:** Ngân hàng Công Thương Việt Nam (VietinBank)
- **Mã ngân hàng:** `CTG`
- **Website:** https://www.vietinbank.vn

## ⚙️ Cấu Hình Trong File `.env`

Mở file `backend/.env` và thêm/cập nhật các dòng sau:

```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG - VIETINBANK
# ============================================
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=1234567890
BANK_ACCOUNT_NAME=NGUYEN VAN A
```

## 📝 Điền Thông Tin Của Bạn

### 1. BANK_CODE
- **Giá trị:** `CTG` (cố định cho VietinBank)
- **Không cần thay đổi**

### 2. BANK_ACCOUNT_NUMBER
- **Thay** `1234567890` bằng **số tài khoản VietinBank** của bạn
- **Ví dụ:** `9876543210`
- ⚠️ Nhập đúng số tài khoản (không có dấu cách, dấu gạch ngang)

### 3. BANK_ACCOUNT_NAME
- **Thay** `NGUYEN VAN A` bằng **tên chủ tài khoản** của bạn
- **Ví dụ:** 
  - `NGUYEN VAN B`
  - `CONG TY TNHH OCHA`
  - `DOANH NGHIEP ABC`

## ✅ Ví Dụ Hoàn Chỉnh

```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG - VIETINBANK
# ============================================
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=9876543210
BANK_ACCOUNT_NAME=NGUYEN VAN A
```

## 🔄 Restart Backend

Sau khi lưu file `.env`:

1. **Dừng backend** (nếu đang chạy):
   - Nhấn `Ctrl + C` trong terminal đang chạy backend

2. **Chạy lại backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Kiểm tra log:**
   - Bạn sẽ thấy: `✅ Database connected`
   - Và: `🚀 Server is running on http://localhost:8080`

## 🧪 Test QR Code

1. Mở frontend: `http://localhost:3000`
2. Tạo đơn hàng test
3. Chọn phương thức thanh toán: **"QR Code ngân hàng"**
4. Kiểm tra QR code hiển thị:
   - ✅ Mã ngân hàng: **CTG** (VietinBank)
   - ✅ Số tài khoản: Đúng số tài khoản của bạn
   - ✅ Tên tài khoản: Đúng tên của bạn
   - ✅ Số tiền: Đúng tổng tiền đơn hàng

## 📱 Cách Khách Hàng Sử Dụng

1. Khách hàng mở app ngân hàng (bất kỳ app nào hỗ trợ VietQR)
2. Chọn tính năng "Quét QR" hoặc "Scan QR"
3. Quét QR code hiển thị trên màn hình
4. App sẽ tự động điền:
   - Số tài khoản nhận
   - Số tiền
   - Nội dung chuyển khoản (mã đơn hàng)
5. Khách hàng xác nhận và chuyển khoản
6. Nhân viên nhấn nút **"Đã thanh toán"** để xác nhận

## ❓ Câu Hỏi Thường Gặp

### Q: Làm sao biết số tài khoản VietinBank của tôi?
**A:** 
- Xem trên thẻ ATM VietinBank
- Xem trên sổ tiết kiệm
- Xem trên app VietinBank iPay Mobile
- Hoặc hỏi nhân viên ngân hàng

### Q: Tên tài khoản phải viết hoa hay thường?
**A:** 
- Có thể viết hoa hoặc thường đều được
- Nhưng nên viết hoa để dễ đọc: `NGUYEN VAN A`

### Q: QR code có hoạt động với tất cả app ngân hàng không?
**A:** 
- QR code theo chuẩn **VietQR** sẽ hoạt động với:
  - ✅ VietinBank iPay
  - ✅ Vietcombank
  - ✅ Techcombank
  - ✅ VPBank
  - ✅ Và hầu hết các app ngân hàng khác hỗ trợ VietQR

### Q: Tôi có thể test với số tiền nhỏ không?
**A:** 
- ✅ Có, bạn có thể test với số tiền nhỏ (ví dụ: 1,000 VNĐ)
- Sau khi test xong, nhớ verify payment để hoàn tất đơn hàng

## 🔒 Bảo Mật

⚠️ **QUAN TRỌNG:**
- File `.env` chứa thông tin nhạy cảm
- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** chia sẻ file `.env` với người khác
- File `.env` đã được thêm vào `.gitignore`

---

**Chúc bạn cấu hình thành công!** 🎉

Nếu có vấn đề, hãy kiểm tra:
1. File `.env` đã lưu chưa?
2. Backend đã restart chưa?
3. Số tài khoản và tên tài khoản đã đúng chưa?

