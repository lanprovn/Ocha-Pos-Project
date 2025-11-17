# 📝 Commit Message Guide

## Quy tắc viết Commit Message

### Format chuẩn:
```
<type>: <mô tả tiếng Việt>
```

**Lưu ý:** 
- **Type** viết bằng **tiếng Anh** (feat, fix, docs, etc.)
- **Mô tả** viết bằng **tiếng Việt**

### Types phổ biến:
- `feat`: Thêm tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật tài liệu
- `style`: Thay đổi giao diện/styling
- `refactor`: Refactor code
- `perf`: Cải thiện hiệu suất
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build tasks, dependencies

### Ví dụ đúng:

```bash
# Thêm tính năng
git commit -m "feat: Cập nhật tính năng"

# Sửa lỗi
git commit -m "fix: Sửa lỗi kết nối database"

# Cập nhật tài liệu
git commit -m "docs: Cập nhật tài liệu"

# Thay đổi giao diện
git commit -m "style: Cập nhật giao diện chuyên nghiệp"

# Cải thiện code
git commit -m "refactor: Tối ưu hóa code"
```

### Ví dụ không đúng:

```bash
# ❌ Type bằng tiếng Việt
git commit -m "tính năng: Cập nhật tính năng"

# ❌ Mô tả bằng tiếng Anh (nên dùng tiếng Việt)
git commit -m "feat: Update feature"

# ❌ Không có type
git commit -m "Cập nhật tính năng"

# ❌ Quá dài
git commit -m "feat: Cập nhật tính năng với nhiều thay đổi về UI và backend..."
```

### Best Practices:

1. **Ngắn gọn**: Mô tả ngắn gọn, rõ ràng
2. **Rõ ràng**: Mô tả chính xác những gì đã làm
3. **Format**: `<type>: <mô tả tiếng Việt>`
4. **Nhất quán**: Luôn dùng format này cho tất cả commits

### Ví dụ cho project này:

```bash
# UI updates
git commit -m "feat: Cập nhật giao diện chuyên nghiệp"
git commit -m "style: Loại bỏ animations và emoji"

# Backend
git commit -m "feat: Thêm file .env.example"
git commit -m "fix: Sửa lỗi cập nhật trạng thái đơn hàng"

# Documentation
git commit -m "docs: Cập nhật hướng dẫn setup"
git commit -m "docs: Thêm hướng dẫn push GitHub"
```

