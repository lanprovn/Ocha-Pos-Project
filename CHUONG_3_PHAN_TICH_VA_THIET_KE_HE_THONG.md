# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Thực trạng bài toán

### 3.1.1. Yêu cầu chức năng

Hệ thống quản lý đơn hàng: cho phép nhân viên tạo đơn hàng, quản lý trạng thái đơn hàng từ CREATING → PENDING → CONFIRMED → PREPARING → READY → COMPLETED, hỗ trợ tạm giữ đơn hàng và tiếp tục chỉnh sửa, quản lý thông tin khách hàng và bàn ăn.

Hệ thống quản lý sản phẩm: cho phép quản lý và cập nhật thông tin về sản phẩm đồ uống và thức ăn, bao gồm hình ảnh, mô tả, giá cả, danh mục, kích thước và topping. Hỗ trợ quản lý danh mục sản phẩm với icon và hình ảnh.

Hệ thống quản lý kho hàng: tự động trừ kho khi tạo đơn hàng dựa trên công thức sản phẩm (BOM - Bill of Materials), quản lý tồn kho sản phẩm và nguyên liệu, cảnh báo khi hết hàng hoặc tồn kho thấp, theo dõi lịch sử giao dịch kho hàng.

Hệ thống quản lý khách hàng: lưu trữ thông tin khách hàng, quản lý hệ thống tích điểm và phân cấp thành viên (Bronze, Silver, Gold, Platinum), theo dõi lịch sử mua hàng và tổng chi tiêu.

Hệ thống báo cáo và phân tích: cung cấp báo cáo doanh thu theo ngày/tuần/tháng/tùy chỉnh, phân tích sản phẩm bán chạy, phân tích giờ cao điểm, thống kê phương thức thanh toán, xuất báo cáo Excel với nhiều sheet chi tiết.

Tích hợp thanh toán: hỗ trợ nhiều phương thức thanh toán phù hợp với thị trường Việt Nam bao gồm tiền mặt, thẻ, và QR code (VNPay, MoMo, ZaloPay).

Hiển thị đơn hàng thời gian thực: màn hình hiển thị đơn hàng cho bếp và bar với cập nhật tự động qua Socket.io, hỗ trợ theo dõi trạng thái đơn hàng và in hóa đơn.

### 3.1.2. Thực trạng hệ thống

Admin: là người quản trị hệ thống, admin đăng nhập thành công tài khoản có toàn quyền sử dụng hệ thống, bao gồm quản lý sản phẩm, kho hàng, đơn hàng, khách hàng, báo cáo, và cấu hình hệ thống.

Nhân viên (Staff): là người sử dụng hệ thống để phục vụ khách hàng, có thể tạo đơn hàng, cập nhật trạng thái đơn hàng, quản lý kho hàng, và xem báo cáo. Nhân viên không có quyền quản lý người dùng và một số cấu hình hệ thống.

Khách hàng (Customer): là thành viên đã đăng ký tài khoản để có thể đặt hàng trực tuyến, theo dõi đơn hàng, và tích điểm thành viên. Khách hàng có thể xem lịch sử đơn hàng và quản lý thông tin cá nhân.

Yêu cầu hiệu suất: hệ thống cần đảm bảo tốc độ tải trang nhanh chóng và khả năng xử lý đồng thời nhiều yêu cầu từ người dùng mà không bị quá tải, đặc biệt quan trọng trong giờ cao điểm của quán cà phê. Hệ thống cần hỗ trợ cập nhật thời gian thực cho màn hình hiển thị đơn hàng.

Yêu cầu thiết kế giao diện: thiết kế giao diện thân thiện với người dùng, đơn giản, dễ sử dụng, trực quan và tương thích tốt trên các thiết bị di động và máy tính bảng. Giao diện cần hỗ trợ thao tác nhanh để phục vụ khách hàng hiệu quả.

Yêu cầu mở rộng và duy trì: hệ thống cần được thiết kế linh hoạt để dễ dàng mở rộng và cung cấp công cụ cùng giao diện quản trị thuận tiện cho việc cập nhật và bảo trì. Kiến trúc module hóa cho phép thêm tính năng mới mà không ảnh hưởng đến các module hiện có.

Yêu cầu phân quyền: hệ thống cần hỗ trợ quản lý phân quyền truy cập dựa trên vai trò (Role-Based Access Control), cho phép Admin, Staff và Customer có các quyền truy cập khác nhau vào các tính năng và dữ liệu của hệ thống.

Thử nghiệm và kiểm thử: kiểm thử tích hợp nhằm đảm bảo tính đồng nhất và ổn định của hệ thống thông qua việc kiểm tra tích hợp giữa các thành phần khác nhau như Socket.io real-time updates, tự động trừ kho khi tạo đơn hàng, và hệ thống tích điểm. Đồng thời kiểm thử bảo mật để kiểm tra và đảm bảo tính an toàn của hệ thống trước các cuộc tấn công có thể xảy ra, đặc biệt là bảo vệ thông tin thanh toán và dữ liệu khách hàng.

## 3.2. Phân tích yêu cầu hệ thống

### 3.2.1. Yêu cầu chức năng

#### Trang quản trị

- Quản lý sản phẩm: thêm, sửa, xóa sản phẩm; quản lý giá cả, hình ảnh, mô tả; quản lý kích thước và topping; đánh dấu sản phẩm phổ biến; quản lý trạng thái sẵn có của sản phẩm.

- Quản lý danh mục sản phẩm: thêm, sửa, xóa danh mục; quản lý icon và hình ảnh danh mục; quản lý mô tả danh mục.

- Quản lý kho hàng: quản lý tồn kho sản phẩm và nguyên liệu; thiết lập mức tồn kho tối thiểu; xem cảnh báo hết hàng và tồn kho thấp; quản lý giao dịch kho hàng (nhập, xuất, điều chỉnh); quản lý công thức sản phẩm (BOM).

