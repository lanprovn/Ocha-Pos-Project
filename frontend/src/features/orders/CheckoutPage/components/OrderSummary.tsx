import React from 'react';
import { formatPrice } from '@/utils/formatPrice';
import type { CartItem } from '@/types/cart';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Tag, Calculator, Receipt } from 'lucide-react';

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  discountRate?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, totalPrice, discountRate = 0 }) => {
  const subtotal = totalPrice;
  const discountAmount = discountRate > 0 ? subtotal * (discountRate / 100) : 0;
  const priceAfterDiscount = subtotal - discountAmount;
  const vat = priceAfterDiscount * 0.1;
  const finalTotal = priceAfterDiscount + vat;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Giỏ hàng trống</h3>
        <p className="text-sm text-slate-400 mt-2 font-medium">Chọn món ngon từ menu để thanh toán</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-8 bg-white">
      <div className="flex-1 px-8 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{item.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge variant="outline" className="text-[9px] h-4 border-none bg-slate-100 text-slate-500 font-bold px-1.5 uppercase">
                      Số lượng: {item.quantity}
                    </Badge>
                  </div>
                </div>
              </div>
              <span className="font-black text-slate-900 text-sm tracking-tighter">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Light Calculation Pad */}
      <div className="mt-8 p-10 bg-slate-50 border-t border-slate-100 space-y-5 rounded-t-[48px]">
        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-3"><Calculator className="w-4 h-4" /> Tạm tính</span>
          <span className="text-slate-700">{formatPrice(subtotal)}</span>
        </div>

        {discountRate > 0 && (
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 p-3 rounded-2xl">
            <span className="flex items-center gap-3"><Tag className="w-4 h-4" /> Giảm giá ({discountRate}%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-3"><Receipt className="w-4 h-4" /> Thuế VAT (10%)</span>
          <span className="text-slate-700">{formatPrice(vat)}</span>
        </div>

        <div className="h-px bg-slate-200 my-2" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-1 leading-none">Tổng thanh toán</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{formatPrice(finalTotal)}</p>
          </div>
          <div className="w-16 h-16 bg-white shadow-xl shadow-slate-200 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-50">
            <span className="text-2xl font-black">₫</span>
          </div>
        </div>
      </div>
    </div>
  );
};
