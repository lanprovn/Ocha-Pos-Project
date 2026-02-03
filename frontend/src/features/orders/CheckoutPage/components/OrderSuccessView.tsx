import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '@features/orders/services/order.service';
import {
  CheckCircle2,
  ArrowRight,
  Plus,
  Home,
  Printer,
  Receipt,
  Calendar,
  User,
  CreditCard,
  MapPin,
  PartyPopper,
  ShoppingCart
} from 'lucide-react';
import type { OrderDetails, PaymentMethod } from '@features/orders/OrderSuccessPage/types';
import type { Order } from '@features/orders/services/order.service';
import toast from 'react-hot-toast';
import { formatPrice } from '@/utils/formatPrice';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OrderSuccessViewProps {
  orderId: string;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  table?: string;
  onNewOrder: () => void;
  onGoHome: () => void;
}

const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  orderId,
  orderNumber,
  paymentMethod,
  customerName,
  table,
  onNewOrder,
  onGoHome,
}) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetailsFull, setOrderDetailsFull] = useState<Order | null>(null);

  const transformOrderToDetails = (order: Order): OrderDetails => {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      timestamp: new Date(order.createdAt).getTime(),
      total: parseFloat(order.totalAmount),
      items: order.items.length,
      customerName: order.customerName || customerName || 'Khách hàng',
      products: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.subtotal),
        size: item.selectedSize || null,
        toppings: item.selectedToppings || [],
        note: item.note || null,
      })),
    };
  };

  useEffect(() => {
    const loadOrderFromAPI = async () => {
      try {
        const order = await orderService.getById(orderId);
        setOrderDetailsFull(order);
        const details = transformOrderToDetails(order);
        setOrderDetails(details);
        setIsLoading(false);
      } catch (error: any) {
        toast.error('Không thể tải thông tin đơn hàng.');
        setIsLoading(false);
      }
    };

    if (orderId) loadOrderFromAPI();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4" />
        <p className="font-bold uppercase tracking-widest text-xs text-slate-400">Đang xuất hóa đơn...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto no-scrollbar animate-in fade-in duration-700">

      {/* Confetti Animation Placeholder Effect */}
      <div className="relative w-full max-w-[800px] flex flex-col items-center">

        {/* Success Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-10 scale-in-95 animate-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-white stroke-[3px]" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mã đơn hàng: <span className="text-slate-900 border-b-2 border-primary/20">{orderNumber}</span></p>
          </div>
        </div>

        {/* Info Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">

          {/* Left: Summary Box */}
          <Card className="border-none shadow-xl shadow-slate-200 rounded-[32px] overflow-hidden bg-white group hover:translate-y-[-4px] transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">Chi tiết đơn hàng</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-50 group-hover:border-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><Calendar className="w-3 h-3" /> Thời gian</span>
                  <span className="text-sm font-bold text-slate-800">{new Date(orderDetailsFull?.createdAt || '').toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-50 group-hover:border-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><User className="w-3 h-3" /> Khách hàng</span>
                  <span className="text-sm font-bold text-slate-800">{orderDetailsFull?.customerName || 'Khách lẻ'}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-50 group-hover:border-slate-100 transition-colors">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><CreditCard className="w-3 h-3" /> Phương thức</span>
                  <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[10px] uppercase">
                    {paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản QR'}
                  </Badge>
                </div>
                {table && (
                  <div className="flex items-center justify-between py-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><MapPin className="w-3 h-3" /> Bàn số</span>
                    <span className="text-sm font-black text-rose-500">{table}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Total & Items Box */}
          <Card className="border-none shadow-xl shadow-slate-200 rounded-[32px] overflow-hidden bg-slate-900 group">
            <CardContent className="p-8 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-white uppercase tracking-tight text-sm">Sản phẩm đã mua</h3>
                </div>
                <div className="space-y-3 max-h-32 overflow-y-auto no-scrollbar scroll-smooth">
                  {orderDetailsFull?.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        <span className="font-bold text-white pr-2">{item.quantity}x</span>
                        {item.product.name}
                      </span>
                      <span className="font-bold text-slate-400">{formatPrice(parseFloat(item.subtotal))}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1 leading-none">Net Paid Amount</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(parseFloat(orderDetailsFull?.totalAmount || '0'))}</p>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Pad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Button
            size="lg"
            className="h-16 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-900 shadow-xl shadow-slate-200 font-bold uppercase tracking-widest text-xs gap-3"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" /> In hóa đơn
          </Button>

          <Button
            size="lg"
            className="h-16 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-900 shadow-xl shadow-slate-200 font-bold uppercase tracking-widest text-xs gap-3"
            onClick={() => {
              const url = `/orders/${orderId}`;
              window.open(url, '_blank');
            }}
          >
            <ArrowRight className="w-4 h-4" /> Chi tiết đơn
          </Button>

          <Button
            size="lg"
            className="h-16 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 font-bold uppercase tracking-widest text-xs gap-3 group"
            onClick={onNewOrder}
          >
            <Plus className="w-4 h-4 text-primary group-hover:scale-125 transition-transform" /> Đơn mới
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-16 rounded-2xl bg-transparent border-2 border-slate-200 hover:border-slate-800 text-slate-600 font-bold uppercase tracking-widest text-xs gap-3"
            onClick={onGoHome}
          >
            <Home className="w-4 h-4" /> Về Home
          </Button>
        </div>

        <p className="mt-10 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic animate-pulse">
          Trải nghiệm đẳng cấp cùng Ocha POS Luxury System
        </p>
      </div>

    </div>
  );
};

export default OrderSuccessView;
