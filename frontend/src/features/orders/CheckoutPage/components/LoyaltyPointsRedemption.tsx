import React, { useState, useEffect } from 'react';
import { GiftIcon } from '@heroicons/react/24/outline';
import customerService from '@features/customers/services/customer.service';
import type { Customer } from '@/types/customer';

interface LoyaltyPointsRedemptionProps {
  customer: Customer | null;
  orderAmount: number;
  onRedemptionChange: (points: number, discount: number) => void;
}

export const LoyaltyPointsRedemption: React.FC<LoyaltyPointsRedemptionProps> = ({
  customer,
  orderAmount,
  onRedemptionChange,
}) => {
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!customer || customer.loyaltyPoints === 0) {
      setPointsToRedeem(0);
      setDiscountAmount(0);
      onRedemptionChange(0, 0);
      return;
    }
  }, [customer]);

  useEffect(() => {
    if (!customer || pointsToRedeem === 0) {
      setDiscountAmount(0);
      onRedemptionChange(0, 0);
      return;
    }

    const calculateRedemption = async () => {
      if (pointsToRedeem <= 0 || pointsToRedeem > customer.loyaltyPoints) {
        setDiscountAmount(0);
        onRedemptionChange(0, 0);
        return;
      }

      setIsCalculating(true);
      try {
        const result = await customerService.calculateRedemption({
          loyaltyPoints: customer.loyaltyPoints,
          pointsToRedeem,
          orderAmount,
        });
        setDiscountAmount(result.discountAmount);
        onRedemptionChange(result.pointsUsed, result.discountAmount);
      } catch (error: any) {
        console.error('Error calculating redemption:', error);
        setPointsToRedeem(0);
        setDiscountAmount(0);
        onRedemptionChange(0, 0);
      } finally {
        setIsCalculating(false);
      }
    };

    const timeout = setTimeout(calculateRedemption, 300);
    return () => clearTimeout(timeout);
  }, [pointsToRedeem, customer, orderAmount, onRedemptionChange]);

  if (!customer || customer.loyaltyPoints === 0) {
    return null;
  }

  const maxRedeemable = Math.min(customer.loyaltyPoints, Math.floor(orderAmount / 100));

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <GiftIcon className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">Đổi điểm tích lũy</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-gray-700">
                  Điểm hiện có: <span className="font-semibold text-orange-600">{customer.loyaltyPoints.toLocaleString()}</span>
                </label>
                <span className="text-xs text-gray-500">
                  Tối đa: {maxRedeemable.toLocaleString()} điểm
                </span>
              </div>
              <input
                type="number"
                min="0"
                max={maxRedeemable}
                value={pointsToRedeem || ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setPointsToRedeem(Math.min(value, maxRedeemable));
                }}
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Nhập số điểm muốn đổi"
                disabled={isCalculating}
              />
              <p className="text-xs text-gray-500 mt-1">
                1 điểm = 100 VND. Tối đa {maxRedeemable.toLocaleString()} điểm ({new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(maxRedeemable * 100)})
              </p>
            </div>

            {pointsToRedeem > 0 && discountAmount > 0 && (
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Giảm giá:</span>
                  <span className="font-bold text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                    }).format(discountAmount)}
                  </span>
                </div>
                {customer.loyaltyPoints - pointsToRedeem >= 0 && (
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Điểm còn lại:</span>
                    <span className="font-semibold">{(customer.loyaltyPoints - pointsToRedeem).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




