/**
 * Type definitions - Re-export all types for easier imports
 */

// Common types
export type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderCreatorType,
  CustomerInfo,
  Timestamped,
} from './common';

// Cart types
export type {
  CartItem,
  CartContextType,
} from './cart';

// Display types
export type {
  DisplayData,
  DisplaySyncMessage,
  UseDisplaySyncReturn,
  OrderTracking,
  OrderTrackingMessage,
} from './display';

// Product types
export type {
  Size,
  Topping,
  Product,
  Restaurant,
  Category,
  DiscountItem,
  ProductContextType,
} from './product';

