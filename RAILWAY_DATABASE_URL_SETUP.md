# 🔧 Hướng Dẫn Setup DATABASE_URL cho Railway

## ❌ Vấn Đề Hiện Tại

Backend đang nhận `DATABASE_URL` là empty string `''`, dẫn đến lỗi:
```
DATABASE_URL is required
```

## ✅ Giải Pháp: 3 Cách Setup DATABASE_URL

### Cách 1: Dùng Railway Variable Reference (Khuyến Nghị - Tự Động)

**Khi nào dùng:** Khi PostgreSQL service và Backend service đã được tạo trong cùng một Railway project.

**Các bước:**

1. **Vào Railway Dashboard → Backend Service → Settings → Variables**

2. **Click "+ New Variable"**

3. **Thêm variable:**
   ```
   Variable Name: DATABASE_URL
   Value: ${{Postgres.DATABASE_URL}}
   ```
   
   **Lưu ý:** Thay `Postgres` bằng tên chính xác của PostgreSQL service của bạn:
   - Nếu tên là `Postgres` → dùng `${{Postgres.DATABASE_URL}}`
   - Nếu tên là `PostgreSQL` → dùng `${{PostgreSQL.DATABASE_URL}}`
   - Nếu tên là `postgres` → dùng `${{postgres.DATABASE_URL}}`
   - Nếu tên khác → dùng `${{TênService.DATABASE_URL}}`

4. **Kiểm tra tên PostgreSQL service:**
   - Vào Railway Dashboard → Project
   - Nhìn vào sidebar bên trái
   - Tìm service có icon con voi xanh (PostgreSQL)
   - Xem tên chính xác ở trên cùng của card

5. **Save và Redeploy:**
   - Click "Save" hoặc Railway tự động save
   - Vào Deployments → Redeploy Backend service

**Ưu điểm:**
- ✅ Tự động sync khi PostgreSQL thay đổi
- ✅ Không cần copy/paste thủ công
- ✅ Railway tự động inject vào Backend service

**Nhược điểm:**
- ⚠️ Cần đảm bảo tên service đúng
- ⚠️ Cả 2 services phải trong cùng project

---

### Cách 2: Copy Trực Tiếp từ PostgreSQL Service (Chắc Chắn Hoạt Động)

**Khi nào dùng:** Khi cách 1 không hoạt động hoặc bạn muốn chắc chắn 100%.

**Các bước:**

1. **Vào PostgreSQL Service → Variables Tab**
   - Railway Dashboard → Project → PostgreSQL Service
   - Click vào tab "Variables"

2. **Tìm và Copy DATABASE_URL**
   - Tìm variable `DATABASE_URL`
   - Click vào để xem giá trị
   - Copy toàn bộ giá trị (sẽ là một string dài như: `postgresql://user:password@host:port/database`)

3. **Paste vào Backend Service**
   - Vào Backend Service → Settings → Variables
   - Click "+ New Variable"
   - Variable Name: `DATABASE_URL`
   - Value: Paste giá trị vừa copy (KHÔNG dùng `${{...}}`)
   - Click "Save"

4. **Redeploy Backend**
   - Vào Deployments → Redeploy

**Ưu điểm:**
- ✅ Chắc chắn hoạt động 100%
- ✅ Không phụ thuộc vào tên service
- ✅ Dễ debug (có thể thấy giá trị cụ thể)

**Nhược điểm:**
- ⚠️ Phải copy/paste thủ công
- ⚠️ Nếu PostgreSQL thay đổi, phải update lại

---

### Cách 3: Dùng Railway "Add Variable" Banner (Tự Động Link)

**Khi nào dùng:** Khi bạn thấy banner màu tím trong Variables tab.

**Các bước:**

1. **Vào Backend Service → Settings → Variables**

2. **Tìm banner màu tím:**
   ```
   "Trying to connect a database? Add Variable"
   ```

3. **Click vào "Add Variable" trong banner**