- Quản lý đơn hàng: xem danh sách đơn hàng; cập nhật trạng thái đơn hàng; xem chi tiết đơn hàng; lọc đơn hàng theo trạng thái, ngày tháng, phương thức thanh toán; in hóa đơn.

- Quản lý khách hàng: xem danh sách khách hàng; quản lý thông tin khách hàng; quản lý điểm tích lũy và cấp độ thành viên; xem lịch sử đơn hàng của khách hàng; quản lý ghi chú và tag khách hàng.

- Quản lý thành viên: quản lý tài khoản Admin và Staff; phân quyền người dùng; kích hoạt/vô hiệu hóa tài khoản.

- Báo cáo và phân tích: xem báo cáo doanh thu; phân tích sản phẩm bán chạy; phân tích giờ cao điểm; thống kê phương thức thanh toán; xuất báo cáo Excel.

- Cấu hình website: quản lý cài đặt hệ thống; cấu hình tích hợp thanh toán.

#### Trang người dùng

- Xem trang chủ: hiển thị sản phẩm nổi bật; hiển thị danh mục sản phẩm; hiển thị banner và thông tin quán.

- Xem trang tất cả sản phẩm: hiển thị danh sách tất cả sản phẩm; lọc sản phẩm theo danh mục; tìm kiếm sản phẩm.

- Xem trang sản phẩm theo danh mục: hiển thị sản phẩm theo từng danh mục; lọc và sắp xếp sản phẩm.

- Xem trang chi tiết sản phẩm: hiển thị thông tin chi tiết sản phẩm; chọn kích thước và topping; thêm sản phẩm vào giỏ hàng; xem giá tổng cộng.

- Đăng ký thành viên: đăng ký tài khoản khách hàng; xác thực thông tin.

- Đăng nhập thành viên: đăng nhập vào hệ thống; lấy thông tin tài khoản.

- Quản lý giỏ hàng: thêm sản phẩm vào giỏ hàng; cập nhật số lượng; xóa sản phẩm khỏi giỏ hàng; xem tổng tiền.

- Đặt hàng và thanh toán: nhập thông tin khách hàng; chọn phương thức thanh toán; xác nhận đơn hàng; thanh toán qua tiền mặt, thẻ hoặc QR code.

- Theo dõi đơn hàng: xem trạng thái đơn hàng; xem chi tiết đơn hàng; xem lịch sử đơn hàng.

- Tìm kiếm: tìm kiếm sản phẩm theo tên; lọc sản phẩm theo giá.

#### Màn hình hiển thị đơn hàng

- Hiển thị đơn hàng thời gian thực: hiển thị các đơn hàng đang chờ xử lý; cập nhật tự động qua Socket.io; phân loại đơn hàng theo trạng thái với màu sắc; hiển thị thông tin chi tiết đơn hàng; hỗ trợ in hóa đơn.

### 3.2.2. Danh sách các Actor

| STT | Tên Actor | Ý nghĩa |
|-----|-----------|---------|
| 1 | Quản trị (Admin) | Là người quản trị hệ thống, admin đăng nhập tài khoản có toàn quyền sử dụng hệ thống.<br>Có thể quản lý tất cả các chức năng của hệ thống<br>Có thể thêm, sửa, xóa sản phẩm, danh mục, kho hàng<br>Có thể quản lý đơn hàng và cập nhật trạng thái<br>Quản lý khách hàng và thành viên<br>Xem và xuất báo cáo<br>Cấu hình hệ thống |
| 2 | Nhân viên (Staff) | Là người sử dụng hệ thống để phục vụ khách hàng tại quán.<br>Có thể tạo và quản lý đơn hàng<br>Có thể cập nhật trạng thái đơn hàng<br>Có thể quản lý kho hàng và xem cảnh báo<br>Có thể xem báo cáo<br>Không thể quản lý người dùng và một số cấu hình hệ thống |
| 3 | Khách hàng (Customer) | Là thành viên đã đăng ký tài khoản để đặt hàng trực tuyến.<br>Có thể xem sản phẩm và thông tin quán<br>Đã đăng ký tài khoản<br>Có thể đặt hàng và thanh toán<br>Có thể theo dõi đơn hàng<br>Có thể xem lịch sử đơn hàng và điểm tích lũy<br>Quản lý thông tin tài khoản cá nhân |

**Bảng 1. Danh sách các Actor**

### 3.2.3. Danh sách các Use case

| ID | Tên Use Case | Mô tả |
|----|--------------|-------|
| UC1 | Đăng nhập | Admin hoặc Staff đăng nhập vào hệ thống để sử dụng các chức năng quản trị. |
| UC2 | Đăng ký khách hàng | Khách hàng đăng ký tài khoản để có thể đặt hàng và tích điểm. |
| UC3 | Tạo đơn hàng | Nhân viên hoặc khách hàng tạo đơn hàng mới với các sản phẩm đã chọn. |
| UC4 | Cập nhật trạng thái đơn hàng | Admin hoặc Staff cập nhật trạng thái đơn hàng (PENDING → CONFIRMED → PREPARING → READY → COMPLETED). |
| UC5 | Quản lý giỏ hàng | Khách hàng hoặc nhân viên thêm, cập nhật, xóa sản phẩm trong giỏ hàng. |
| UC6 | Thanh toán đơn hàng | Khách hàng hoặc nhân viên thực hiện thanh toán đơn hàng bằng tiền mặt, thẻ hoặc QR code. |
| UC7 | Quản lý sản phẩm | Admin hoặc Staff thêm, sửa, xóa sản phẩm, quản lý giá cả và thông tin sản phẩm. |
| UC8 | Quản lý danh mục | Admin hoặc Staff thêm, sửa, xóa danh mục sản phẩm. |
| UC9 | Quản lý kho hàng | Admin hoặc Staff quản lý tồn kho sản phẩm và nguyên liệu, xem cảnh báo hết hàng. |
| UC10 | Quản lý công thức sản phẩm | Admin hoặc Staff quản lý công thức (BOM) của sản phẩm để tự động trừ kho khi tạo đơn hàng. |
| UC11 | Quản lý khách hàng | Admin hoặc Staff xem danh sách khách hàng, quản lý thông tin và điểm tích lũy. |
| UC12 | Quản lý thành viên | Admin quản lý tài khoản Admin và Staff, phân quyền người dùng. |
| UC13 | Xem báo cáo | Admin hoặc Staff xem báo cáo doanh thu, sản phẩm bán chạy, giờ cao điểm. |
| UC14 | Xuất báo cáo Excel | Admin hoặc Staff xuất báo cáo ra file Excel với nhiều sheet chi tiết. |
| UC15 | Hiển thị đơn hàng | Màn hình hiển thị đơn hàng cho bếp và bar với cập nhật thời gian thực. |
| UC16 | Tìm kiếm sản phẩm | Người dùng tìm kiếm sản phẩm theo tên hoặc danh mục. |
| UC17 | Lọc sản phẩm | Người dùng lọc sản phẩm theo danh mục, giá cả, trạng thái. |
| UC18 | Theo dõi đơn hàng | Khách hàng xem trạng thái và chi tiết đơn hàng của mình. |
| UC19 | Quản lý giao dịch kho | Admin hoặc Staff xem và quản lý lịch sử giao dịch kho hàng (nhập, xuất, điều chỉnh). |
| UC20 | Xem cảnh báo kho | Admin hoặc Staff xem các cảnh báo về tồn kho thấp hoặc hết hàng. |

