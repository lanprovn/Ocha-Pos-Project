import React, { useState, useEffect } from 'react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/solid';
import type { Product, Size, Topping } from '../../../../types/product';
import { useCart } from '../../../../hooks/useCart';
import { formatPrice } from '../../../../utils/formatPrice';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || undefined);
      setSelectedToppings([]);
      setQuantity(1);
      setNote('');
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const calculateTotalPrice = () => {
    const base = product.price;
    const sizePrice = selectedSize?.extraPrice || 0;
    const toppingPrice = selectedToppings.reduce((sum, t) => sum + t.extraPrice, 0);
    return (base + sizePrice + toppingPrice) * quantity;
  };

  const handleAddToCart = () => {
    const totalPrice = calculateTotalPrice();

    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      selectedSize,
      selectedToppings,
      note,
      quantity,
      totalPrice,
    });

    // Reset and close
    setSelectedSize(product.sizes?.[0] || undefined);
    setSelectedToppings([]);
    setQuantity(1);
    setNote('');
    onClose();
  };

  const handleToppingToggle = (topping: Topping) => {
    setSelectedToppings(prev => {
      const isSelected = prev.some(t => t.name === topping.name);
      if (isSelected) {
        return prev.filter(t => t.name !== topping.name);
      } else {
        return [...prev, topping];
      }
    });
  };

  return (
    <>
      {/* Backdrop - Only covers product grid area, not cart panel */}
      <div
        className="fixed left-96 right-0 top-16 bottom-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed right-[23%] top-20 max-h-[calc(100vh-5rem)] w-[550px] max-w-[48%] bg-white shadow-2xl z-50 overflow-hidden flex flex-col rounded-2xl animate-slide-in-right border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 animate-fade-in">
          <h2 className="text-lg font-bold text-gray-800">Chi tiết sản phẩm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full z-10"
            style={{
              willChange: 'transform, background-color',
              transform: 'translateZ(0)',
              transition: 'transform 0.3s ease-out, background-color 0.3s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg) translateZ(0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(0)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95) translateZ(0)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg) translateZ(0)';
            }}
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" style={{ transition: 'color 0.3s ease-out' }} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Product Image */}
          <div className="mb-4 animate-fade-in">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 group">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                style={{
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                  transition: 'transform 0.5s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(0)';
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/src/assets/img/gallery/default-food.png';
                }}
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            <div className="flex items-center space-x-3 mb-3">
              <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="text-sm text-gray-700 font-medium">
                  {product.rating} • {product.restaurant}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              {product.description}
            </p>

            {/* Base Price */}
            <div className="mb-4">
              <span className="text-2xl font-bold text-orange-600">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kích thước</h3>
              <div className="space-y-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full p-3 rounded-lg border-2 text-left ${
                      selectedSize?.name === size.name
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 bg-white'
                    }`}
                    style={{
                      willChange: 'transform, border-color, background-color',
                      transform: selectedSize?.name === size.name ? 'scale(1.05) translateZ(0)' : 'translateZ(0)',
                      transition: 'transform 0.3s ease-out, border-color 0.3s ease-out, background-color 0.3s ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSize?.name !== size.name) {
                        e.currentTarget.style.transform = 'scale(1.05) translateZ(0)';
                        e.currentTarget.style.borderColor = 'rgb(251 146 60)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSize?.name !== size.name) {
                        e.currentTarget.style.transform = 'translateZ(0)';
                        e.currentTarget.style.borderColor = '';
                      }
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95) translateZ(0)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = selectedSize?.name === size.name ? 'scale(1.05) translateZ(0)' : 'scale(1.05) translateZ(0)';
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{size.name}</span>
                      {size.extraPrice > 0 && (
                        <span className="text-sm text-gray-600">
                          +{formatPrice(size.extraPrice)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toppings Selection */}
          {product.toppings && product.toppings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Topping</h3>
              <div className="space-y-2">
                {product.toppings.map((topping) => {
                  const isSelected = selectedToppings.some(t => t.name === topping.name);
                  return (
                    <button
                      key={topping.name}
                      onClick={() => handleToppingToggle(topping)}
                      className={`w-full p-3 rounded-lg border-2 text-left ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 bg-white'
                      }`}
                      style={{
                        willChange: 'transform, border-color, background-color',
                        transform: isSelected ? 'scale(1.05) translateZ(0)' : 'translateZ(0)',
                        transition: 'transform 0.3s ease-out, border-color 0.3s ease-out, background-color 0.3s ease-out',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'scale(1.05) translateZ(0)';
                          e.currentTarget.style.borderColor = 'rgb(251 146 60)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateZ(0)';
                          e.currentTarget.style.borderColor = '';
                        }
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95) translateZ(0)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = isSelected ? 'scale(1.05) translateZ(0)' : 'scale(1.05) translateZ(0)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{topping.name}</span>
                        </div>
                        {topping.extraPrice > 0 && (
                          <span className="text-sm text-gray-600">
                            +{formatPrice(topping.extraPrice)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú cho món này..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none hover:border-orange-300 focus:shadow-lg focus:shadow-orange-200"
              style={{
                transition: 'border-color 0.3s ease-out, box-shadow 0.3s ease-out',
              }}
              rows={3}
            />
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số lượng
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                style={{
                  willChange: 'transform, background-color, color',
                  transform: 'translateZ(0)',
                  transition: 'transform 0.3s ease-out, background-color 0.3s ease-out, color 0.3s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                  e.currentTarget.style.backgroundColor = 'rgb(254 226 226)';
                  e.currentTarget.style.color = 'rgb(220 38 38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(0)';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95) translateZ(0)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                }}
              >
                -
              </button>
              <span className="text-xl font-bold text-gray-800 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600"
                style={{
                  willChange: 'transform, background-color, color',
                  transform: 'translateZ(0)',
                  transition: 'transform 0.3s ease-out, background-color 0.3s ease-out, color 0.3s ease-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                  e.currentTarget.style.backgroundColor = 'rgb(220 252 231)';
                  e.currentTarget.style.color = 'rgb(22 163 74)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateZ(0)';
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95) translateZ(0)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateZ(0)';
                }}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="p-4 bg-gray-50 rounded-lg mb-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Tổng cộng:</span>
              <span 
                className="text-2xl font-bold text-orange-600"
                style={{
                  willChange: 'opacity',
                  animation: 'pulse-opacity 2s ease-in-out infinite',
                }}
              >
                {formatPrice(calculateTotalPrice())}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Add to Cart Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-orange-500/50"
          >
            Thêm vào giỏ hàng
          </button>
        </div>
      </div>

      {/* Animation CSS with GPU acceleration */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%) translateZ(0);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateZ(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse-opacity {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
          will-change: transform, opacity;
          transform: translateZ(0);
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
          will-change: opacity;
        }
      `}</style>
    </>
  );
};

export default ProductModal;
