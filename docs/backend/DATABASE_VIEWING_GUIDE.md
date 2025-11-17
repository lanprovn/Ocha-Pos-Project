# 📊 Hướng Dẫn Xem Database

## 🎯 Cách 1: Prisma Studio (Khuyên dùng - Dễ nhất)

**Prisma Studio** là công cụ GUI có sẵn trong project, cho phép xem và chỉnh sửa database trực tiếp qua trình duyệt.

### Cách sử dụng:

1. **Mở terminal trong thư mục `backend`:**
   ```bash
   cd backend
   ```

2. **Chạy Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```
   Hoặc:
   ```bash
   npx prisma studio
   ```

3. **Mở trình duyệt:**
   - Prisma Studio sẽ tự động mở tại: `http://localhost:5555`
   - Nếu không tự mở, bạn có thể truy cập thủ công

### Tính năng:
- ✅ Xem tất cả tables (Users, Products, Categories, Orders, Stock, etc.)
- ✅ Xem chi tiết từng record
- ✅ Thêm, sửa, xóa dữ liệu trực tiếp
- ✅ Tìm kiếm và filter
- ✅ Xem relationships giữa các tables
- ✅ Giao diện đẹp, dễ sử dụng

### Screenshot:
```
Prisma Studio sẽ hiển thị:
- Sidebar: Danh sách tất cả models
- Main area: Bảng dữ liệu với pagination
- Detail view: Chi tiết record khi click vào
```

---

## 🎯 Cách 2: pgAdmin (PostgreSQL GUI Tool)

**pgAdmin** là công cụ chính thức của PostgreSQL, mạnh mẽ và đầy đủ tính năng.

### Cài đặt:

1. **Download pgAdmin:**
   - Windows: https://www.pgadmin.org/download/pgadmin-4-windows/
   - Mac: https://www.pgadmin.org/download/pgadmin-4-macos/
   - Linux: `sudo apt-get install pgadmin4`

2. **Kết nối database:**
   - Mở pgAdmin
   - Right-click "Servers" → "Create" → "Server"
   - Tab "General": Name = "OCHA POS"
   - Tab "Connection":
     - Host: `localhost` (hoặc IP của PostgreSQL server)
     - Port: `5432` (mặc định)
     - Database: Tên database (xem trong `.env` file)
     - Username: PostgreSQL username
     - Password: PostgreSQL password
   - Click "Save"

3. **Xem database:**
   - Expand "OCHA POS" → "Databases" → [Database name] → "Schemas" → "public" → "Tables"
   - Click vào table để xem dữ liệu

### Tính năng:
- ✅ Query editor (viết SQL queries)
- ✅ View, edit, delete data
- ✅ Create tables, indexes, etc.
- ✅ Backup/restore database
- ✅ Performance monitoring

---

## 🎯 Cách 3: DBeaver (Universal Database Tool)

**DBeaver** là công cụ mã nguồn mở, hỗ trợ nhiều loại database.

### Cài đặt:

1. **Download DBeaver:**
   - https://dbeaver.io/download/
   - Chọn Community Edition (miễn phí)

2. **Kết nối database:**
   - Mở DBeaver
   - Click "New Database Connection" (icon database)
   - Chọn "PostgreSQL"
   - Điền thông tin:
     - Host: `localhost`
     - Port: `5432`
     - Database: Tên database
     - Username: PostgreSQL username
     - Password: PostgreSQL password
   - Click "Test Connection" để kiểm tra
   - Click "Finish"

3. **Xem database:**
   - Expand connection → "Schemas" → "public" → "Tables"
   - Right-click table → "View Data"

### Tính năng:
- ✅ SQL editor với syntax highlighting
- ✅ ER diagrams (Entity Relationship)
- ✅ Data export/import
- ✅ Query execution plans
- ✅ Hỗ trợ nhiều database types

---

## 🎯 Cách 4: TablePlus (Modern GUI - Trả phí nhưng có bản miễn phí)

**TablePlus** là công cụ hiện đại, giao diện đẹp, dễ sử dụng.

### Cài đặt:

1. **Download TablePlus:**
   - Windows: https://tableplus.com/windows
   - Mac: https://tableplus.com/mac
   - Có bản miễn phí (giới hạn số connections)

2. **Kết nối database:**
   - Mở TablePlus
   - Click "Create a new connection"
   - Chọn "PostgreSQL"
   - Điền thông tin connection
   - Click "Connect"

### Tính năng:
- ✅ Giao diện đẹp, hiện đại
- ✅ Fast và responsive
- ✅ Multiple tabs
- ✅ Query editor
- ✅ Data editing

---

## 🎯 Cách 5: Command Line (psql)

Nếu bạn thích dùng terminal, có thể dùng `psql` command line tool.

### Sử dụng:

1. **Kết nối:**
   ```bash
   psql -h localhost -U username -d database_name
   ```

2. **Các lệnh hữu ích:**
   ```sql
   -- Xem danh sách tables
   \dt
   
   -- Xem cấu trúc table
   \d table_name
   
   -- Xem dữ liệu
   SELECT * FROM users;
   SELECT * FROM products;
   SELECT * FROM orders;
   
   -- Thoát
   \q
   ```

---

## 📋 Thông Tin Database Connection

Để biết thông tin kết nối database, xem file `.env` trong thư mục `backend`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

**Giải thích:**
- `username`: PostgreSQL username
- `password`: PostgreSQL password
- `localhost:5432`: Host và port
- `database_name`: Tên database
- `schema=public`: Schema name

---

## 🚀 Khuyến Nghị

**Cho người mới bắt đầu:**
👉 **Dùng Prisma Studio** - Đơn giản nhất, không cần cài đặt thêm, đã có sẵn trong project.

**Cho developer:**
👉 **DBeaver** hoặc **pgAdmin** - Nhiều tính năng, có thể viết SQL queries, phù hợp cho development.

**Cho designer/UI-focused:**
👉 **TablePlus** - Giao diện đẹp, dễ nhìn, phù hợp cho demo hoặc presentation.

---

## 🔧 Troubleshooting

### Prisma Studio không mở được:
```bash
# Đảm bảo database đã chạy
# Kiểm tra DATABASE_URL trong .env
# Chạy lại:
npm run prisma:studio
```

### Không kết nối được database:
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra thông tin connection trong `.env`
3. Kiểm tra firewall/port 5432
4. Test connection bằng `psql` command line

### Lỗi "Database does not exist":
```bash
# Tạo database mới:
createdb database_name

# Hoặc dùng Prisma:
npx prisma migrate dev
```

---

## 📚 Tài Liệu Tham Khảo

- Prisma Studio: https://www.prisma.io/studio
- pgAdmin: https://www.pgadmin.org/docs/
- DBeaver: https://dbeaver.io/docs/
- TablePlus: https://tableplus.com/docs

---

**Last Updated:** 2024-01-01

