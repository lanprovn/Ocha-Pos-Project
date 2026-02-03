# 🗄️ HƯỚNG DẪN SETUP DATABASE

> **Mục tiêu**: Kết nối PostgreSQL database cho OCHA POS System

---

## 📋 YÊU CẦU

- ✅ PostgreSQL 16+ đã cài đặt (Đã có ✓)
- ✅ pgAdmin4 đã cài đặt (Đã có ✓)
- ✅ Node.js 20+ (Đã có ✓)

---

## 🚀 CÁCH 1: SETUP TỰ ĐỘNG (KHUYẾN NGHỊ)

### Chạy script tự động:

```bash
# Từ thư mục gốc project
bash setup-database.sh
```

**Script sẽ tự động**:
1. ✅ Kiểm tra PostgreSQL đang chạy
2. ✅ Kết nối và test
3. ✅ Tạo database `ocha_pos`
4. ✅ Tạo file `backend/.env` với config đúng
5. ✅ Hiển thị hướng dẫn tiếp theo

**Sau khi chạy xong**, làm theo các bước được hiển thị:
```bash
cd backend
npm run prisma:migrate     # Tạo tables
npm run prisma:seed        # Thêm dữ liệu mẫu
npm run dev               # Chạy backend
```

---

## 🖥️ CÁCH 2: SETUP BẰTAygủi (pgAdmin4)

### Bước 1: Kết nối PostgreSQL Server

1. Mở **pgAdmin4**
2. Right-click `Servers` → `Register` → `Server`
3. Điền thông tin:
   - **Name**: `Local PostgreSQL`
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Username**: `postgres` (hoặc user của bạn)
   - **Password**: (password PostgreSQL của bạn)
4. Click **Save**

### Bước 2: Tạo Database

1. Right-click `Databases` → `Create` → `Database`
2. **Database name**: `ocha_pos`
3. **Owner**: `postgres`
4. Click **Save**

### Bước 3: Tạo file `.env`

Copy file `.env.example` thành `.env`:
```bash
cd backend
cp .env.example .env
```

Sửa file `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ocha_pos?schema=public"
```

Thay `YOUR_PASSWORD` bằng password PostgreSQL của bạn.

### Bước 4: Chạy Migrations

```bash
cd backend
npm run prisma:migrate
```

### Bước 5: Seed Dữ Liệu Mẫu

```bash
npm run prisma:seed
```

---

## 🛠️ CÁCH 3: SETUP BẰNG TERMINAL

### 1. Kiểm tra PostgreSQL đang chạy

```bash
# Kiểm tra
pg_isready

# Nếu chưa chạy, start PostgreSQL
brew services start postgresql@16
```

### 2. Tạo Database

```bash
# Kết nối vào PostgreSQL
psql postgres

# Trong psql shell:
CREATE DATABASE ocha_pos;
\l  # Xem danh sách databases
\q  # Thoát
```

### 3. Tạo file .env

```bash
cd backend
cp .env.example .env
```

Sửa `DATABASE_URL` trong `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ocha_pos?schema=public"
```

### 4. Chạy Prisma Migrations

```bash
npm run prisma:migrate
```

### 5. Seed Dữ Liệu

```bash
npm run prisma:seed
```

---

## 📊 SAU KHI SETUP XONG

### Verify Database

```bash
# Kết nối vào database
psql -d ocha_pos

# Xem các tables
\dt

# Xem số lượng records
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM users;

# Thoát
\q
```

### Chạy Backend

```bash
cd backend
npm run dev
```

Backend sẽ chạy tại: `http://localhost:8080`

### Test API

```bash
# Health check
curl http://localhost:8080/health

# Get products
curl http://localhost:8080/api/v1/products

# Login (default admin)
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ocha.com",
    "password": "Admin@123"
  }'
```

---

## 🔑 DEFAULT ACCOUNTS (Sau khi Seed)

### Admin Account
- **Email**: `admin@ocha.com`
- **Password**: `Admin@123`
- **Role**: ADMIN

### Staff Account
- **Email**: `staff@ocha.com`
- **Password**: `Staff@123`
- **Role**: STAFF

---

## 🗂️ DATABASE SCHEMA

Prisma sẽ tạo các tables sau:

### Core Tables
- `users` - Nhân viên (Admin/Staff)
- `categories` - Danh mục sản phẩm
- `products` - Sản phẩm
- `product_sizes` - Size sản phẩm (S, M, L)
- `product_toppings` - Topping

### Order Tables
- `orders` - Đơn hàng
- `order_items` - Chi tiết đơn hàng
- `order_cancellations` - Hủy đơn
- `order_returns` - Đổi trả
- `order_splits` - Chia đơn
- `order_merges` - Gộp đơn

### Customer Tables
- `customers` - Khách hàng VIP
- `loyalty_transactions` - Giao dịch điểm thưởng

### Inventory Tables
- `stock` - Tồn kho sản phẩm
- `ingredients` - Nguyên liệu
- `ingredient_stocks` - Tồn kho nguyên liệu
- `product_recipes` - Công thức sản phẩm
- `stock_transactions` - Lịch sử nhập/xuất
- `stock_alerts` - Cảnh báo hết hàng

### System Tables
- `settings` - Cấu hình hệ thống

**Tổng cộng**: 18 tables

---

## ⚠️ TROUBLESHOOTING

### Lỗi: "PostgreSQL is not running"
```bash
brew services start postgresql@16
```

### Lỗi: "FATAL: password authentication failed"
```bash
# Reset password
psql postgres
ALTER USER postgres PASSWORD 'your_new_password';
```

### Lỗi: "database already exists"
```bash
# Xóa và tạo lại (MẤT DỮ LIỆU!)
psql postgres
DROP DATABASE ocha_pos;
CREATE DATABASE ocha_pos;
```

### Lỗi: "Prisma migration failed"
```bash
# Reset migrations
cd backend
rm -rf prisma/migrations
npm run prisma:migrate
```

### Xem logs database
```bash
tail -f /usr/local/var/log/postgresql@16.log
```

---

## 🌐 KẾT NỐI TỪ XA (OPTIONAL)

Nếu muốn kết nối từ máy khác:

1. Sửa `postgresql.conf`:
```bash
# Find config file
psql -c "SHOW config_file"

# Edit
nano /path/to/postgresql.conf

# Sửa dòng:
listen_addresses = '*'
```

2. Sửa `pg_hba.conf`:
```bash
# Add this line
host    all             all             0.0.0.0/0               md5
```

3. Restart PostgreSQL:
```bash
brew services restart postgresql@16
```

---

## 📚 TÀI LIỆU THAM KHẢO

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

---

**Prepared by**: Con Đỉ Chó 🐕  
**Last Updated**: 2026-02-03
