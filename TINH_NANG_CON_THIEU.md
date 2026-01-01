# 📋 DANH SÁCH TÍNH NĂNG CÒN THIẾU CHO HỆ THỐNG POS

## 🎯 TỔNG QUAN

Dựa trên phân tích hệ thống OCHA POS hiện tại, dưới đây là danh sách các tính năng nghiệp vụ còn thiếu để đáp ứng đầy đủ yêu cầu của một hệ thống POS chuyên nghiệp trong môi trường kinh doanh thực tế.

---

## 🔴 NHÓM 1: QUẢN LÝ KHUYẾN MÃI & GIẢM GIÁ

### 1.1. Mã giảm giá (Promotion Codes)
- **Mô tả**: Hệ thống chỉ có giảm giá theo hạng thành viên, chưa có mã giảm giá độc lập
- **Tính năng cần có**:
  - Tạo mã giảm giá (code, voucher)
  - Loại giảm giá: % hoặc số tiền cố định
  - Điều kiện áp dụng: giá trị đơn tối thiểu, sản phẩm cụ thể, danh mục
  - Thời hạn hiệu lực (start date, end date)
  - Số lần sử dụng tối đa / số lần sử dụng còn lại
  - Giới hạn số lần sử dụng mỗi khách hàng
  - Lịch sử sử dụng mã giảm giá
- **Câu hỏi giảng viên**: "Làm thế nào để khách hàng nhập mã giảm giá khi thanh toán? Làm sao quản lý các chương trình khuyến mãi theo thời gian?"

### 1.2. Chương trình khuyến mãi theo sản phẩm
- **Mô tả**: Giảm giá trực tiếp trên sản phẩm (có field `discount` nhưng chưa có quản lý chi tiết)
- **Tính năng cần có**:
  - Khuyến mãi "Mua 2 tặng 1"
  - Khuyến mãi "Giảm giá theo combo"
  - Khuyến mãi theo thời gian trong ngày (happy hour)
  - Khuyến mãi theo ngày trong tuần
- **Câu hỏi giảng viên**: "Làm sao để tạo chương trình 'Mua 2 tặng 1' hoặc giảm giá vào giờ vàng?"

### 1.3. Combo/Bundle sản phẩm
- **Mô tả**: Chưa có tính năng tạo combo sản phẩm với giá ưu đãi
- **Tính năng cần có**:
  - Tạo combo từ nhiều sản phẩm
  - Giá combo riêng (thường thấp hơn tổng giá lẻ)
  - Hiển thị combo trên menu
  - Báo cáo doanh thu combo vs sản phẩm lẻ
- **Câu hỏi giảng viên**: "Làm sao để tạo combo 'Trà sữa + Bánh mì' với giá ưu đãi?"

---

## 🟠 NHÓM 2: QUẢN LÝ BÀN & ĐẶT CHỖ

### 2.1. Quản lý bàn (Table Management)
- **Mô tả**: Có field `customerTable` nhưng chưa có hệ thống quản lý bàn
- **Tính năng cần có**:
  - Danh sách bàn với trạng thái: Trống, Đang phục vụ, Đã đặt trước, Bảo trì
  - Sơ đồ bàn (floor plan) trực quan
  - Gán đơn hàng vào bàn cụ thể
  - Chuyển bàn (transfer table)
  - Gộp bàn (merge tables)
  - Tính phí phục vụ theo bàn (nếu có)
- **Câu hỏi giảng viên**: "Làm sao để nhân viên biết bàn nào đang trống, bàn nào đang phục vụ? Làm sao quản lý khi khách muốn chuyển bàn?"

### 2.2. Đặt chỗ trước (Reservation System)
- **Mô tả**: Chưa có tính năng đặt bàn trước
- **Tính năng cần có**:
  - Khách hàng đặt bàn qua điện thoại/web
  - Quản lý lịch đặt bàn theo ngày/giờ
  - Thông báo nhắc nhở đặt bàn
  - Xác nhận đặt bàn qua SMS/Email
  - Hủy đặt bàn
  - Lịch sử đặt bàn của khách hàng
- **Câu hỏi giảng viên**: "Làm sao để khách hàng đặt bàn trước? Làm sao quản lý khi nhiều khách cùng muốn đặt bàn vào giờ cao điểm?"

---

## 🟡 NHÓM 3: QUẢN LÝ NHÀ CUNG CẤP & NHẬP HÀNG

