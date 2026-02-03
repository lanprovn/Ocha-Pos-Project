"use client";
import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/order.service';
import type { Order } from '../services/order.service';
import toast from 'react-hot-toast';

export const useHoldOrders = (orderCreator?: 'STAFF' | 'CUSTOMER') => {
  const [holdOrders, setHoldOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orders = await orderService.getHoldOrders(orderCreator);
      setHoldOrders(orders);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Không thể tải danh sách đơn đã lưu';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Fetch hold orders error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderCreator]);

  const holdOrder = useCallback(async (orderId: string, holdName?: string | null) => {
    try {
      const order = await orderService.holdOrder(orderId, { holdName });
      await fetchHoldOrders();
      return order;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Không thể lưu đơn hàng';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchHoldOrders]);

  const resumeHoldOrder = useCallback(async (orderId: string) => {
    try {
      const order = await orderService.resumeHoldOrder(orderId);
      await fetchHoldOrders();
      return order;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Không thể khôi phục đơn hàng';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchHoldOrders]);

  useEffect(() => {
    fetchHoldOrders();
  }, [fetchHoldOrders]);

  return {
    holdOrders,
    isLoading,
    error,
    refetch: fetchHoldOrders,
    holdOrder,
    resumeHoldOrder,
  };
};
