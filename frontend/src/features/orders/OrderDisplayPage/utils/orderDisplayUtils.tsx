// Order display utilities
import React from 'react';
import type { OrderTracking, GroupedOrders, StatusConfig, StatusSection } from '../types';

export const groupOrdersByStatus = (orders: OrderTracking[]): GroupedOrders => {
  const groups: GroupedOrders = {
    creating: [],
    pending_verification: [],
    paid: [],
    preparing: [],
    completed: [],
    hold: []
  };

  orders.forEach(order => {
    // Đảm bảo chỉ group các status hợp lệ
    if (order.status && order.status in groups) {
      groups[order.status as keyof GroupedOrders].push(order);
    } else {
      // Log warning nếu có status không hợp lệ (để debug)
      console.warn('Order with unknown status:', order.id, order.status);
      // Fallback: thêm vào 'creating' nếu status không hợp lệ
      groups.creating.push(order);
    }
  });

  return groups;
};

export const formatOrderTime = (timestamp: number, currentTime: Date): string => {
  const date = new Date(timestamp);
  const now = currentTime.getTime();
  const diff = now - timestamp;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Vừa xong';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes} phút trước`;
  } else {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export const getStatusConfig = (status: OrderTracking['status']): StatusConfig => {
  switch (status) {
    case 'creating':
      return {
        label: 'Đang tạo',
        bgColor: 'bg-sky-500',
        badgeColor: 'bg-sky-100 text-sky-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      };
    case 'pending_verification':
      return {
        label: 'Chờ duyệt',
        bgColor: 'bg-amber-500',
        badgeColor: 'bg-amber-100 text-amber-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    case 'paid':
      return {
        label: 'Đã thanh toán',
        bgColor: 'bg-blue-600',
        badgeColor: 'bg-blue-100 text-blue-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      };
    case 'preparing':
      return {
        label: 'Đang chuẩn bị',
        bgColor: 'bg-indigo-600',
        badgeColor: 'bg-indigo-100 text-indigo-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        bgColor: 'bg-emerald-600',
        badgeColor: 'bg-emerald-100 text-emerald-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      };
    case 'hold':
      return {
        label: 'Đã lưu',
        bgColor: 'bg-purple-600',
        badgeColor: 'bg-purple-100 text-purple-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        )
      };
    default:
      return {
        label: status,
        bgColor: 'bg-gray-600',
        badgeColor: 'bg-gray-100 text-gray-800',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      };
  }
};

export const getPaymentMethodText = (method?: 'cash' | 'qr'): string => {
  switch (method) {
    case 'cash': return 'Tiền mặt';
    case 'qr': return 'QR Code';
    default: return 'Chưa thanh toán';
  }
};

export const getStatusSections = (groupedOrders: GroupedOrders): StatusSection[] => {
  // Display sections: Creating, Pending Verification, Hold, Completed
  return [
    { key: 'creating', title: 'Đang Tạo', orders: groupedOrders.creating },
    { key: 'pending_verification', title: '⚡ Chờ Duyệt', orders: groupedOrders.pending_verification },
    { key: 'hold', title: '📌 Đã Lưu', orders: groupedOrders.hold },
    { key: 'completed', title: 'Hoàn Thành', orders: groupedOrders.completed }
  ];
};

