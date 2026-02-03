import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Coffee, ShoppingBag, Utensils, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiningOptionSelectorProps {
    value: 'dine-in' | 'takeaway';
    onChange: (value: 'dine-in' | 'takeaway') => void;
    tableNumber: string;
    onTableNumberChange: (value: string) => void;
}

export const DiningOptionSelector: React.FC<DiningOptionSelectorProps> = ({
    value,
    onChange,
    tableNumber,
    onTableNumberChange
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 rounded-xl">
                    <Utensils className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Hình thức phục vụ</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select dining mode</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Option: Dine-in */}
                <button
                    onClick={() => onChange('dine-in')}
                    className={cn(
                        "relative p-6 rounded-[32px] border-2 transition-all duration-500 text-left group overflow-hidden",
                        value === 'dine-in'
                            ? "bg-white border-emerald-500 shadow-2xl shadow-emerald-100 ring-4 ring-emerald-50"
                            : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        value === 'dine-in' ? "bg-emerald-500 text-white" : "bg-white text-slate-300"
                    )}>
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Dine-in</p>
                        <h4 className="text-lg font-black tracking-tighter uppercase text-slate-800">Dùng tại quán</h4>
                    </div>
                    {value === 'dine-in' && (
                        <div className="absolute top-6 right-6 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    )}
                </button>

                {/* Option: Takeaway */}
                <button
                    onClick={() => onChange('takeaway')}
                    className={cn(
                        "relative p-6 rounded-[32px] border-2 transition-all duration-500 text-left group overflow-hidden",
                        value === 'takeaway'
                            ? "bg-white border-blue-500 shadow-2xl shadow-blue-100 ring-4 ring-blue-50"
                            : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        value === 'takeaway' ? "bg-blue-500 text-white" : "bg-white text-slate-300"
                    )}>
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Takeaway</p>
                        <h4 className="text-lg font-black tracking-tighter uppercase text-slate-800">Mang về</h4>
                    </div>
                    {value === 'takeaway' && (
                        <div className="absolute top-6 right-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    )}
                </button>
            </div>

            {value === 'dine-in' && (
                <div className="animate-in slide-in-from-top-4 duration-500">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-600 font-black text-[10px] px-2 h-6">MÃ BÀN</Badge>
                        </div>
                        <input
                            type="text"
                            placeholder="Số bàn hoặc số thẻ rung..."
                            value={tableNumber}
                            onChange={(e) => onTableNumberChange(e.target.value)}
                            className="w-full h-20 bg-emerald-50/30 border-2 border-emerald-100 rounded-[28px] pl-28 pr-8 text-xl font-black text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 transition-all"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