4. **Railway sẽ tự động:**
   - Detect PostgreSQL service trong project
   - Tạo `DATABASE_URL` variable
   - Link với PostgreSQL service

5. **Kiểm tra:**
   - Xem `DATABASE_URL` đã được thêm chưa
   - Giá trị sẽ là `${{Postgres.DATABASE_URL}}` hoặc tương tự

6. **Redeploy Backend**

**Ưu điểm:**
- ✅ Tự động và nhanh nhất
- ✅ Railway tự động detect và link

**Nhược điểm:**
- ⚠️ Chỉ hoạt động nếu Railway detect được PostgreSQL service

---

## 🔍 Kiểm Tra DATABASE_URL Đã Được Set Đúng

### Checklist:

- [ ] Vào Backend Service → Variables
- [ ] Tìm variable `DATABASE_URL`
- [ ] Kiểm tra giá trị:
  - ✅ **Đúng:** Có giá trị (không empty)
    - Dạng: `postgresql://user:password@host:port/database`
    - Hoặc: `${{Postgres.DATABASE_URL}}` (Railway sẽ tự resolve)
  - ❌ **Sai:** Empty hoặc không có variable này

### Cách Test Nhanh:

1. **Vào Backend Service → Deployments → Latest Deployment → View Logs**
2. **Tìm dòng có `DATABASE_URL`**
3. **Kiểm tra:**
   - Nếu thấy connection string → ✅ Đúng
   - Nếu thấy empty hoặc undefined → ❌ Sai

---

## 🚨 Troubleshooting

### Vấn đề 1: `${{Postgres.DATABASE_URL}}` không được resolve

**Triệu chứng:** Variable có giá trị `${{Postgres.DATABASE_URL}}` nhưng Backend vẫn nhận empty.

**Giải pháp:**
1. Kiểm tra tên PostgreSQL service có đúng không
2. Thử các tên khác: `PostgreSQL`, `postgres`, etc.
3. Hoặc dùng Cách 2 (copy trực tiếp)

### Vấn đề 2: Không tìm thấy PostgreSQL service

**Triệu chứng:** Không thấy PostgreSQL service trong project.

**Giải pháp:**
1. Vào Project → Click "+ New"
2. Chọn "Database" → "Add PostgreSQL"
3. Đợi PostgreSQL khởi động (1-2 phút)
4. Sau đó làm theo Cách 1 hoặc Cách 2

### Vấn đề 3: DATABASE_URL bị empty sau khi redeploy

**Triệu chứng:** Đã set DATABASE_URL nhưng sau redeploy lại bị empty.

**Giải pháp:**
1. Kiểm tra lại Variables trong Railway Dashboard
2. Đảm bảo variable vẫn còn đó
3. Nếu dùng `${{...}}`, kiểm tra PostgreSQL service vẫn còn active
4. Hoặc dùng Cách 2 (copy trực tiếp) để tránh vấn đề này

---

## 📝 Tóm Tắt Nhanh

**Để DATABASE_URL hoạt động:**

1. ✅ **PostgreSQL service phải được tạo và Active**
2. ✅ **DATABASE_URL variable phải được thêm vào Backend service**
3. ✅ **Giá trị phải không empty:**
   - Dùng `${{Postgres.DATABASE_URL}}` (tự động)
   - Hoặc copy trực tiếp từ PostgreSQL service (chắc chắn)
4. ✅ **Redeploy Backend service sau khi set**

---

## 🎯 Khuyến Nghị

**Cho lần đầu setup:**
- Dùng **Cách 3** (banner "Add Variable") nếu có
- Hoặc **Cách 2** (copy trực tiếp) để chắc chắn

**Cho production:**
- Dùng **Cách 1** (`${{Postgres.DATABASE_URL}}`) để tự động sync

---

**Sau khi set xong DATABASE_URL, đừng quên:**
- Set `JWT_SECRET` (tối thiểu 32 ký tự)
- Set các variables khác (NODE_ENV, PORT, etc.)
- Redeploy Backend service

