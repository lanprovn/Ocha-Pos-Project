import React from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '@/utils/formatPrice';
import type { Product, Size, Topping } from '@/types/product';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: {
    name: string;
    description: string;
    price: string;
    categoryId: string;
    image: string;
    discount: string;
    stock: string;
    isAvailable: boolean;
    isPopular: boolean;
    tags: string[];
    sizes: Size[];
    toppings: Topping[];
  };
  categories: Array<{ id: number | string; name: string }>;
  isEdit: boolean;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  categories,
  isEdit,
}) => {
  if (!isOpen) return null;

  const category = categories.find((c) => String(c.id) === formData.categoryId);
  const price = parseFloat(formData.price) || 0;
  const discount = parseFloat(formData.discount) || 0;
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[80%] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b flex-shrink-0">
          <h3 className="text-lg font-medium text-gray-900">
            Xem trước sản phẩm
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Image */}
            <div>
              {formData.image ? (
                <img
                  src={formData.image}
                  alt={formData.name}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-64 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center ${
                  formData.image ? 'hidden' : 'flex'
                }`}
              >
                <PhotoIcon className="h-16 w-16 text-gray-400" />
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData.name || 'Chưa có tên'}</h2>
                {category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {category.name}
                  </span>
                )}
              </div>

              {formData.description && (
                <p className="text-gray-600">{formData.description}</p>
              )}

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-600">
                    {formatPrice(finalPrice)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(price)}
                      </span>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>

                {formData.stock && (
                  <p className="text-sm text-gray-600">
                    Tồn kho: <span className="font-medium">{formData.stock}</span>
                  </p>
                )}
              </div>

              {/* Status badges */}
              <div className="flex gap-2">
                {formData.isAvailable ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Đang bán
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Ngừng bán
                  </span>
                )}
                {formData.isPopular && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Phổ biến
                  </span>
                )}
              </div>

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {formData.sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Kích thước:</p>
                  <div className="space-y-1">
                    {formData.sizes.map((size, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-50 rounded text-sm"
                      >
                        {size.name} (+{formatPrice(size.extraPrice)})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {formData.toppings.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Topping:</p>
                  <div className="space-y-1">
                    {formData.toppings.map((topping, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-gray-50 rounded text-sm"
                      >
                        {topping.name} (+{formatPrice(topping.extraPrice)})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            {isEdit ? 'Xác nhận cập nhật' : 'Xác nhận tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewModal;

