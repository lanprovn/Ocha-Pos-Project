# 🔧 Middleware - Giải Thích Chi Tiết

## ❓ Middleware Là Gì?

**Middleware** = **"Người trung gian"** xử lý request trước khi đến route handler.

### 🎯 Ví Dụ Đời Thường:

Giống như khi bạn vào cửa hàng:
1. **Bảo vệ** (middleware) kiểm tra bạn có đeo khẩu trang không
2. **Nhân viên** (middleware) hỏi bạn cần gì
3. **Thu ngân** (middleware) tính tiền
4. Cuối cùng bạn mới **mua được hàng** (route handler)

**Middleware = Các bước kiểm tra/xử lý trước khi đến đích!**

---

## 🏗️ Middleware Trong Express

### **Luồng Hoạt Động:**

```
Request → Middleware 1 → Middleware 2 → Middleware 3 → Route Handler → Response
```

### **Ví Dụ Trong Code:**

```typescript
// app.ts
app.use(express.json());           // Middleware 1: Parse JSON body
app.use(cors());                   // Middleware 2: CORS
app.use(helmet());                 // Middleware 3: Security headers
app.use('/api-docs', swaggerUi);   // Middleware 4: Swagger UI
app.get('/api/products', handler); // Route Handler: Xử lý request
```

---

## 📋 Các Middleware Trong Backend Của Bạn

### **1. Body Parser Middleware**
```typescript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```
**Chức năng:** Chuyển đổi request body từ string → JavaScript object
**Ví dụ:** `{"name": "Trà sữa"}` → `{ name: "Trà sữa" }`

### **2. CORS Middleware**
```typescript
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
```
**Chức năng:** Cho phép frontend gọi API từ domain khác
**Ví dụ:** Frontend `localhost:3000` → Backend `localhost:8080`

### **3. Helmet Middleware**
```typescript
app.use(helmet());
```
**Chức năng:** Thêm security headers để bảo vệ API
**Ví dụ:** Chống XSS, clickjacking, etc.

### **4. Swagger Middleware** ⭐
```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```
**Chức năng:** Serve Swagger UI tại route `/api-docs`
**Ví dụ:** Khi vào `http://localhost:8080/api-docs` → Hiển thị Swagger UI

### **5. Authentication Middleware**
```typescript
router.put('/:id/status', authenticate, requireRole('ADMIN', 'STAFF'), handler);
```
**Chức năng:** Kiểm tra user đã đăng nhập và có quyền không
**Ví dụ:** Chỉ ADMIN/STAFF mới update order status

---

## 🔍 Swagger Middleware Chi Tiết

### **Code:**

```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### **Giải Thích Từng Phần:**

#### **1. `app.use('/api-docs', ...)`**
- **Ý nghĩa:** "Khi có request đến `/api-docs`, hãy dùng middleware này"
- **Giống như:** "Khi khách vào cửa hàng, bảo vệ sẽ kiểm tra"

#### **2. `swaggerUi.serve`**
- **Ý nghĩa:** Serve các file static của Swagger UI (HTML, CSS, JS)
- **Giống như:** "Lấy các file cần thiết để hiển thị trang web"

#### **3. `swaggerUi.setup(swaggerSpec)`**
- **Ý nghĩa:** Setup Swagger UI với config từ `swaggerSpec`
- **Giống như:** "Cấu hình trang web với dữ liệu API của bạn"

### **Luồng Hoạt Động:**

```
1. User mở: http://localhost:8080/api-docs
   ↓
2. Express nhận request đến route "/api-docs"
   ↓
3. Swagger middleware được gọi:
   - swaggerUi.serve: Serve các file HTML/CSS/JS của Swagger UI
   - swaggerUi.setup: Inject API spec vào Swagger UI
   ↓
4. Browser nhận được HTML page với Swagger UI
   ↓
5. Swagger UI tự động load API spec và hiển thị documentation
```

---

## 🎯 So Sánh Middleware

### **Middleware Thường (Xử Lý Request):**

```typescript
app.use((req, res, next) => {
  console.log('Request đến:', req.path);
  next(); // Chuyển sang middleware tiếp theo
});
```

**Chức năng:** Xử lý request, sau đó chuyển tiếp

### **Swagger Middleware (Serve Static Files):**

```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

**Chức năng:** Serve một trang web (Swagger UI) tại route `/api-docs`

**Khác biệt:** Swagger middleware **serve một trang web**, không phải xử lý API request!

---

## 📊 Ví Dụ Cụ Thể

### **Khi Bạn Truy Cập:**

#### **1. `/api/products`**
```
Request → express.json() → cors() → helmet() → Route Handler
                                                      ↓
                                              Return products data
```

#### **2. `/api-docs`**
```
Request → express.json() → cors() → helmet() → Swagger Middleware
                                                      ↓
                                              Return Swagger UI HTML page
```

**Khác nhau:**
- `/api/products` → Trả về **JSON data**
- `/api-docs` → Trả về **HTML page** (Swagger UI)

---

## 🔧 Middleware Chain

### **Thứ Tự Middleware Trong app.ts:**

```typescript
// 1. Security middleware
app.use(helmet());

// 2. CORS middleware
app.use(cors());

// 3. Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// 4. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Static files middleware
app.use('/uploads', express.static('uploads'));

// 6. Swagger middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 7. API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
```

**Luồng xử lý:**
```
Request → Helmet → CORS → Logger → Body Parser → Static/Swagger/Routes → Response
```

---

## 💡 Tại Sao Gọi Là "Middleware"?

**"Middle"** = Giữa  
**"Ware"** = Phần mềm

**Middleware = Phần mềm ở giữa request và response**

```
Client Request → [Middleware] → Route Handler → Response
                ↑
            Ở giữa!
```

---

## 🎓 Tóm Tắt

### **Middleware Là:**
- ✅ **"Người trung gian"** xử lý request
- ✅ **Chạy trước** route handler
- ✅ **Có thể** modify request/response
- ✅ **Có thể** chặn request (như authentication)

### **Swagger Middleware:**
- ✅ **Serve một trang web** (Swagger UI)
- ✅ **Không xử lý** API request
- ✅ **Chỉ hiển thị** documentation
- ✅ **Tự động** load API spec

### **Ví Dụ Dễ Hiểu:**

**Middleware thường:**
```
Khách vào cửa hàng → Bảo vệ kiểm tra → Nhân viên hỏi → Bán hàng
```

**Swagger middleware:**
```
Khách vào cửa hàng → Nhân viên đưa catalog (Swagger UI) → Khách xem catalog
```

**Catalog = Swagger UI (trang web hiển thị API docs)**

---

## ✅ Kết Luận

**Middleware Swagger:**
- ✅ Là một middleware trong Express
- ✅ Serve trang web Swagger UI tại `/api-docs`
- ✅ Không phải server riêng
- ✅ Chạy cùng với backend
- ✅ Tự động có sẵn khi backend chạy

**Chỉ cần hiểu:** Swagger middleware = Serve một trang web để xem API documentation! 📚

