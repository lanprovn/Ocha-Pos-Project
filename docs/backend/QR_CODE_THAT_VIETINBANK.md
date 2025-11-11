# 💳 QR Code Thật Cho VietinBank - Hướng Dẫn Đầy Đủ

## ✅ QR Code Đã Được Cấu Hình Đúng

Hệ thống đã được cấu hình để tạo **QR code thật** cho VietinBank. Khi khách hàng quét QR code này, app ngân hàng sẽ tự động điền thông tin chuyển khoản.

## 🎯 Cách Hoạt Động

### 1. Format QR Code

QR code được tạo theo format chuẩn **VietQR**:
```
https://vietqr.net/CTG/{SỐ_TÀI_KHOẢN}?amount={SỐ_TIỀN}&addInfo={NỘI_DUNG}
```

### 2. Khi Khách Hàng Quét QR Code

Khi khách hàng quét QR code bằng app ngân hàng (VietinBank iPay, Vietcombank, Techcombank, v.v.):

✅ **Tự động điền:**
- Số tài khoản nhận: Số tài khoản VietinBank của bạn
- Số tiền: Tổng tiền đơn hàng
- Nội dung: "Thanh toan don hang {MÃ_ĐƠN_HÀNG}"

✅ **Khách hàng chỉ cần:**
- Xác nhận thông tin
- Nhập mật khẩu/PIN
- Xác nhận chuyển khoản

## ⚙️ Cấu Hình

### File `.env` trong `backend/`

Đảm bảo bạn đã cấu hình đúng trong file `backend/.env`:

```env
# ============================================
# CẤU HÌNH QR CODE NGÂN HÀNG - VIETINBANK
# ============================================
BANK_CODE=CTG
BANK_ACCOUNT_NUMBER=0768562386
BANK_ACCOUNT_NAME=LE HOANG NGOC LAN
```

### Giải Thích:

- **BANK_CODE=CTG**: Mã ngân hàng VietinBank (cố định)
- **BANK_ACCOUNT_NUMBER**: Số tài khoản VietinBank của bạn (ví dụ: `0768562386`)
- **BANK_ACCOUNT_NAME**: Tên chủ tài khoản (ví dụ: `LE HOANG NGOC LAN`)

## 🧪 Test QR Code Thật

### Bước 1: Tạo Đơn Hàng

1. Mở frontend: `http://localhost:3000`
2. Thêm sản phẩm vào giỏ hàng
3. Đi đến trang checkout
4. Chọn phương thức thanh toán: **"QR Code ngân hàng"**

### Bước 2: Quét QR Code

1. Mở app ngân hàng trên điện thoại:
   - VietinBank iPay
   - Vietcombank
   - Techcombank
   - Hoặc bất kỳ app ngân hàng nào hỗ trợ VietQR

2. Chọn tính năng "Quét QR" hoặc "Scan QR"

3. Quét QR code hiển thị trên màn hình

4. **Kiểm tra thông tin tự động điền:**
   - ✅ Số tài khoản: `0768562386` (số tài khoản của bạn)
   - ✅ Tên tài khoản: `LE HOANG NGOC LAN` (tên của bạn)
   - ✅ Số tiền: Số tiền đơn hàng
   - ✅ Nội dung: "Thanh toan don hang ORD001"

5. Xác nhận và chuyển khoản

### Bước 3: Xác Nhận Thanh Toán

Sau khi khách hàng chuyển khoản thành công:
1. Nhấn nút **"Đã thanh toán"** trong modal
2. Hệ thống sẽ cập nhật trạng thái đơn hàng thành **"Đã thanh toán"**

## 📱 App Ngân Hàng Hỗ Trợ

QR code này hoạt động với **TẤT CẢ** app ngân hàng tại Việt Nam hỗ trợ VietQR:

- ✅ VietinBank iPay
- ✅ Vietcombank
- ✅ Techcombank
- ✅ VPBank
- ✅ ACB
- ✅ TPBank
- ✅ MBBank
- ✅ VIB
- ✅ Sacombank
- ✅ HDBank
- ✅ Và tất cả app ngân hàng khác hỗ trợ VietQR

## 🔍 Kiểm Tra QR Code Có Đúng Không?

### Cách 1: Quét Thử

1. Tạo QR code trong hệ thống
2. Quét bằng app ngân hàng
3. Kiểm tra thông tin tự động điền có đúng không

### Cách 2: Kiểm Tra URL

QR code chứa URL có dạng:
```
https://vietqr.net/CTG/0768562386?amount=100000&addInfo=Thanh%20toan%20don%20hang%20ORD001
```

Bạn có thể:
1. Copy URL này
2. Dán vào trình duyệt
3. Trang web sẽ hiển thị thông tin tài khoản và số tiền

## ⚠️ Lưu Ý Quan Trọng

### 1. Số Tài Khoản Phải Đúng

- ✅ Nhập đúng số tài khoản (không có dấu cách, dấu gạch ngang)
- ✅ Kiểm tra lại số tài khoản trước khi sử dụng

### 2. Tên Tài Khoản

- ✅ Tên tài khoản sẽ hiển thị trong app ngân hàng khi quét
- ✅ Nên viết hoa để dễ đọc

### 3. Số Tiền

- ✅ Số tiền được làm tròn (không có số thập phân)
- ✅ Đơn vị: VNĐ

### 4. Nội Dung Chuyển Khoản

- ✅ Tự động chứa mã đơn hàng để dễ dàng đối soát
- ✅ Format: "Thanh toan don hang {MÃ_ĐƠN_HÀNG}"

## 🚀 Sau Khi Cấu Hình

1. **Lưu file `.env`**
2. **Restart backend:**
   ```bash
   cd backend
   npm run dev
   ```
3. **Test QR code:**
   - Tạo đơn hàng
   - Chọn "QR Code ngân hàng"
   - Quét bằng app ngân hàng
   - Kiểm tra thông tin tự động điền

## ✅ Kết Quả Mong Đợi

Khi khách hàng quét QR code:

1. App ngân hàng mở ra
2. Form chuyển khoản tự động điền:
   - Số tài khoản: `0768562386`
   - Tên tài khoản: `LE HOANG NGOC LAN`
   - Số tiền: `100,000 VNĐ` (ví dụ)
   - Nội dung: `Thanh toan don hang ORD001`
3. Khách hàng chỉ cần:
   - Xác nhận thông tin
   - Nhập mật khẩu
   - Xác nhận chuyển khoản

---

**QR code của bạn đã sẵn sàng để sử dụng!** 🎉

Nếu có vấn đề, hãy kiểm tra:
1. File `.env` đã cấu hình đúng chưa?
2. Backend đã restart chưa?
3. Số tài khoản và tên tài khoản đã đúng chưa?

