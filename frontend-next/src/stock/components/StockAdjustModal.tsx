"use client";
import React, { useState, useEffect } from 'react';
import type { StockProduct } from '@features/stock/services/stock.service';
import type { IngredientStock } from '@/utils/ingredientManagement';
import type { Product } from '@/types/product';

interface StockAdjustModalProps {
  isOpen: boolean;
  product?: StockProduct | null;
  ingredient?: IngredientStock | null;
  productInfo?: Product | null;
  forceAdjustMode?: boolean; // Force adjust mode when true
  onClose: () => void;
  onConfirm: (quantity: number, reason: string, isAdjustMode: boolean) => void;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  product,
  ingredient,
  productInfo,
  forceAdjustMode,
  onClose,
  onConfirm,
}) => {
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjustMode, setIsAdjustMode] = useState(false);

  useEffect(() => {
    if (product || ingredient) {
      const hasStock = (product?.currentStock ?? ingredient?.currentStock ?? 0) > 0;
      setIsAdjustMode(forceAdjustMode !== undefined ? forceAdjustMode : hasStock);
      setAdjustQuantity(
        forceAdjustMode !== undefined && forceAdjustMode
          ? String(product?.currentStock ?? ingredient?.currentStock ?? 0)
          : hasStock
            ? String(product?.currentStock ?? ingredient?.currentStock ?? 0)
            : ''
      );
      setAdjustReason('');
    }
  }, [product, ingredient, forceAdjustMode]);

  if (!isOpen || (!product && !ingredient)) return null;

  const currentStock = product?.currentStock ?? ingredient?.currentStock ?? 0;
  const minStock = product?.minStock ?? ingredient?.minStock ?? 0;
  const maxStock = product?.maxStock ?? ingredient?.maxStock ?? 0;
  const unit = product?.unit ?? ingredient?.unit ?? '';
  const name = productInfo?.name ?? ingredient?.name ?? 'Unknown';
  const image = productInfo?.image;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleSubmit = () => {
    const quantity = parseInt(adjustQuantity);
    if (isNaN(quantity) || quantity < 0) {
      return;
    }
    onConfirm(quantity, adjustReason, isAdjustMode);
    setAdjustQuantity('');
    setAdjustReason('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 w-full md:w-[90%] lg:w-[80%] mx-auto my-auto border border-white/50 transform animate-scale-in">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {currentStock === 0
              ? product
                ? 'Nhập Hàng'
                : 'Nhập Nguyên Liệu'
              : product
                ? 'Điều Chỉnh Tồn Kho'
                : 'Điều Chỉnh Nguyên Liệu'}
          </h3>

          <div className="space-y-5">
            {/* Info Card */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {/* Image/Icon */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center border-2 border-orange-200 mx-auto sm:mx-0">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/src/assets/img/gallery/default-food.png';
                      }}
                    />
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <h4 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 text-center sm:text-left">
                    {name}
                  </h4>
                  {productInfo ? (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mt-2">
                      <span>🏪 {productInfo.restaurant}</span>
                      <span>•</span>
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(productInfo.price)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600 mt-2">
                      <span>📏 Đơn vị: {unit}</span>
                    </div>
                  )}

                  {/* Stock Info */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-600">📦 Tồn kho:</span>
                      <span
                        className={`font-bold text-lg ${
                          currentStock === 0
                            ? 'text-red-600'
                            : currentStock <= minStock
                              ? 'text-yellow-600'
                              : 'text-green-600'
                        }`}
                      >
                        {currentStock} {unit}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <span className="text-xs text-gray-600">📉 Min:</span>
                        <span className="text-xs font-semibold text-blue-600">
                          {minStock} {unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
                        <span className="text-xs text-gray-600">📈 Max:</span>
                        <span className="text-xs font-semibold text-purple-600">
                          {maxStock} {unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  {isAdjustMode ? 'Số lượng mới' : 'Số lượng nhập'}
                </label>
                {isAdjustMode && (
                  <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Số lượng hiện tại:</span>
                      <span className="font-bold text-blue-600">
                        {currentStock} {unit}
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-lg font-bold bg-white"
                  placeholder={
                    isAdjustMode
                      ? `Nhập số lượng mới (hiện tại: ${currentStock})`
                      : 'Nhập số lượng'
                  }
                  min="0"
                />
                {isAdjustMode &&
                  adjustQuantity &&
                  !isNaN(parseInt(adjustQuantity)) && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Thay đổi:</span>
                        <span
                          className={`font-bold ${
                            parseInt(adjustQuantity) >= currentStock
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {parseInt(adjustQuantity) >= currentStock ? '+' : ''}
                          {parseInt(adjustQuantity) - currentStock} {unit}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Lý do (tùy chọn)
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                  placeholder="Nhập lý do điều chỉnh..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
            >
              {isAdjustMode ? 'Điều Chỉnh' : product ? 'Nhập Hàng' : 'Nhập Nguyên Liệu'}
            </button>
          </div>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default StockAdjustModal;

