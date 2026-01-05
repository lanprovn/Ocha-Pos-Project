import React from 'react';
import { StarIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import type { CustomerStatistics, MembershipLevel } from '@/types/customer';
import { formatPrice } from '@/utils/formatPrice';

interface CustomerStatisticsProps {
  statistics: CustomerStatistics;
  isLoading?: boolean;
  onCustomerClick?: (customerId: string) => void;
}

const membershipLevelColors: Record<MembershipLevel, string> = {
  BRONZE: 'bg-amber-100 text-amber-800 border-amber-300',
  SILVER: 'bg-gray-100 text-gray-800 border-gray-300',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  PLATINUM: 'bg-purple-100 text-purple-800 border-purple-300',
};

const membershipLevelLabels: Record<MembershipLevel, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
};

const CustomerStatistics: React.FC<CustomerStatisticsProps> = ({
  statistics,
  isLoading = false,
  onCustomerClick,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
      </div>
    );
  }

  const { overview, membershipDistribution, vipCustomers, frequentCustomers, topCustomersBySpending } = statistics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border-l-4 border-blue-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 mb-2 font-medium uppercase tracking-wide">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-blue-900">{overview.totalCustomers}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border-l-4 border-purple-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-700 mb-2 font-medium uppercase tracking-wide">Khách hàng VIP</p>
              <p className="text-2xl font-bold text-purple-900">{overview.vipCustomersCount}</p>
            </div>
            <StarIcon className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border-l-4 border-emerald-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-700 mb-2 font-medium uppercase tracking-wide">Khách hàng thường xuyên</p>
              <p className="text-2xl font-bold text-emerald-900">{overview.frequentCustomersCount}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-emerald-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border-l-4 border-amber-500 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-700 mb-2 font-medium uppercase tracking-wide">Chi tiêu trung bình</p>
              <p className="text-2xl font-bold text-amber-900">{formatPrice(overview.averageSpent)}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Membership Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ cấp độ thành viên</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(membershipDistribution).map(([level, count]) => (
            <div
              key={level}
              className={`border-2 rounded-lg p-4 text-center ${membershipLevelColors[level as MembershipLevel]}`}
            >
              <p className="text-sm font-medium mb-1">{membershipLevelLabels[level as MembershipLevel]}</p>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs mt-1 opacity-75">
                {overview.totalCustomers > 0
                  ? `${Math.round((count / overview.totalCustomers) * 100)}%`
                  : '0%'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Customers by Spending */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 khách hàng theo chi tiêu</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm tích lũy</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topCustomersBySpending.map((customer, index) => (
                <tr
                  key={customer.id}
                  className={onCustomerClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onCustomerClick?.(customer.id)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                        membershipLevelColors[customer.membershipLevel]
                      }`}
                    >
                      {membershipLevelLabels[customer.membershipLevel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.orderCount}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(customer.totalSpent)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.loyaltyPoints.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIP Customers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng VIP (GOLD & PLATINUM)</h3>
        {vipCustomers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có khách hàng VIP</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm tích lũy</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vipCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={onCustomerClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    onClick={() => onCustomerClick?.(customer.id)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          membershipLevelColors[customer.membershipLevel]
                        }`}
                      >
                        {membershipLevelLabels[customer.membershipLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{customer.loyaltyPoints.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Frequent Customers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Khách hàng thường xuyên</h3>
        {frequentCustomers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có khách hàng thường xuyên</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cấp độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng chi tiêu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lần cuối ghé thăm</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {frequentCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={onCustomerClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    onClick={() => onCustomerClick?.(customer.id)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                          membershipLevelColors[customer.membershipLevel]
                        }`}
                      >
                        {membershipLevelLabels[customer.membershipLevel]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{customer.orderCount}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {customer.lastVisitAt
                        ? new Date(customer.lastVisitAt).toLocaleDateString('vi-VN')
                        : 'Chưa có'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerStatistics;