**Bảng 2. Danh sách các Use case**

### 3.2.4. Biểu đồ Usecase

#### Biểu đồ Usecase tổng quát

```
┌─────────────────────────────────────────────────────────────┐
│                    OCHA POS SYSTEM                         │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐            │
│  │  Admin   │    │  Staff   │    │ Customer │            │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘            │
│       │               │                │                   │
│       ├───────────────┼────────────────┤                   │
│       │               │                │                   │
│  ┌────▼────────────────────────────────▼─────┐            │
│  │         Quản lý đơn hàng                  │            │
│  │         Quản lý sản phẩm                  │            │
│  │         Quản lý kho hàng                  │            │
│  │         Quản lý khách hàng               │            │
│  │         Báo cáo và phân tích              │            │
│  │         Thanh toán                        │            │
│  │         Hiển thị đơn hàng                 │            │
│  └───────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**Hình 1. Sơ đồ usecase tổng quát**

#### Biểu đồ Usecase Admin

```
                    ┌──────────┐
                    │  Admin   │
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Quản lý  │      │Quản lý   │    │Quản lý  │
   │sản phẩm │      │kho hàng  │    │đơn hàng │
   └─────────┘      └──────────┘    └─────────┘
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Quản lý  │      │Quản lý   │    │Quản lý  │
   │danh mục │      │công thức │    │khách hàng│
   └─────────┘      └──────────┘    └─────────┘
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Quản lý  │      │Quản lý   │    │Báo cáo  │
   │thành viên│     │giao dịch │    │và phân tích│
   └─────────┘      └──────────┘    └─────────┘
```

**Hình 2. Sơ đồ usecase Admin**

#### Biểu đồ Usecase Staff

```
                    ┌──────────┐
                    │  Staff   │
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Tạo đơn  │      │Cập nhật   │    │Xem kho  │
   │hàng     │      │trạng thái │    │hàng     │
   └─────────┘      └──────────┘    └─────────┘
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Thanh toán│     │Xem cảnh   │    │Xem báo  │
   │đơn hàng │      │báo kho    │    │cáo      │
   └─────────┘      └──────────┘    └─────────┘
```

**Hình 3. Sơ đồ usecase Staff**

#### Biểu đồ Usecase Customer

```
                    ┌──────────┐
                    │ Customer │
                    └────┬─────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Xem sản  │      │Quản lý    │    │Đặt hàng │
   │phẩm     │      │giỏ hàng   │    │và thanh toán│
   └─────────┘      └──────────┘    └─────────┘
        │                │                │
   ┌────▼────┐      ┌─────▼─────┐    ┌────▼────┐
   │Tìm kiếm │      │Theo dõi   │    │Quản lý  │
   │sản phẩm │      │đơn hàng   │    │tài khoản│
   └─────────┘      └──────────┘    └─────────┘
```

**Hình 4. Sơ đồ usecase Customer**

### 3.2.5. Biểu đồ hoạt động

#### Đăng nhập

```
[Admin/Staff] → Nhập email và password → [Hệ thống]
                                              │
                                              ▼
                                    Kiểm tra thông tin đăng nhập
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              Thành công          Thất bại
                                    │                   │
                                    ▼                   ▼
                            Tạo JWT token        Hiển thị lỗi
                                    │
                                    ▼
                            Trả về token và thông tin user
                                    │
                                    ▼
                            [Admin/Staff] đăng nhập thành công
```

**Hình 5. Biểu đồ hoạt động đăng nhập**

#### Tạo đơn hàng

```
[Nhân viên/Khách hàng] → Chọn sản phẩm → Thêm vào giỏ hàng
                                              │
                                              ▼
                                    Tính tổng tiền
                                              │
                                              ▼
                                    Nhập thông tin khách hàng
                                              │
                                              ▼
                                    Chọn phương thức thanh toán
                                              │
                                              ▼
                                    [Hệ thống] Tạo đơn hàng
                                              │
                                              ▼
                                    Kiểm tra tồn kho
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              Đủ hàng            Không đủ hàng
                                    │                   │
                                    ▼                   ▼
                            Trừ kho tự động      Hiển thị cảnh báo
                                    │
                                    ▼
                            Cập nhật trạng thái đơn hàng
                                    │
                                    ▼
                            Gửi thông báo qua Socket.io
                                    │
                                    ▼
                            [Đơn hàng được tạo thành công]
