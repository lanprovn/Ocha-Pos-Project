import React from 'react';
import { useOrderDisplay } from './hooks/useOrderDisplay';
import { OrderDisplayHeader } from './components/OrderDisplayHeader';
import { OrderStatusSection } from './components/OrderStatusSection';
import { EmptyState } from '../../components/common/ui/EmptyState';
import { getStatusSections } from './utils/orderDisplayUtils';

const OrderDisplayPage: React.FC = () => {
  const { orders, groupedOrders, currentTime, completedSectionRef } = useOrderDisplay();
  const statusSections = getStatusSections(groupedOrders);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 p-4 sm:p-6">
        <div className="max-w-[1920px] mx-auto">
          <OrderDisplayHeader currentTime={currentTime} />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scroll-smooth">
        <div className="max-w-[1920px] mx-auto">
          {orders.length === 0 ? (
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

