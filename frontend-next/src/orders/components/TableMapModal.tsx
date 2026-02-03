"use client";
import React from 'react';
import { useCart } from '@features/orders/hooks/useCart';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Users, Clock, Coffee, Sparkles, X, Plus } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';

interface TableMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TABLES = Array.from({ length: 20 }, (_, i) => ({
    id: `Bàn ${i + 1}`,
    capacity: i % 3 === 0 ? 4 : 2,
}));

export const TableMapModal: React.FC<TableMapModalProps> = ({ isOpen, onClose }) => {
    const { parkedOrders, unparkOrder, parkOrder, items } = useCart();

    const getTableStatus = (tableId: string) => {
        const order = parkedOrders.find(o => o.label === tableId);
        if (order) return { status: 'occupied', order };
        return { status: 'available', order: null };
    };

    const handleTableClick = (tableId: string) => {
        const { status, order } = getTableStatus(tableId);

        if (status === 'occupied' && order) {
            unparkOrder(order.id);
            onClose();
        } else {
            if (items.length > 0) {
                parkOrder(tableId);
                onClose();
            } else {
                onClose();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-white rounded-[40px] border-none shadow-2xl p-0 overflow-hidden outline-none">
                <DialogHeader className="p-10 pb-6 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <LayoutGrid className="w-6 h-6" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Sơ đồ nhà hàng</DialogTitle>
                                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Quản lý trạng thái bàn Real-time</DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400">Trống</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400">Đang ngồi</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white text-slate-300">
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="h-[600px] p-10 pt-4 bg-slate-50 overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10">
                        {TABLES.map((table) => {
                            const { status, order } = getTableStatus(table.id);
                            const isOccupied = status === 'occupied';

                            return (
                                <button
                                    key={table.id}
                                    onClick={() => handleTableClick(table.id)}
                                    className={cn(
                                        "relative group p-6 rounded-[32px] border-2 transition-all duration-500 text-left overflow-hidden",
                                        isOccupied
                                            ? "bg-white border-amber-200 shadow-xl shadow-amber-100"
                                            : "bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-200"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            isOccupied ? "bg-amber-500 text-white" : "bg-emerald-50 text-emerald-500"
                                        )}>
                                            {isOccupied ? <Coffee className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                                        </div>
                                        <Badge variant="outline" className="border-none bg-slate-50 text-[8px] font-black uppercase px-1.5 h-4">
                                            <Users className="w-2.5 h-2.5 mr-1" /> {table.capacity}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter">{table.id}</h4>
                                        {isOccupied ? (
                                            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                                                <p className="text-sm font-black text-amber-600 tracking-tighter">{formatPrice(order?.totalPrice || 0)}</p>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{Math.floor((Date.now() - (order?.parkedAt || 0)) / 60000)} Phút</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest pt-2">Sẵn sàng</p>
                                        )}
                                    </div>

                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl">
                            <span className="text-[10px] font-black uppercase text-slate-400">Phục vụ</span>
                            <span className="text-sm font-black text-slate-800">{parkedOrders.length} / {TABLES.length} Bàn</span>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Ocha Luxury Flooring System</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