### 3.1. Quản lý nhà cung cấp (Supplier/Vendor Management)
- **Mô tả**: Hoàn toàn chưa có module này
- **Tính năng cần có**:
  - Danh sách nhà cung cấp (tên, địa chỉ, SĐT, email, người liên hệ)
  - Sản phẩm/nguyên liệu mà mỗi nhà cung cấp cung cấp
  - Lịch sử giao dịch với nhà cung cấp
  - Đánh giá nhà cung cấp
  - Quản lý hợp đồng, giá cả
- **Câu hỏi giảng viên**: "Làm sao để biết nguyên liệu này mua từ nhà cung cấp nào? Làm sao so sánh giá giữa các nhà cung cấp?"

### 3.2. Đơn hàng nhập (Purchase Orders)
- **Mô tả**: Có `StockTransactionType.PURCHASE` nhưng chưa có module quản lý đơn nhập hàng
- **Tính năng cần có**:
  - Tạo đơn đặt hàng từ nhà cung cấp
  - Trạng thái đơn nhập: Dự thảo, Đã gửi, Đã nhận hàng, Đã thanh toán
  - Chi tiết đơn nhập: sản phẩm, số lượng, đơn giá, tổng tiền
  - Nhập hàng vào kho (cập nhật stock)
  - Hóa đơn nhập hàng
  - Báo cáo chi phí nhập hàng
- **Câu hỏi giảng viên**: "Làm sao để quản lý việc đặt hàng từ nhà cung cấp? Làm sao theo dõi chi phí nhập hàng?"

### 3.3. Quản lý giá vốn (Cost of Goods Sold - COGS)
- **Mô tả**: Chưa có tính năng tính giá vốn hàng bán
- **Tính năng cần có**:
  - Giá nhập của từng nguyên liệu/sản phẩm
  - Tính giá vốn của sản phẩm dựa trên công thức (BOM)
  - Báo cáo lợi nhuận gộp (gross profit) = Doanh thu - Giá vốn
  - Phân tích biên lợi nhuận theo sản phẩm
- **Câu hỏi giảng viên**: "Làm sao để biết sản phẩm nào đang có lợi nhuận cao nhất? Làm sao tính giá vốn của một ly trà sữa?"

---

## 🟢 NHÓM 4: QUẢN LÝ CHI PHÍ & TÀI CHÍNH

### 4.1. Quản lý chi phí (Expense Management)
- **Mô tả**: Hoàn toàn chưa có module này
- **Tính năng cần có**:
  - Ghi nhận các khoản chi phí: tiền thuê mặt bằng, điện nước, lương nhân viên, marketing, v.v.
  - Phân loại chi phí: Chi phí cố định, Chi phí biến đổi
  - Upload hóa đơn/chứng từ
  - Báo cáo chi phí theo thời gian
  - So sánh chi phí vs doanh thu (P&L statement)
- **Câu hỏi giảng viên**: "Làm sao để theo dõi các khoản chi phí hàng ngày? Làm sao biết cửa hàng có đang lãi hay lỗ?"

### 4.2. Quản lý ca làm việc (Shift Management)
- **Mô tả**: Chưa có tính năng quản lý ca làm việc
- **Tính năng cần có**:
  - Mở ca (opening shift): số tiền đầu ca
  - Đóng ca (closing shift): số tiền cuối ca, đếm tiền thực tế
  - Tính toán chênh lệch tiền (cash variance)
  - Ghi nhận giao dịch trong ca
  - Báo cáo doanh thu theo ca
  - Phân quyền: chỉ quản lý mới được mở/đóng ca
- **Câu hỏi giảng viên**: "Làm sao để quản lý ca làm việc của nhân viên? Làm sao đảm bảo số tiền trong ca khớp với số tiền thực tế?"

### 4.3. Quản lý ngân quỹ (Cash Drawer Management)
- **Mô tả**: Chưa có tính năng quản lý ngân quỹ chi tiết
- **Tính năng cần có**:
  - Mở ngân quỹ với số tiền ban đầu
  - Theo dõi số tiền trong ngân quỹ theo thời gian thực
  - Rút tiền từ ngân quỹ (cash out) với lý do
  - Nạp tiền vào ngân quỹ (cash in)
  - Lịch sử giao dịch ngân quỹ