```

**Hình 6. Biểu đồ hoạt động tạo đơn hàng**

#### Cập nhật trạng thái đơn hàng

```
[Admin/Staff] → Chọn đơn hàng → Chọn trạng thái mới
                                      │
                                      ▼
                            [Hệ thống] Kiểm tra quyền
                                      │
                                      ▼
                            Cập nhật trạng thái đơn hàng
                                      │
                                      ▼
                            Gửi thông báo qua Socket.io
                                      │
                                      ▼
                            Cập nhật màn hình hiển thị đơn hàng
                                      │
                                      ▼
                            [Trạng thái đơn hàng được cập nhật]
```

**Hình 7. Biểu đồ hoạt động cập nhật trạng thái đơn hàng**

#### Thanh toán đơn hàng

```
[Nhân viên/Khách hàng] → Chọn đơn hàng → Chọn phương thức thanh toán
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                              Tiền mặt            Thẻ/QR
                                    │                   │
                                    ▼                   ▼
                            Cập nhật trạng thái    Tạo yêu cầu thanh toán
                            thanh toán thành công        │
                                    │                   ▼
                                    │            Chuyển đến cổng thanh toán
                                    │                   │
                                    │                   ▼
                                    │            Xử lý thanh toán
                                    │                   │
                                    └───────────┬───────┘
                                                ▼
                                    Cập nhật trạng thái thanh toán
                                                │
                                                ▼
                                    Tích điểm cho khách hàng (nếu có)
                                                │
                                                ▼
                                    Gửi thông báo qua Socket.io
                                                │
                                                ▼
                                    [Thanh toán hoàn tất]
```

**Hình 8. Biểu đồ hoạt động thanh toán đơn hàng**

#### Quản lý kho hàng tự động

```
[Tạo đơn hàng] → [Hệ thống] Lấy công thức sản phẩm (BOM)
                              │
                              ▼
                    Tính toán nguyên liệu cần thiết
                              │
                              ▼
                    Kiểm tra tồn kho nguyên liệu
                              │
                    ┌─────────┴─────────┐
                    │                   │
              Đủ nguyên liệu    Không đủ nguyên liệu
                    │                   │
                    ▼                   ▼
            Trừ kho nguyên liệu   Hiển thị cảnh báo
                    │                   │
                    ▼                   │
            Kiểm tra mức tồn kho tối thiểu │
                    │                   │
                    ▼                   │
            Tạo cảnh báo nếu cần    ────┘
                    │
                    ▼
            Ghi lại giao dịch kho
                    │
                    ▼
            [Kho hàng được cập nhật]
```

**Hình 9. Biểu đồ hoạt động quản lý kho hàng tự động**

#### Hiển thị đơn hàng thời gian thực

```
[Màn hình hiển thị] → Kết nối Socket.io → [Server]
                                              │
                                              ▼
                                    Lắng nghe sự kiện đơn hàng
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                            Đơn hàng mới        Cập nhật trạng thái
                                    │                   │
                                    ▼                   ▼
                            Hiển thị đơn hàng mới  Cập nhật màu sắc
                                    │                   │
                                    └─────────┬─────────┘
                                              ▼
                                    Cập nhật giao diện tự động
                                              │
                                              ▼
                                    [Màn hình được cập nhật]
