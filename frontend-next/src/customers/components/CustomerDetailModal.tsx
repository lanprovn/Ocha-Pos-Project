"use client";
import React, { useEffect } from 'react';
import { XMarkIcon, PencilIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { CustomerDetail, MembershipLevel } from '@/types/customer';
import { formatPrice } from '@/utils/formatPrice';

interface CustomerDetailModalProps {
  customer: CustomerDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onAdjustPoints?: () => void;
}

const membershipLevelColors: Record<MembershipLevel, string> = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-gray-100 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
};

const membershipLevelLabels: Record<MembershipLevel, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
};

const transactionTypeLabels: Record<string, string> = {
  EARN: 'Tích điểm',
  REDEEM: 'Đổi điểm',
  EXPIRED: 'Hết hạn',
  ADJUSTMENT: 'Điều chỉnh',
};

const transactionTypeColors: Record<string, string> = {
  EARN: 'text-green-600 bg-green-50',
  REDEEM: 'text-red-600 bg-red-50',
  EXPIRED: 'text-gray-600 bg-gray-50',
  ADJUSTMENT: 'text-blue-600 bg-blue-50',
};

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ 
  customer, 
  isLoading, 
  onClose,
  onEdit,
  onAdjustPoints,
}) => {
  useEffect(() => {
    if (customer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full md:w-[90%] lg:w-[80%] rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-500">Chi tiết khách hàng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                    <p className="text-gray-900">{customer.phone}</p>
                  </div>
                  {customer.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                      <p className="text-gray-900">{customer.address}</p>
                    </div>
                  )}
                  {customer.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                      <p className="text-gray-900">
                        {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                  {customer.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Giới tính</label>
                      <p className="text-gray-900">{customer.gender}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cấp độ thành viên</label>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-1 ${
                        membershipLevelColors[customer.membershipLevel as MembershipLevel]
                      }`}
                    >
                      {membershipLevelLabels[customer.membershipLevel as MembershipLevel]}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Điểm tích lũy</label>
                    <p className="text-gray-900 font-semibold">{customer.loyaltyPoints.toLocaleString()} điểm</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tổng chi tiêu</label>
                    <p className="text-gray-900 font-semibold">{formatPrice(Number(customer.totalSpent))}</p>
                  </div>
                  {customer.lastVisitAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Lần cuối ghé thăm</label>
                      <p className="text-gray-900">
                        {new Date(customer.lastVisitAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </div>
                {customer.tags.length > 0 && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {customer.notes && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500 mb-2 block">Ghi chú</label>
                    <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">{customer.notes}</p>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử mua hàng ({customer.orders.length})</h3>
                {customer.orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có đơn hàng nào</p>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customer.orders.map((order) => (
                            <tr key={order.id}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{order.status}</td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {formatPrice(Number(order.totalAmount))}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Loyalty Transactions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lịch sử giao dịch điểm tích lũy ({customer.loyaltyTransactions.length})
                  </h3>
                  {customer.loyaltyTransactions.length > 0 && (
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Tổng tích: <span className="font-semibold text-green-600">
                          +{customer.loyaltyTransactions
                            .filter((t) => t.type === 'EARN')
                            .reduce((sum, t) => sum + t.points, 0)
                            .toLocaleString()}
                        </span>
                      </span>
                      <span>
                        Tổng đổi: <span className="font-semibold text-red-600">
                          -{customer.loyaltyTransactions
                            .filter((t) => t.type === 'REDEEM')
                            .reduce((sum, t) => sum + Math.abs(t.points), 0)
                            .toLocaleString()}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
                {customer.loyaltyTransactions.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <p className="text-gray-500">Chưa có giao dịch điểm nào</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày giờ</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Điểm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customer.loyaltyTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-500">
                                <div>
                                  {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                  })}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(transaction.createdAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    transactionTypeColors[transaction.type] || 'bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {transactionTypeLabels[transaction.type] || transaction.type}
                                </span>
                              </td>
                              <td
                                className={`px-4 py-3 text-sm font-bold text-right ${
                                  transaction.type === 'EARN' || transaction.type === 'ADJUSTMENT'
                                    ? transaction.points > 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {transaction.type === 'EARN' || (transaction.type === 'ADJUSTMENT' && transaction.points > 0)
                                  ? '+'
                                  : '-'}
                                {Math.abs(transaction.points).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {transaction.reason || (
                                  <span className="text-gray-400 italic">Không có lý do</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {transaction.orderId ? (
                                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                    {transaction.orderId.slice(0, 8)}...
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <PencilIcon className="w-5 h-5" />
                Chỉnh sửa
              </button>
            )}
            {onAdjustPoints && (
              <button
                onClick={onAdjustPoints}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <CurrencyDollarIcon className="w-5 h-5" />
                Điều chỉnh điểm
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailModal;

