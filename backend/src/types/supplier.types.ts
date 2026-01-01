/**
 * Supplier and Purchase Order related types
 */

import { Timestamped } from './common.types';

// ===== Enums =====
export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// ===== Supplier Types =====
export interface Supplier extends Timestamped {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export interface CreateSupplierInput {
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  notes?: string;
  isActive?: boolean;
}

// ===== Purchase Order Types =====
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId?: string | null;
  ingredientId?: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string | null;
  createdAt: Date | string;
}

export interface PurchaseOrder extends Timestamped {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  receivedAt?: Date | string | null;
  paidAt?: Date | string | null;
  notes?: string | null;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderItemInput {
  productId?: string;
  ingredientId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  items: CreatePurchaseOrderItemInput[];
  notes?: string;
}

export interface UpdatePurchaseOrderInput {
  supplierId?: string;
  items?: CreatePurchaseOrderItemInput[];
  notes?: string;
  status?: PurchaseOrderStatus;
}

export interface ReceivePurchaseOrderInput {
  receivedAt?: Date;
  notes?: string;
}



