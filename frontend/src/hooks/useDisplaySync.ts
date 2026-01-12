import { useEffect, useCallback, useRef } from 'react';
import type { CartItem } from '@/types/cart';
import type { DisplayData, DisplaySyncMessage, UseDisplaySyncReturn } from '@/types/display';

const DISPLAY_CHANNEL_NAME = 'ocha_display';
const DISPLAY_STORAGE_KEY = 'ocha_display_data';

/**
 * Hook để đồng bộ dữ liệu giỏ hàng giữa POS và Customer Display
 * Sử dụng BroadcastChannel API để truyền dữ liệu real-time giữa các tab
 */
export function useDisplaySync(): UseDisplaySyncReturn {
  // Tạo BroadcastChannel để giao tiếp giữa các tab
  // Sử dụng ref để tránh recreate channel mỗi lần render
  const channelRef = useRef<BroadcastChannel | null>(null);
  
  if (!channelRef.current) {
    try {
      channelRef.current = new BroadcastChannel(DISPLAY_CHANNEL_NAME);
    } catch (error) {
      console.warn('Failed to create BroadcastChannel:', error);
      channelRef.current = null;
    }
  }
  
  const channel = channelRef.current;

  /**
   * Gửi dữ liệu giỏ hàng đến Customer Display
   * @param cartItems - Danh sách sản phẩm trong giỏ
   * @param totalPrice - Tổng tiền
   * @param totalItems - Tổng số lượng sản phẩm
   * @param status - Trạng thái đơn hàng
   * @param customerInfo - Thông tin khách hàng (optional)
   * @param paymentMethod - Phương thức thanh toán (optional)
   * @param paymentStatus - Trạng thái thanh toán (optional)
   * @param discountRate - Phần trăm giảm giá (optional)
   */
  const sendToDisplay = useCallback((
    cartItems: CartItem[],
    totalPrice: number,
    totalItems: number,
    status: DisplayData['status'] = 'creating',
    customerInfo?: DisplayData['customerInfo'],
    paymentMethod?: DisplayData['paymentMethod'],
    paymentStatus?: DisplayData['paymentStatus'],
    discountRate?: number
  ) => {
    try {
      const displayData: DisplayData = {
        items: cartItems,
        totalPrice,
        totalItems,
        status,
        customerInfo,
        timestamp: Date.now(),
        paymentMethod,
        paymentStatus,
        discountRate
      };

      // Gửi qua BroadcastChannel
      const message: DisplaySyncMessage = {
        type: 'cart_update',
        data: displayData
      };
      
      // Check if channel is available before posting message
      if (channel) {
        try {
          channel.postMessage(message);
        } catch (error) {
          console.warn('Failed to post message to channel:', error);
        }
      }

      // Backup vào localStorage (fallback)
      localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(displayData));
      
      // Trigger custom event cho instant sync
      const customEvent = new CustomEvent('displayDataUpdate', { 
        detail: displayData 
      });
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.warn('Failed to send to display:', error);
      // Fallback to localStorage only
      try {
        const displayData: DisplayData = {
          items: cartItems,
          totalPrice,
          totalItems,
          status,
          customerInfo,
          timestamp: Date.now(),
          paymentMethod,
          paymentStatus,
          discountRate
        };
        localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(displayData));
      } catch (storageError) {
        console.error('Failed to save to localStorage:', storageError);
      }
    }
  }, [channel]);

  /**
   * Lắng nghe dữ liệu từ POS
   * @param callback - Callback function để xử lý dữ liệu mới
   * @returns Function để unsubscribe
   */
  const subscribeToDisplay = useCallback((callback: (data: DisplayData) => void) => {
    let lastDataHash = '';
    let intervalId: NodeJS.Timeout;

    const handleMessage = (event: MessageEvent<DisplaySyncMessage>) => {
      if (event.data.type === 'cart_update') {
        callback(event.data.data);
      }
    };

    // Lắng nghe BroadcastChannel
    try {
      if (channel) {
        channel.addEventListener('message', handleMessage);
      }
    } catch (error) {
      console.warn('Failed to add message listener:', error);
    }

    // Polling localStorage để sync giữa các port khác nhau
    const pollStorage = () => {
      try {
        const stored = localStorage.getItem(DISPLAY_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as DisplayData;
          const dataHash = JSON.stringify(data);
          
          if (dataHash !== lastDataHash) {
            lastDataHash = dataHash;
            callback(data);
          }
        }
      } catch (error) {
        console.error('Error polling localStorage:', error);
      }
    };

    // Load dữ liệu từ localStorage khi khởi tạo
    const loadFromStorage = () => {
      try {
        const stored = localStorage.getItem(DISPLAY_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored) as DisplayData;
          lastDataHash = JSON.stringify(data);
          callback(data);
        }
      } catch (error) {
        console.error('Error loading display data from storage:', error);
      }
    };

    // Load ngay lập tức
    loadFromStorage();

    // Storage event listener cho instant updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === DISPLAY_STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue) as DisplayData;
          const dataHash = JSON.stringify(data);
          
          if (dataHash !== lastDataHash) {
            lastDataHash = dataHash;
            callback(data);
          }
        } catch (error) {
          console.error('Error parsing storage event data:', error);
        }
      }
    };

    // Custom event listener cho instant updates
    const handleCustomEvent = (event: CustomEvent) => {
      const data = event.detail as DisplayData;
      const dataHash = JSON.stringify(data);
      
      if (dataHash !== lastDataHash) {
        lastDataHash = dataHash;
        callback(data);
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('displayDataUpdate', handleCustomEvent as EventListener);

    // Start polling every 50ms for ultra-fast updates
    intervalId = setInterval(pollStorage, 50);

    // Cleanup function
    return () => {
      try {
        if (channel) {
          channel.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.warn('Failed to remove message listener:', error);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('displayDataUpdate', handleCustomEvent as EventListener);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [channel]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      try {
        if (channelRef.current) {
          channelRef.current.close();
        }
      } catch (error) {
        console.warn('Failed to close channel:', error);
      }
    };
  }, []);

  return {
    sendToDisplay,
    subscribeToDisplay
  };
}

/**
 * Hook đơn giản để gửi dữ liệu từ POS
 * @param cartItems - Danh sách sản phẩm trong giỏ
 * @param totalPrice - Tổng tiền
 * @param totalItems - Tổng số lượng sản phẩm
 * @param status - Trạng thái đơn hàng
 * @param discountRate - Phần trăm giảm giá (optional)
 */
export function usePOSDisplaySync(
  cartItems: CartItem[],
  totalPrice: number,
  totalItems: number,
  status: DisplayData['status'] = 'creating',
  discountRate?: number
) {
  const { sendToDisplay } = useDisplaySync();

  useEffect(() => {
    sendToDisplay(cartItems, totalPrice, totalItems, status, undefined, undefined, undefined, discountRate);
  }, [cartItems, totalPrice, totalItems, status, discountRate, sendToDisplay]);
}