- **Câu hỏi giảng viên**: "Làm sao để quản lý ngân quỹ khi có nhiều nhân viên cùng làm việc? Làm sao theo dõi khi có rút tiền hoặc nạp tiền?"

---

## 🔵 NHÓM 5: XỬ LÝ ĐƠN HÀNG NÂNG CAO

### 5.1. Hoàn trả & Đổi hàng (Refund & Return)
- **Mô tả**: Có status `CANCELLED` nhưng chưa có xử lý hoàn tiền chi tiết
- **Tính năng cần có**:
  - Hoàn trả một phần hoặc toàn bộ đơn hàng
  - Hoàn trả từng sản phẩm trong đơn
  - Lý do hoàn trả
  - Phương thức hoàn tiền: tiền mặt, chuyển khoản, trừ vào điểm tích lũy
  - Cập nhật lại tồn kho khi hoàn trả
  - Hoàn lại điểm tích lũy (nếu đã tích điểm)
  - Lịch sử hoàn trả
- **Câu hỏi giảng viên**: "Làm sao xử lý khi khách hàng muốn hoàn trả sản phẩm? Làm sao đảm bảo tồn kho được cập nhật đúng khi hoàn trả?"

### 5.2. Sửa đơn hàng sau khi tạo (Order Modification)
- **Mô tả**: Chưa có tính năng sửa đơn sau khi đã tạo
- **Tính năng cần có**:
  - Thêm sản phẩm vào đơn đã tạo (nếu chưa thanh toán)
  - Xóa sản phẩm khỏi đơn
  - Thay đổi số lượng
  - Thay đổi size/topping
  - Lịch sử thay đổi đơn hàng
  - Tính toán lại tổng tiền tự động
- **Câu hỏi giảng viên**: "Làm sao để khách hàng thêm sản phẩm vào đơn đã đặt? Làm sao đảm bảo tính nhất quán khi sửa đơn?"

### 5.3. Chia hóa đơn (Split Bill)
- **Mô tả**: Chưa có tính năng chia hóa đơn
- **Tính năng cần có**:
  - Chia hóa đơn theo số người
  - Chia hóa đơn theo sản phẩm (mỗi người trả phần của mình)
  - Thanh toán riêng từng phần
  - In hóa đơn riêng cho từng phần
- **Câu hỏi giảng viên**: "Làm sao xử lý khi một nhóm khách muốn chia hóa đơn? Làm sao để mỗi người thanh toán phần của mình?"

### 5.4. Thanh toán một phần (Partial Payment)
- **Mô tả**: Chưa hỗ trợ thanh toán nhiều lần cho một đơn
- **Tính năng cần có**:
  - Thanh toán một phần đơn hàng
  - Theo dõi số tiền đã thanh toán và còn nợ
  - Thanh toán nợ sau
  - Lịch sử thanh toán của đơn hàng
- **Câu hỏi giảng viên**: "Làm sao xử lý khi khách hàng muốn trả trước một phần và trả sau? Làm sao theo dõi công nợ?"

---

## 🟣 NHÓM 6: QUẢN LÝ KHO NÂNG CAO

### 6.1. Theo dõi lô hàng & hạn sử dụng (Batch Tracking & Expiry)
- **Mô tả**: Chưa có tính năng theo dõi lô hàng và hạn sử dụng
- **Tính năng cần có**:
  - Ghi nhận số lô (batch number) khi nhập hàng
  - Hạn sử dụng của từng lô
  - Cảnh báo sắp hết hạn
  - Ưu tiên xuất kho theo FIFO (First In First Out)
  - Báo cáo hàng sắp hết hạn
- **Câu hỏi giảng viên**: "Làm sao đảm bảo nguyên liệu được sử dụng trước khi hết hạn? Làm sao truy xuất được lô hàng khi có vấn đề?"

### 6.2. Kiểm kê kho (Stocktaking/Inventory Count)
- **Mô tả**: Chưa có tính năng kiểm kê kho định kỳ
- **Tính năng cần có**:
  - Tạo phiếu kiểm kê
  - Đếm số lượng thực tế
  - So sánh số lượng hệ thống vs thực tế
  - Điều chỉnh chênh lệch tự động
  - Lịch sử kiểm kê
  - Báo cáo tổn thất kho
- **Câu hỏi giảng viên**: "Làm sao để thực hiện kiểm kê kho định kỳ? Làm sao xử lý khi số lượng thực tế khác với hệ thống?"

