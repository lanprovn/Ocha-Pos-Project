"use client";
import React from 'react';
import { formatPrice } from '@/utils/formatPrice';
import { Check, Loader2, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CompleteOrderButtonProps {
  totalPrice: number;
  itemsCount: number;
  isProcessing: boolean;
  isFormValid: boolean;
  discountRate?: number;
  onComplete: () => void;
}

export const CompleteOrderButton: React.FC<CompleteOrderButtonProps> = ({
  totalPrice,
  itemsCount,
  isProcessing,
  isFormValid,
  discountRate = 0,
  onComplete
}) => {
  const subtotal = totalPrice;
  const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
  const priceAfterDiscount = subtotal - discountAmount;
  const vat = priceAfterDiscount * 0.1;
  const finalTotal = priceAfterDiscount + vat;

  const isDisabled = !isFormValid || itemsCount === 0 || isProcessing;

  return (
    <div className="w-full">
      <Button
        onClick={onComplete}
        disabled={isDisabled}
        className={cn(
          "w-full h-20 rounded-[28px] text-white transition-all duration-500 flex flex-col items-center justify-center gap-1 shadow-2xl relative overflow-hidden group active:scale-[0.97]",
          isDisabled
            ? "bg-slate-200 text-slate-400 border-none cursor-not-allowed shadow-none"
            : "bg-slate-900 hover:bg-black shadow-slate-200"
        )}
      >
        {/* Animated Background Pulse */}
        {!isDisabled && !isProcessing && (
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
        )}

        {isProcessing ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-lg font-black uppercase tracking-widest">Đang kết nối...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:scale-105 duration-300">
              <Check className={cn("w-6 h-6", !isDisabled && "text-primary")} />
              <span className="text-xl font-black uppercase tracking-[0.15em]">Xác nhận thanh toán</span>
              <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em] relative z-10",
              isDisabled ? "text-slate-400" : "text-slate-400"
            )}>
              Total Payable: {formatPrice(finalTotal)}
            </p>
          </>
        )}

        {/* Shine effect for active button */}
        {!isDisabled && (
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/10 opacity-40 group-hover:animate-shine" />
        )}
      </Button>

      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .group-hover\\:animate-shine:hover {
          animation: shine 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};