```

**Hình 10. Biểu đồ hoạt động hiển thị đơn hàng thời gian thực**

## 3.3. Cơ sở dữ liệu

### 3.3.1. User (Thành viên)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh duy nhất của người dùng |
| 2 | email | String | Unique, Not Null | Email đăng nhập |
| 3 | password | String | Not Null | Mật khẩu đã được mã hóa |
| 4 | name | String | Not Null | Tên người dùng |
| 5 | role | Enum (ADMIN, STAFF, CUSTOMER) | Not Null, Default: STAFF | Vai trò của người dùng |
| 6 | isActive | Boolean | Not Null, Default: true | Trạng thái hoạt động |
| 7 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 8 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 3. Bảng User (Thành viên)**

### 3.3.2. Category (Danh mục sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh danh mục |
| 2 | name | String | Not Null | Tên danh mục |
| 3 | image | String | Nullable | URL hình ảnh danh mục |
| 4 | description | String | Nullable | Mô tả danh mục |
| 5 | icon | String | Nullable | Icon danh mục |
| 6 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 7 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 4. Bảng Category (Danh mục sản phẩm)**

### 3.3.3. Product (Sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh sản phẩm |
| 2 | name | String | Not Null | Tên sản phẩm |
| 3 | description | String | Nullable | Mô tả sản phẩm |
| 4 | price | Decimal(10,2) | Not Null | Giá sản phẩm |
| 5 | categoryId | String (UUID) | Foreign Key, Nullable | Mã danh mục |
| 6 | image | String | Nullable | URL hình ảnh sản phẩm |
| 7 | rating | Decimal(3,2) | Nullable | Đánh giá sản phẩm |
| 8 | discount | Decimal(5,2) | Nullable | Giảm giá (%) |
| 9 | stock | Integer | Not Null, Default: 0 | Số lượng tồn kho |
| 10 | isAvailable | Boolean | Not Null, Default: true | Trạng thái sẵn có |
| 11 | isPopular | Boolean | Not Null, Default: false | Sản phẩm nổi bật |
| 12 | tags | String[] | Not Null, Default: [] | Tags sản phẩm |
| 13 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 14 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 5. Bảng Product (Sản phẩm)**

### 3.3.4. ProductSize (Kích thước sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh kích thước |
| 2 | productId | String (UUID) | Foreign Key, Not Null | Mã sản phẩm |
| 3 | name | String | Not Null | Tên kích thước (S, M, L) |
| 4 | extraPrice | Decimal(10,2) | Not Null, Default: 0 | Giá phụ thu |
| 5 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 6 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 6. Bảng ProductSize (Kích thước sản phẩm)**

### 3.3.5. ProductTopping (Topping sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh topping |
| 2 | productId | String (UUID) | Foreign Key, Not Null | Mã sản phẩm |
| 3 | name | String | Not Null | Tên topping |
| 4 | extraPrice | Decimal(10,2) | Not Null, Default: 0 | Giá phụ thu |
| 5 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 6 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 7. Bảng ProductTopping (Topping sản phẩm)**

### 3.3.6. Order (Đơn hàng)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh đơn hàng |
| 2 | orderNumber | String | Unique, Not Null | Số đơn hàng |
| 3 | status | Enum | Not Null, Default: PENDING | Trạng thái đơn hàng |
| 4 | totalAmount | Decimal(10,2) | Not Null | Tổng tiền |
| 5 | customerName | String | Nullable | Tên khách hàng |
| 6 | customerPhone | String | Nullable | Số điện thoại khách hàng |
| 7 | customerTable | String | Nullable | Số bàn |
| 8 | notes | String | Nullable | Ghi chú đơn hàng |
| 9 | paymentMethod | Enum (CASH, CARD, QR) | Nullable | Phương thức thanh toán |
| 10 | paymentStatus | Enum | Not Null, Default: PENDING | Trạng thái thanh toán |
| 11 | orderCreator | Enum (STAFF, CUSTOMER) | Not Null, Default: STAFF | Người tạo đơn |
| 12 | orderCreatorName | String | Nullable | Tên người tạo đơn |
| 13 | paidAt | DateTime | Nullable | Thời gian thanh toán |
| 14 | paymentDate | DateTime | Nullable | Ngày thanh toán |
| 15 | paymentTransactionId | String | Nullable | Mã giao dịch thanh toán |
| 16 | customerId | String | Foreign Key, Nullable | Mã khách hàng |
| 17 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 18 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 8. Bảng Order (Đơn hàng)**

### 3.3.7. OrderItem (Chi tiết đơn hàng)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh chi tiết đơn |
| 2 | orderId | String (UUID) | Foreign Key, Not Null | Mã đơn hàng |
| 3 | productId | String (UUID) | Foreign Key, Not Null | Mã sản phẩm |
| 4 | quantity | Integer | Not Null | Số lượng |
| 5 | price | Decimal(10,2) | Not Null | Giá đơn vị |
| 6 | subtotal | Decimal(10,2) | Not Null | Tổng tiền |
| 7 | selectedSize | String | Nullable | Kích thước đã chọn |
| 8 | selectedToppings | String[] | Not Null, Default: [] | Toppings đã chọn |
| 9 | note | String | Nullable | Ghi chú sản phẩm |
| 10 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |

**Bảng 9. Bảng OrderItem (Chi tiết đơn hàng)**

### 3.3.8. Ingredient (Nguyên liệu)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh nguyên liệu |
| 2 | name | String | Not Null | Tên nguyên liệu |
| 3 | unit | String | Not Null | Đơn vị tính |
| 4 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 5 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 10. Bảng Ingredient (Nguyên liệu)**

### 3.3.9. Stock (Tồn kho sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh tồn kho |
| 2 | productId | String (UUID) | Foreign Key, Unique, Not Null | Mã sản phẩm |
| 3 | quantity | Integer | Not Null, Default: 0 | Số lượng tồn kho |
| 4 | minStock | Integer | Not Null, Default: 0 | Mức tồn kho tối thiểu |
| 5 | maxStock | Integer | Not Null, Default: 0 | Mức tồn kho tối đa |
| 6 | unit | String | Not Null, Default: "pcs" | Đơn vị tính |
| 7 | isActive | Boolean | Not Null, Default: true | Trạng thái hoạt động |
| 8 | lastUpdated | DateTime | Not Null, Default: now() | Thời gian cập nhật cuối |
| 9 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 10 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 11. Bảng Stock (Tồn kho sản phẩm)**

### 3.3.10. IngredientStock (Tồn kho nguyên liệu)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh tồn kho |
| 2 | ingredientId | String (UUID) | Foreign Key, Unique, Not Null | Mã nguyên liệu |
| 3 | quantity | Integer | Not Null, Default: 0 | Số lượng tồn kho |
| 4 | minStock | Integer | Not Null, Default: 0 | Mức tồn kho tối thiểu |
| 5 | maxStock | Integer | Not Null, Default: 0 | Mức tồn kho tối đa |
| 6 | isActive | Boolean | Not Null, Default: true | Trạng thái hoạt động |
| 7 | lastUpdated | DateTime | Not Null, Default: now() | Thời gian cập nhật cuối |
| 8 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 9 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 12. Bảng IngredientStock (Tồn kho nguyên liệu)**

### 3.3.11. ProductRecipe (Công thức sản phẩm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh công thức |
| 2 | productId | String (UUID) | Foreign Key, Not Null | Mã sản phẩm |
| 3 | ingredientId | String (UUID) | Foreign Key, Not Null | Mã nguyên liệu |
| 4 | quantity | Decimal(10,3) | Not Null | Số lượng nguyên liệu |
| 5 | unit | String | Not Null | Đơn vị tính |
| 6 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 7 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 13. Bảng ProductRecipe (Công thức sản phẩm)**

### 3.3.12. StockTransaction (Giao dịch kho)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh giao dịch |
| 2 | productId | String (UUID) | Foreign Key, Nullable | Mã sản phẩm |
| 3 | ingredientId | String (UUID) | Foreign Key, Nullable | Mã nguyên liệu |
| 4 | type | Enum | Not Null | Loại giao dịch (SALE, PURCHASE, ADJUSTMENT, RETURN) |
| 5 | quantity | Integer | Not Null | Số lượng |
| 6 | reason | String | Nullable | Lý do giao dịch |
| 7 | userId | String | Nullable | Mã người dùng thực hiện |
| 8 | timestamp | DateTime | Not Null, Default: now() | Thời gian giao dịch |

**Bảng 14. Bảng StockTransaction (Giao dịch kho)**

### 3.3.13. StockAlert (Cảnh báo kho)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String (UUID) | Primary Key, Not Null | Mã định danh cảnh báo |
| 2 | productId | String (UUID) | Foreign Key, Nullable | Mã sản phẩm |
| 3 | ingredientId | String (UUID) | Foreign Key, Nullable | Mã nguyên liệu |
| 4 | type | Enum | Not Null | Loại cảnh báo (LOW_STOCK, OUT_OF_STOCK, OVERSTOCK) |
| 5 | message | String | Not Null | Nội dung cảnh báo |
| 6 | isRead | Boolean | Not Null, Default: false | Trạng thái đã đọc |
| 7 | timestamp | DateTime | Not Null, Default: now() | Thời gian cảnh báo |
| 8 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |

**Bảng 15. Bảng StockAlert (Cảnh báo kho)**

### 3.3.14. customers (Khách hàng)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String | Primary Key, Not Null | Mã định danh khách hàng |
| 2 | name | String | Not Null | Tên khách hàng |
| 3 | phone | String | Unique, Not Null | Số điện thoại |
| 4 | email | String | Unique, Nullable | Email |
| 5 | address | String | Nullable | Địa chỉ |
| 6 | dateOfBirth | DateTime | Nullable | Ngày sinh |
| 7 | gender | String | Nullable | Giới tính |
| 8 | avatar | String | Nullable | URL ảnh đại diện |
| 9 | loyaltyPoints | Integer | Not Null, Default: 0 | Điểm tích lũy |
| 10 | membershipLevel | Enum | Not Null, Default: BRONZE | Cấp độ thành viên |
| 11 | totalSpent | Decimal(10,2) | Not Null, Default: 0 | Tổng chi tiêu |
| 12 | notes | String | Nullable | Ghi chú |
| 13 | tags | String[] | Not Null, Default: [] | Tags khách hàng |
| 14 | isActive | Boolean | Not Null, Default: true | Trạng thái hoạt động |
| 15 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |
| 16 | updatedAt | DateTime | Not Null, Auto update | Thời gian cập nhật |
| 17 | lastVisitAt | DateTime | Nullable | Lần ghé thăm cuối |

**Bảng 16. Bảng customers (Khách hàng)**

### 3.3.15. loyalty_transactions (Giao dịch tích điểm)

| STT | Thuộc tính | Kiểu | Ràng buộc | Mô tả |
|-----|-----------|------|-----------|-------|
| 1 | id | String | Primary Key, Not Null | Mã định danh giao dịch |
| 2 | customerId | String | Foreign Key, Not Null | Mã khách hàng |
| 3 | orderId | String (UUID) | Foreign Key, Nullable | Mã đơn hàng |
| 4 | type | Enum | Not Null | Loại giao dịch (EARN, REDEEM, EXPIRED, ADJUSTMENT) |
| 5 | points | Integer | Not Null | Số điểm |
| 6 | reason | String | Nullable | Lý do giao dịch |
| 7 | createdAt | DateTime | Not Null, Default: now() | Thời gian tạo |

**Bảng 17. Bảng loyalty_transactions (Giao dịch tích điểm)**

### 3.3.16. Sơ đồ quan hệ cơ sở dữ liệu

```
User (1) ──────── (0..n) Order
                            │
                            │
                    (1..n) OrderItem ──── (1) Product
                            │                    │
                            │                    │
                            │              (0..1) Stock
                            │                    │
                            │              (0..n) ProductRecipe ──── (1) Ingredient
                            │                    │                        │
                            │                    │                        │
                            │              (0..1) IngredientStock        │
                            │                                              │
                            │                    (0..n) StockTransaction ─┘
                            │
                            │
                    (0..1) customers ──── (0..n) loyalty_transactions
                            │
                            │
                    (0..n) Order