### 6.3. Chuyển kho (Stock Transfer)
- **Mô tả**: Chưa có tính năng chuyển kho giữa các cửa hàng
- **Tính năng cần có**:
  - Chuyển hàng từ kho này sang kho khác
  - Phiếu chuyển kho
  - Xác nhận nhận hàng
  - Cập nhật tồn kho tự động
- **Câu hỏi giảng viên**: "Nếu có nhiều cửa hàng, làm sao chuyển hàng giữa các cửa hàng?"

---

## 🔴 NHÓM 7: QUẢN LÝ ĐA CHI NHÁNH

### 7.1. Multi-store/Branch Management
- **Mô tả**: Hệ thống hiện tại chỉ hỗ trợ một cửa hàng
- **Tính năng cần có**:
  - Quản lý nhiều chi nhánh
  - Phân quyền theo chi nhánh
  - Báo cáo tổng hợp từ tất cả chi nhánh
  - Báo cáo riêng từng chi nhánh
  - So sánh hiệu suất giữa các chi nhánh
  - Chuyển hàng giữa chi nhánh
- **Câu hỏi giảng viên**: "Làm sao để mở rộng hệ thống cho nhiều chi nhánh? Làm sao quản lý tập trung nhưng vẫn phân quyền theo chi nhánh?"

---

## 🟠 NHÓM 8: QUẢN LÝ KHÁCH HÀNG NÂNG CAO

### 8.1. Thẻ quà tặng (Gift Cards/Vouchers)
- **Mô tả**: Chưa có tính năng thẻ quà tặng
- **Tính năng cần có**:
  - Tạo thẻ quà tặng với mệnh giá
  - Mã thẻ quà tặng
  - Sử dụng thẻ khi thanh toán
  - Kiểm tra số dư thẻ
  - Lịch sử sử dụng thẻ
  - Hạn sử dụng thẻ
- **Câu hỏi giảng viên**: "Làm sao để phát hành và quản lý thẻ quà tặng? Làm sao đảm bảo thẻ không bị sử dụng nhiều lần?"

### 8.2. Đánh giá & Phản hồi khách hàng (Customer Reviews)
- **Mô tả**: Có field `rating` trên Product nhưng chưa có hệ thống đánh giá
- **Tính năng cần có**:
  - Khách hàng đánh giá sản phẩm/dịch vụ
  - Đánh giá theo sao (1-5 sao)
  - Bình luận/ý kiến phản hồi
  - Phản hồi từ cửa hàng
  - Hiển thị đánh giá trên sản phẩm
  - Báo cáo điểm đánh giá trung bình
- **Câu hỏi giảng viên**: "Làm sao để thu thập phản hồi từ khách hàng? Làm sao sử dụng đánh giá để cải thiện dịch vụ?"

### 8.3. Chương trình khách hàng thân thiết nâng cao
- **Mô tả**: Có hệ thống tích điểm cơ bản nhưng chưa có các tính năng nâng cao
- **Tính năng cần có**:
  - Đổi điểm lấy sản phẩm/voucher
  - Quà sinh nhật tự động
  - Chương trình giới thiệu bạn bè (referral program)
  - Thông báo khuyến mãi cho khách VIP
  - Phân tích hành vi khách hàng
- **Câu hỏi giảng viên**: "Làm sao để khuyến khích khách hàng quay lại? Làm sao tạo chương trình giới thiệu bạn bè?"

---

## 🟡 NHÓM 9: QUẢN LÝ NHÂN SỰ NÂNG CAO

### 9.1. Lịch làm việc (Employee Scheduling)
- **Mô tả**: Chưa có tính năng lên lịch làm việc
- **Tính năng cần có**:
  - Tạo lịch làm việc theo tuần/tháng
  - Phân ca làm việc
  - Xác nhận lịch làm việc
  - Đổi ca giữa nhân viên
  - Thông báo lịch làm việc
  - Theo dõi giờ làm việc thực tế
- **Câu hỏi giảng viên**: "Làm sao để quản lý lịch làm việc của nhân viên? Làm sao đảm bảo luôn có đủ nhân viên trong ca?"

### 9.2. Tính lương & Chấm công (Payroll & Attendance)
- **Mô tả**: Chưa có tính năng này
- **Tính năng cần có**:
  - Chấm công vào/ra
  - Tính giờ làm việc
  - Tính lương theo giờ/ca
  - Thưởng/phạt
  - Xuất bảng lương
