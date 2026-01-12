import React from 'react';
import type { StatusSection } from '../types';
import { OrderCard } from './OrderCard';

interface OrderStatusSectionProps {
  section: StatusSection;
  currentTime: Date;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  onStatusUpdate?: () => void;
}

export const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
  section,
  currentTime,
  sectionRef,
  onStatusUpdate,
}) => {
  if (section.orders.length === 0) return null;

  return (
    <div ref={sectionRef} className="bg-white rounded-md shadow-sm p-4 sm:p-6 border border-gray-300 scroll-mt-4">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2 sticky top-0 bg-white py-2 z-10">
        <span>{section.title}</span>
        <span className="text-sm sm:text-base font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-300">
          {section.orders.length}
        </span>
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
        {section.orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            currentTime={currentTime}
            onStatusUpdate={onStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
};

