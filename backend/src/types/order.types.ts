/**
 * Re-export order types from shared-types package
 * This ensures type consistency between Frontend and Backend
 */
export type {
  CreateOrderItemInput,
  CreateOrderInput,
  OrderFilters,
  UpdateOrderStatusInput,
  UpdateOrderInput,
  OrderWithItems,
  Order,
  OrderItem,
} from '@ocha-pos/shared-types';