- **Câu hỏi giảng viên**: "Làm sao để tính lương cho nhân viên theo giờ làm việc? Làm sao quản lý chấm công?"

### 9.3. Phân quyền chi tiết (Advanced Permissions)
- **Mô tả**: Chỉ có 3 role cơ bản (ADMIN, STAFF, CUSTOMER)
- **Tính năng cần có**:
  - Phân quyền chi tiết theo chức năng
  - Role: Quản lý, Thu ngân, Pha chế, Phục vụ
  - Quyền: Xem báo cáo, Sửa giá, Hoàn trả, v.v.
- **Câu hỏi giảng viên**: "Làm sao để phân quyền chi tiết cho từng nhân viên? Làm sao đảm bảo nhân viên chỉ làm được những việc được phép?"

---

## 🟢 NHÓM 10: GIAO HÀNG & ĐẶT HÀNG ONLINE

### 10.1. Quản lý giao hàng (Delivery Management)
- **Mô tả**: Chưa có tính năng giao hàng
- **Tính năng cần có**:
  - Địa chỉ giao hàng
  - Phí giao hàng
  - Trạng thái giao hàng: Đang chuẩn bị, Đang giao, Đã giao
  - Theo dõi vị trí giao hàng (nếu tích hợp)
  - Thông tin người nhận
  - Lịch sử giao hàng
- **Câu hỏi giảng viên**: "Làm sao để quản lý đơn hàng giao hàng? Làm sao theo dõi trạng thái giao hàng?"

### 10.2. Đặt hàng online (Online Ordering)
- **Mô tả**: Có thể đặt hàng nhưng chưa có portal riêng cho khách hàng
- **Tính năng cần có**:
  - Website/app đặt hàng cho khách hàng
  - Đăng ký/Đăng nhập khách hàng
  - Xem menu online
  - Đặt hàng và thanh toán online
  - Theo dõi đơn hàng
  - Lịch sử đơn hàng
- **Câu hỏi giảng viên**: "Làm sao để khách hàng đặt hàng trực tuyến? Làm sao tích hợp với hệ thống POS?"

---

## 🔵 NHÓM 11: BÁO CÁO & PHÂN TÍCH NÂNG CAO

### 11.1. Báo cáo tài chính (Financial Reports)
- **Mô tả**: Có báo cáo doanh thu cơ bản nhưng chưa có báo cáo tài chính đầy đủ
- **Tính năng cần có**:
  - Báo cáo P&L (Profit & Loss)
  - Báo cáo dòng tiền (Cash Flow)
  - Báo cáo tổng hợp chi phí vs doanh thu
  - Phân tích biên lợi nhuận
  - Dự báo doanh thu
- **Câu hỏi giảng viên**: "Làm sao để biết cửa hàng có đang lãi hay lỗ? Làm sao phân tích hiệu quả kinh doanh?"

### 11.2. Phân tích hành vi khách hàng (Customer Analytics)
- **Mô tả**: Chưa có phân tích chi tiết về khách hàng
- **Tính năng cần có**:
  - Khách hàng mới vs khách hàng quay lại
  - Tần suất mua hàng
  - Giá trị đơn hàng trung bình theo khách hàng
  - Phân tích RFM (Recency, Frequency, Monetary)
  - Khách hàng có nguy cơ rời bỏ
- **Câu hỏi giảng viên**: "Làm sao để phân tích hành vi khách hàng? Làm sao xác định khách hàng VIP?"

### 11.3. Phân tích hiệu suất nhân viên (Staff Performance)
- **Mô tả**: Chưa có báo cáo về hiệu suất nhân viên
- **Tính năng cần có**:
  - Doanh thu theo nhân viên
  - Số đơn hàng xử lý
  - Tỷ lệ hoàn trả theo nhân viên
  - Đánh giá hiệu suất
- **Câu hỏi giảng viên**: "Làm sao để đánh giá hiệu suất làm việc của nhân viên? Làm sao khuyến khích nhân viên bán hàng tốt hơn?"

---

## 🟣 NHÓM 12: TÍNH NĂNG KỸ THUẬT & TÍCH HỢP

