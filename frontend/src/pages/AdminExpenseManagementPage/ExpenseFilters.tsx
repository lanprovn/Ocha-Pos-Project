import React from 'react';
import type { ExpenseCategory, ExpenseType, ExpenseFilters as ExpenseFiltersType } from '../../types/expense';

interface ExpenseFiltersProps {
    categories: ExpenseCategory[];
    filters: ExpenseFiltersType;
    onFiltersChange: (filters: ExpenseFiltersType) => void;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ categories, filters, onFiltersChange }) => {
    const handleChange = (key: keyof ExpenseFiltersType, value: string | undefined) => {
        onFiltersChange({
            ...filters,
            [key]: value || undefined,
        });
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                    <select
                        value={filters.categoryId || ''}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
                    <select
                        value={filters.type || ''}
                        onChange={(e) => handleChange('type', e.target.value as ExpenseType)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Tất cả</option>
                        <option value="FIXED">Cố định</option>
                        <option value="VARIABLE">Biến đổi</option>
                        <option value="ONE_TIME">Một lần</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default ExpenseFilters;



