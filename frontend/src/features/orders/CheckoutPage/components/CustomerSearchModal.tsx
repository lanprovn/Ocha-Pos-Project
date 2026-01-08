import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import customerService from '@features/customers/services/customer.service';
import type { Customer } from '@/types/customer';

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  onCreateNew: () => void;
}

const membershipLevelLabels: Record<string, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch Kim',
};

const membershipLevelColors: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-800',
  SILVER: 'bg-gray-100 text-gray-800',
  GOLD: 'bg-yellow-100 text-yellow-800',
  PLATINUM: 'bg-purple-100 text-purple-800',
};

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  onCreateNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCustomers([]);
      return;
    }

    // Auto-focus search input when modal opens
    const input = document.getElementById('customer-search-input');
    if (input) {
      setTimeout(() => input.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setCustomers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Debounce search
    const timeout = setTimeout(async () => {
      try {
        const result = await customerService.quickSearch(searchQuery.trim(), 10);
        setCustomers(result.customers);
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomers([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchQuery, isOpen]);

  const handleSelectCustomer = (customer: Customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[80%] bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Tìm kiếm khách hàng</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="customer-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Tìm theo tên hoặc số điện thoại..."
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchQuery.length < 2 ? (
            <div className="text-center text-gray-500 py-8">
              Nhập ít nhất 2 ký tự để tìm kiếm
            </div>
          ) : customers.length === 0 && !isSearching ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Không tìm thấy khách hàng</p>
              <button
                onClick={onCreateNew}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Tạo khách hàng mới
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            membershipLevelColors[customer.membershipLevel] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {membershipLevelLabels[customer.membershipLevel] || customer.membershipLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{customer.phone}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span>
                          Điểm: <span className="font-semibold text-orange-600">{customer.loyaltyPoints.toLocaleString()}</span>
                        </span>
                        <span>
                          Đã chi: <span className="font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                              minimumFractionDigits: 0,
                            }).format(customer.totalSpent)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onCreateNew}
            className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Tạo khách hàng mới
          </button>
        </div>
      </div>
    </div>
  );
};