Product ──── (0..1) Category
    │
    │
    ├─── (0..n) ProductSize
    │
    ├─── (0..n) ProductTopping
    │
    └─── (0..n) ProductRecipe ──── (1) Ingredient

Product ──── (0..1) Stock ──── (0..n) StockAlert
Ingredient ──── (0..1) IngredientStock ──── (0..n) StockAlert
```

**Hình 11. Sơ đồ quan hệ cơ sở dữ liệu**

## 3.4. Thiết kế kiến trúc hệ thống

### 3.4.1. Kiến trúc tổng thể

Hệ thống OCHA POS được thiết kế theo kiến trúc Client-Server với các thành phần chính:

- **Frontend**: Ứng dụng web React được xây dựng bằng TypeScript, sử dụng Vite làm build tool và Tailwind CSS cho styling. Frontend giao tiếp với backend thông qua RESTful API và Socket.io cho cập nhật thời gian thực.

- **Backend**: Server API được xây dựng bằng Node.js và Express.js, sử dụng TypeScript. Backend xử lý logic nghiệp vụ, quản lý cơ sở dữ liệu thông qua Prisma ORM, và cung cấp real-time communication qua Socket.io.

- **Database**: PostgreSQL được sử dụng làm hệ quản trị cơ sở dữ liệu chính, lưu trữ tất cả dữ liệu của hệ thống.

- **Real-time Communication**: Socket.io được sử dụng để cung cấp cập nhật thời gian thực cho màn hình hiển thị đơn hàng và đồng bộ hóa trạng thái đơn hàng giữa các client.

#### Sơ đồ kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Web App    │  │  Admin Panel │  │ Order Display│        │
│  │  (React +    │  │  (React +    │  │  Screen      │        │
│  │  TypeScript) │  │  TypeScript) │  │  (React)      │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                 │                 │
│         └─────────────────┼─────────────────┘                 │
│                           │                                    │
│                    RESTful API + Socket.io                     │
│                           │                                    │
└───────────────────────────┼────────────────────────────────────┘
                            │
┌───────────────────────────┼────────────────────────────────────┐
│                           │         SERVER LAYER               │
│                           │                                    │
│                  ┌────────▼─────────┐                         │
│                  │   Express.js     │                         │
│                  │   (Node.js +     │                         │
│                  │   TypeScript)    │                         │
│                  └────────┬─────────┘                         │
│                           │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         │                  │                  │                │
│  ┌──────▼──────┐  ┌───────▼───────┐  ┌──────▼──────┐        │
│  │   REST API  │  │  Socket.io    │  │  Business   │        │
│  │   Routes    │  │  Server       │  │  Logic      │        │
│  └──────┬──────┘  └───────┬───────┘  └──────┬──────┘        │
│         │                  │                  │                │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
│                  ┌─────────▼─────────┐                        │
│                  │   Prisma ORM      │                        │
│                  └─────────┬─────────┘                        │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                             │      DATA LAYER                   │
│                    ┌────────▼─────────┐                       │
│                    │   PostgreSQL     │                       │
│                    │   Database       │                       │
│                    └──────────────────┘                       │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│  │   Users    │  │  Products   │  │   Orders   │             │
│  │  Customers │  │  Categories │  │ OrderItems │             │
│  │  Stock     │  │ Ingredients │  │  Reports   │             │
│  └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Hình 12. Sơ đồ kiến trúc tổng thể hệ thống**

### 3.4.2. Kiến trúc module

Hệ thống được chia thành các module chính:

- **Module Quản lý đơn hàng**: Xử lý tạo đơn hàng, cập nhật trạng thái, quản lý giỏ hàng, và thanh toán.

- **Module Quản lý sản phẩm**: Quản lý thông tin sản phẩm, danh mục, kích thước và topping.

- **Module Quản lý kho hàng**: Quản lý tồn kho sản phẩm và nguyên liệu, công thức sản phẩm, và tự động trừ kho khi tạo đơn hàng.

- **Module Quản lý khách hàng**: Quản lý thông tin khách hàng và hệ thống tích điểm.

- **Module Báo cáo và phân tích**: Xử lý các báo cáo doanh thu, phân tích sản phẩm bán chạy, và xuất báo cáo Excel.

- **Module Xác thực và phân quyền**: Xử lý đăng nhập, JWT authentication, và phân quyền dựa trên vai trò.

- **Module Real-time Updates**: Xử lý cập nhật thời gian thực qua Socket.io cho màn hình hiển thị đơn hàng.

#### Sơ đồ kiến trúc module

```
┌─────────────────────────────────────────────────────────────────┐
│                    OCHA POS SYSTEM                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Module Xác thực và Phân quyền                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  JWT Auth    │  │  Role-Based  │  │  Permission  │  │  │
│  │  │              │  │  Access      │  │  Control     │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│        ┌───────────────────┼───────────────────┐                │
│        │                   │                   │                │
│  ┌─────▼──────┐    ┌───────▼───────┐   ┌──────▼──────┐       │
│  │  Module    │    │   Module      │   │   Module    │       │
│  │  Quản lý   │    │   Quản lý     │   │   Quản lý   │       │
│  │  đơn hàng  │    │   sản phẩm    │   │   kho hàng  │       │
│  │            │    │               │   │             │       │
│  │ ┌────────┐ │    │ ┌──────────┐ │   │ ┌─────────┐ │       │
│  │ │Tạo đơn │ │    │ │Quản lý   │ │   │ │Tồn kho  │ │       │
│  │ │hàng    │ │    │ │sản phẩm  │ │   │ │         │ │       │
│  │ └────────┘ │    │ └──────────┘ │   │ └─────────┘ │       │
│  │ ┌────────┐ │    │ ┌──────────┐ │   │ ┌─────────┐ │       │
│  │ │Thanh   │ │    │ │Danh mục  │ │   │ │BOM      │ │       │
│  │ │toán    │ │    │ │          │ │   │ │         │ │       │
│  │ └────────┘ │    │ └──────────┘ │   │ └─────────┘ │       │
│  │ ┌────────┐ │    │ ┌──────────┐ │   │ ┌─────────┐ │       │
│  │ │Giỏ hàng│ │    │ │Kích thước│ │   │ │Tự động  │ │       │
│  │ │        │ │    │ │Topping   │ │   │ │trừ kho   │ │       │
│  │ └────────┘ │    │ └──────────┘ │   │ └─────────┘ │       │
│  └─────┬──────┘    └───────┬───────┘   └──────┬──────┘       │
│        │                   │                   │                │
│        └───────────────────┼───────────────────┘                │
│                            │                                     │
│        ┌────────────────────┼────────────────────┐              │
│        │                    │                    │              │
│  ┌─────▼──────┐    ┌────────▼────────┐  ┌──────▼──────┐      │
│  │  Module    │    │   Module         │  │   Module    │      │
│  │  Quản lý   │    │   Báo cáo và     │  │   Real-time │      │
│  │  khách hàng│    │   Phân tích      │  │   Updates   │      │
│  │            │    │                  │  │             │      │
│  │ ┌────────┐ │    │ ┌──────────────┐ │  │ ┌─────────┐ │      │
│  │ │Thông tin│ │    │ │Doanh thu     │ │  │ │Socket.io│ │      │
│  │ │KH       │ │    │ │              │ │  │ │         │ │      │
│  │ └────────┘ │    │ └──────────────┘ │  │ └─────────┘ │      │
│  │ ┌────────┐ │    │ ┌──────────────┐ │  │ ┌─────────┐ │      │
│  │ │Tích điểm│ │    │ │Sản phẩm     │ │  │ │Order    │ │      │
│  │ │         │ │    │ │bán chạy     │ │  │ │Display  │ │      │
│  │ └────────┘ │    │ └──────────────┘ │  │ └─────────┘ │      │
│  │ ┌────────┐ │    │ ┌──────────────┐ │  │             │      │
│  │ │Thành   │ │    │ │Xuất Excel    │ │  │             │      │
│  │ │viên    │ │    │ │              │ │  │             │      │
│  │ └────────┘ │    │ └──────────────┘ │  │             │      │
│  └─────┬──────┘    └────────┬─────────┘  └──────┬──────┘      │
│        │                    │                    │              │
│        └────────────────────┼────────────────────┘              │
│                             │                                    │
│                    ┌─────────▼─────────┐                        │
│                    │   Database Layer  │                        │
│                    │   (PostgreSQL)    │                        │
│                    └───────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Hình 13. Sơ đồ kiến trúc module hệ thống**

