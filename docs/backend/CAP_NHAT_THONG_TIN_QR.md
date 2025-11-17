# ✅ Cập Nhật Thông Tin QR Code Của Bạn

## 📋 Thông Tin QR Code Của Bạn

Dựa trên QR code bạn đã tạo trên vietqr.net:

- **Ngân hàng:** VietinBank (CTG)
- **Số tài khoản:** `0768562386`
- **Tên chủ tài khoản:** `LE HOANG NGOC LAN`

## ⚙️ Cập Nhật File `.env`

Mở file `backend/.env` và cập nhật/cập nhật các dòng sau:

```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG - VIETINBANK
# ============================================
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=0768562386
BANK_ACCOUNT_NAME=LE HOANG NGOC LAN
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

## 🎯 Sự Khác Biệt Giữa QR Code Tĩnh và QR Code Động

### QR Code Tĩnh (từ vietqr.net):
- ✅ Chứa thông tin tài khoản cố định
- ❌ Không có số tiền
- ❌ Không có nội dung chuyển khoản
- ✅ Có thể in ra và dùng nhiều lần

### QR Code Động (từ hệ thống):
- ✅ Chứa thông tin tài khoản của bạn
- ✅ **Tự động điền số tiền** (từ đơn hàng)
- ✅ **Tự động điền nội dung** (mã đơn hàng)
- ✅ Mỗi đơn hàng có QR code riêng với số tiền chính xác

## 📱 Cách Hoạt Động

Khi khách hàng quét QR code từ hệ thống:

1. **App ngân hàng mở ra**
2. **Tự động điền:**
   - Số tài khoản: `0768562386`
   - Tên tài khoản: `LE HOANG NGOC LAN`
   - Số tiền: `100,000 VNĐ` (ví dụ - số tiền thực tế từ đơn hàng)
   - Nội dung: `Thanh toan don hang ORD001` (mã đơn hàng thực tế)

3. **Khách hàng chỉ cần:**
   - Xác nhận thông tin
   - Nhập mật khẩu
   - Xác nhận chuyển khoản

## ✅ Kiểm Tra

Sau khi restart backend:

1. Mở frontend: `http://localhost:3000`
2. Tạo đơn hàng test
3. Chọn "QR Code ngân hàng"
4. Kiểm tra QR code hiển thị:
   - ✅ Mã ngân hàng: **CTG**
   - ✅ Số tài khoản: **0768562386**
   - ✅ Tên tài khoản: **LE HOANG NGOC LAN**
   - ✅ Số tiền: Đúng số tiền đơn hàng
   - ✅ Nội dung: Có mã đơn hàng

5. **Quét thử bằng app ngân hàng:**
   - Mở app VietinBank iPay (hoặc app ngân hàng khác)
   - Quét QR code
   - Kiểm tra thông tin tự động điền có đúng không

## 🎉 Kết Quả

Sau khi cập nhật, mỗi khi khách hàng chọn "QR Code ngân hàng":

- ✅ QR code sẽ chứa thông tin tài khoản của bạn
- ✅ Số tiền tự động điền từ đơn hàng
- ✅ Nội dung tự động chứa mã đơn hàng
- ✅ Khách hàng chỉ cần quét và xác nhận

---

**Thông tin của bạn đã được cập nhật!** 🚀

Nếu có vấn đề, hãy kiểm tra:
1. File `.env` đã lưu chưa?
2. Backend đã restart chưa?
3. Thông tin trong `.env` đã đúng chưa?

