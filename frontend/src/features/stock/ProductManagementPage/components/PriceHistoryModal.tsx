import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { productService } from '@features/products/services/product.service';
import { formatPrice } from '@/utils/formatPrice';
import toast from 'react-hot-toast';

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

interface PriceHistoryEntry {
  id: string;
  productId: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string | null;
  reason: string | null;
  createdAt: string;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
}) => {
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      loadHistory();
    }
  }, [isOpen, productId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getPriceHistory(productId);
      setHistory(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải lịch sử';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getPriceChange = (oldPrice: number, newPrice: number) => {
    const diff = newPrice - oldPrice;
    const percent = oldPrice > 0 ? ((diff / oldPrice) * 100).toFixed(1) : '0';
    return { diff, percent };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[80%] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b flex-shrink-0">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Lịch sử thay đổi giá</h3>
            <p className="text-sm text-gray-500 mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có lịch sử</h3>
              <p className="mt-1 text-sm text-gray-500">Sản phẩm này chưa có thay đổi giá nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                const { diff, percent } = getPriceChange(entry.oldPrice, entry.newPrice);
                const isIncrease = diff > 0;

                return (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(entry.oldPrice)}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="text-sm font-bold text-orange-600">
                              {formatPrice(entry.newPrice)}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              isIncrease
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {isIncrease ? '+' : ''}
                            {formatPrice(Math.abs(diff))} ({isIncrease ? '+' : ''}
                            {percent}%)
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>{formatDate(entry.createdAt)}</p>
                          {entry.reason && (
                            <p className="text-gray-600">
                              <span className="font-medium">Lý do:</span> {entry.reason}
                            </p>
                          )}
                          {entry.changedBy && (
                            <p>
                              <span className="font-medium">Người thay đổi:</span> {entry.changedBy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceHistoryModal;

