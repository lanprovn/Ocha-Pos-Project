import React, { useState, useMemo } from 'react';
import { useOrderDisplay } from './hooks/useOrderDisplay';
import { OrderDisplayHeader } from './components/OrderDisplayHeader';
import { OrderStatusSection } from './components/OrderStatusSection';
import OrderFilters from './components/OrderFilters';
import { EmptyState } from '../../components/common/ui/EmptyState';
import { getStatusSections } from './utils/orderDisplayUtils';
import type { OrderTracking } from '../../types/display';

const OrderDisplayPage: React.FC = () => {
  const { orders: allOrders, groupedOrders, currentTime, completedSectionRef } = useOrderDisplay();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(query) ||
          order.customerInfo?.name?.toLowerCase().includes(query) ||
          order.customerInfo?.phone?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.backendStatus === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.timestamp).toDateString();
        return orderDate === filterDate;
      });
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      filtered = filtered.filter((order) => {
        const method = order.paymentMethod?.toUpperCase();
        return method === paymentMethodFilter;
      });
    }

    return filtered;
  }, [allOrders, searchQuery, statusFilter, dateFilter, paymentMethodFilter]);

  // Re-group filtered orders
  const filteredGroupedOrders = useMemo(() => {
    const grouped: { [key: string]: OrderTracking[] } = {
      creating: [],
      paid: [],
      preparing: [],
      completed: [],
    };

    filteredOrders.forEach((order) => {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    });

    return grouped;
  }, [filteredOrders]);

  const statusSections = getStatusSections(filteredGroupedOrders);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 p-4 sm:p-6">
        <div className="max-w-[1920px] mx-auto space-y-4">
          <OrderDisplayHeader currentTime={currentTime} />
          <OrderFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            paymentMethodFilter={paymentMethodFilter}
            setPaymentMethodFilter={setPaymentMethodFilter}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scroll-smooth">
        <div className="max-w-[1920px] mx-auto">
          {filteredOrders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {statusSections.map((section) => (
                <OrderStatusSection
                  key={section.key}
                  section={section}
                  currentTime={currentTime}
                  sectionRef={section.key === 'completed' ? completedSectionRef : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smooth scrollbar */}
      <style>{`
        .scroll-smooth::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-smooth::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .scroll-smooth::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .scroll-smooth::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default OrderDisplayPage;

