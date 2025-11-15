import { useEffect, useCallback, useRef } from 'react';
import type { CartItem } from '../types/cart';
import type { DisplayData, DisplaySyncMessage, UseDisplaySyncReturn } from '../types/display';

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
  
  // Initialize channel in useEffect to avoid issues during SSR or strict mode
  useEffect(() => {
    if (!channelRef.current) {
      try {
        channelRef.current = new BroadcastChannel(DISPLAY_CHANNEL_NAME);
      } catch (error) {
        console.warn('Failed to create BroadcastChannel:', error);
        channelRef.current = null;
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch (error) {
          // Ignore errors during cleanup
        }
        channelRef.current = null;
      }
    };
  }, []);
  
  /**
   * Gửi dữ liệu giỏ hàng đến Customer Display
   * @param cartItems - Danh sách sản phẩm trong giỏ
   * @param totalPrice - Tổng tiền
   * @param totalItems - Tổng số lượng sản phẩm
   * @param status - Trạng thái đơn hàng
   * @param customerInfo - Thông tin khách hàng (optional)
   * @param paymentMethod - Phương thức thanh toán (optional)
   * @param paymentStatus - Trạng thái thanh toán (optional)
   */
  const sendToDisplay = useCallback((
    cartItems: CartItem[],
    totalPrice: number,
    totalItems: number,
    status: DisplayData['status'] = 'creating',
    customerInfo?: DisplayData['customerInfo'],
    paymentMethod?: DisplayData['paymentMethod'],
    paymentStatus?: DisplayData['paymentStatus']
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
        paymentStatus
      };

      // Gửi qua BroadcastChannel
      const message: DisplaySyncMessage = {
        type: 'cart_update',
        data: displayData
      };
      
      // Get channel from ref (always get latest)
      const channel = channelRef.current;
      
      // Check if channel is available and open before posting message
      if (channel) {
        try {
          // Check if channel is still open (BroadcastChannel doesn't have readyState, so we use try-catch)
          channel.postMessage(message);
        } catch (error: any) {
          // Channel might be closed, recreate it
          if (error.name === 'InvalidStateError' || error.message?.includes('closed')) {
            try {
              channelRef.current = new BroadcastChannel(DISPLAY_CHANNEL_NAME);
              channelRef.current.postMessage(message);
            } catch (retryError) {
              // Silently fail - localStorage fallback will handle it
            }
          }
          // Silently fail - localStorage fallback will handle it
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
          paymentStatus
        };
        localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(displayData));
      } catch (storageError) {
        console.error('Failed to save to localStorage:', storageError);
      }
    }
  }, []);

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
    const channel = channelRef.current;
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

    // OPTIMIZED: Reduced polling frequency from 50ms to 500ms
    // Event listeners (storage + custom events) handle instant updates
    // Polling is just a fallback, so 500ms is sufficient
    intervalId = setInterval(pollStorage, 500);

    // Cleanup function
    return () => {
      const channel = channelRef.current;
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
 */
export function usePOSDisplaySync(
  cartItems: CartItem[],
  totalPrice: number,
  totalItems: number,
  status: DisplayData['status'] = 'creating'
) {
  const { sendToDisplay } = useDisplaySync();

  useEffect(() => {
    sendToDisplay(cartItems, totalPrice, totalItems, status);
  }, [cartItems, totalPrice, totalItems, status, sendToDisplay]);
}
