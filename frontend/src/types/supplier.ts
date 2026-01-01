export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxCode?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  receivedAt?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
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
  receivedAt?: string;
  notes?: string;
}

export interface PurchaseOrderFilters {
  supplierId?: string;
  status?: PurchaseOrderStatus;
  startDate?: string;
  endDate?: string;
}



