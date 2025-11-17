import React from 'react';
import { formatCurrency } from '../utils/dashboardFormatters';
import type { DashboardStats } from '../types';

interface PaymentStatsProps {
  stats: DashboardStats | null;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ stats }) => {
  const paymentStats = stats?.paymentStats ?? {};
  const totalRevenue = stats?.overview.todayRevenue || 1;

  const paymentMethods = [
    { 
      key: 'cash', 
      label: 'Tiền mặt', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ), 
      color: 'bg-slate-700' 
    },
    { 
      key: 'card', 
      label: 'Thẻ ngân hàng', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ), 
      color: 'bg-slate-700' 
    },
    { 
      key: 'qr', 
      label: 'QR Code', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'bg-slate-700' 
    }
  ];

  if (Object.keys(paymentStats).length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Thanh Toán</h3>
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-sm text-gray-600">Chưa có dữ liệu thanh toán</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-300 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Thanh Toán</h3>
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const stats = paymentStats[method.key];
          if (!stats) return null;
          
          const percentage = ((stats.revenue / totalRevenue) * 100).toFixed(1);
          
          return (
            <div key={method.key} className="p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="text-gray-700">{method.icon}</div>
                  <span className="font-semibold text-gray-900">{method.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(stats.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mx-2 min-w-0 overflow-hidden">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${method.color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%`, maxWidth: '100%' }}
                    ></div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 w-24 text-right flex-shrink-0">
                  {stats.count} đơn ({percentage}%)
                </div>
              </div>
            </div>
          );
        }).filter(Boolean)}
      </div>
    </div>
  );
};

