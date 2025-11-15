// Order display utilities
import type { OrderTracking, GroupedOrders, StatusConfig, StatusSection } from '../types';

export const groupOrdersByStatus = (orders: OrderTracking[]): GroupedOrders => {
  const groups: GroupedOrders = {
    creating: [],
    paid: [],
    preparing: [],
    completed: []
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
        bgColor: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        badgeColor: 'bg-yellow-100 text-yellow-800',
        icon: '📝'
      };
    case 'paid':
      return {
        label: 'Đã thanh toán',
        bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        badgeColor: 'bg-blue-100 text-blue-800',
        icon: '💳'
      };
    case 'preparing':
      return {
        label: 'Đang chuẩn bị',
        bgColor: 'bg-gradient-to-r from-purple-500 to-pink-600',
        badgeColor: 'bg-purple-100 text-purple-800',
        icon: '👨‍🍳'
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        bgColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
        badgeColor: 'bg-green-100 text-green-800',
        icon: '✅'
      };
    default:
      return {
        label: status,
        bgColor: 'bg-gradient-to-r from-gray-500 to-gray-600',
        badgeColor: 'bg-gray-100 text-gray-800',
        icon: '📦'
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
  return [
    { key: 'creating', title: '📝 Đang Tạo', orders: groupedOrders.creating },
    { key: 'paid', title: '💳 Đã Thanh Toán', orders: groupedOrders.paid },
    { key: 'preparing', title: '👨‍🍳 Đang Chuẩn Bị', orders: groupedOrders.preparing },
    { key: 'completed', title: '✅ Hoàn Thành', orders: groupedOrders.completed }
  ];
};