### 12.1. In hóa đơn nâng cao (Advanced Receipt Printing)
- **Mô tả**: Có tính năng in cơ bản nhưng chưa đầy đủ
- **Tính năng cần có**:
  - Template hóa đơn tùy chỉnh
  - In logo cửa hàng
  - In mã QR thanh toán
  - In mã giảm giá cho lần sau
  - In hóa đơn email
  - In nhiều loại hóa đơn: hóa đơn bán hàng, hóa đơn đỏ (VAT)
- **Câu hỏi giảng viên**: "Làm sao để tùy chỉnh mẫu hóa đơn? Làm sao in hóa đơn đỏ theo quy định?"

### 12.2. Quản lý thuế (Tax Management)
- **Mô tả**: Chưa có tính năng quản lý thuế
- **Tính năng cần có**:
  - Cấu hình thuế VAT
  - Tính thuế tự động trên hóa đơn
  - Báo cáo thuế theo kỳ
  - Xuất hóa đơn đỏ (VAT invoice)
- **Câu hỏi giảng viên**: "Làm sao để tính và quản lý thuế VAT? Làm sao xuất hóa đơn đỏ cho khách hàng?"

### 12.3. Đa tiền tệ (Multi-currency)
- **Mô tả**: Chỉ hỗ trợ VND
- **Tính năng cần có**:
  - Hỗ trợ nhiều loại tiền tệ
  - Tỷ giá hối đoái
  - Chuyển đổi giá tự động
  - Hiển thị giá theo tiền tệ
- **Câu hỏi giảng viên**: "Làm sao để hỗ trợ khách hàng nước ngoài thanh toán bằng USD?"

### 12.4. Tích hợp thanh toán nâng cao
- **Mô tả**: Có tích hợp VNPay, MoMo cơ bản
- **Tính năng cần có**:
  - Tích hợp thêm các cổng thanh toán khác
  - Thanh toán trả góp
  - Ví điện tử
  - Tích hợp ví khách hàng
- **Câu hỏi giảng viên**: "Làm sao để tích hợp thêm các phương thức thanh toán mới?"

### 12.5. API & Webhook
- **Mô tả**: Có API nhưng chưa có webhook
- **Tính năng cần có**:
  - Webhook cho các sự kiện: đơn hàng mới, thanh toán thành công, v.v.
  - API documentation đầy đủ
  - Rate limiting
  - API versioning
- **Câu hỏi giảng viên**: "Làm sao để tích hợp hệ thống với các dịch vụ bên thứ ba? Làm sao đảm bảo tính ổn định của API?"

---

## 📊 TỔNG KẾT

### Tính năng ưu tiên cao (Must-have cho sản phẩm kinh doanh):
1. ✅ Quản lý mã giảm giá
2. ✅ Quản lý bàn & đặt chỗ
3. ✅ Quản lý nhà cung cấp & đơn nhập hàng
4. ✅ Quản lý chi phí & ca làm việc
5. ✅ Hoàn trả & đổi hàng
6. ✅ Chia hóa đơn
7. ✅ Quản lý thuế VAT
8. ✅ In hóa đơn nâng cao

### Tính năng ưu tiên trung bình (Should-have):
1. Combo/Bundle sản phẩm
2. Quản lý lô hàng & hạn sử dụng
3. Kiểm kê kho
4. Thẻ quà tặng
5. Đánh giá khách hàng
6. Quản lý giao hàng
7. Báo cáo tài chính đầy đủ

### Tính năng ưu tiên thấp (Nice-to-have):
1. Multi-store
2. Lịch làm việc nhân viên
3. Tính lương
4. Đa tiền tệ
5. Phân tích hành vi khách hàng nâng cao

---

## 💡 KẾT LUẬN

Hệ thống OCHA POS hiện tại đã có nền tảng tốt với các tính năng cốt lõi. Tuy nhiên, để trở thành một sản phẩm POS hoàn chỉnh phục vụ kinh doanh thực tế, cần bổ sung thêm nhiều tính năng nghiệp vụ quan trọng, đặc biệt là:

- **Quản lý khuyến mãi & giảm giá**
- **Quản lý bàn & đặt chỗ**
- **Quản lý nhà cung cấp & nhập hàng**
- **Quản lý chi phí & tài chính**
- **Xử lý đơn hàng nâng cao (hoàn trả, chia hóa đơn)**

Những tính năng này là **bắt buộc** trong môi trường kinh doanh thực tế và sẽ được giảng viên hỏi khi đánh giá dự án.



