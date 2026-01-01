import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CalendarIcon, CreditCardIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { customerService, type Customer } from '../../services/customer.service';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';

interface CustomerDetailModalProps {
  isOpen: boolean;
  customerId: string | null;
  onClose: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  customerId,
  onClose,
}) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId) {
      loadCustomerDetails();
    } else {
      setCustomer(null);
    }
  }, [isOpen, customerId]);

  const loadCustomerDetails = async () => {
    if (!customerId) return;

    try {
      setIsLoading(true);
      const data = await customerService.getById(customerId);
      setCustomer(data);
    } catch (error: any) {
      console.error('Error loading customer details:', error);
      toast.error(error?.message || 'Không thể tải thông tin khách hàng');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getMembershipBadgeColor = (level: string) => {
    switch (level) {
      case 'BRONZE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'SILVER':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[70vw] mx-auto transform animate-scale-in max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
            <h3 className="text-xl font-bold text-slate-900">
              Chi Tiết Khách Hàng
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
              </div>
            ) : customer ? (
              <div className="space-y-6">
                {/* Customer Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <UserCircleIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{customer.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-slate-600">
                          <PhoneIcon className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <EnvelopeIcon className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center space-x-2 text-slate-600 md:col-span-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span>{customer.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMembershipBadgeColor(customer.membershipLevel)}`}>
                        {customer.membershipLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-slate-600 mb-2">
                      <CreditCardIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Điểm Tích Lũy</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{customer.loyaltyPoints.toLocaleString('vi-VN')}</p>
                    <p className="text-xs text-slate-500 mt-1">điểm</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-slate-600 mb-2">
                      <ShoppingBagIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Tổng Chi Tiêu</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{formatPrice(Number(customer.totalSpent))}</p>
                    <p className="text-xs text-slate-500 mt-1">VND</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-slate-600 mb-2">
                      <ShoppingBagIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Tổng Đơn Hàng</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{customer._count?.orders || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">đơn</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-slate-600 mb-2">
                      <CalendarIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Lần Cuối</span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {customer.lastVisitAt
                        ? new Date(customer.lastVisitAt).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">lần ghé thăm</p>
                  </div>
                </div>

                {/* Additional Info */}
                {(customer.dateOfBirth || customer.gender || customer.notes || customer.tags.length > 0) && (
                  <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h5 className="text-sm font-semibold text-slate-700 mb-4">Thông Tin Bổ Sung</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customer.dateOfBirth && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Ngày Sinh</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      )}
                      {customer.gender && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Giới Tính</p>
                          <p className="text-sm font-medium text-slate-900">{customer.gender}</p>
                        </div>
                      )}
                      {customer.notes && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-slate-500 mb-1">Ghi Chú</p>
                          <p className="text-sm text-slate-900">{customer.notes}</p>
                        </div>
                      )}
                      {customer.tags.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-slate-500 mb-2">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {customer.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                {customer.orders && customer.orders.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h5 className="text-sm font-semibold text-slate-700 mb-4">Đơn Hàng Gần Đây</h5>
                    <div className="space-y-3">
                      {customer.orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">{order.orderNumber}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')} - {order.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{formatPrice(Number(order.totalAmount))}</p>
                            <p className={`text-xs ${
                              order.paymentStatus === 'SUCCESS' ? 'text-emerald-600' : 'text-slate-500'
                            }`}>
                              {order.paymentStatus}
                            </p>
                          </div>
                        </div>
                      ))}
                      {customer._count && customer._count.orders > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {customer._count.orders - 5} đơn hàng khác...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Loyalty Transactions */}
                {customer.loyalty_transactions && customer.loyalty_transactions.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-lg p-5">
                    <h5 className="text-sm font-semibold text-slate-700 mb-4">Lịch Sử Tích Điểm</h5>
                    <div className="space-y-2">
                      {customer.loyalty_transactions.slice(0, 10).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {transaction.type === 'EARN' ? 'Tích điểm' : transaction.type === 'REDEEM' ? 'Đổi điểm' : transaction.type}
                            </p>
                            {transaction.reason && (
                              <p className="text-xs text-slate-500">{transaction.reason}</p>
                            )}
                            <p className="text-xs text-slate-400">
                              {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${
                              transaction.type === 'EARN' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'EARN' ? '+' : '-'}{transaction.points.toLocaleString('vi-VN')} điểm
                            </p>
                          </div>
                        </div>
                      ))}
                      {customer._count && customer._count.loyalty_transactions > 10 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {customer._count.loyalty_transactions - 10} giao dịch khác...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>Không tìm thấy thông tin khách hàng</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-semibold shadow-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerDetailModal;





