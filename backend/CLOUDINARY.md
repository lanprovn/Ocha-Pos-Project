# ☁️ Hướng dẫn sử dụng Cloudinary

Cloudinary là dịch vụ lưu trữ và quản lý hình ảnh trên cloud. Hệ thống OCHA POS hỗ trợ tích hợp Cloudinary để lưu trữ hình ảnh sản phẩm, danh mục, và các hình ảnh khác.

## 📋 Mục lục

- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Sử dụng](#sử-dụng)
- [API Endpoints](#api-endpoints)
- [Kiểm tra kết nối](#kiểm-tra-kết-nối)

## 🚀 Cài đặt

### 1. Đăng ký tài khoản Cloudinary

1. Truy cập [https://cloudinary.com/](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng nhập, vào **Dashboard** > **Settings** > **Product Environment Credentials**
4. Lưu lại các thông tin sau:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Cấu hình trong file `.env`

Thêm các biến môi trường sau vào file `backend/.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Lưu ý:** Nếu không cấu hình Cloudinary, hệ thống sẽ tự động sử dụng local storage (lưu trong thư mục `backend/uploads/images`).

## ⚙️ Cấu hình

### Cấu trúc thư mục trên Cloudinary

Hệ thống tự động tổ chức hình ảnh vào các thư mục sau:

- `ocha-pos/products` - Hình ảnh sản phẩm
- `ocha-pos/categories` - Hình ảnh danh mục
- `ocha-pos/users` - Hình ảnh người dùng
- `ocha-pos/general` - Hình ảnh khác

### Transformations tự động

Khi upload hình ảnh lên Cloudinary, hệ thống tự động:
- Giới hạn kích thước tối đa: 800x800px
- Tự động tối ưu chất lượng (`quality: 'auto'`)
- Giữ nguyên tỷ lệ khung hình (`crop: 'limit'`)

## 📖 Sử dụng

### Upload hình ảnh qua API

**Endpoint:** `POST /api/upload/image`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
- `image`: File hình ảnh (JPEG, PNG, WebP, GIF)
- `folder` (query parameter, optional): `products` | `categories` | `users` | `general` (mặc định: `products`)

**Ví dụ với cURL:**
```bash
curl -X POST http://localhost:8080/api/upload/image?folder=products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

**Response:**
```json
{
  "message": "Upload thành công",
  "filename": "ocha-pos/products/products-1234567890-uuid",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ocha-pos/products/products-1234567890-uuid.jpg",
  "fullUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ocha-pos/products/products-1234567890-uuid.jpg",
  "size": 123456,
  "mimetype": "image/jpeg",
  "publicId": "ocha-pos/products/products-1234567890-uuid",
  "storageType": "cloudinary"
}
```

### Xóa hình ảnh

**Endpoint:** `DELETE /api/upload/image/:filename`

**Ví dụ:**
```bash
curl -X DELETE http://localhost:8080/api/upload/image/ocha-pos/products/products-1234567890-uuid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Lưu ý:** Bạn có thể truyền vào:
- Cloudinary URL đầy đủ
- Public ID (ví dụ: `ocha-pos/products/products-1234567890-uuid`)
- Tên file local (nếu sử dụng local storage)

## 🔌 API Endpoints

### 1. Kiểm tra trạng thái Cloudinary

**Endpoint:** `GET /api/upload/cloudinary/status`

**Response khi đã cấu hình:**
```json
{
  "configured": true,
  "connected": true,
  "cloudName": "your-cloud-name",
  "plan": "Free",
  "message": "Cloudinary đã được cấu hình và kết nối thành công"
}
```

**Response khi chưa cấu hình:**
```json
{
  "configured": false,
  "connected": false,
  "message": "Cloudinary chưa được cấu hình. Vui lòng thêm thông tin vào file .env"
}
```

### 2. Upload hình ảnh

**Endpoint:** `POST /api/upload/image`

Xem chi tiết ở phần [Sử dụng](#sử-dụng) ở trên.

### 3. Xóa hình ảnh

**Endpoint:** `DELETE /api/upload/image/:filename`

Xem chi tiết ở phần [Sử dụng](#sử-dụng) ở trên.

### 4. Danh sách hình ảnh (chỉ local storage)

**Endpoint:** `GET /api/upload/images`

**Lưu ý:** Endpoint này chỉ hoạt động với local storage. Để xem danh sách hình ảnh trên Cloudinary, sử dụng Cloudinary Dashboard.

## ✅ Kiểm tra kết nối

### Sử dụng script test

Chạy lệnh sau để kiểm tra kết nối Cloudinary:

```bash
npm run test:cloudinary
```

Script sẽ:
1. Kiểm tra các biến môi trường
2. Test kết nối với Cloudinary
3. Upload một hình ảnh test nhỏ
4. Xóa hình ảnh test sau khi hoàn thành

### Sử dụng API

Gọi endpoint kiểm tra trạng thái:

```bash
curl http://localhost:8080/api/upload/cloudinary/status
```

## 🔒 Bảo mật

- **Không bao giờ commit file `.env`** vào Git
- **Bảo vệ API Secret** - đây là thông tin nhạy cảm
- **Sử dụng HTTPS** - Cloudinary tự động sử dụng HTTPS cho tất cả các URL
- **Giới hạn quyền truy cập** - Chỉ ADMIN và STAFF mới có thể upload/xóa hình ảnh

## 🐛 Xử lý lỗi

### Lỗi kết nối Cloudinary

Nếu Cloudinary không kết nối được, hệ thống sẽ tự động fallback về local storage. Kiểm tra:

1. Các biến môi trường có đúng không
2. API Key và API Secret có hợp lệ không
3. Kết nối internet có ổn định không

### Lỗi upload

- **File quá lớn:** Giới hạn 5MB mỗi file
- **Định dạng không hỗ trợ:** Chỉ hỗ trợ JPEG, PNG, WebP, GIF
- **Quyền truy cập:** Cần đăng nhập với quyền ADMIN hoặc STAFF

## 📚 Tài liệu tham khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Image Transformations](https://cloudinary.com/documentation/image_transformations)

## 💡 Tips

1. **Tối ưu hình ảnh trước khi upload:** Giảm kích thước file sẽ giúp upload nhanh hơn
2. **Sử dụng folder phù hợp:** Giúp quản lý hình ảnh dễ dàng hơn trên Cloudinary Dashboard
3. **Kiểm tra storage type:** Response trả về `storageType` để biết hình ảnh được lưu ở đâu
4. **Monitor usage:** Cloudinary có giới hạn storage và bandwidth cho tài khoản miễn phí
