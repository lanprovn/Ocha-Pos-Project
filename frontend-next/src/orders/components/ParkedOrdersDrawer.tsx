"use client";
import React, { useEffect, useState } from 'react';
import { useCart } from '@features/orders/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Trash2, ShoppingBag, ReceiptText, X } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';

interface ParkedOrdersDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ParkedOrdersDrawer: React.FC<ParkedOrdersDrawerProps> = ({ isOpen, onClose }) => {
    const { parkedOrders, unparkOrder, deleteParkedOrder } = useCart();
    const [mounted, setMounted] = useState(false);

    // Xử lý hiệu ứng mounted để animation mượt
    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setMounted(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted && !isOpen) return null;

    return (
        <div className={cn("fixed inset-0 z-[100] transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer Container */}
            <div className={cn(
                "absolute top-0 right-0 h-full w-full max-w-[500px] bg-white shadow-2xl transition-transform duration-500 ease-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mb-1">Danh sách chờ</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Quản lý đơn hàng tạm lưu</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-300">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-8 no-scrollbar">
                    {parkedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                <ShoppingBag className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Không có đơn hàng nào đang chờ</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-6">
                            {parkedOrders.map((order) => (
                                <div key={order.id} className="group p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <Badge variant="outline" className="bg-white text-slate-400 border-none font-bold text-[9px] uppercase px-2 mb-2">
                                                {new Date(order.parkedAt).toLocaleTimeString('vi-VN')}
                                            </Badge>
                                            <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{order.label}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] mb-1">Total</p>
                                            <p className="text-xl font-black text-primary tracking-tighter">{formatPrice(order.totalPrice)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <ReceiptText className="w-3.5 h-3.5" />
                                        <span>{order.totalItems} Items in cart</span>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <Button
                                            className="flex-1 bg-slate-900 hover:bg-black text-white rounded-2xl h-12 gap-2 font-black uppercase tracking-widest text-[10px] shadow-lg"
                                            onClick={() => { unparkOrder(order.id); onClose(); }}
                                        >
                                            <Play className="w-3.5 h-3.5 fill-current" /> Phục hồi đơn
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="w-12 h-12 rounded-2xl text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                            onClick={() => deleteParkedOrder(order.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Area */}
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <div className="flex items-center justify-center gap-3 opacity-30">
                        <div className="h-px flex-1 bg-slate-400" />
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Ocha Luxury System</p>
                        <div className="h-px flex-1 bg-slate-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};
