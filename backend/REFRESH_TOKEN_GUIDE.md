# 🔐 Refresh Token Implementation Guide

## Tổng Quan

Hệ thống đã được implement **Refresh Token mechanism** để tăng cường bảo mật và cải thiện trải nghiệm người dùng.

---

## 🎯 Lợi Ích

1. **Bảo mật cao hơn**: Access token có thời gian sống ngắn (7 ngày), refresh token dài hơn (30 ngày)
2. **Tự động refresh**: Frontend có thể tự động refresh token khi access token hết hạn
3. **Giảm rủi ro**: Nếu access token bị lộ, thiệt hại được giới hạn trong thời gian ngắn

---

## 📋 Cấu Hình

### Environment Variables

Thêm vào `.env`:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d                    # Access token expiry (default: 7 days)
JWT_REFRESH_SECRET=optional-separate-secret  # Optional: separate secret for refresh token
JWT_REFRESH_EXPIRES_IN=30d           # Refresh token expiry (default: 30 days)
```

**Lưu ý:**
- `JWT_REFRESH_SECRET` là optional. Nếu không có, sẽ dùng `JWT_SECRET`
- Khuyến nghị: Sử dụng secret riêng cho refresh token để tăng bảo mật

---

## 🔄 Flow Hoạt Động

### 1. Login Flow

```typescript
// Request
POST /api/auth/login
{
  "email": "staff@ocha.com",
  "password": "staff123"
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "staff@ocha.com",
      "name": "Staff Name",
      "role": "STAFF"
    }
  },
  "message": "Đăng nhập thành công."
}
```

### 2. Refresh Token Flow

Khi access token hết hạn (401 Unauthorized), frontend sẽ gọi refresh endpoint:

```typescript
// Request
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // New access token
  },
  "message": "Token đã được làm mới thành công."
}
```

### 3. Sử Dụng Access Token

```typescript
// Tất cả các API endpoints khác sử dụng access token
GET /api/products
Headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 💻 Frontend Implementation

### 1. Lưu Trữ Tokens

```typescript
// Sau khi login thành công
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
```

### 2. Axios Interceptor để Auto Refresh

```typescript
import axios from 'axios';

// Request interceptor - Thêm access token vào mọi request
axios.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Auto refresh khi token hết hạn
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Không có refresh token → redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Gọi refresh endpoint
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        
        // Lưu access token mới
        localStorage.setItem('accessToken', accessToken);

        // Retry original request với token mới
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn → redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 3. React Hook Example

```typescript
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

export function useAutoRefresh() {
  const { refreshToken } = useAuth();

  useEffect(() => {
    // Refresh token trước khi hết hạn (ví dụ: mỗi 6 ngày)
    const interval = setInterval(async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    }, 6 * 24 * 60 * 60 * 1000); // 6 days

    return () => clearInterval(interval);
  }, [refreshToken]);
}
```

---

## 🔒 Security Best Practices

### 1. Token Storage

- ✅ **LocalStorage**: OK cho web app (không phải mobile)
- ⚠️ **HttpOnly Cookies**: Tốt hơn cho production (chống XSS)
- ❌ **SessionStorage**: Không nên dùng (mất khi đóng tab)

### 2. Token Rotation (Optional)

Hiện tại refresh token không được rotate. Có thể implement:

```typescript
// Trong refreshToken service
return {
  accessToken: newAccessToken,
  refreshToken: newRefreshToken, // Rotate refresh token
};
```

### 3. Token Revocation (Future)

Có thể thêm blacklist cho refresh tokens đã bị revoke:

```typescript
// Thêm vào database
model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## 🧪 Testing

### Test Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@ocha.com",
    "password": "staff123"
  }'
```

### Test Refresh Token

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📝 Notes

1. **Access Token**: Dùng cho mọi API request, expires sau 7 ngày (default)
2. **Refresh Token**: Chỉ dùng để refresh access token, expires sau 30 ngày (default)
3. **Token Type**: Mỗi token có field `type: 'access' | 'refresh'` để phân biệt
4. **Error Handling**: Tất cả errors đều trả về format chuẩn với `AppError`

---

## 🚀 Migration từ Old System

Nếu đang dùng hệ thống cũ chỉ có access token:

1. Update frontend để lưu cả `accessToken` và `refreshToken`
2. Thêm axios interceptor để auto refresh
3. Update login response handling để nhận cả 2 tokens
4. Test kỹ flow refresh token

---

**Cập nhật lần cuối**: 2024-11-15

