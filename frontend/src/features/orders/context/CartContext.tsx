import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { CartContextType, CartItem, ParkedOrder } from '@/types/cart';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useDisplaySync } from '@/hooks/useDisplaySync';
import { STORAGE_KEYS } from '@/constants';
import { orderService } from '../services/order.service';

// Context definition
export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderCreator, setOrderCreator] = useState<{ type: 'staff' | 'customer'; name?: string } | null>(null);
  const [parkedOrders, setParkedOrders] = useState<ParkedOrder[]>([]);

  // Real-time display sync
  const { sendToDisplay } = useDisplaySync();
  const draftOrderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from session
  useEffect(() => {
    const savedCart = sessionStorage.getItem(STORAGE_KEYS.CART);
    const savedParked = sessionStorage.getItem('Ocha_Parked_Orders');
    if (savedCart) {
      try { setItems(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
    if (savedParked) {
      try { setParkedOrders(JSON.parse(savedParked)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save to session
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    sessionStorage.setItem('Ocha_Parked_Orders', JSON.stringify(parkedOrders));
  }, [parkedOrders]);

  // Sync to display
  useEffect(() => {
    const totalItms = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrc = items.reduce((sum, item) => sum + item.totalPrice, 0);
    sendToDisplay(items, totalPrc, totalItms, 'creating');
  }, [items, sendToDisplay]);

  // Auto-save draft order to backend
  useEffect(() => {
    if (draftOrderTimeoutRef.current) clearTimeout(draftOrderTimeoutRef.current);
    if (!orderCreator) return;

    draftOrderTimeoutRef.current = setTimeout(async () => {
      try {
        if (items.length === 0) {
          await orderService.deleteDraftOrders(orderCreator.type.toUpperCase() as 'STAFF' | 'CUSTOMER', orderCreator.name || null);
          return;
        }
        const orderItems = items.map(item => ({
          productId: String(item.productId),
          quantity: item.quantity,
          price: item.basePrice + (item.selectedSize?.extraPrice || 0) + item.selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0),
          subtotal: item.totalPrice,
          selectedSize: item.selectedSize?.name || null,
          selectedToppings: item.selectedToppings.map(t => t.name),
          note: item.note || null,
        }));
        await orderService.createOrUpdateDraft({
          orderCreator: orderCreator.type.toUpperCase() as 'STAFF' | 'CUSTOMER',
          orderCreatorName: orderCreator.name || null,
          items: orderItems,
        });
      } catch (e) { console.error('Draft sync failed', e); }
    }, 500);
  }, [items, orderCreator]);

  // Actions
  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const toastId = `add-${item.productId}-${item.selectedSize?.name || 'default'}`;
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId && i.selectedSize?.name === item.selectedSize?.name && JSON.stringify(i.selectedToppings) === JSON.stringify(item.selectedToppings));
      if (existing) {
        toast.success(`Cập nhật số lượng!`, { id: toastId });
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity, totalPrice: i.totalPrice + item.totalPrice } : i);
      }
      toast.success(`Đã thêm món!`, { id: toastId });
      return [...prev, { ...item, id: uuidv4() }];
    });
  };

  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const base = item.basePrice + (item.selectedSize?.extraPrice || 0) + item.selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0);
        return { ...item, quantity, totalPrice: base * quantity };
      }
      return item;
    }));
  };

  const updateCartItemNote = (id: string, note: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, note: note || undefined } : i));
  };

  const clearCart = () => { setItems([]); toast.success('Đã dọn sạch giỏ hàng.'); };

  const setCartItems = (newItems: Omit<CartItem, 'id'>[]) => {
    setItems(newItems.map(i => ({ ...i, id: uuidv4() })));
  };

  const updateOrderStatus = (status: any, customerInfo: any, paymentMethod: any, paymentStatus: any) => {
    const totalItms = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrc = items.reduce((sum, item) => sum + item.totalPrice, 0);
    sendToDisplay(items, totalPrc, totalItms, status, customerInfo, paymentMethod, paymentStatus);
  };

  // Park Methods
  const parkOrder = (label?: string) => {
    if (items.length === 0) return;
    const newOrder: ParkedOrder = {
      id: uuidv4(), items: [...items],
      totalPrice: items.reduce((s, i) => s + i.totalPrice, 0),
      totalItems: items.reduce((s, i) => s + i.quantity, 0),
      parkedAt: Date.now(),
      label: label || `Bàn ${Math.floor(Math.random() * 50) + 1}`,
    };
    setParkedOrders(prev => [newOrder, ...prev]);
    setItems([]);
    toast.success('Đã lưu vào danh sách chờ');
  };

  const unparkOrder = (id: string) => {
    const order = parkedOrders.find(o => o.id === id);
    if (!order) return;
    if (items.length > 0) {
      parkOrder('Đơn dang dở');
    }
    setItems(order.items);
    setParkedOrders(prev => prev.filter(o => o.id !== id));
    toast.success('Đã khôi phục đơn hàng');
  };

  const deleteParkedOrder = (id: string) => {
    setParkedOrders(prev => prev.filter(o => o.id !== id));
  };

  const value: CartContextType = {
    items, totalItems: items.reduce((s, i) => s + i.quantity, 0), totalPrice: items.reduce((s, i) => s + i.totalPrice, 0),
    addToCart, removeFromCart, updateQuantity, updateCartItemNote, clearCart, setCartItems,
    isCartOpen, setIsCartOpen, updateOrderStatus, setOrderCreator, orderCreator,
    parkedOrders, parkOrder, unparkOrder, deleteParkedOrder
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
