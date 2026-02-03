# 💎 Ocha POS - Luxury Terminal Experience

Ocha POS là hệ thống quản lý bán hàng (Point of Sale) cao cấp được thiết kế chuyên biệt cho các mô hình kinh doanh F&B (Nhà hàng, Cà phê, Bakery). Dự án tập trung vào trải nghiệm người dùng tinh tế (Luxury UI), hiệu năng xử lý tốc độ cao và khả năng đồng bộ thời gian thực mạnh mẽ.

## ✨ Tính năng nổi bật

### 🎨 Giao diện "Luxury Terminal"
* Thiết kế hiện đại theo phong cách tối giản, sang trọng với các bo góc siêu lớn (32px-48px).
* Hiệu ứng Glassmorphism và Backdrop Blur tạo chiều sâu cho không gian làm việc.
* Tối ưu hóa trải nghiệm trên cả màn hình máy tính và máy tính bảng (Tablet).

### 📋 Quản lý Đơn hàng Thông minh
* **Lưu đơn chờ (Parked Orders)**: Cho phép tạm dừng đơn hàng đang dở để phục vụ khách khác và khôi phục lại tức thì.
* **Sơ đồ bàn (Floor Plan)**: Quản lý trạng thái bàn (Trống/Đang ngồi) theo sơ đồ trực quan, hiển thị tổng tiền và thời gian khách đã ngồi theo thời gian thực.
* **Quy trình Thanh toán tối ưu**: Tích hợp chọn hình thức phục vụ (Dùng tại quán/Mang về) và gán số bàn/thẻ rung ngay trong luồng thanh toán.

### ⚡ Hiệu năng & Đồng bộ
* **Real-time Sync**: Sử dụng WebSockets (Socket.io) để đồng bộ trạng thái đơn hàng giữa màn hình nhân viên và màn hình hiển thị cho khách hàng.
* **Single-Pass Algorithm**: Thuật toán lọc đơn hàng tối ưu, đảm bảo tìm kiếm và phân loại hàng ngàn đơn hàng trong tích tắc mà không gây giật lag UI.
* **Offline Persistence**: Lưu trữ giỏ hàng và đơn chờ thông qua SessionStorage, đảm bảo không mất dữ liệu khi trình duyệt được tải lại.

### 💳 Thanh toán & Bảo mật
* Tích hợp thanh toán QR Code hiện đại với giao diện "Luxury Banking".
* Quản lý trạng thái xác thực và phân quyền nhân viên (Staff/Admin).

## 🛠 Công nghệ sử dụng

*   **Frontend**: React 18+, TypeScript, Tailwind CSS.
*   **UI Components**: Shadcn/UI, Lucide Icons, Framer Motion.
*   **State Management**: React Context API & Custom Hooks.
*   **Backend Backend**: Node.js/Express (API phục vụ POS).
*   **Real-time**: Socket.io.

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
* Node.js v18.0.0 trở lên.
* npm hoặc yarn.

### 2. Cài đặt Dependencies
```bash
# Cài đặt cho toàn bộ dự án
npm install

# Hoặc cài đặt riêng cho frontend/backend
cd frontend && npm install
cd ../backend && npm install
```

### 3. Cấu hình môi trường (Environment Variables)
Sao chép file `.env.example` thành `.env` trong cả hai thư mục `frontend` và `backend` và cấu hình các thông số API URL, Port.

### 4. Chạy ứng dụng
```bash
# Tại thư mục gốc (Root)
npm run dev
```
Ứng dụng sẽ khả dụng tại:
* **POS Terminal**: `http://localhost:3000`
* **Màn hình khách hàng**: `http://localhost:3000/customer`

## 📂 Cấu trúc dự án
* `frontend/src/features/orders`: Chứa toàn bộ logic xử lý đơn hàng, thanh toán và sơ đồ bàn.
* `frontend/src/features/products`: Quản lý danh mục và hiển thị sản phẩm.
* `frontend/src/components/layout`: Chứa giao diện POS Layout và Sidebar.
* `shared-types/`: Chứa các định nghĩa kiểu dữ liệu (TypeScript Interfaces) dùng chung cho toàn hệ thống.

---
*Phát triển bởi LanProVN Core Team.*