### 3.4.3. Luồng xử lý chính

#### Luồng tạo đơn hàng và tự động trừ kho

1. Người dùng (Staff hoặc Customer) chọn sản phẩm và thêm vào giỏ hàng
2. Hệ thống tính tổng tiền dựa trên giá sản phẩm, kích thước và topping
3. Người dùng nhập thông tin khách hàng và chọn phương thức thanh toán
4. Hệ thống tạo đơn hàng và lấy công thức (BOM) của các sản phẩm
5. Hệ thống tính toán số lượng nguyên liệu cần thiết dựa trên số lượng sản phẩm đã đặt
6. Hệ thống kiểm tra tồn kho nguyên liệu và tự động trừ kho
7. Nếu không đủ nguyên liệu, hệ thống hiển thị cảnh báo
8. Hệ thống kiểm tra mức tồn kho tối thiểu và tạo cảnh báo nếu cần
9. Hệ thống ghi lại giao dịch kho và gửi thông báo qua Socket.io
10. Màn hình hiển thị đơn hàng được cập nhật tự động

**Sơ đồ luồng tạo đơn hàng và tự động trừ kho:**

```
[User] Chọn sản phẩm → Thêm vào giỏ hàng
         │
         ▼
[Frontend] Tính tổng tiền (giá + size + topping)
         │
         ▼
[User] Nhập thông tin KH + Chọn phương thức thanh toán
         │
         ▼
[Backend] Tạo đơn hàng → Lấy BOM của sản phẩm
         │
         ▼
[Backend] Tính toán nguyên liệu cần thiết
         │
         ▼
[Backend] Kiểm tra tồn kho nguyên liệu
         │
    ┌────┴────┐
    │         │
Đủ hàng   Không đủ
    │         │
    ▼         ▼
Trừ kho   Hiển thị cảnh báo
    │         │
    │         └──→ [Kết thúc]
    ▼
Kiểm tra mức tồn kho tối thiểu
    │
    ▼
Tạo cảnh báo nếu cần
    │
    ▼
Ghi giao dịch kho
    │
    ▼
Gửi thông báo qua Socket.io
    │
    ▼
Cập nhật màn hình hiển thị đơn hàng
    │
    ▼
[Đơn hàng được tạo thành công]
```

