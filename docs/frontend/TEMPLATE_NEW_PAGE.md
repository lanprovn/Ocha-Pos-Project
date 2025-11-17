# 📄 Template Tạo Trang Mới

## ⚠️ Vấn Đề Thường Gặp

Khi tạo trang mới, thường gặp các vấn đề:
- Layout bị override bởi `global.css`
- Container bị giới hạn width
- Overflow bị chặn
- Styles không apply đúng

## ✅ Giải Pháp: Sử Dụng Components Chuẩn

### 1. Sử dụng `PageWrapper` + `PageContainer`

```tsx
import React from 'react';
import PageWrapper from '@components/layout/PageWrapper';
import PageContainer from '@components/layout/PageContainer';

const YourNewPage: React.FC = () => {
  return (
    <PageWrapper 
      background="gradient" 
      fullHeight 
      allowOverflow
    >
      <PageContainer maxWidth="90%" centered padding="lg">
        {/* Your content here */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1>Your Page Title</h1>
          {/* ... */}
        </div>
      </PageContainer>
    </PageWrapper>
  );
};

export default YourNewPage;
```

### 2. Các Options Có Sẵn

#### PageWrapper Props:
- `background`: 'default' | 'gradient' | 'white' | 'gray'
- `fullHeight`: boolean (min-h-screen)
- `allowOverflow`: boolean (cho phép scroll)
- `className`: string (custom classes)

#### PageContainer Props:
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | '90%' | '80%'
- `centered`: boolean (flex items-center justify-center)
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `className`: string (custom classes)

### 3. Ví Dụ Các Trường Hợp

#### Trang Login (rộng 90%):
```tsx
<PageWrapper background="gradient" fullHeight allowOverflow>
  <PageContainer maxWidth="90%" centered padding="md">
    {/* Login form */}
  </PageContainer>
</PageWrapper>
```

#### Trang Dashboard (container nhỏ):
```tsx
<PageWrapper background="gray" fullHeight>
  <PageContainer maxWidth="xl" padding="lg">
    {/* Dashboard content */}
  </PageContainer>
</PageWrapper>
```

#### Trang Full Width:
```tsx
<PageWrapper background="white" fullHeight>
  <PageContainer maxWidth="full" padding="none">
    {/* Full width content */}
  </PageContainer>
</PageWrapper>
```

## 🚫 Những Điều KHÔNG Nên Làm

1. ❌ **KHÔNG** dùng `max-w-md`, `max-w-lg` trực tiếp nếu muốn rộng
2. ❌ **KHÔNG** set `overflow: hidden` trong component
3. ❌ **KHÔNG** dùng inline style `maxWidth` trừ khi dùng `PageContainer`
4. ❌ **KHÔNG** tạo wrapper div với `min-h-screen` nếu đã dùng `PageWrapper`

## ✅ Checklist Khi Tạo Trang Mới

- [ ] Import `PageWrapper` và `PageContainer`
- [ ] Wrap content với `PageWrapper` (set `allowOverflow={true}` nếu cần scroll)
- [ ] Wrap content với `PageContainer` (chọn `maxWidth` phù hợp)
- [ ] Test trên mobile và desktop
- [ ] Kiểm tra overflow có hoạt động không
- [ ] Kiểm tra responsive

## 📝 Notes

- `PageWrapper` xử lý background và overflow
- `PageContainer` xử lý width và padding
- Luôn dùng cả 2 components để đảm bảo consistency
- Các components này đã được thiết kế để tránh conflict với `global.css`

