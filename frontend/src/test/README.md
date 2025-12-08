# Frontend Testing Guide

Hướng dẫn chạy tests cho OCHA POS Frontend.

## Cấu trúc Tests

Tests được đặt cùng thư mục với source code:
```
frontend/src/
├── components/
│   └── **/*.test.tsx
├── hooks/
│   └── **/*.test.tsx
├── utils/
│   └── **/*.test.ts
└── test/
    └── setup.ts        # Test setup
```

## Chạy Tests

### Chạy tất cả tests
```bash
npm test
```

### Chạy tests với watch mode
```bash
npm test -- --watch
```

### Chạy tests với UI
```bash
npm run test:ui
```

### Chạy tests với coverage
```bash
npm run test:coverage
```

## Viết Tests Mới

### Component Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Hook Test Example

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(0);
  });
});
```

## Testing Utilities

### formatPrice.test.ts
Tests cho các utility functions format giá tiền.

### useCart.test.tsx
Tests cho cart hook và context.

## Best Practices

1. **Test user interactions**: Test những gì user thấy và làm
2. **Mock external dependencies**: Mock API calls, localStorage
3. **Accessibility**: Test với screen readers và keyboard navigation
4. **Coverage**: Aim for > 70% coverage cho components quan trọng

