"use client";
import React from 'react';
import type { StatusSection } from '../types';
import { OrderCard } from './OrderCard';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderStatusSectionProps {
  section: StatusSection;
  currentTime: Date;
  sectionRef?: React.RefObject<HTMLDivElement | null>;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export const OrderStatusSection: React.FC<OrderStatusSectionProps> = ({
  section,
  currentTime,
  sectionRef,
  onStatusUpdate,
}) => {
  if (section.orders.length === 0) return null;

  return (
    <motion.div
      layout
      ref={sectionRef}
      className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 p-6 sm:p-10 border border-slate-100 scroll-mt-24 mb-10 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-10 rounded-full ${section.key === 'preparing' ? 'bg-amber-500' :
              section.key === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
            }`} />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tighter">
            {section.title}
          </h2>
        </div>
        <span className="text-sm font-black text-slate-400 bg-slate-50 px-5 py-2 rounded-2xl border border-slate-100">
          {section.orders.length} ĐƠN HÀNG
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {section.orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <OrderCard
                order={order}
                currentTime={currentTime}
                onStatusUpdate={(newStatus) => onStatusUpdate?.(order.id, newStatus)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
