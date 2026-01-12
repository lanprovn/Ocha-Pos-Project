import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { subscribeToOrders } from '@lib/socket.service';
import type { Order } from '../services/order.service';
import { formatPrice } from '@utils/formatPrice';
import toast from 'react-hot-toast';

const CustomerOrderTrackingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Get orderId from location state or query params
  const orderId = (location.state as { orderId?: string } | null)?.orderId || 
                  new URLSearchParams(location.search).get('orderId');
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSearchForm, setShowSearchForm] = useState<boolean>(!orderId);

  useEffect(() => {
    if (!orderId) {
      // Don't show error if user hasn't searched yet
      if (!showSearchForm) {
        setIsLoading(false);
      }
      return;
    }

    const loadOrder = async () => {
      setIsLoading(true);
      try {
        // Try to find by phone or order number first
        try {
          const orderData = await orderService.findByPhoneOrOrderNumber(orderId);
          setOrder(orderData);
        } catch (error: any) {
          // Fallback to getById for UUID
          const orderData = await orderService.getById(orderId);
          setOrder(orderData);
        }
      } catch (error: any) {
        console.error('Error loading order:', error);
        toast.error('Không thể tải thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, showSearchForm]);

  // Subscribe to order updates via Socket.io
  useEffect(() => {
    if (!orderId) return;

    const cleanup = subscribeToOrders(
      undefined, // onOrderCreated
      (updatedOrder: Order) => {
        if (updatedOrder.id === orderId) {
          setOrder(updatedOrder);
        }
      },
      (data: { orderId: string; status: string }) => {
        if (data.orderId === orderId) {
          loadOrder();
        }
      }
    );

    return cleanup;
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      // Try to find by phone or order number first
      try {
        const orderData = await orderService.findByPhoneOrOrderNumber(orderId);
        setOrder(orderData);
      } catch (error: any) {
        // Fallback to getById for UUID
        const orderData = await orderService.getById(orderId);
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Không tìm thấy đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng hoặc số điện thoại');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = await orderService.findByPhoneOrOrderNumber(searchTerm.trim());
      setOrder(orderData);
      setShowSearchForm(false);
      // Update URL without reload
      navigate(`/customer/orders/track?orderId=${encodeURIComponent(searchTerm.trim())}`, { replace: true });
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại số điện thoại hoặc mã đơn hàng');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: string; description: string }> = {
      'PENDING': { label: 'Đã xác nhận', color: 'bg-blue-500', icon: '✅', description: 'Đơn hàng đã được xác nhận' },
      'CONFIRMED': { label: 'Đã xác nhận', color: 'bg-blue-500', icon: '✅', description: 'Đơn hàng đã được xác nhận' },
      'PREPARING': { label: 'Đang chuẩn bị', color: 'bg-yellow-500', icon: '👨‍🍳', description: 'Đang chuẩn bị món ăn' },
      'READY': { label: 'Sẵn sàng', color: 'bg-purple-500', icon: '🍽️', description: 'Món ăn đã sẵn sàng' },
      'COMPLETED': { label: 'Hoàn thành', color: 'bg-green-500', icon: '🎉', description: 'Đơn hàng đã hoàn thành' },
      'CANCELLED': { label: 'Đã hủy', color: 'bg-red-500', icon: '❌', description: 'Đơn hàng đã bị hủy' },
    };
    return configs[status] || { label: status, color: 'bg-gray-500', icon: '❓', description: 'Trạng thái không xác định' };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  // Show search form if no order and no orderId
  if (showSearchForm || (!order && !orderId)) {
    return (
      <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="min-h-full py-6 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Theo dõi đơn hàng</h1>
                <p className="text-gray-600">Nhập mã đơn hàng hoặc số điện thoại để theo dõi</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đơn hàng hoặc số điện thoại
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Nhập mã đơn hàng (ORD-123456) hoặc số điện thoại..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Mã đơn hàng được gửi đến bạn sau khi đặt hàng thành công
                  </p>
                </div>

                <button
                  onClick={handleSearch}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Tìm kiếm
                </button>

                <button
                  onClick={() => navigate('/customer')}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy đơn hàng</h2>
        <p className="text-gray-600 mb-6">Đơn hàng không tồn tại hoặc đã bị xóa</p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSearchForm(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Tìm kiếm lại
          </button>
          <button
            onClick={() => navigate('/customer')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const isCompleted = order.status === 'COMPLETED';
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusSteps = () => {
    const steps = [
      { status: 'PENDING', label: 'Đã xác nhận', icon: '✓', color: 'blue' },
      { status: 'PREPARING', label: 'Đang chuẩn bị', icon: '👨‍🍳', color: 'yellow' },
      { status: 'READY', label: 'Sẵn sàng', icon: '🍽️', color: 'purple' },
      { status: 'COMPLETED', label: 'Hoàn thành', icon: '🎉', color: 'green' },
    ];
    
    const statusOrder = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    return steps.map((step, index) => {
      const stepIndex = statusOrder.indexOf(step.status);
      const isActive = currentIndex >= stepIndex;
      const isCurrent = order.status === step.status || 
                       (step.status === 'PENDING' && ['PENDING', 'CONFIRMED'].includes(order.status));
      
      return { ...step, isActive, isCurrent };
    });
  };

  const statusSteps = getStatusSteps();

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      <div className="min-h-full py-6 px-4">
        <div className="max-w-5xl mx-auto">
        {/* Header với animation */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Theo dõi đơn hàng</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Thời gian hiện tại: {currentTime.toLocaleTimeString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Order Info Card - Redesign */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã đơn hàng */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="text-sm font-medium text-gray-500">Mã đơn hàng</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 font-mono tracking-wide">{order.orderNumber}</p>
            </div>

            {/* Trạng thái */}
            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-500">Trạng thái</span>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig.color} text-white shadow-md`}>
                <span className="text-xl">{statusConfig.icon}</span>
                <span className="font-semibold">{statusConfig.label}</span>
              </div>
            </div>
          </div>
          
          {/* Thông tin khách hàng */}
          {order.customerName && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">Khách hàng: {order.customerName}</span>
                {order.customerPhone && (
                  <span className="text-gray-400">• {order.customerPhone}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Items - Redesign */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {order.items.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-start justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-800 text-lg">{item.product.name}</span>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {item.selectedSize && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>Size: <span className="font-medium">{item.selectedSize}</span></span>
                      </div>
                    )}
                    {item.selectedToppings && item.selectedToppings.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>Topping: <span className="font-medium">{item.selectedToppings.join(', ')}</span></span>
                      </div>
                    )}
                    {item.note && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 italic mt-2">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>{item.note}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className="text-lg font-bold text-emerald-600">
                    {formatPrice(parseFloat(item.subtotal))}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                {formatPrice(parseFloat(order.totalAmount))}
              </span>
            </div>
          </div>
        </div>

        {/* Status Timeline - Redesign với đường nối */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Tiến trình đơn hàng</h2>
          </div>
          
          <div className="relative">
            {/* Đường nối dọc */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5">
              {statusSteps.map((step, index) => {
                if (index === statusSteps.length - 1) return null;
                const nextStep = statusSteps[index + 1];
                const isLineActive = step.isActive && nextStep.isActive;
                const isLinePartial = step.isActive && !nextStep.isActive;
                
                return (
                  <div
                    key={`line-${index}`}
                    className={`absolute w-full transition-all duration-300 ${
                      isLineActive 
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-500 h-6' 
                        : isLinePartial
                        ? 'bg-gradient-to-b from-emerald-400 to-gray-200 h-6'
                        : 'bg-gray-200 h-6'
                    }`}
                    style={{ top: `${index * 96}px` }}
                  />
                );
              })}
            </div>
            
            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const colorClasses = {
                  blue: 'bg-blue-500',
                  yellow: 'bg-yellow-500',
                  purple: 'bg-purple-500',
                  green: 'bg-green-500'
                };
                
                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    {/* Icon Circle */}
                    <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all duration-300 ${
                      step.isActive 
                        ? `${colorClasses[step.color as keyof typeof colorClasses]} scale-110` 
                        : 'bg-gray-300 scale-100'
                    } ${step.isCurrent ? 'ring-4 ring-opacity-50 ' + colorClasses[step.color as keyof typeof colorClasses] : ''}`}>
                      {step.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <p className={`text-lg font-semibold mb-1 transition-colors ${
                        step.isActive ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {step.isCurrent && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <p className="text-sm text-emerald-600 font-medium">Đang xử lý...</p>
                        </div>
                      )}
                      {!step.isActive && (
                        <p className="text-sm text-gray-400">Chờ xử lý...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons - Redesign */}
        {isCompleted && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/customer')}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đặt đơn mới
            </button>
            <button
              onClick={() => navigate('/customer')}
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderTrackingPage;