**Hình 14. Sơ đồ luồng tạo đơn hàng và tự động trừ kho**

#### Luồng thanh toán và tích điểm

1. Người dùng chọn phương thức thanh toán (Tiền mặt, Thẻ, QR)
2. Nếu thanh toán bằng QR, hệ thống tạo yêu cầu thanh toán và chuyển đến cổng thanh toán
3. Sau khi thanh toán thành công, hệ thống cập nhật trạng thái thanh toán
4. Nếu khách hàng có tài khoản, hệ thống tính điểm tích lũy dựa trên tổng tiền
5. Hệ thống cập nhật điểm tích lũy và cấp độ thành viên của khách hàng
6. Hệ thống ghi lại giao dịch tích điểm và gửi thông báo

**Sơ đồ luồng thanh toán và tích điểm:**

```
[User] Chọn phương thức thanh toán
         │
    ┌────┴────┬──────────────┐
    │         │              │
Tiền mặt   Thẻ          QR Code
    │         │              │
    ▼         ▼              ▼
Cập nhật  Tạo yêu cầu   Tạo yêu cầu
trạng thái thanh toán    thanh toán
    │         │              │
    │         ▼              ▼
    │    Chuyển đến cổng thanh toán
    │         │              │
    │         ▼              ▼
    │    Xử lý thanh toán
    │         │              │
    └─────────┴──────────────┘
              │
              ▼
    Cập nhật trạng thái thanh toán
              │
              ▼
    Khách hàng có tài khoản?
              │
      ┌───────┴───────┐
      │               │
     Có              Không
      │               │
      ▼               ▼
Tính điểm tích lũy  [Kết thúc]
      │
      ▼
Cập nhật điểm tích lũy
      │
      ▼
Kiểm tra và cập nhật cấp độ thành viên
      │
      ▼
Ghi giao dịch tích điểm
      │
      ▼
Gửi thông báo
      │
      ▼
[Thanh toán hoàn tất]
```

**Hình 15. Sơ đồ luồng thanh toán và tích điểm**

## 3.5. Thiết kế giao diện

### 3.5.1. Nguyên tắc thiết kế

- **Đơn giản và trực quan**: Giao diện được thiết kế đơn giản, dễ sử dụng, phù hợp với môi trường phục vụ nhanh của quán cà phê.

- **Responsive Design**: Giao diện tương thích tốt trên các thiết bị khác nhau từ máy tính để bàn đến máy tính bảng và điện thoại di động.

- **Màu sắc và Typography**: Sử dụng màu sắc nhất quán và typography rõ ràng để tăng khả năng đọc và sử dụng.

- **Feedback người dùng**: Cung cấp phản hồi rõ ràng cho mọi hành động của người dùng thông qua notifications và loading states.

### 3.5.2. Các màn hình chính

- **Màn hình Dashboard**: Hiển thị tổng quan về doanh thu, đơn hàng, và cảnh báo kho hàng.

- **Màn hình Quản lý đơn hàng**: Giao diện tạo đơn hàng với danh sách sản phẩm, giỏ hàng, và thông tin khách hàng.

- **Màn hình Hiển thị đơn hàng**: Màn hình full-screen hiển thị đơn hàng cho bếp và bar với cập nhật thời gian thực.

- **Màn hình Quản lý sản phẩm**: Giao diện quản lý sản phẩm với bảng dữ liệu và form thêm/sửa.

- **Màn hình Quản lý kho hàng**: Hiển thị tồn kho sản phẩm và nguyên liệu, cảnh báo, và lịch sử giao dịch.

- **Màn hình Báo cáo**: Hiển thị các biểu đồ và bảng dữ liệu báo cáo với khả năng xuất Excel.

