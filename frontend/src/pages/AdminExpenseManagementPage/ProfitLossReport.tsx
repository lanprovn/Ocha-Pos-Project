import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { ProfitLossReport as ProfitLossReportType } from '../../types/expense';

interface ProfitLossReportProps {
    report: ProfitLossReportType;
    onClose: () => void;
}

const ProfitLossReport: React.FC<ProfitLossReportProps> = ({ report, onClose }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75" onClick={onClose} />

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Báo Cáo Lãi Lỗ (P&L)</h3>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-500 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Period */}
                            <div className="text-sm text-slate-600">
                                Kỳ báo cáo: {formatDate(report.period.startDate)} - {formatDate(report.period.endDate)}
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-700 mb-2 font-medium">Doanh Thu</p>
                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(report.revenue)}</p>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-700 mb-2 font-medium">Chi Phí</p>
                                    <p className="text-2xl font-bold text-red-900">{formatCurrency(report.expenses)}</p>
                                </div>

                                <div className={`border rounded-lg p-4 ${report.profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className={`text-sm mb-2 font-medium ${report.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                        Lợi Nhuận
                                    </p>
                                    <p className={`text-2xl font-bold ${report.profit >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                        {formatCurrency(report.profit)}
                                    </p>
                                    <p className={`text-xs mt-1 ${report.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        Biên lợi nhuận: {report.profitMargin.toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            {/* Expense Breakdown by Category */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-3">Chi Phí Theo Danh Mục</h4>
                                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                    {report.expenseBreakdown.byCategory.map((item) => (
                                        <div key={item.categoryId} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-700">{item.categoryName}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-slate-900">{formatCurrency(item.totalAmount)}</span>
                                                <span className="text-xs text-slate-500 ml-2">({item.count} chi phí)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Expense Breakdown by Type */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-900 mb-3">Chi Phí Theo Loại</h4>
                                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                    {report.expenseBreakdown.byType.map((item) => (
                                        <div key={item.type} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-700">
                                                {item.type === 'FIXED' ? 'Cố định' : item.type === 'VARIABLE' ? 'Biến đổi' : 'Một lần'}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-slate-900">{formatCurrency(item.totalAmount)}</span>
                                                <span className="text-xs text-slate-500 ml-2">({item.count} chi phí)</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLossReport;



