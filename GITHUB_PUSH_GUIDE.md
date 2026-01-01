# 🚀 Hướng dẫn Push Project lên GitHub

## Bước 1: Kiểm tra trạng thái Git

```bash
git status
```

## Bước 2: Thêm các file mới và thay đổi

```bash
# Thêm tất cả các file đã thay đổi
git add .

# Hoặc thêm từng file cụ thể
git add README.md
git add LICENSE
git add backend/package.json
git add backend/prisma/schema.prisma
git add backend/src/services/reporting.service.ts
```

## Bước 3: Commit các thay đổi

```bash
git commit -m "docs: Add professional README.md and LICENSE

- Add comprehensive README with installation, usage, and API documentation
- Add MIT License file
- Update project documentation structure"
```

## Bước 4: Push lên GitHub

```bash
# Push lên branch main
git push origin main

# Hoặc nếu bạn đang ở branch khác
git push origin <your-branch-name>
```

## Bước 5: Kiểm tra trên GitHub

1. Truy cập: https://github.com/lanprovn/Ocha-Pos-Project
2. Kiểm tra README.md đã hiển thị đúng chưa
3. Kiểm tra LICENSE đã được thêm chưa

## Lưu ý quan trọng

⚠️ **KHÔNG commit file `.env`** - File này chứa thông tin nhạy cảm và đã được thêm vào `.gitignore`

⚠️ **Kiểm tra `.gitignore`** - Đảm bảo các file nhạy cảm đã được ignore:
- `.env`
- `node_modules/`
- `dist/`
- `build/`
- `*.log`

## Nếu gặp lỗi khi push

### Lỗi: "Updates were rejected"

```bash
# Pull các thay đổi mới nhất từ remote
git pull origin main

# Giải quyết conflicts (nếu có)
# Sau đó push lại
git push origin main
```

### Lỗi: "Permission denied"

```bash
# Kiểm tra authentication
# Sử dụng Personal Access Token thay vì password
# Hoặc cấu hình SSH key
```

## Tùy chọn: Tạo Release trên GitHub

1. Vào repository trên GitHub
2. Click "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `v1.0.0 - Initial Release`
5. Mô tả các tính năng chính
6. Publish release

---

**Chúc bạn thành công! 🎉**
