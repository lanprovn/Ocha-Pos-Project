# Hướng Dẫn Setup Cloudinary cho OCHA POS

## Tại sao dùng Cloudinary?

- ✅ **Miễn phí**: 25GB storage + 25GB bandwidth/tháng
- ✅ **CDN toàn cầu**: Hình ảnh tải nhanh từ mọi nơi
- ✅ **Auto optimize**: Tự động resize và optimize hình ảnh
- ✅ **Không mất file**: File lưu trên cloud, không mất khi restart server
- ✅ **Dễ scale**: Không lo về storage khi dự án lớn

## Bước 1: Tạo tài khoản Cloudinary

1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký tài khoản miễn phí (có thể dùng Google/GitHub)
3. Xác nhận email

## Bước 2: Lấy API Credentials

1. Đăng nhập vào Cloudinary Dashboard: https://cloudinary.com/console
2. Vào **Settings** → **Access Keys**
3. Copy 3 thông tin sau:
   - **Cloud name** (ví dụ: `dabc123`)
   - **API Key** (ví dụ: `123456789012345`)
   - **API Secret** (ví dụ: `abcdefghijklmnopqrstuvwxyz`)

## Bước 3: Thêm vào Environment Variables

### Local Development (.env)

Thêm vào file `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Railway Deployment

1. Vào Railway Dashboard → Project → Service (Backend)
2. Vào tab **Variables**
3. Thêm 3 biến môi trường:
   - `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_api_key`
   - `CLOUDINARY_API_SECRET` = `your_api_secret`

## Bước 4: Test Upload

1. Restart backend server
2. Vào admin panel → Thêm sản phẩm
3. Upload một hình ảnh
4. Kiểm tra log backend, bạn sẽ thấy: `☁️ Image uploaded to Cloudinary`
5. Hình ảnh sẽ có URL từ Cloudinary (ví dụ: `https://res.cloudinary.com/...`)

## Fallback Mechanism

- ✅ Nếu **KHÔNG** có Cloudinary credentials → Tự động dùng local storage
- ✅ Nếu Cloudinary upload **FAIL** → Tự động fallback về local storage
- ✅ Code đã được setup sẵn, chỉ cần thêm credentials là dùng được!

## Lưu Ý

- **Không commit** file `.env` vào Git (đã có trong .gitignore)
- **API Secret** là thông tin nhạy cảm, không chia sẻ công khai
- Free tier đủ cho dự án nhỏ/trung bình (25GB storage)
- Khi vượt quá free tier, sẽ có thông báo từ Cloudinary

## Troubleshooting

### Upload không hoạt động?
1. Kiểm tra credentials đã đúng chưa
2. Kiểm tra log backend để xem lỗi cụ thể
3. Nếu Cloudinary fail, sẽ tự động fallback về local storage

### Muốn tắt Cloudinary?
Chỉ cần xóa hoặc comment 3 biến môi trường Cloudinary, hệ thống sẽ tự động dùng local storage.

## Tài Liệu Tham Khảo

- Cloudinary Docs: https://cloudinary.com/documentation
- Node.js SDK: https://cloudinary.com/documentation/node_integration

