// Types for OrderDisplayPage
import type { OrderTracking as DisplayOrderTracking } from '../../types/display';
export type OrderTracking = DisplayOrderTracking;

export interface GroupedOrders {
  creating: OrderTracking[];
  paid: OrderTracking[];
  preparing: OrderTracking[];
  completed: OrderTracking[];
}

export interface StatusConfig {
  label: string;
  bgColor: string;
  badgeColor: string;
  icon: string;
}

export interface StatusSection {
  key: keyof GroupedOrders;
  title: string;
  orders: OrderTracking[];
}

