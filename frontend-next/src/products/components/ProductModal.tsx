"use client";
import React, { useState, useEffect } from 'react';
import { X, Star, Plus, Minus, Check, ShoppingBag, Info, MessageSquare } from 'lucide-react';
import type { Product, Size, Topping } from '@/types/product';
import { useCart } from '@features/orders/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || undefined);
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const calculateTotalPrice = () => {
    const base = product.price;
    const sizePrice = selectedSize?.extraPrice || 0;
    const toppingPrice = selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0);
    return (base + sizePrice + toppingPrice) * quantity;
  };

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      selectedSize,
      selectedToppings,
      note,
      quantity,
      totalPrice,
    });
    onClose();
  };

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings(prev => {
      const isSelected = prev.some(t => t.name === topping.name);
      if (isSelected) {
        return prev.filter(t => t.name !== topping.name);
      } else {
        return [...prev, topping];
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-300">
      {/* Glass Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Luxury Modal Container */}
      <div className="relative w-full max-w-[1000px] h-full max-h-[800px] bg-white rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500">

        {/* Left: Product Showcase (Visuals) */}
        <div className="md:w-1/2 relative h-64 md:h-auto bg-slate-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 left-6 w-11 h-11 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white border border-white/30 z-20 md:hidden"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Floating Product Badge */}
          <div className="absolute bottom-6 left-6 z-20">
            <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 mb-2">
              {product.category || 'Specialty'}
            </Badge>
            <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">
              {product.name}
            </h2>
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="md:w-1/2 flex flex-col h-full bg-white relative">
          {/* Header (Desktop Only) */}
          <div className="hidden md:flex items-center justify-between p-8 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Customization</p>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cá nhân hóa món ăn</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 text-slate-400">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Configuration Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-8 pb-32 pt-4 space-y-8 no-scrollbar">

            {/* Description Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Giới thiệu</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {product.description || 'Thưởng thức hương vị độc bản được chế biến từ những nguyên liệu tươi ngon nhất, mang lại trải nghiệm ẩm thực tinh tế cho ngày của bạn.'}
              </p>
            </div>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Kích Thước</span>
                  <Badge variant="outline" className="text-[9px] font-bold border-slate-200">Bắt buộc</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300",
                        selectedSize?.name === size.name
                          ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1"
                          : "border-slate-100 bg-slate-50/50 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", selectedSize?.name === size.name ? "border-white bg-white" : "border-slate-300")}>
                          {selectedSize?.name === size.name && <Check className="w-3 h-3 text-slate-900 stroke-[4px]" />}
                        </div>
                        <span className="font-bold text-sm uppercase tracking-tight">{size.name}</span>
                      </div>
                      <span className={cn("text-sm font-black tracking-tight", selectedSize?.name === size.name ? "text-primary" : "text-slate-500")}>
                        +{formatPrice(size.extraPrice)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toppings Selector */}
            {product.toppings && product.toppings.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Topping thêm</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Tùy chọn</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {product.toppings.map((topping) => {
                    const isSelected = selectedToppings.some(t => t.name === topping.name);
                    return (
                      <button
                        key={topping.name}
                        onClick={() => handleToppingToggle(topping)}
                        className={cn(
                          "p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col gap-2 text-left",
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100"
                            : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-center justify-between pointer-events-none">
                          <div className={cn("w-4 h-4 rounded-md border-2 flex items-center justify-center transition-colors", isSelected ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />}
                          </div>
                          <span className={cn("text-[10px] font-black tracking-tight", isSelected ? "text-emerald-600" : "text-slate-400")}>
                            +{formatPrice(topping.extraPrice)}
                          </span>
                        </div>
                        <span className={cn("text-xs font-bold uppercase tracking-tighter truncate", isSelected ? "text-emerald-700" : "text-slate-600")}>
                          {topping.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Note & Quantity Pad */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Ghi chú cho bếp</span>
                </div>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Ít đá, không lấy muỗng..."
                  className="h-12 bg-slate-100/50 border-none rounded-2xl font-medium focus-visible:ring-primary/20"
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Số lượng</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-90"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-lg font-black text-slate-800">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-black text-white shadow-xl transition-all active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(calculateTotalPrice())}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer (Sticky) */}
          <div className="absolute bottom-0 inset-x-0 p-8 pt-4 bg-gradient-to-t from-white via-white to-transparent border-t border-slate-50">
            <Button
              onClick={handleAddToCart}
              className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-2xl shadow-2xl shadow-slate-300 transition-all font-black uppercase tracking-[0.2em] text-lg group active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5 mr-3 group-hover:animate-bounce" /> Thêm Vào Giỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
