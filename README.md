# Ocha POS - Enterprise-Grade F&B Management System

Ocha POS là một giải pháp Point of Sale (POS) toàn diện được xây dựng trên nền tảng Full-stack Modern Web. Hệ thống được tối ưu hóa cho các nghiệp vụ F&B phức tạp, tập trung vào hiệu năng xử lý (Performance), tính ổn định cao (High Availability) và trải nghiệm người dùng liền mạch (Seamless UX).

## 🚀 Key Technical Features

### Modern Frontend Architecture
*   **Feature-Based Module**: Cấu trúc thư mục theo modular hóa, tách biệt logic nghiệp vụ giúp dễ dàng mở rộng và bảo trì.
*   **Type-Safe Development**: Sử dụng TypeScript 100% cho cả client và server, đảm bảo tính nhất quán của dữ liệu thông qua bộ `shared-types` tập trung.
*   **Responsive Engine**: Hệ thống Layout được thiết kế linh hoạt, tối ưu hóa hiển thị cho đa dạng thiết bị đầu cuối từ Desktop đến Tablet.

### Advanced Order Lifecycle Management
*   **Atomic Order Processing**: Luồng xử lý đơn hàng được nguyên tử hóa, tích hợp quản lý trạng thái realtime thông qua Socket.io.
*   **Dine-in/Takeaway Workflow**: Modular hóa quy trình checkout, cho phép gán định danh (mã bàn/pager) linh hoạt mà không làm gián đoạn luồng dữ liệu chính.
*   **Table-State Mapping**: Hệ thống quản lý sơ đồ tầng (Floor Plan) đồng bộ realtime, phản ánh chính xác trạng thái vận hành của nhà hàng.

### Optimized Data Processing
*   **Single-Pass Filter Algorithm**: Thuật toán lọc dữ liệu thời gian thực được tối ưu hóa với độ phức tạp O(n), đảm bảo xử lý hàng ngàn bản ghi với độ trễ tối thiểu (<16ms).
*   **Optimistic UI Updates**: Tăng cường cảm giác phản hồi tức thì bằng cách cập nhật trạng thái cục bộ trước khi nhận xác nhận từ server, giúp UX mượt mà vượt trội.
*   **Synchronized Multi-Display**: Cơ chế đồng bộ hóa giữa thiết bị nhân viên và màn hình khách hàng thông qua mô hình Event-Driven.

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express, Socket.io |
| **State** | Context API, Custom Hooks, Session Persistence |
| **UI Kit** | Radix UI, Lucide Icons, Shadcn/UI |

## ⚙️ Development Setup

### System Requirements
*   Node.js (LTS version recommended)
*   npm / yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/lanprovn/Ocha-Pos-Project.git

# Install dependencies for all packages
npm install
```

### Configuration
Khởi tạo `.env` từ file `.env.example` tại các thư mục `frontend` và `backend`. Đảm bảo các biến môi trường `API_URL` và `SOCKET_URL` được cấu hình chính xác.

### Running the Project
```bash
# Start development environment
npm run dev
```

## 🏗 Directory Structure
*   `/frontend/src/features` - Chứa các module chức năng độc lập (orders, products, auth, etc.)
*   `/backend` - RESTful API và Socket.io server.
*   `/shared-types` - Centralized definitions cho mô hình dữ liệu (Order, Customer, Product).

---
**LanProVN Engineering Team**
