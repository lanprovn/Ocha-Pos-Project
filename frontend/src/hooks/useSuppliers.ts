import { useState, useEffect, useCallback } from 'react';
import { supplierService, purchaseOrderService } from '../services/supplier.service';
import type { Supplier, PurchaseOrder, CreateSupplierInput, UpdateSupplierInput, PurchaseOrderFilters } from '../types/supplier';
import toast from 'react-hot-toast';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async (isActive?: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await supplierService.getAll(isActive);
      setSuppliers(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách nhà cung cấp';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSupplier = useCallback(async (data: CreateSupplierInput): Promise<Supplier | null> => {
    try {
      const newSupplier = await supplierService.create(data);
      setSuppliers((prev) => [newSupplier, ...prev]);
      toast.success('Đã tạo nhà cung cấp thành công');
      return newSupplier;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo nhà cung cấp');
      return null;
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, data: UpdateSupplierInput): Promise<Supplier | null> => {
    try {
      const updated = await supplierService.update(id, data);
      setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Đã cập nhật nhà cung cấp thành công');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật nhà cung cấp');
      return null;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string): Promise<boolean> => {
    try {
      await supplierService.delete(id);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      toast.success('Đã xóa nhà cung cấp thành công');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa nhà cung cấp');
      return false;
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    isLoading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPurchaseOrders = useCallback(async (filters?: PurchaseOrderFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await purchaseOrderService.getAll(filters);
      setPurchaseOrders(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách đơn nhập hàng';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPurchaseOrder = useCallback(async (data: any): Promise<PurchaseOrder | null> => {
    try {
      const newOrder = await purchaseOrderService.create(data);
      setPurchaseOrders((prev) => [newOrder, ...prev]);
      toast.success('Đã tạo đơn nhập hàng thành công');
      return newOrder;
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạo đơn nhập hàng');
      return null;
    }
  }, []);

  const updatePurchaseOrder = useCallback(async (id: string, data: any): Promise<PurchaseOrder | null> => {
    try {
      const updated = await purchaseOrderService.update(id, data);
      setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? updated : po)));
      toast.success('Đã cập nhật đơn nhập hàng thành công');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật đơn nhập hàng');
      return null;
    }
  }, []);

  const receivePurchaseOrder = useCallback(async (id: string, data?: any): Promise<PurchaseOrder | null> => {
    try {
      const received = await purchaseOrderService.receive(id, data);
      setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? received : po)));
      toast.success('Đã nhận hàng thành công');
      return received;
    } catch (err: any) {
      toast.error(err.message || 'Không thể nhận hàng');
      return null;
    }
  }, []);

  const markAsPaid = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
    try {
      const updated = await purchaseOrderService.markAsPaid(id);
      setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? updated : po)));
      toast.success('Đã đánh dấu đã thanh toán');
      return updated;
    } catch (err: any) {
      toast.error(err.message || 'Không thể đánh dấu đã thanh toán');
      return null;
    }
  }, []);

  const cancelPurchaseOrder = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
    try {
      const cancelled = await purchaseOrderService.cancel(id);
      setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? cancelled : po)));
      toast.success('Đã hủy đơn nhập hàng');
      return cancelled;
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy đơn nhập hàng');
      return null;
    }
  }, []);

  useEffect(() => {
    loadPurchaseOrders();
  }, [loadPurchaseOrders]);

  return {
    purchaseOrders,
    isLoading,
    error,
    loadPurchaseOrders,
    createPurchaseOrder,
    updatePurchaseOrder,
    receivePurchaseOrder,
    markAsPaid,
    cancelPurchaseOrder,
  };
};



