import React from 'react';
import type { PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../types';
import { Banknote, QrCode, CreditCard, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  isCustomerDisplay?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  isCustomerDisplay = false
}) => {
  const methods: Array<{ key: PaymentMethod; icon: React.ReactNode; label: string; description: string; tag?: string }> = [
    {
      key: 'qr',
      icon: <QrCode className="w-8 h-8" />,
      label: 'QR Code',
      description: 'Chuyển khoản / Ví điện tử',
      tag: 'Khuyên dùng'
    },
    {
      key: 'cash',
      icon: <Banknote className="w-8 h-8" />,
      label: 'Tiền mặt',
      description: 'Thanh toán tại quầy',
    },
  ];

  // Sắp xếp thứ tự ưu tiên: Khách hàng thì QR trước, Staff thì Cash trước
  const sortedMethods = isCustomerDisplay ? [...methods] : [...methods].reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">Thanh toán</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chọn phương thức phù hợp</p>
        </div>
        <CreditCard className="w-6 h-6 text-slate-200" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedMethods.map((method) => (
          <button
            key={method.key}
            onClick={() => onPaymentMethodChange(method.key)}
            className={cn(
              "relative group p-6 rounded-3xl border-2 transition-all duration-300 text-left overflow-hidden",
              paymentMethod === method.key
                ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200"
                : "border-slate-100 bg-slate-50/50 hover:border-slate-300 text-slate-600"
            )}
          >
            {/* Active Indicator Splash */}
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 transition-transform duration-500",
              paymentMethod === method.key ? "scale-100" : "scale-0"
            )} />

            <div className="relative z-10">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                paymentMethod === method.key ? "bg-white/10 text-white" : "bg-white text-slate-400 border border-slate-100 shadow-sm"
              )}>
                {method.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm uppercase tracking-tight">{PAYMENT_METHODS[method.key]}</span>
                  {method.tag && (
                    <Badge variant="outline" className={cn(
                      "text-[8px] h-4 font-black uppercase tracking-widest px-1.5 border-none",
                      paymentMethod === method.key ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {method.tag}
                    </Badge>
                  )}
                  {paymentMethod === method.key && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                </div>
                <p className={cn("text-[10px] font-medium transition-colors", paymentMethod === method.key ? "text-slate-400" : "text-slate-400")}>
                  {method.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {paymentMethod === 'qr' && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-xs text-emerald-700 font-bold flex items-center gap-2">
            <Info className="w-4 h-4" />
            Vui lòng chuẩn bị ứng dụng Ngân hàng hoặc Ví điện tử để quét mã QR ở bước tiếp theo.
          </p>
        </div>
      )}
    </div>
  );
};
