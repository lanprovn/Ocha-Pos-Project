"use client";
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import promotionService from '@features/promotions/services/promotion.service';
import type { ValidatePromotionResult } from '@features/promotions/services/promotion.service';

interface PromotionCodeInputProps {
  promotionCode: string;
  promotionDiscount: number;
  orderAmount: number;
  productIds?: string[];
  categoryIds?: string[];
  customerMembershipLevel?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  customerId?: string;
  onPromotionCodeChange: (code: string) => void;
  onPromotionApplied: (result: ValidatePromotionResult) => void;
  onPromotionRemoved: () => void;
}

export const PromotionCodeInput: React.FC<PromotionCodeInputProps> = ({
  promotionCode,
  promotionDiscount,
  orderAmount,
  productIds,
  categoryIds,
  customerMembershipLevel,
  customerId,
  onPromotionCodeChange,
  onPromotionApplied,
  onPromotionRemoved,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState<ValidatePromotionResult | null>(null);

  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }

    setIsValidating(true);
    try {
      // Validate promotion with original order amount (before any discounts)
      // This ensures promotion minOrderAmount is checked against subtotal
      const result = await promotionService.validateAndApply({
        code: promotionCode.trim().toUpperCase(),
        orderAmount, // Use original subtotal for validation
        productIds,
        categoryIds,
        customerMembershipLevel,
        customerId,
      });

      if (result.isValid) {
        setAppliedPromotion(result);
        onPromotionApplied(result);
        toast.success(`Áp dụng mã khuyến mãi thành công! Giảm ${result.discountAmount.toLocaleString('vi-VN')}₫`);
      } else {
        toast.error(result.error || 'Mã khuyến mãi không hợp lệ');
        setAppliedPromotion(null);
        onPromotionRemoved();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Không thể xác thực mã khuyến mãi');
      setAppliedPromotion(null);
      onPromotionRemoved();
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    onPromotionRemoved();
    onPromotionCodeChange('');
    toast.success('Đã xóa mã khuyến mãi');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isValidating) {
      handleApplyPromotion();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 lg:p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Mã khuyến mãi
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={promotionCode}
          onChange={(e) => onPromotionCodeChange(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Nhập mã khuyến mãi"
          disabled={isValidating || !!appliedPromotion}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {appliedPromotion ? (
          <button
            onClick={handleRemovePromotion}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm font-medium"
          >
            Xóa
          </button>
        ) : (
          <button
            onClick={handleApplyPromotion}
            disabled={isValidating || !promotionCode.trim()}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Đang kiểm tra...' : 'Áp dụng'}
          </button>
        )}
      </div>
      {appliedPromotion && appliedPromotion.promotion && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="text-sm text-green-800">
            <span className="font-medium">{appliedPromotion.promotion.name}</span>
            {appliedPromotion.promotion.description && (
              <span className="ml-2 text-green-600">- {appliedPromotion.promotion.description}</span>
            )}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Giảm {appliedPromotion.discountAmount.toLocaleString('vi-VN')}₫
          </div>
        </div>
      )}
    </div>
  );
};

