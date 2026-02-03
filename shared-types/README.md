# @ocha-pos/shared-types

> Shared TypeScript types for OCHA POS System

## 📦 Installation

This package is part of the monorepo and should be used via npm workspaces:

```bash
# From root directory
npm install
```

## 🚀 Usage

### In Backend

```typescript
import { 
  Order, 
  OrderStatus, 
  CreateOrderInput,
  Customer,
  MembershipLevel 
} from '@ocha-pos/shared-types';

// Use types
const order: Order = {
  id: 'uuid',
  orderNumber: 'ORD-001',
  status: OrderStatus.PENDING,
  // ...
};
```

### In Frontend

```typescript
import type { 
  Product, 
  Category, 
  CartItem,
  DisplayData 
} from '@ocha-pos/shared-types';

// Use types
const product: Product = {
  id: 1,
  name: 'Cà phê sữa',
  price: 35000,
  // ...
};
```

## 📁 Structure

```
shared-types/
├── src/
│   ├── index.ts       # Main entry - re-exports all
│   ├── enums.ts       # All enums (OrderStatus, PaymentMethod...)
│   ├── common.ts      # Common interfaces (Timestamped, ApiResponse...)
│   ├── product.ts     # Product, Category, Size, Topping
│   ├── order.ts       # Order, OrderItem, CreateOrderInput...
│   ├── customer.ts    # Customer, LoyaltyTransaction, MembershipConfig
│   ├── user.ts        # User, AuthUser, LoginInput...
│   ├── stock.ts       # Stock, Ingredient, StockAlert...
│   └── socket.ts      # Socket.IO event types
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Build

```bash
# Build types
npm run build --workspace=shared-types

# Watch mode (development)
npm run dev --workspace=shared-types
```

## 📝 Guidelines

1. **Single Source of Truth**: All shared types should be defined here
2. **Enums over String Literals**: Use enums for status values to ensure consistency
3. **Backward Compatibility**: Avoid breaking changes when updating types
4. **Documentation**: Add JSDoc comments for complex types

## 📋 Available Types

### Enums
- `OrderStatus` - CREATING, PENDING, HOLD, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED
- `PaymentMethod` - CASH, QR
- `PaymentStatus` - PENDING, SUCCESS, FAILED
- `OrderCreator` - STAFF, CUSTOMER
- `UserRole` - ADMIN, STAFF, CUSTOMER
- `MembershipLevel` - BRONZE, SILVER, GOLD, PLATINUM
- `LoyaltyTransactionType` - EARN, REDEEM, EXPIRED, ADJUSTMENT
- `StockTransactionType` - SALE, PURCHASE, ADJUSTMENT, RETURN
- `StockAlertType` - LOW_STOCK, OUT_OF_STOCK, OVERSTOCK

### Interfaces
- `Product`, `Category`, `ProductSize`, `ProductTopping`
- `Order`, `OrderItem`, `CreateOrderInput`, `OrderFilters`
- `Customer`, `CustomerDetail`, `LoyaltyTransaction`
- `User`, `AuthUser`, `LoginInput`, `LoginResponse`
- `Stock`, `Ingredient`, `StockAlert`, `StockTransaction`
- `DisplayData`, `OrderTracking`, `ServerToClientEvents`, `ClientToServerEvents`

---

*Part of OCHA POS System*
