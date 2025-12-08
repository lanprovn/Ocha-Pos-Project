import React, { createContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { CartContextType, CartItem } from '../types/cart';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useDisplaySync } from '@hooks/useDisplaySync';
import { STORAGE_KEYS } from '@constants';
import { orderService } from '@services/order.service';

// Context definition
export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderCreator, setOrderCreator] = useState<{ type: 'staff' | 'customer'; name?: string } | null>(null);
  
  // Real-time display sync
  const { sendToDisplay } = useDisplaySync();
  
  // Debounce ref để tránh gọi API quá nhiều
  const draftOrderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  }, [items]);

  // Sync to Customer Display whenever cart changes
  useEffect(() => {
    // Memoize calculations để tránh tính toán lại không cần thiết
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Always sync to display, even when cart is empty
    sendToDisplay(items, totalPrice, totalItems, 'creating');
  }, [items, sendToDisplay]);

  // Sync draft order to backend whenever cart changes (real-time)
  useEffect(() => {
    // Clear previous timeout
    if (draftOrderTimeoutRef.current) {
      clearTimeout(draftOrderTimeoutRef.current);
    }

    // Chỉ sync nếu orderCreator đã được set
    if (!orderCreator) {
      return;
    }

    // Sync function
    const syncDraftOrder = async () => {
      try {
        // Map items to order items format
        const orderItems = items.map((item) => ({
          productId: String(item.productId), // Convert number to string
          quantity: item.quantity,
          price: item.basePrice + (item.selectedSize?.extraPrice || 0) + 
            item.selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0),
          subtotal: item.totalPrice,
          selectedSize: item.selectedSize?.name || null,
          selectedToppings: item.selectedToppings.map(t => t.name),
          note: item.note || null,
        }));

        // Tính VAT 10% và thêm vào subtotal của item cuối cùng (chỉ khi có items)
        let orderItemsWithVAT = [...orderItems];
        if (orderItemsWithVAT.length > 0) {
          const currentTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
          const vat = currentTotal * 0.1;
          const finalTotal = currentTotal + vat;
          
          // Thêm VAT vào item cuối cùng để tổng = finalTotal
          const lastItem = orderItemsWithVAT[orderItemsWithVAT.length - 1];
          const vatToAdd = finalTotal - currentTotal;
          orderItemsWithVAT[orderItemsWithVAT.length - 1] = {
            ...lastItem,
            subtotal: lastItem.subtotal + vatToAdd,
          };
        }
        // Nếu cart rỗng, orderItemsWithVAT sẽ là [] - backend sẽ update draft order với items rỗng

        await orderService.createOrUpdateDraft({
          orderCreator: orderCreator.type.toUpperCase() as 'STAFF' | 'CUSTOMER',
          orderCreatorName: orderCreator.name || null,
          items: orderItemsWithVAT, // Có thể là [] nếu cart rỗng
        });
      } catch (error: any) {
        console.error('Failed to sync draft order to backend:', error);
        // Không hiển thị error toast để không làm phiền user
      }
    };

    // Debounce ngắn hơn (200ms) cho real-time tốt hơn
    // Nhưng vẫn debounce để tránh quá nhiều API calls
    draftOrderTimeoutRef.current = setTimeout(syncDraftOrder, 200);

    return () => {
      if (draftOrderTimeoutRef.current) {
        clearTimeout(draftOrderTimeoutRef.current);
      }
    };
  }, [items, orderCreator]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    // Create unique toast ID based on product details to prevent duplicates
    const toastId = `add-${item.productId}-${item.selectedSize?.name || 'default'}-${JSON.stringify(item.selectedToppings)}`;
    
    setItems(prevItems => {
      const existing = prevItems.find(
        (i) =>
          i.productId === item.productId &&
          i.selectedSize?.name === item.selectedSize?.name &&
          JSON.stringify(i.selectedToppings) === JSON.stringify(item.selectedToppings)
      );
      
      if (existing) {
        const updatedItems = prevItems.map((i) =>
          i === existing
            ? { 
                ...i, 
                quantity: i.quantity + item.quantity, 
                totalPrice: i.totalPrice + item.totalPrice 
              }
            : i
        );
        // Use toast id to prevent duplicate notifications
        setTimeout(() => {
          toast.success(`Đã cập nhật số lượng ${item.name}!`, {
            id: `update-${item.productId}-${item.selectedSize?.name || 'default'}`
          });
        }, 0);
        return updatedItems;
      } else {
        const newItem = { ...item, id: uuidv4() };
        // Use toast id to prevent duplicate notifications - same ID will replace previous toast
        setTimeout(() => {
          toast.success(`Đã thêm ${item.name} vào giỏ hàng!`, {
            id: toastId // Same ID prevents duplicate
          });
        }, 0);
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      const newItems = prevItems.filter(item => item.id !== id);
      if (item) {
        // Use toast id to prevent duplicate notifications
        setTimeout(() => {
          toast.success(`Đã xóa ${item.name} khỏi giỏ hàng!`, {
            id: `remove-${id}` // Unique ID for this toast
          });
        }, 0);
      }
      return newItems;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      // Remove item silently when quantity reaches 0 (no toast)
      // Toast will only show when user explicitly clicks remove button
      setItems(prevItems => prevItems.filter(item => item.id !== id));
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          // If preservePrice is true, maintain the price per item ratio
          if (item.preservePrice) {
            const pricePerItem = item.totalPrice / item.quantity;
            return { ...item, quantity, totalPrice: pricePerItem * quantity };
          }
          
          // Otherwise, recalculate from basePrice + size + toppings
          const basePrice = item.basePrice + (item.selectedSize?.extraPrice || 0) + 
            item.selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0);
          return { ...item, quantity, totalPrice: basePrice * quantity };
        }
        return item;
      })
    );
  };

  const updateCartItemNote = (id: string, note: string) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          return { ...item, note: note.trim() || undefined };
        }
        return item;
      })
    );
    // Show toast notification
    const item = items.find(item => item.id === id);
    if (item) {
      setTimeout(() => {
        toast.success(note.trim() ? `Đã cập nhật ghi chú cho ${item.name}!` : `Đã xóa ghi chú cho ${item.name}!`, {
          id: `note-${id}`
        });
      }, 0);
    }
  };

  const clearCart = () => {
    setItems([]);
    // Move toast outside of setState callback
    setTimeout(() => toast.success('Đã xóa tất cả giỏ hàng!'), 0);
  };

  // Set cart items directly (for restoring orders, no merge, no toast)
  const setCartItems = (newItems: Omit<CartItem, 'id'>[]) => {
    const itemsWithIds = newItems.map(item => ({ ...item, id: uuidv4() }));
    setItems(itemsWithIds);
    // Clear localStorage cart to prevent reload
    localStorage.removeItem(STORAGE_KEYS.CART);
    // Set new items to localStorage
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(itemsWithIds));
  };

  // Function to update order status and sync to display
  const updateOrderStatus = (status: 'creating' | 'confirmed' | 'paid' | 'completed', customerInfo?: { name?: string; table?: string }, paymentMethod?: 'cash' | 'card' | 'qr', paymentStatus?: 'success' | 'pending' | 'failed') => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    sendToDisplay(items, totalPrice, totalItems, status, customerInfo, paymentMethod, paymentStatus);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const value: CartContextType = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartItemNote,
    clearCart,
    setCartItems,
    isCartOpen,
    setIsCartOpen,
    updateOrderStatus,
    setOrderCreator,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

