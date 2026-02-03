# 🎨 SHADCN/UI - Components Guide

> Modern, accessible, and customizable UI components for OCHA POS

---

## 📦 Đã cài đặt

✅ **Core Dependencies**:
- `class-variance-authority` - Variant management
- `clsx` - Class merging
- `tailwind-merge` - Tailwind class merging
- `@radix-ui/*` - Accessible primitives

✅ **Components có sẵn**:
- Button
- Card
- Input  
- Badge
- Dialog

---

## 🚀 Sử dụng

### 1. Button Component

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">🔥</Button>
```

### 2. Card Component

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Total Sales</CardTitle>
    <CardDescription>Today's revenue</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">₫2,450,000</div>
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

### 3. Input Component

```tsx
import { Input } from '@/components/ui/input';

<div className="space-y-2">
  <label>Email</label>
  <Input type="email" placeholder="admin@ocha.com" />
</div>

<div className="space-y-2">
  <label>Password</label>
  <Input type="password" placeholder="••••••••" />
</div>
```

### 4. Badge Component

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="destructive">Cancelled</Badge>
<Badge variant="outline">Draft</Badge>
```

### 5. Dialog Component

```tsx
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Order</DialogTitle>
      <DialogDescription>
        Fill in the details below
      </DialogDescription>
    </DialogHeader>
    
    {/* Form content */}
    <div className="space-y-4">
      <Input placeholder="Customer name" />
      <Input placeholder="Phone number" />
    </div>
    
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎨 Customization

### Thay đổi màu sắc

Tất cả components sử dụng CSS variables từ `index.css`:

```css
@theme {
  --color-primary: #ff5a3c;      /* Màu chính */
  --color-success: #10b981;      /* Màu success */
  --color-danger: #ef4444;       /* Màu danger */
  --color-warning: #f59e0b;      /* Màu warning */
}
```

### Thêm custom styling

Tất cả components đều chấp nhận `className` prop:

```tsx
<Button className="rounded-full">
  Rounded Button
</Button>

<Card className="border-2 border-[--color-primary]">
  Custom Card
</Card>
```

---

## 📚 Components Roadmap

### ✅ Có sẵn:
- Button
- Card
- Input
- Badge
- Dialog

### 🔜 Sắp thêm:
- Table (perfect cho order list)
- Dropdown Menu
- Select
- Tabs
- Toast/Alert
- Avatar
- Progress
- Accordion
- Checkbox
- Radio Group

---

## 🌟 Best Practices

### 1. Kết hợp với existing components

```tsx
// Thay vì dùng <button> thông thường
<button className="bg-blue-500 px-4 py-2">Click me</button>

// Dùng Button component
<Button variant="default">Click me</Button>
```

### 2. Consistent styling

```tsx
// ✅ Good - Dùng variants
<Button variant="destructive">Delete</Button>
<Badge variant="destructive">Error</Badge>

// ❌ Bad - Custom colors mỗi nơi
<button className="bg-red-500">Delete</button>
<span className="bg-red-400">Error</span>
```

### 3. Accessibility

Tất cả components đã built-in accessibility features:
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Focus management

---

## 🎯 Example: Order Form

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Dialog } from '@/components/ui';

function CreateOrderForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Customer name" />
        <Input placeholder="Phone number" />
        <Input placeholder="Table number" />
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button variant="success" className="flex-1">
            Create Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔗 Resources

- **Shadcn/UI Docs**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com

---

## 📍 Demo Page

Xem demo tất cả components tại:
```
/ui-showcase
```

Hoặc import:
```tsx
import UIShowcase from '@/pages/UIShowcase';
```

---

**Created by**: Con Đỉ Chó 🐕  
**Date**: 2026-02-03  
**Status**: Production Ready ✅
