"use client";
import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { orderService } from '@features/orders/services/order.service';
import type { Order } from '@features/orders/services/order.service';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess?: () => void;
}

const CANCEL_REASON_TYPES = [
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
  { value: 'CUSTOMER_REQUEST', label: 'Khách hàng yêu cầu' },
  { value: 'SYSTEM_ERROR', label: 'Lỗi hệ thống' },
  { value: 'OTHER', label: 'Khác' },
] as const;

const REFUND_METHODS = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'QR', label: 'Chuyển khoản' },
] as const;

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [reasonType, setReasonType] = useState<'OUT_OF_STOCK' | 'CUSTOMER_REQUEST' | 'SYSTEM_ERROR' | 'OTHER'>('CUSTOMER_REQUEST');
  const [refundAmount, setRefundAmount] = useState<number | null>(null);
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'QR' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && order) {
      // Auto-calculate refund if order is paid
      if (order.paymentStatus === 'SUCCESS') {
        setRefundAmount(parseFloat(order.totalAmount));
        setRefundMethod(order.paymentMethod as 'CASH' | 'QR' | null);
      } else {
        setRefundAmount(null);
        setRefundMethod(null);
      }
      setReason('');
      setReasonType('CUSTOMER_REQUEST');
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const needsRefund = order.paymentStatus === 'SUCCESS';
  const canCancel = order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order.id || !reason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    if (!canCancel) {
      toast.error('Không thể hủy đơn hàng này');
      return;
    }

    setIsLoading(true);
    try {
      await orderService.cancelOrder(order.id, {
        reason: reason.trim(),
        reasonType,
        refundAmount: refundAmount || null,
        refundMethod: refundMethod || null,
      });
      toast.success('Đã hủy đơn hàng');
      onSuccess?.();
      onClose();
      setReason('');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.message || 'Không thể hủy đơn hàng';
      toast.error(errorMessage);
      console.error('Cancel order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Hủy đơn hàng</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mã đơn:</span>
                <span className="font-semibold text-gray-800">{order.orderNumber}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Khách hàng:</span>
                  <span className="font-semibold text-gray-800">{order.customerName}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Tổng tiền:</span>
                <span className="text-lg font-bold text-orange-600">
                  {formatPrice(parseFloat(order.totalAmount))}
                </span>
              </div>
              {needsRefund && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Đơn hàng đã thanh toán - cần hoàn tiền</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reason Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại lý do <span className="text-red-500">*</span>
              </label>
              <select
                value={reasonType}
                onChange={(e) => setReasonType(e.target.value as typeof reasonType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={isLoading}
              >
                {CANCEL_REASON_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason Input */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy đơn <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hủy đơn hàng..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
                disabled={isLoading}
              />
            </div>

            {/* Refund Section */}
            {needsRefund && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800">Thông tin hoàn tiền</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền hoàn lại
                  </label>
                  <input
                    type="number"
                    value={refundAmount || ''}
                    onChange={(e) => setRefundAmount(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="0"
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Mặc định: {formatPrice(parseFloat(order.totalAmount))}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức hoàn tiền
                  </label>
                  <select
                    value={refundMethod || ''}
                    onChange={(e) => setRefundMethod(e.target.value as typeof refundMethod)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Chọn phương thức</option>
                    {REFUND_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {!canCancel && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">Không thể hủy đơn hàng ở trạng thái này</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isLoading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isLoading || !canCancel || !reason.trim()}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
