# Cloudinary Setup Guide

## Tổng quan

Project này hỗ trợ upload hình ảnh lên Cloudinary để lưu trữ persistent. Nếu không cấu hình Cloudinary, hệ thống sẽ tự động fallback về local storage.

## Cách hoạt động

1. **Nếu có Cloudinary config**: Upload lên Cloudinary → Lưu URL vào database
2. **Nếu không có Cloudinary config**: Upload vào local storage → Lưu path vào database

## Cấu hình Cloudinary

### Bước 1: Tạo tài khoản Cloudinary

1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí (Free tier có 25GB storage, 25GB bandwidth/tháng)
3. Vào Dashboard → Settings → Upload

### Bước 2: Lấy thông tin API

Từ Cloudinary Dashboard, bạn sẽ có:
- **Cloud Name**: Tên cloud của bạn
- **API Key**: Key để authenticate
- **API Secret**: Secret để authenticate

### Bước 3: Thêm vào Environment Variables

**Local Development (.env):**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Railway Production:**
1. Vào Railway Dashboard
2. Chọn Backend Service
3. Vào tab "Variables"
4. Thêm 3 biến:
   - `CLOUDINARY_CLOUD_NAME` = your-cloud-name
   - `CLOUDINARY_API_KEY` = your-api-key
   - `CLOUDINARY_API_SECRET` = your-api-secret

## Lợi ích của Cloudinary

✅ **Persistent Storage**: Hình ảnh không bị mất khi deploy/redeploy  
✅ **CDN tự động**: Hình ảnh được serve từ CDN gần nhất  
✅ **Image Optimization**: Tự động optimize hình ảnh  
✅ **Transformations**: Có thể resize, crop hình ảnh trên fly  
✅ **Free Tier**: 25GB storage + 25GB bandwidth/tháng (đủ cho hầu hết projects)

## API Response Format

### Upload thành công (Cloudinary):
```json
{
  "message": "Upload thành công",
  "filename": "ocha-pos/products/product-1234567890-uuid",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ocha-pos/products/product-1234567890-uuid.jpg",
  "fullUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ocha-pos/products/product-1234567890-uuid.jpg",
  "size": 123456,
  "mimetype": "image/jpeg",
  "storage": "cloudinary"
}
```

### Upload thành công (Local):
```json
{
  "message": "Upload thành công",
  "filename": "1234567890-uuid.jpg",
  "url": "/uploads/images/1234567890-uuid.jpg",
  "fullUrl": "https://your-backend-url.com/uploads/images/1234567890-uuid.jpg",
  "size": 123456,
  "mimetype": "image/jpeg",
  "storage": "local"
}
```

## Xóa hình ảnh

API xóa hình ảnh tự động detect loại storage:
- Nếu URL là Cloudinary URL → Xóa từ Cloudinary
- Nếu là filename → Xóa từ local storage

## Lưu ý

⚠️ **Local Storage trên Railway**: 
- Files sẽ bị mất khi container restart/redeploy
- Chỉ dùng cho development hoặc testing
- **Nên dùng Cloudinary cho production**

⚠️ **Database**: 
- Lưu `fullUrl` vào database (field `image` của Product/Category)
- URL sẽ tự động hoạt động với cả Cloudinary và local storage

