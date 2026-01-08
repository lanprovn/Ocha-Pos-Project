// Types for OrderDisplayPage
import React from 'react';
import type { OrderTracking as DisplayOrderTracking } from '@/types/display';
export type OrderTracking = DisplayOrderTracking;

export interface GroupedOrders {
  creating: OrderTracking[];
  pending_verification: OrderTracking[];
  paid: OrderTracking[];
  preparing: OrderTracking[];
  completed: OrderTracking[];
  hold: OrderTracking[];
}

export interface StatusConfig {
  label: string;
  bgColor: string;
  badgeColor: string;
  icon: React.ReactNode;
}

export interface StatusSection {
  key: keyof GroupedOrders;
  title: string;
  orders: OrderTracking[];
}

